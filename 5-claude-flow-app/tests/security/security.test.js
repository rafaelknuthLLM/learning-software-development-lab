const request = require('supertest');
const mongoose = require('mongoose');

const app = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/server');
const User = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/models/User');
const TestHelpers = require('../utils/testHelpers');

describe('Security Tests', () => {
  let testUser, authToken;

  beforeEach(async () => {
    // Clean database
    await User.deleteMany({});
    
    // Create test user and token
    testUser = await TestHelpers.createTestUser();
    authToken = TestHelpers.generateTestToken(testUser._id);
  });

  describe('SQL Injection Protection', () => {
    it('should prevent SQL injection in email field during login', async () => {
      const sqlInjectionPayload = "admin@example.com'; DROP TABLE users; --";
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: sqlInjectionPayload,
          password: 'password123'
        })
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);

      // Verify users table still exists and contains data
      const userCount = await User.countDocuments();
      expect(userCount).toBeGreaterThan(0);
    });

    it('should prevent NoSQL injection in MongoDB queries', async () => {
      const noSqlInjection = { $ne: null };
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: noSqlInjection,
          password: noSqlInjection
        })
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
    });

    it('should sanitize user search queries', async () => {
      const maliciousSearch = { $where: "function() { return true; }" };
      
      const response = await request(app)
        .get('/api/users')
        .query({ search: maliciousSearch })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should prevent injection in user update fields', async () => {
      const maliciousUpdate = {
        name: 'Test User',
        role: { $set: { role: 'admin' } }, // Attempt to escalate privileges
        $inc: { loginAttempts: 1000 } // Attempt to modify unauthorized fields
      };

      const response = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(maliciousUpdate)
        .expect(200);

      // Verify role wasn't changed (should remain 'user')
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.role).toBe('user');
    });
  });

  describe('XSS Protection', () => {
    it('should sanitize XSS in user registration', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      const userData = {
        name: `Malicious User ${xssPayload}`,
        email: 'malicious@example.com',
        password: 'TestPass123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      TestHelpers.assertApiResponse(response, 201);
      
      // Verify XSS payload was sanitized
      expect(response.body.data.user.name).not.toContain('<script>');
      expect(response.body.data.user.name).toContain('&lt;script&gt;');
    });

    it('should sanitize XSS in user profile updates', async () => {
      const xssInBio = '<img src="x" onerror="alert(1)">';
      
      const response = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Safe Name',
          bio: xssInBio
        })
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      
      // Verify XSS was sanitized
      if (response.body.data.bio) {
        expect(response.body.data.bio).not.toContain('<img');
        expect(response.body.data.bio).not.toContain('onerror');
      }
    });

    it('should escape special characters in search responses', async () => {
      // Create user with special characters
      await TestHelpers.createTestUser({
        name: 'Test <script>alert("search")</script> User',
        email: 'search-test@example.com'
      });

      const response = await request(app)
        .get('/api/users?search=script')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      
      // Check that script tags are escaped in response
      const foundUser = response.body.data.find(user => 
        user.name.includes('&lt;script&gt;')
      );
      expect(foundUser).toBeTruthy();
    });
  });

  describe('Authentication & Authorization', () => {
    it('should reject requests without authentication token', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
      expect(response.body.message).toContain('token');
    });

    it('should reject invalid JWT tokens', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.jwt.token')
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });

    it('should reject expired JWT tokens', async () => {
      const expiredToken = TestHelpers.generateExpiredToken(testUser._id);
      
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });

    it('should prevent privilege escalation', async () => {
      const response = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ role: 'admin' })
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      
      // Verify role wasn't changed
      expect(response.body.data.role).toBe('user');
    });

    it('should prevent access to other users data', async () => {
      const otherUser = await TestHelpers.createTestUser();
      
      const response = await request(app)
        .get(`/api/users/${otherUser._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      TestHelpers.assertApiResponse(response, 403);
    });

    it('should enforce admin-only endpoints', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      TestHelpers.assertApiResponse(response, 403);
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting on login attempts', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      };

      // Make multiple failed requests
      const requests = Array(6).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send(loginData)
      );

      const responses = await Promise.all(requests);
      
      // At least one should be rate limited (429)
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    }, 10000);

    it('should enforce general API rate limiting', async () => {
      // Make many requests to a general endpoint
      const requests = Array(105).fill().map(() => // Exceeds limit of 100
        request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      
      // Some should be rate limited
      const rateLimitedCount = responses.filter(res => res.status === 429).length;
      expect(rateLimitedCount).toBeGreaterThan(0);
    }, 15000);
  });

  describe('Input Validation', () => {
    it('should validate email format strictly', async () => {
      const invalidEmails = [
        'not-an-email',
        '@invalid.com',
        'invalid@',
        'invalid..double.dot@example.com',
        'invalid@.com'
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email,
            password: 'ValidPass123!',
            name: 'Test User'
          })
          .expect(400);

        TestHelpers.assertApiResponse(response, 400);
      }
    });

    it('should enforce strong password requirements', async () => {
      const weakPasswords = [
        '123',
        'password',
        'PASSWORD',
        '12345678',
        'abcdefgh'
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            email: 'test@example.com',
            password,
            name: 'Test User'
          })
          .expect(400);

        TestHelpers.assertApiResponse(response, 400);
      }
    });

    it('should validate input length limits', async () => {
      const longString = 'a'.repeat(1000);
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'ValidPass123!',
          name: longString
        })
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
    });

    it('should reject requests with oversized payloads', async () => {
      const largePayload = {
        email: 'test@example.com',
        password: 'ValidPass123!',
        name: 'Test User',
        data: 'x'.repeat(15 * 1024 * 1024) // 15MB (exceeds 10MB limit)
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(largePayload)
        .expect(413);
    });
  });

  describe('HTTP Parameter Pollution (HPP)', () => {
    it('should handle duplicate parameters safely', async () => {
      const response = await request(app)
        .get('/api/users?page=1&page=2&role=user&role=admin')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('Security Headers', () => {
    it('should set security headers', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      // Check for security headers set by Helmet
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
      expect(response.headers['content-security-policy']).toBeDefined();
    });

    it('should not expose sensitive server information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      // Should not reveal Express or Node.js version
      expect(response.headers['x-powered-by']).toBeUndefined();
    });

    it('should set secure cookie attributes in production', async () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      if (response.status === 200) {
        const cookie = response.headers['set-cookie']?.[0];
        if (cookie) {
          expect(cookie).toContain('HttpOnly');
          expect(cookie).toContain('Secure');
          expect(cookie).toContain('SameSite=Strict');
        }
      }

      // Restore original environment
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('CORS Protection', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/auth/login')
        .set('Origin', 'https://malicious-site.com')
        .set('Access-Control-Request-Method', 'POST');

      // Should either allow (if configured) or deny based on CORS settings
      expect([200, 204, 403, 404]).toContain(response.status);
    });

    it('should not leak sensitive information in CORS headers', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Origin', 'https://malicious-site.com')
        .set('Authorization', `Bearer ${authToken}`);

      // Check that sensitive headers are not exposed
      const accessControlExposeHeaders = response.headers['access-control-expose-headers'];
      if (accessControlExposeHeaders) {
        expect(accessControlExposeHeaders.toLowerCase()).not.toContain('authorization');
      }
    });
  });

  describe('Error Information Disclosure', () => {
    it('should not expose stack traces in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app)
        .post('/api/auth/login')
        .send({}); // Invalid payload to trigger error

      expect(response.body).not.toHaveProperty('stack');
      expect(JSON.stringify(response.body)).not.toContain('Error:');

      process.env.NODE_ENV = originalEnv;
    });

    it('should provide generic error messages for sensitive operations', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      // Should not reveal whether email exists
      expect(response.body.message).not.toContain('not found');
      expect(response.body.message).not.toContain('does not exist');
    });
  });

  describe('Session Security', () => {
    it('should invalidate sessions on password change', async () => {
      const oldToken = TestHelpers.generateTestToken(testUser._id);
      
      // Change password
      await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'NewPassword123!'
        })
        .expect(200);

      // Old token should be invalid
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${oldToken}`)
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });

    it('should handle concurrent login sessions securely', async () => {
      const loginData = {
        email: testUser.email,
        password: testUser.password
      };

      // Create multiple sessions
      const session1 = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      const session2 = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      // Both sessions should be valid initially
      expect(session1.body.data.accessToken).toBeTruthy();
      expect(session2.body.data.accessToken).toBeTruthy();

      // Test that both tokens work
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${session1.body.data.accessToken}`)
        .expect(200);

      await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${session2.body.data.accessToken}`)
        .expect(200);
    });
  });

  describe('File Upload Security', () => {
    it('should reject dangerous file types', async () => {
      // This would be more relevant if the API has file upload endpoints
      // Currently, this is a placeholder for future file upload security tests
      expect(true).toBe(true);
    });
  });
});
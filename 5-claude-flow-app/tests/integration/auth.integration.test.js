const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Import the app - adjust path based on actual structure
const app = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/server');
const User = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/models/User');
const Token = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/models/token.model');
const TestHelpers = require('../utils/testHelpers');

describe('Authentication Integration Tests', () => {
  let server;
  
  beforeAll(async () => {
    // Ensure test database connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  beforeEach(async () => {
    // Clean up database before each test
    await User.deleteMany({});
    await Token.deleteMany({});
  });

  afterAll(async () => {
    if (server) {
      await server.close();
    }
  });

  describe('POST /api/auth/register', () => {
    const validUserData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPass123!',
      phone: '+1234567890',
      address: {
        street: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'Test Country'
      }
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      TestHelpers.assertApiResponse(response, 201);
      expect(response.body.message).toContain('Registration successful');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(validUserData.email);
      expect(response.body.data.user).not.toHaveProperty('password');

      // Verify user was created in database
      const userInDb = await User.findOne({ email: validUserData.email });
      expect(userInDb).toBeTruthy();
      expect(userInDb.name).toBe(validUserData.name);
    });

    it('should return error for duplicate email', async () => {
      // Create user first
      await request(app)
        .post('/api/auth/register')
        .send(validUserData);

      // Try to register again with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
      expect(response.body.message).toContain('User already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUserData, email: 'invalid-email' })
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
    });

    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...validUserData, password: '123' })
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
    });

    it('should set secure httpOnly cookie', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.headers['set-cookie']).toBeDefined();
      const cookie = response.headers['set-cookie'][0];
      expect(cookie).toContain('token=');
      expect(cookie).toContain('HttpOnly');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPass123!',
      isEmailVerified: true
    };

    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      testUser = await User.create({
        ...userData,
        password: hashedPassword
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(userData.email);
    });

    it('should return error for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: userData.password
        })
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });

    it('should return error for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword'
        })
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });

    it('should reject login for unverified email when verification is enabled', async () => {
      // Update user to unverified
      await User.findByIdAndUpdate(testUser._id, { isEmailVerified: false });
      
      // Temporarily enable email verification
      const originalValue = process.env.ENABLE_EMAIL_VERIFICATION;
      process.env.ENABLE_EMAIL_VERIFICATION = 'true';

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
      expect(response.body.message).toContain('verify your email');

      // Restore original value
      process.env.ENABLE_EMAIL_VERIFICATION = originalValue;
    });

    it('should handle rememberMe option', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
          rememberMe: true
        })
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      
      // Check cookie expiry is longer
      const cookie = response.headers['set-cookie'][0];
      expect(cookie).toContain('token=');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
    });

    it('should apply rate limiting', async () => {
      // Make multiple failed login attempts
      const promises = [];
      for (let i = 0; i < 6; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: userData.email,
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // At least one should be rate limited
      const rateLimited = responses.some(res => res.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('POST /api/auth/logout', () => {
    let testUser, authToken, refreshToken;

    beforeEach(async () => {
      // Create user and login
      testUser = await TestHelpers.createTestUser();
      authToken = TestHelpers.generateTestToken(testUser._id);
      
      // Create refresh token
      refreshToken = 'test_refresh_token';
      await Token.create({
        token: refreshToken,
        user: testUser._id,
        type: 'refresh',
        deviceInfo: { userAgent: 'Test Browser' }
      });
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ refreshToken })
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.message).toBe('Logged out successfully');

      // Verify refresh token is removed
      const tokenInDb = await Token.findOne({ token: refreshToken });
      expect(tokenInDb).toBeFalsy();
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken })
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });

    it('should clear cookie on logout', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ refreshToken })
        .expect(200);

      const cookie = response.headers['set-cookie'][0];
      expect(cookie).toContain('token=none');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let testUser, refreshToken;

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser();
      
      // Create valid refresh token
      refreshToken = 'valid_refresh_token';
      await Token.create({
        token: refreshToken,
        user: testUser._id,
        type: 'refresh',
        deviceInfo: { userAgent: 'Test Browser' },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
    });

    it('should refresh token successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.message).toBe('Token refreshed successfully');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid_token' })
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });

    it('should reject expired refresh token', async () => {
      // Update token to be expired
      await Token.findOneAndUpdate(
        { token: refreshToken },
        { expiresAt: new Date(Date.now() - 1000) }
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser();
    });

    it('should handle forgot password for existing user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.message).toContain('password reset link');

      // Verify reset token was created
      const resetToken = await Token.findOne({
        user: testUser._id,
        type: 'passwordReset'
      });
      expect(resetToken).toBeTruthy();
    });

    it('should handle forgot password for non-existing user without revealing', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.message).toContain('password reset link');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let testUser, resetToken;

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser();
      
      // Create password reset token
      resetToken = 'valid_reset_token';
      await Token.create({
        token: resetToken,
        user: testUser._id,
        type: 'passwordReset',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      });
    });

    it('should reset password successfully', async () => {
      const newPassword = 'NewPassword123!';
      
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword
        })
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.message).toBe('Password reset successful');
      expect(response.body.data).toHaveProperty('accessToken');

      // Verify password was changed
      const updatedUser = await User.findById(testUser._id).select('+password');
      const isNewPassword = await bcrypt.compare(newPassword, updatedUser.password);
      expect(isNewPassword).toBe(true);

      // Verify token was used/removed
      const tokenInDb = await Token.findOne({ token: resetToken });
      expect(tokenInDb).toBeFalsy();
    });

    it('should reject invalid reset token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid_token',
          password: 'NewPassword123!'
        })
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
      expect(response.body.message).toContain('Invalid or expired');
    });

    it('should reject expired reset token', async () => {
      // Update token to be expired
      await Token.findOneAndUpdate(
        { token: resetToken },
        { expiresAt: new Date(Date.now() - 1000) }
      );

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: 'NewPassword123!'
        })
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
    });

    it('should validate password strength', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: '123'
        })
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
    });
  });

  describe('GET /api/auth/verify-email/:token', () => {
    let testUser, verificationToken;

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser({ isEmailVerified: false });
      
      // Create email verification token
      verificationToken = 'valid_verification_token';
      await Token.create({
        token: verificationToken,
        user: testUser._id,
        type: 'emailVerification',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      });
    });

    it('should verify email successfully', async () => {
      const response = await request(app)
        .get(`/api/auth/verify-email/${verificationToken}`)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.message).toBe('Email verified successfully');

      // Verify user email is now verified
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.isEmailVerified).toBe(true);
    });

    it('should reject invalid verification token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-email/invalid_token')
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
      expect(response.body.message).toContain('Invalid or expired');
    });

    it('should reject expired verification token', async () => {
      // Update token to be expired
      await Token.findOneAndUpdate(
        { token: verificationToken },
        { expiresAt: new Date(Date.now() - 1000) }
      );

      const response = await request(app)
        .get(`/api/auth/verify-email/${verificationToken}`)
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser, authToken;

    beforeEach(async () => {
      testUser = await TestHelpers.createTestUser();
      authToken = TestHelpers.generateTestToken(testUser._id);
    });

    it('should get current user info', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user._id).toBe(testUser._id.toString());
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });

    it('should reject expired token', async () => {
      const expiredToken = TestHelpers.generateExpiredToken(testUser._id);
      
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });

    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });
  });

  describe('POST /api/auth/check-password', () => {
    it('should check password strength', async () => {
      const response = await request(app)
        .post('/api/auth/check-password')
        .send({ password: 'StrongPassword123!' })
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data).toHaveProperty('score');
      expect(response.body.data).toHaveProperty('feedback');
    });

    it('should return weak score for weak password', async () => {
      const response = await request(app)
        .post('/api/auth/check-password')
        .send({ password: '123' })
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data.score).toBeLessThan(3);
    });

    it('should require password field', async () => {
      const response = await request(app)
        .post('/api/auth/check-password')
        .send({})
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
    });
  });
});
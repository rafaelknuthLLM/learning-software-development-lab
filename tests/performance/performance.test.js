const request = require('supertest');
const mongoose = require('mongoose');
const { performance } = require('perf_hooks');

const app = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/server');
const User = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/models/User');
const TestHelpers = require('../utils/testHelpers');

describe('Performance Tests', () => {
  let adminUser, adminToken;
  
  beforeAll(async () => {
    // Create admin user for performance testing
    adminUser = await TestHelpers.createTestUser({ role: 'admin' });
    adminToken = TestHelpers.generateTestToken(adminUser._id, 'admin');
  });

  beforeEach(async () => {
    // Clean up except admin user
    await User.deleteMany({ role: { $ne: 'admin' } });
  });

  describe('Response Time Benchmarks', () => {
    it('should handle authentication within acceptable time limits', async () => {
      const userData = {
        email: 'perf-test@example.com',
        password: 'TestPass123!',
        name: 'Performance Test User'
      };

      // Registration performance
      const regStart = performance.now();
      const regResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);
      const regTime = performance.now() - regStart;

      expect(regTime).toBeLessThan(2000); // Should complete within 2 seconds
      TestHelpers.assertApiResponse(regResponse, 201);

      // Login performance
      const loginStart = performance.now();
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);
      const loginTime = performance.now() - loginStart;

      expect(loginTime).toBeLessThan(1000); // Should complete within 1 second
      TestHelpers.assertApiResponse(loginResponse, 200);
    });

    it('should handle user profile retrieval efficiently', async () => {
      const testUser = await TestHelpers.createTestUser();
      const userToken = TestHelpers.generateTestToken(testUser._id);

      const start = performance.now();
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(500); // Should complete within 500ms
      TestHelpers.assertApiResponse(response, 200);
    });

    it('should handle user listing with pagination efficiently', async () => {
      // Create bulk users for testing
      const users = TestHelpers.generateBulkTestData(100, TestHelpers.generateUserData);
      const hashedUsers = users.map(userData => ({
        ...userData,
        password: '$2b$10$hashedpassword' // Mock hashed password
      }));
      await User.insertMany(hashedUsers);

      const start = performance.now();
      const response = await request(app)
        .get('/api/users?page=1&limit=20')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      TestHelpers.assertPaginationResponse(response);
      expect(response.body.data.length).toBe(20);
    });

    it('should handle user search efficiently', async () => {
      // Create users with searchable data
      const searchUsers = Array.from({ length: 50 }, (_, i) => ({
        ...TestHelpers.generateUserData(),
        name: i < 10 ? `Searchable User ${i}` : `Regular User ${i}`,
        password: '$2b$10$hashedpassword'
      }));
      await User.insertMany(searchUsers);

      const start = performance.now();
      const response = await request(app)
        .get('/api/users?search=Searchable')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(1500); // Should complete within 1.5 seconds
      TestHelpers.assertPaginationResponse(response);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent authentication requests', async () => {
      const users = Array.from({ length: 10 }, (_, i) => ({
        email: `concurrent${i}@example.com`,
        password: 'TestPass123!',
        name: `Concurrent User ${i}`
      }));

      // Register users concurrently
      const registrations = users.map(userData =>
        request(app)
          .post('/api/auth/register')
          .send(userData)
      );

      const start = performance.now();
      const responses = await Promise.all(registrations);
      const duration = performance.now() - start;

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Should handle concurrency efficiently
      expect(duration).toBeLessThan(5000); // 5 seconds for 10 registrations
    });

    it('should handle concurrent user queries without performance degradation', async () => {
      // Create test users
      const users = TestHelpers.generateBulkTestData(20, TestHelpers.generateUserData);
      await User.insertMany(users.map(userData => ({
        ...userData,
        password: '$2b$10$hashedpassword'
      })));

      // Create multiple concurrent requests
      const requests = Array.from({ length: 20 }, () =>
        request(app)
          .get('/api/users?page=1&limit=10')
          .set('Authorization', `Bearer ${adminToken}`)
      );

      const start = performance.now();
      const responses = await Promise.all(requests);
      const duration = performance.now() - start;

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        TestHelpers.assertPaginationResponse(response);
      });

      // Average response time should be reasonable
      const avgTime = duration / responses.length;
      expect(avgTime).toBeLessThan(1000); // Average under 1 second per request
    });

    it('should maintain performance under concurrent profile updates', async () => {
      // Create test users
      const testUsers = [];
      for (let i = 0; i < 10; i++) {
        const user = await TestHelpers.createTestUser({
          email: `update${i}@example.com`
        });
        testUsers.push(user);
      }

      // Update all users concurrently
      const updates = testUsers.map((user, i) => {
        const token = TestHelpers.generateTestToken(user._id);
        return request(app)
          .put(`/api/users/${user._id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: `Updated Name ${i}`,
            phone: `+123456789${i}`
          });
      });

      const start = performance.now();
      const responses = await Promise.all(updates);
      const duration = performance.now() - start;

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during bulk operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform memory-intensive operations
      for (let i = 0; i < 5; i++) {
        const bulkUsers = TestHelpers.generateBulkTestData(50, TestHelpers.generateUserData);
        await User.insertMany(bulkUsers.map(userData => ({
          ...userData,
          password: '$2b$10$hashedpassword'
        })));

        await request(app)
          .get('/api/users?page=1&limit=50')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        // Clean up
        await User.deleteMany({ role: { $ne: 'admin' } });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    it('should handle large query results efficiently', async () => {
      // Create a large dataset
      const largeDataset = TestHelpers.generateBulkTestData(500, TestHelpers.generateUserData);
      await User.insertMany(largeDataset.map(userData => ({
        ...userData,
        password: '$2b$10$hashedpassword'
      })));

      const beforeMemory = process.memoryUsage().heapUsed;

      const response = await request(app)
        .get('/api/users?limit=100')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const afterMemory = process.memoryUsage().heapUsed;
      const memoryUsed = afterMemory - beforeMemory;

      TestHelpers.assertPaginationResponse(response);
      expect(response.body.data.length).toBe(100);

      // Should not use excessive memory for query
      expect(memoryUsed).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });
  });

  describe('Database Performance', () => {
    it('should execute queries within acceptable time limits', async () => {
      // Create indexed data
      const users = TestHelpers.generateBulkTestData(1000, TestHelpers.generateUserData);
      await User.insertMany(users.map(userData => ({
        ...userData,
        password: '$2b$10$hashedpassword'
      })));

      // Test query performance
      const queryStart = performance.now();
      const result = await User.find({ isActive: true }).limit(100);
      const queryTime = performance.now() - queryStart;

      expect(result.length).toBeGreaterThan(0);
      expect(queryTime).toBeLessThan(500); // Should complete within 500ms

      // Test aggregation performance
      const aggStart = performance.now();
      const stats = await User.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);
      const aggTime = performance.now() - aggStart;

      expect(stats.length).toBeGreaterThan(0);
      expect(aggTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle complex queries efficiently', async () => {
      // Create varied test data
      const roles = ['user', 'admin', 'moderator'];
      const users = Array.from({ length: 300 }, (_, i) => ({
        ...TestHelpers.generateUserData(),
        role: roles[i % 3],
        isActive: i % 4 !== 0, // 75% active
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)), // Spread over days
        password: '$2b$10$hashedpassword'
      }));
      await User.insertMany(users);

      const start = performance.now();
      const response = await request(app)
        .get('/api/users?role=user&isActive=true&sort=-createdAt&limit=50')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const duration = performance.now() - start;

      TestHelpers.assertPaginationResponse(response);
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Load Testing Simulation', () => {
    it('should handle burst traffic', async () => {
      // Simulate burst of requests
      const burstSize = 50;
      const requests = Array.from({ length: burstSize }, () =>
        request(app)
          .get('/api/auth/me')
          .set('Authorization', `Bearer ${adminToken}`)
      );

      const start = performance.now();
      const responses = await Promise.all(requests);
      const duration = performance.now() - start;

      // All requests should succeed
      const successfulResponses = responses.filter(res => res.status === 200);
      expect(successfulResponses.length).toBe(burstSize);

      // Should handle burst within reasonable time
      expect(duration).toBeLessThan(10000); // 10 seconds for 50 requests

      // Calculate throughput
      const throughput = (burstSize / duration) * 1000; // requests per second
      expect(throughput).toBeGreaterThan(5); // At least 5 RPS
    });

    it('should maintain response quality under load', async () => {
      // Create some test data
      const users = TestHelpers.generateBulkTestData(100, TestHelpers.generateUserData);
      await User.insertMany(users.map(userData => ({
        ...userData,
        password: '$2b$10$hashedpassword'
      })));

      const requestCount = 30;
      const requests = Array.from({ length: requestCount }, (_, i) =>
        request(app)
          .get(`/api/users?page=${Math.floor(i / 10) + 1}&limit=10`)
          .set('Authorization', `Bearer ${adminToken}`)
      );

      const start = performance.now();
      const responses = await Promise.all(requests);
      const duration = performance.now() - start;

      // All should succeed with proper data structure
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        TestHelpers.assertPaginationResponse(response);
        expect(response.body.data).toBeInstanceOf(Array);
      });

      // Calculate average response time
      const avgResponseTime = duration / requestCount;
      expect(avgResponseTime).toBeLessThan(1000); // Average under 1 second
    });

    it('should gracefully handle resource exhaustion scenarios', async () => {
      // Test with very large page sizes to simulate resource pressure
      const response = await request(app)
        .get('/api/users?limit=1000') // Large page size
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      TestHelpers.assertPaginationResponse(response);
      
      // Should still return reasonable response
      expect(response.body.data.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('API Endpoint Performance Benchmarks', () => {
    const performanceThresholds = {
      auth: 1000,      // Authentication endpoints - 1 second
      crud: 500,       // CRUD operations - 500ms
      list: 1000,      // List operations - 1 second
      search: 1500,    // Search operations - 1.5 seconds
      analytics: 2000  // Analytics/stats - 2 seconds
    };

    it('should meet performance benchmarks for all endpoints', async () => {
      const testUser = await TestHelpers.createTestUser();
      const userToken = TestHelpers.generateTestToken(testUser._id);

      const benchmarkTests = [
        {
          name: 'POST /api/auth/login',
          category: 'auth',
          test: () => request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password })
        },
        {
          name: 'GET /api/auth/me',
          category: 'crud',
          test: () => request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${userToken}`)
        },
        {
          name: 'PUT /api/users/:id',
          category: 'crud',
          test: () => request(app)
            .put(`/api/users/${testUser._id}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ name: 'Updated Name' })
        },
        {
          name: 'GET /api/users',
          category: 'list',
          test: () => request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${adminToken}`)
        }
      ];

      for (const benchmark of benchmarkTests) {
        const start = performance.now();
        const response = await benchmark.test();
        const duration = performance.now() - start;

        expect(response.status).toBeLessThan(400); // Should be successful
        expect(duration).toBeLessThan(performanceThresholds[benchmark.category]);
        
        console.log(`${benchmark.name}: ${Math.round(duration)}ms`);
      }
    });
  });
});
const request = require('supertest');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/server');
const User = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/models/User');
const Token = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/models/token.model');
const TestHelpers = require('../utils/testHelpers');

describe('Users Integration Tests', () => {
  let adminUser, regularUser, adminToken, userToken;

  beforeAll(async () => {
    // Ensure test database connection
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  beforeEach(async () => {
    // Clean up database
    await User.deleteMany({});
    await Token.deleteMany({});

    // Create test users
    adminUser = await TestHelpers.createTestUser({ 
      role: 'admin',
      email: 'admin@example.com',
      name: 'Admin User'
    });
    
    regularUser = await TestHelpers.createTestUser({
      role: 'user',
      email: 'user@example.com',
      name: 'Regular User'
    });

    // Generate tokens
    adminToken = TestHelpers.generateTestToken(adminUser._id, 'admin');
    userToken = TestHelpers.generateTestToken(regularUser._id, 'user');
  });

  describe('GET /api/users', () => {
    beforeEach(async () => {
      // Create additional test users for pagination testing
      const users = TestHelpers.generateBulkTestData(15, TestHelpers.generateUserData);
      await User.insertMany(users.map(userData => ({
        ...userData,
        password: bcrypt.hashSync(userData.password, 10)
      })));
    });

    it('should get all users with admin access', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      TestHelpers.assertPaginationResponse(response);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(17); // 2 + 15 created
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=2&limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      TestHelpers.assertPaginationResponse(response);
      expect(response.body.pagination.current).toBe(2);
      expect(response.body.pagination.pageSize).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('should support searching by name and email', async () => {
      // Create a user with specific name
      await TestHelpers.createTestUser({ 
        name: 'John Search Test',
        email: 'john.search@example.com'
      });

      const response = await request(app)
        .get('/api/users?search=john')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      TestHelpers.assertPaginationResponse(response);
      const foundUser = response.body.data.find(user => 
        user.name.toLowerCase().includes('john') || 
        user.email.toLowerCase().includes('john')
      );
      expect(foundUser).toBeTruthy();
    });

    it('should support filtering by role', async () => {
      const response = await request(app)
        .get('/api/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      TestHelpers.assertPaginationResponse(response);
      response.body.data.forEach(user => {
        expect(user.role).toBe('admin');
      });
    });

    it('should support filtering by active status', async () => {
      // Create inactive user
      await TestHelpers.createTestUser({ isActive: false });

      const response = await request(app)
        .get('/api/users?isActive=false')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      TestHelpers.assertPaginationResponse(response);
      response.body.data.forEach(user => {
        expect(user.isActive).toBe(false);
      });
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/api/users?sort=name&limit=50')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      TestHelpers.assertPaginationResponse(response);
      
      // Check if sorted by name
      const names = response.body.data.map(user => user.name);
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it('should require admin access', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      TestHelpers.assertApiResponse(response, 403);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });

    it('should not include sensitive fields', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      response.body.data.forEach(user => {
        expect(user).not.toHaveProperty('password');
        expect(user).not.toHaveProperty('refreshTokens');
      });
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by ID for admin', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data._id).toBe(regularUser._id.toString());
      expect(response.body.data.email).toBe(regularUser.email);
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should allow user to get own profile', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data._id).toBe(regularUser._id.toString());
    });

    it('should prevent user from accessing other profiles', async () => {
      const response = await request(app)
        .get(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      TestHelpers.assertApiResponse(response, 403);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      TestHelpers.assertApiResponse(response, 404);
    });

    it('should return 400 for invalid user ID format', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
    });
  });

  describe('PUT /api/users/:id', () => {
    const updateData = {
      name: 'Updated Name',
      phone: '+9876543210',
      address: {
        street: '456 Updated St',
        city: 'Updated City',
        state: 'UC',
        zipCode: '54321',
        country: 'Updated Country'
      }
    };

    it('should update own profile successfully', async () => {
      const response = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.phone).toBe(updateData.phone);
      expect(response.body.data.address.street).toBe(updateData.address.street);

      // Verify in database
      const updatedUser = await User.findById(regularUser._id);
      expect(updatedUser.name).toBe(updateData.name);
    });

    it('should allow admin to update any user', async () => {
      const response = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data.name).toBe(updateData.name);
    });

    it('should allow admin to update admin-only fields', async () => {
      const adminUpdateData = {
        ...updateData,
        role: 'moderator',
        isActive: false
      };

      const response = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adminUpdateData)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data.role).toBe('moderator');
      expect(response.body.data.isActive).toBe(false);
    });

    it('should ignore admin-only fields for regular users', async () => {
      const adminUpdateData = {
        ...updateData,
        role: 'admin', // Should be ignored
        isActive: false // Should be ignored
      };

      const response = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(adminUpdateData)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data.role).toBe('user'); // Unchanged
      expect(response.body.data.isActive).toBe(true); // Unchanged
    });

    it('should prevent users from updating other profiles', async () => {
      const response = await request(app)
        .put(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      TestHelpers.assertApiResponse(response, 403);
    });

    it('should validate update data', async () => {
      const invalidData = {
        name: '', // Empty name
        phone: 'invalid-phone'
      };

      const response = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(invalidData)
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { name: 'Partially Updated' };

      const response = await request(app)
        .put(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(partialUpdate)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data.name).toBe(partialUpdate.name);
      expect(response.body.data.email).toBe(regularUser.email); // Unchanged
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete own account', async () => {
      const response = await request(app)
        .delete(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.message).toBe('User deleted successfully');

      // Verify user is deleted (hard delete by default)
      const deletedUser = await User.findById(regularUser._id);
      expect(deletedUser).toBeFalsy();
    });

    it('should allow admin to delete any user', async () => {
      const response = await request(app)
        .delete(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
    });

    it('should soft delete when enabled', async () => {
      process.env.SOFT_DELETE = 'true';

      const response = await request(app)
        .delete(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);

      // Verify user is soft deleted
      const softDeletedUser = await User.findById(regularUser._id);
      expect(softDeletedUser).toBeTruthy();
      expect(softDeletedUser.isActive).toBe(false);
      expect(softDeletedUser.deletedAt).toBeTruthy();

      process.env.SOFT_DELETE = 'false';
    });

    it('should prevent users from deleting other accounts', async () => {
      const response = await request(app)
        .delete(`/api/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      TestHelpers.assertApiResponse(response, 403);
    });

    it('should clean up user tokens on deletion', async () => {
      // Create tokens for the user
      await Token.create({
        token: 'user_token_1',
        user: regularUser._id,
        type: 'refresh'
      });

      const response = await request(app)
        .delete(`/api/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Verify tokens are removed
      const userTokens = await Token.find({ user: regularUser._id });
      expect(userTokens.length).toBe(0);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      TestHelpers.assertApiResponse(response, 404);
    });
  });

  describe('PUT /api/users/change-password', () => {
    const passwordData = {
      currentPassword: 'TestPass123!',
      newPassword: 'NewTestPass123!'
    };

    it('should change password successfully', async () => {
      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send(passwordData)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.message).toBe('Password changed successfully');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');

      // Verify password was changed
      const updatedUser = await User.findById(regularUser._id).select('+password');
      const isNewPassword = await bcrypt.compare(passwordData.newPassword, updatedUser.password);
      expect(isNewPassword).toBe(true);
    });

    it('should reject incorrect current password', async () => {
      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...passwordData,
          currentPassword: 'WrongPassword123!'
        })
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
      expect(response.body.message).toContain('Current password is incorrect');
    });

    it('should validate new password strength', async () => {
      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...passwordData,
          newPassword: '123'
        })
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put('/api/users/change-password')
        .send(passwordData)
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });

    it('should invalidate other refresh tokens', async () => {
      // Create multiple refresh tokens
      await Token.create([
        { token: 'token1', user: regularUser._id, type: 'refresh' },
        { token: 'token2', user: regularUser._id, type: 'refresh' }
      ]);

      const response = await request(app)
        .put('/api/users/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send(passwordData)
        .expect(200);

      // Only the new refresh token should remain
      const remainingTokens = await Token.find({
        user: regularUser._id,
        type: 'refresh'
      });
      expect(remainingTokens.length).toBe(1);
      expect(remainingTokens[0].token).toBe(response.body.data.refreshToken);
    });
  });

  describe('PUT /api/users/change-email', () => {
    const emailData = {
      newEmail: 'newemail@example.com',
      password: 'TestPass123!'
    };

    it('should change email successfully', async () => {
      const response = await request(app)
        .put('/api/users/change-email')
        .set('Authorization', `Bearer ${userToken}`)
        .send(emailData)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.message).toContain('Email updated successfully');
      expect(response.body.data.email).toBe(emailData.newEmail);

      // Verify email was changed and verification reset
      const updatedUser = await User.findById(regularUser._id);
      expect(updatedUser.email).toBe(emailData.newEmail);
      expect(updatedUser.isEmailVerified).toBe(false);
    });

    it('should reject if new email already exists', async () => {
      // Use admin's email
      const response = await request(app)
        .put('/api/users/change-email')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...emailData,
          newEmail: adminUser.email
        })
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
      expect(response.body.message).toContain('Email already in use');
    });

    it('should reject incorrect password', async () => {
      const response = await request(app)
        .put('/api/users/change-email')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...emailData,
          password: 'WrongPassword123!'
        })
        .expect(401);

      TestHelpers.assertApiResponse(response, 401);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .put('/api/users/change-email')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...emailData,
          newEmail: 'invalid-email'
        })
        .expect(400);

      TestHelpers.assertApiResponse(response, 400);
    });

    it('should send verification email when enabled', async () => {
      process.env.ENABLE_EMAIL_VERIFICATION = 'true';

      const response = await request(app)
        .put('/api/users/change-email')
        .set('Authorization', `Bearer ${userToken}`)
        .send(emailData)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);

      // Verify verification token was created
      const verificationToken = await Token.findOne({
        user: regularUser._id,
        type: 'emailVerification'
      });
      expect(verificationToken).toBeTruthy();

      process.env.ENABLE_EMAIL_VERIFICATION = 'false';
    });
  });

  describe('GET /api/users/stats', () => {
    beforeEach(async () => {
      // Create additional users for meaningful stats
      const users = [
        { role: 'user', isActive: true, isEmailVerified: true },
        { role: 'user', isActive: true, isEmailVerified: false },
        { role: 'user', isActive: false, isEmailVerified: true },
        { role: 'moderator', isActive: true, isEmailVerified: true }
      ];

      for (const userData of users) {
        await TestHelpers.createTestUser(userData);
      }
    });

    it('should get user statistics for admin', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data).toHaveProperty('totalUsers');
      expect(response.body.data).toHaveProperty('activeUsers');
      expect(response.body.data).toHaveProperty('verifiedUsers');
      expect(response.body.data).toHaveProperty('usersByRole');
      expect(response.body.data).toHaveProperty('userGrowth');
      expect(response.body.data).toHaveProperty('recentSignups');

      expect(response.body.data.totalUsers).toBeGreaterThan(0);
      expect(typeof response.body.data.usersByRole).toBe('object');
      expect(Array.isArray(response.body.data.userGrowth)).toBe(true);
    });

    it('should require admin access', async () => {
      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      TestHelpers.assertApiResponse(response, 403);
    });

    it('should handle empty statistics gracefully', async () => {
      // Clear all users except admin
      await User.deleteMany({ role: { $ne: 'admin' } });

      const response = await request(app)
        .get('/api/users/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data.totalUsers).toBeGreaterThanOrEqual(1); // At least admin
    });
  });

  describe('GET /api/users/:id/activity', () => {
    beforeEach(async () => {
      // Create some activity tokens
      await Token.create([
        {
          token: 'refresh1',
          user: regularUser._id,
          type: 'refresh',
          deviceInfo: { userAgent: 'Browser 1' },
          used: false
        },
        {
          token: 'refresh2',
          user: regularUser._id,
          type: 'refresh',
          deviceInfo: { userAgent: 'Browser 2' },
          used: true,
          usedAt: new Date()
        }
      ]);
    });

    it('should get own activity', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser._id}/activity`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.count).toBe(2);
      expect(response.body.data[0]).toHaveProperty('type');
      expect(response.body.data[0]).toHaveProperty('timestamp');
      expect(response.body.data[0]).toHaveProperty('device');
      expect(response.body.data[0]).toHaveProperty('status');
    });

    it('should allow admin to view any user activity', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser._id}/activity`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
    });

    it('should prevent users from viewing other user activity', async () => {
      const response = await request(app)
        .get(`/api/users/${adminUser._id}/activity`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      TestHelpers.assertApiResponse(response, 403);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser._id}/activity?page=1&limit=1`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      TestHelpers.assertApiResponse(response, 200);
      expect(response.body.data.length).toBe(1);
    });

    it('should show different status for used/unused tokens', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser._id}/activity`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const activeActivity = response.body.data.find(activity => activity.status === 'active');
      const expiredActivity = response.body.data.find(activity => activity.status === 'expired');

      expect(activeActivity).toBeTruthy();
      expect(expiredActivity).toBeTruthy();
    });
  });
});
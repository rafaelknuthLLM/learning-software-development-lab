const userController = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/controllers/user.controller');
const User = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/models/User');
const Token = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/models/token.model');
const authService = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/services/auth.service');
const TestHelpers = require('../utils/testHelpers');

// Mock dependencies
jest.mock('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/models/User');
jest.mock('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/models/token.model');
jest.mock('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/services/auth.service');

describe('User Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { _id: 'user123', role: 'user', email: 'test@example.com' },
      token: 'access_token_123',
      headers: {},
      ip: '127.0.0.1'
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis()
    };

    next = jest.fn();

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    beforeEach(() => {
      req.user.role = 'admin'; // Admin access required
    });

    it('should get all users with default pagination', async () => {
      const users = [
        { _id: 'user1', email: 'user1@test.com', name: 'User 1' },
        { _id: 'user2', email: 'user2@test.com', name: 'User 2' }
      ];
      
      User.countDocuments.mockResolvedValue(2);
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(users)
      };
      User.find.mockReturnValue(mockQuery);

      await userController.getAllUsers(req, res, next);

      expect(User.find).toHaveBeenCalledWith({});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        pagination: expect.objectContaining({
          current: 1,
          pageSize: 20,
          total: 2,
          pages: 1
        }),
        data: users
      });
    });

    it('should handle search and filtering', async () => {
      req.query = {
        search: 'john',
        role: 'user',
        isActive: 'true',
        page: 2,
        limit: 10
      };

      const users = [{ _id: 'user1', email: 'john@test.com', name: 'John Doe' }];
      User.countDocuments.mockResolvedValue(1);
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(users)
      };
      User.find.mockReturnValue(mockQuery);

      await userController.getAllUsers(req, res, next);

      expect(User.find).toHaveBeenCalledWith({
        role: 'user',
        isActive: 'true',
        $or: [
          { name: { $regex: 'john', $options: 'i' } },
          { email: { $regex: 'john', $options: 'i' } }
        ]
      });
    });

    it('should include pagination navigation', async () => {
      req.query = { page: 2, limit: 1 };
      
      User.countDocuments.mockResolvedValue(3);
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([{ _id: 'user2' }])
      };
      User.find.mockReturnValue(mockQuery);

      await userController.getAllUsers(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        pagination: expect.objectContaining({
          current: 2,
          next: { page: 3, limit: 1 },
          prev: { page: 1, limit: 1 }
        }),
        data: [{ _id: 'user2' }]
      });
    });
  });

  describe('getUserById', () => {
    beforeEach(() => {
      req.params = { id: 'user123' };
    });

    it('should get user by ID for own profile', async () => {
      const user = { _id: 'user123', email: 'test@example.com', name: 'Test User' };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(user)
      });

      await userController.getUserById(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: user
      });
    });

    it('should get user by ID for admin', async () => {
      req.user.role = 'admin';
      req.params.id = 'other_user_id';
      
      const user = { _id: 'other_user_id', email: 'other@example.com', name: 'Other User' };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(user)
      });

      await userController.getUserById(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('other_user_id');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw error for unauthorized access', async () => {
      req.params.id = 'other_user_id'; // Different user ID

      await expect(userController.getUserById(req, res, next)).rejects.toThrow('Not authorized to access this resource');
    });

    it('should throw error if user not found', async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await expect(userController.getUserById(req, res, next)).rejects.toThrow('User not found');
    });
  });

  describe('updateUser', () => {
    beforeEach(() => {
      req.params = { id: 'user123' };
      req.body = {
        name: 'Updated Name',
        phone: '+1234567890',
        address: { street: '456 New St' }
      };
    });

    it('should update own profile successfully', async () => {
      const updatedUser = { 
        _id: 'user123', 
        ...req.body, 
        email: 'test@example.com' 
      };
      
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUser)
      });

      await userController.updateUser(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        {
          name: 'Updated Name',
          phone: '+1234567890',
          address: { street: '456 New St' }
        },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });
    });

    it('should allow admin to update admin-only fields', async () => {
      req.user.role = 'admin';
      req.body.role = 'moderator';
      req.body.isActive = false;

      const updatedUser = { _id: 'user123', role: 'moderator', isActive: false };
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(updatedUser)
      });

      await userController.updateUser(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        expect.objectContaining({
          role: 'moderator',
          isActive: false
        }),
        { new: true, runValidators: true }
      );
    });

    it('should throw error for unauthorized update', async () => {
      req.params.id = 'other_user_id';

      await expect(userController.updateUser(req, res, next)).rejects.toThrow('Not authorized to update this resource');
    });

    it('should remove undefined fields from update', async () => {
      req.body = {
        name: 'New Name',
        phone: undefined,
        address: null
      };

      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: 'user123' })
      });

      await userController.updateUser(req, res, next);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user123',
        { name: 'New Name', address: null },
        { new: true, runValidators: true }
      );
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      req.params = { id: 'user123' };
    });

    it('should soft delete user when enabled', async () => {
      process.env.SOFT_DELETE = 'true';
      
      const user = {
        _id: 'user123',
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true)
      };
      User.findById.mockResolvedValue(user);
      authService.blacklistToken.mockResolvedValue(true);

      await userController.deleteUser(req, res, next);

      expect(user.isActive).toBe(false);
      expect(user.deletedAt).toBeInstanceOf(Date);
      expect(user.save).toHaveBeenCalled();
      expect(authService.blacklistToken).toHaveBeenCalledWith('access_token_123');

      process.env.SOFT_DELETE = 'false';
    });

    it('should hard delete user when soft delete disabled', async () => {
      const user = {
        _id: 'user123',
        email: 'test@example.com',
        deleteOne: jest.fn().mockResolvedValue(true)
      };
      User.findById.mockResolvedValue(user);
      Token.removeUserTokens.mockResolvedValue(true);
      authService.blacklistToken.mockResolvedValue(true);

      await userController.deleteUser(req, res, next);

      expect(Token.removeUserTokens).toHaveBeenCalledWith('user123');
      expect(user.deleteOne).toHaveBeenCalled();
    });

    it('should allow admin to delete other users', async () => {
      req.user.role = 'admin';
      req.params.id = 'other_user_id';

      const user = {
        _id: 'other_user_id',
        email: 'other@example.com',
        deleteOne: jest.fn().mockResolvedValue(true)
      };
      User.findById.mockResolvedValue(user);
      Token.removeUserTokens.mockResolvedValue(true);

      await userController.deleteUser(req, res, next);

      expect(user.deleteOne).toHaveBeenCalled();
      expect(authService.blacklistToken).not.toHaveBeenCalled(); // Not self-deletion
    });

    it('should throw error for unauthorized deletion', async () => {
      req.params.id = 'other_user_id';

      await expect(userController.deleteUser(req, res, next)).rejects.toThrow('Not authorized to delete this resource');
    });

    it('should throw error if user not found', async () => {
      User.findById.mockResolvedValue(null);

      await expect(userController.deleteUser(req, res, next)).rejects.toThrow('User not found');
    });
  });

  describe('changePassword', () => {
    beforeEach(() => {
      req.body = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!'
      };
    });

    it('should change password successfully', async () => {
      const user = {
        _id: 'user123',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true)
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(user)
      });
      authService.generateAccessToken.mockReturnValue('new_access_token');
      authService.extractDeviceInfo.mockReturnValue({ device: 'test' });
      authService.generateRefreshToken.mockResolvedValue('new_refresh_token');
      Token.deleteMany.mockResolvedValue({ deletedCount: 2 });

      await userController.changePassword(req, res, next);

      expect(user.comparePassword).toHaveBeenCalledWith('OldPass123!');
      expect(user.password).toBe('NewPass123!');
      expect(user.save).toHaveBeenCalled();
      expect(Token.deleteMany).toHaveBeenCalledWith({
        user: 'user123',
        type: 'refresh',
        token: { $ne: 'new_refresh_token' }
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw error for incorrect current password', async () => {
      const user = {
        comparePassword: jest.fn().mockResolvedValue(false)
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(user)
      });

      await expect(userController.changePassword(req, res, next)).rejects.toThrow('Current password is incorrect');
    });
  });

  describe('changeEmail', () => {
    beforeEach(() => {
      req.body = {
        newEmail: 'newemail@example.com',
        password: 'TestPass123!'
      };
    });

    it('should change email successfully', async () => {
      User.findOne.mockResolvedValue(null); // New email doesn't exist
      
      const user = {
        _id: 'user123',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true)
      };

      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(user)
      });

      await userController.changeEmail(req, res, next);

      expect(user.email).toBe('newemail@example.com');
      expect(user.isEmailVerified).toBe(false);
      expect(user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw error if new email already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'newemail@example.com' });

      await expect(userController.changeEmail(req, res, next)).rejects.toThrow('Email already in use');
    });

    it('should send verification email when enabled', async () => {
      process.env.ENABLE_EMAIL_VERIFICATION = 'true';
      
      User.findOne.mockResolvedValue(null);
      const user = {
        _id: 'user123',
        comparePassword: jest.fn().mockResolvedValue(true),
        save: jest.fn().mockResolvedValue(true)
      };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(user)
      });
      Token.createEmailVerificationToken.mockResolvedValue({ token: 'verification_token' });
      authService.sendVerificationEmail.mockResolvedValue(true);

      await userController.changeEmail(req, res, next);

      expect(Token.createEmailVerificationToken).toHaveBeenCalledWith('user123');
      expect(authService.sendVerificationEmail).toHaveBeenCalledWith(user, 'verification_token');

      process.env.ENABLE_EMAIL_VERIFICATION = 'false';
    });
  });

  describe('getUserStats', () => {
    beforeEach(() => {
      req.user.role = 'admin'; // Admin only endpoint
    });

    it('should return user statistics', async () => {
      const mockStats = [{
        totalUsers: [{ count: 100 }],
        activeUsers: [{ count: 85 }],
        verifiedUsers: [{ count: 75 }],
        recentSignups: [{ count: 10 }],
        usersByRole: [
          { _id: 'user', count: 80 },
          { _id: 'admin', count: 5 }
        ],
        userGrowth: [
          { _id: { year: 2024, month: 1 }, count: 20 },
          { _id: { year: 2023, month: 12 }, count: 15 }
        ]
      }];

      User.aggregate.mockResolvedValue(mockStats);

      await userController.getUserStats(req, res, next);

      expect(User.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          totalUsers: 100,
          activeUsers: 85,
          verifiedUsers: 75,
          recentSignups: 10,
          usersByRole: { user: 80, admin: 5 },
          userGrowth: [
            { month: '2024-01', count: 20 },
            { month: '2023-12', count: 15 }
          ]
        })
      });
    });
  });

  describe('getUserActivity', () => {
    beforeEach(() => {
      req.params = { id: 'user123' };
      req.query = { page: 1, limit: 50 };
    });

    it('should get user activity for own profile', async () => {
      const tokens = [
        {
          createdAt: new Date(),
          deviceInfo: { userAgent: 'Test Browser' },
          used: false
        }
      ];

      Token.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(tokens)
      });

      await userController.getUserActivity(req, res, next);

      expect(Token.find).toHaveBeenCalledWith({
        user: 'user123',
        type: 'refresh'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 1,
        data: expect.arrayContaining([
          expect.objectContaining({
            type: 'login',
            status: 'active'
          })
        ])
      });
    });

    it('should allow admin to view other user activity', async () => {
      req.user.role = 'admin';
      req.params.id = 'other_user_id';

      Token.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue([])
      });

      await userController.getUserActivity(req, res, next);

      expect(Token.find).toHaveBeenCalledWith({
        user: 'other_user_id',
        type: 'refresh'
      });
    });

    it('should throw error for unauthorized access', async () => {
      req.params.id = 'other_user_id';

      await expect(userController.getUserActivity(req, res, next)).rejects.toThrow('Not authorized to access this resource');
    });
  });
});
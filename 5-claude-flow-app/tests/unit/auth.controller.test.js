const authController = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/controllers/auth.controller');
const User = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/models/User');
const Token = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/models/token.model');
const authService = require('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/services/auth.service');
const TestHelpers = require('../utils/testHelpers');

// Mock dependencies
jest.mock('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/models/User');
jest.mock('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/models/token.model');
jest.mock('../../1-source-material/reuven-cohen-projects/CLAUDE-FLOW/examples/05-swarm-apps/rest-api-advanced/src/services/auth.service');

describe('Auth Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: null,
      token: null,
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

  describe('register', () => {
    const userData = {
      email: 'test@example.com',
      password: 'TestPass123!',
      name: 'Test User',
      phone: '+1234567890',
      address: {
        street: '123 Main St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345',
        country: 'Test Country'
      }
    };

    beforeEach(() => {
      req.body = userData;
    });

    it('should register a new user successfully', async () => {
      // Mock implementations
      User.findOne.mockResolvedValue(null); // User doesn't exist
      const createdUser = { _id: 'user123', ...userData };
      User.create.mockResolvedValue(createdUser);
      authService.generateAccessToken.mockReturnValue('access_token_123');
      authService.extractDeviceInfo.mockReturnValue({ device: 'test' });
      authService.generateRefreshToken.mockResolvedValue('refresh_token_123');

      await authController.register(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(User.create).toHaveBeenCalledWith(userData);
      expect(authService.generateAccessToken).toHaveBeenCalledWith(createdUser);
      expect(authService.generateRefreshToken).toHaveBeenCalledWith('user123', { device: 'test' });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
          user: createdUser,
          accessToken: 'access_token_123',
          refreshToken: 'refresh_token_123'
        }
      });
    });

    it('should throw error if user already exists', async () => {
      User.findOne.mockResolvedValue({ email: userData.email });

      await expect(authController.register(req, res, next)).rejects.toThrow('User already exists with this email');
    });

    it('should handle email verification when enabled', async () => {
      process.env.ENABLE_EMAIL_VERIFICATION = 'true';
      
      User.findOne.mockResolvedValue(null);
      const createdUser = { _id: 'user123', ...userData };
      User.create.mockResolvedValue(createdUser);
      authService.generateAccessToken.mockReturnValue('access_token_123');
      authService.extractDeviceInfo.mockReturnValue({ device: 'test' });
      authService.generateRefreshToken.mockResolvedValue('refresh_token_123');
      Token.createEmailVerificationToken.mockResolvedValue({ token: 'verification_token' });
      authService.sendVerificationEmail.mockResolvedValue(true);

      await authController.register(req, res, next);

      expect(Token.createEmailVerificationToken).toHaveBeenCalledWith('user123');
      expect(authService.sendVerificationEmail).toHaveBeenCalledWith(createdUser, 'verification_token');
    });

    afterEach(() => {
      process.env.ENABLE_EMAIL_VERIFICATION = 'false';
    });
  });

  describe('login', () => {
    const loginData = {
      email: 'test@example.com',
      password: 'TestPass123!',
      rememberMe: false
    };

    beforeEach(() => {
      req.body = loginData;
    });

    it('should login user successfully', async () => {
      const user = { _id: 'user123', email: loginData.email, isEmailVerified: true };
      User.findByCredentials.mockResolvedValue(user);
      authService.generateAccessToken.mockReturnValue('access_token_123');
      authService.extractDeviceInfo.mockReturnValue({ device: 'test' });
      authService.generateRefreshToken.mockResolvedValue('refresh_token_123');

      await authController.login(req, res, next);

      expect(User.findByCredentials).toHaveBeenCalledWith(loginData.email, loginData.password);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        data: {
          user,
          accessToken: 'access_token_123',
          refreshToken: 'refresh_token_123'
        }
      });
    });

    it('should throw error if email verification is required but not verified', async () => {
      process.env.ENABLE_EMAIL_VERIFICATION = 'true';
      const user = { _id: 'user123', email: loginData.email, isEmailVerified: false };
      User.findByCredentials.mockResolvedValue(user);

      await expect(authController.login(req, res, next)).rejects.toThrow('Please verify your email before logging in');
      
      process.env.ENABLE_EMAIL_VERIFICATION = 'false';
    });

    it('should set longer cookie expiry when rememberMe is true', async () => {
      req.body.rememberMe = true;
      const user = { _id: 'user123', email: loginData.email, isEmailVerified: true };
      User.findByCredentials.mockResolvedValue(user);
      authService.generateAccessToken.mockReturnValue('access_token_123');
      authService.extractDeviceInfo.mockReturnValue({ device: 'test' });
      authService.generateRefreshToken.mockResolvedValue('refresh_token_123');

      await authController.login(req, res, next);

      expect(res.cookie).toHaveBeenCalledWith('token', 'access_token_123', expect.objectContaining({
        expires: expect.any(Date),
        httpOnly: true
      }));
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      req.user = { _id: 'user123', email: 'test@example.com' };
      req.token = 'access_token_123';
      req.body = { refreshToken: 'refresh_token_123' };
    });

    it('should logout user successfully', async () => {
      authService.blacklistToken.mockResolvedValue(true);
      Token.findOneAndDelete.mockResolvedValue({ token: 'refresh_token_123' });

      await authController.logout(req, res, next);

      expect(authService.blacklistToken).toHaveBeenCalledWith('access_token_123');
      expect(Token.findOneAndDelete).toHaveBeenCalledWith({
        token: 'refresh_token_123',
        user: 'user123',
        type: 'refresh'
      });
      expect(res.cookie).toHaveBeenCalledWith('token', 'none', expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('refreshToken', () => {
    beforeEach(() => {
      req.body = { refreshToken: 'refresh_token_123' };
    });

    it('should refresh token successfully', async () => {
      const refreshResult = {
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token'
      };
      authService.refreshAccessToken.mockResolvedValue(refreshResult);

      await authController.refreshToken(req, res, next);

      expect(authService.refreshAccessToken).toHaveBeenCalledWith('refresh_token_123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Token refreshed successfully',
        data: refreshResult
      });
    });
  });

  describe('forgotPassword', () => {
    beforeEach(() => {
      req.body = { email: 'test@example.com' };
    });

    it('should handle forgot password for existing user', async () => {
      const user = { _id: 'user123', email: 'test@example.com' };
      User.findOne.mockResolvedValue(user);
      Token.createPasswordResetToken.mockResolvedValue({ token: 'reset_token' });
      authService.sendPasswordResetEmail.mockResolvedValue(true);

      await authController.forgotPassword(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(Token.createPasswordResetToken).toHaveBeenCalledWith('user123');
      expect(authService.sendPasswordResetEmail).toHaveBeenCalledWith(user, 'reset_token');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should handle forgot password for non-existing user without revealing', async () => {
      User.findOne.mockResolvedValue(null);

      await authController.forgotPassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link.'
      });
    });
  });

  describe('resetPassword', () => {
    beforeEach(() => {
      req.body = { token: 'reset_token', password: 'NewPass123!' };
    });

    it('should reset password successfully', async () => {
      const user = { 
        _id: 'user123', 
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true)
      };
      const tokenDoc = { user };
      Token.verifyToken.mockResolvedValue(tokenDoc);
      authService.generateAccessToken.mockReturnValue('access_token_123');
      authService.extractDeviceInfo.mockReturnValue({ device: 'test' });
      authService.generateRefreshToken.mockResolvedValue('refresh_token_123');

      await authController.resetPassword(req, res, next);

      expect(Token.verifyToken).toHaveBeenCalledWith('reset_token', 'passwordReset');
      expect(user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw error for invalid token', async () => {
      Token.verifyToken.mockResolvedValue(null);

      await expect(authController.resetPassword(req, res, next)).rejects.toThrow('Invalid or expired password reset token');
    });
  });

  describe('verifyEmail', () => {
    beforeEach(() => {
      req.params = { token: 'verification_token' };
    });

    it('should verify email successfully', async () => {
      const user = {
        _id: 'user123',
        email: 'test@example.com',
        save: jest.fn().mockResolvedValue(true)
      };
      const tokenDoc = { user };
      Token.verifyToken.mockResolvedValue(tokenDoc);

      await authController.verifyEmail(req, res, next);

      expect(Token.verifyToken).toHaveBeenCalledWith('verification_token', 'emailVerification');
      expect(user.isEmailVerified).toBe(true);
      expect(user.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should throw error for invalid verification token', async () => {
      Token.verifyToken.mockResolvedValue(null);

      await expect(authController.verifyEmail(req, res, next)).rejects.toThrow('Invalid or expired verification token');
    });
  });

  describe('getMe', () => {
    it('should return current user data', async () => {
      const user = { _id: 'user123', email: 'test@example.com' };
      req.user = user;

      await authController.getMe(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { user }
      });
    });
  });

  describe('checkPasswordStrength', () => {
    it('should check password strength', async () => {
      req.body = { password: 'TestPass123!' };
      const strength = { score: 4, feedback: [] };
      authService.validatePasswordStrength.mockReturnValue(strength);

      await authController.checkPasswordStrength(req, res, next);

      expect(authService.validatePasswordStrength).toHaveBeenCalledWith('TestPass123!');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: strength
      });
    });

    it('should throw error if password is missing', async () => {
      req.body = {};

      await expect(authController.checkPasswordStrength(req, res, next)).rejects.toThrow('Password is required');
    });
  });
});
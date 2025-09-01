const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createError, asyncHandler } = require('../middleware/errorHandler');
const winston = require('winston');

// Generate tokens
const generateTokens = (user) => {
  const accessToken = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();
  return { accessToken, refreshToken };
};

// Set refresh token cookie
const setRefreshTokenCookie = (res, refreshToken) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);
};

// Register new user
exports.register = asyncHandler(async (req, res, next) => {
  const { username, email, password, profile } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return next(createError(400, 'Email already registered'));
    }
    if (existingUser.username === username) {
      return next(createError(400, 'Username already taken'));
    }
  }

  // Create new user
  const userData = {
    username,
    email,
    password,
    profile: profile || {}
  };

  const user = await User.create(userData);

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Save refresh token to user
  user.refreshTokens.push({ token: refreshToken });
  await user.save({ validateBeforeSave: false });

  // Set refresh token cookie
  setRefreshTokenCookie(res, refreshToken);

  // Remove sensitive data
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  winston.info(`New user registered: ${user.email}`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: userResponse,
      accessToken
    }
  });
});

// Login user
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(createError(401, 'Invalid email or password'));
  }

  if (!user.isActive) {
    return next(createError(401, 'Account is deactivated. Please contact support.'));
  }

  // Update last login
  await user.updateLastLogin();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);

  // Save refresh token to user
  user.refreshTokens.push({ token: refreshToken });
  await user.save({ validateBeforeSave: false });

  // Set refresh token cookie
  setRefreshTokenCookie(res, refreshToken);

  // Remove sensitive data
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.refreshTokens;

  winston.info(`User logged in: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: userResponse,
      accessToken
    }
  });
});

// Refresh access token
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!refreshToken) {
    return next(createError(401, 'Refresh token not provided'));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
    
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return next(createError(401, 'Invalid refresh token'));
    }

    // Check if refresh token exists in user's tokens
    const tokenExists = user.refreshTokens.some(tokenObj => tokenObj.token === refreshToken);
    
    if (!tokenExists) {
      return next(createError(401, 'Invalid refresh token'));
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter(tokenObj => tokenObj.token !== refreshToken);
    user.refreshTokens.push({ token: newRefreshToken });
    await user.save({ validateBeforeSave: false });

    // Set new refresh token cookie
    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken
      }
    });

  } catch (error) {
    return next(createError(401, 'Invalid refresh token'));
  }
});

// Logout user
exports.logout = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken && req.user) {
    // Remove refresh token from user
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { refreshTokens: { token: refreshToken } }
    });
  }

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  winston.info(`User logged out: ${req.user?.email || 'Unknown'}`);

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

// Logout from all devices
exports.logoutAll = asyncHandler(async (req, res, next) => {
  // Clear all refresh tokens
  await User.findByIdAndUpdate(req.user._id, {
    $set: { refreshTokens: [] }
  });

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  winston.info(`User logged out from all devices: ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Logged out from all devices successfully'
  });
});

// Get current user profile
exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshTokens')
    .populate({
      path: 'posts',
      select: 'title status createdAt',
      match: { status: { $ne: 'archived' } },
      options: { limit: 5, sort: { createdAt: -1 } }
    });

  if (!user) {
    return next(createError(404, 'User not found'));
  }

  res.status(200).json({
    success: true,
    data: {
      user
    }
  });
});

// Update user profile
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const allowedUpdates = ['username', 'profile'];
  const updates = {};

  // Filter allowed updates
  Object.keys(req.body).forEach(key => {
    if (allowedUpdates.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  // Check if username is already taken
  if (updates.username && updates.username !== req.user.username) {
    const existingUser = await User.findOne({ 
      username: updates.username,
      _id: { $ne: req.user._id }
    });
    
    if (existingUser) {
      return next(createError(400, 'Username already taken'));
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    {
      new: true,
      runValidators: true
    }
  ).select('-password -refreshTokens');

  winston.info(`User profile updated: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user
    }
  });
});

// Change password
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return next(createError(400, 'Current password is incorrect'));
  }

  user.password = newPassword;
  await user.save();

  // Clear all refresh tokens to force re-login
  user.refreshTokens = [];
  await user.save({ validateBeforeSave: false });

  winston.info(`Password changed for user: ${user.email}`);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please log in again.'
  });
});

// Deactivate account
exports.deactivateAccount = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, {
    isActive: false,
    refreshTokens: []
  });

  // Clear refresh token cookie
  res.clearCookie('refreshToken');

  winston.info(`Account deactivated: ${req.user.email}`);

  res.status(200).json({
    success: true,
    message: 'Account deactivated successfully'
  });
});
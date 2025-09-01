const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createError } = require('./errorHandler');

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError(401, 'Access denied. No token provided.'));
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return next(createError(401, 'Access denied. No token provided.'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (!user || !user.isActive) {
      return next(createError(401, 'Invalid token. User not found or inactive.'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(createError(401, 'Invalid token.'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(createError(401, 'Token expired.'));
    }
    next(createError(500, 'Token verification failed.'));
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId).select('-password -refreshTokens');
    
    if (user && user.isActive) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

// Authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, 'Access denied. Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(createError(403, 'Access denied. Insufficient permissions.'));
    }

    next();
  };
};

// Check if user owns resource
const checkOwnership = (resourceField = 'author') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError(401, 'Access denied. Authentication required.'));
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if resource exists and user owns it
    if (req.resource && req.resource[resourceField]) {
      const resourceOwnerId = req.resource[resourceField].toString();
      const userId = req.user._id.toString();
      
      if (resourceOwnerId !== userId) {
        return next(createError(403, 'Access denied. You can only access your own resources.'));
      }
    }

    next();
  };
};

// Rate limiting for sensitive operations
const createRateLimiter = (windowMs, max, message) => {
  const rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message || 'Too many requests, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: message || 'Too many requests, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Specific rate limiters
const authRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  5, // 5 attempts per window
  'Too many authentication attempts, please try again later.'
);

const apiRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'API rate limit exceeded, please try again later.'
);

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  checkOwnership,
  authRateLimit,
  apiRateLimit,
  createRateLimiter
};
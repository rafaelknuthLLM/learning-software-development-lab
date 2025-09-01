# API Structure and Middleware Design

## Overview

This document outlines the REST API structure, middleware pipeline, and routing architecture for the system.

## API Structure

### Directory Structure

```
src/
├── controllers/          # Request handlers
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── resource.controller.ts
│   └── index.ts
├── middleware/           # Custom middleware
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── rateLimit.middleware.ts
│   ├── logging.middleware.ts
│   ├── error.middleware.ts
│   └── index.ts
├── routes/              # Route definitions
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── resource.routes.ts
│   ├── health.routes.ts
│   └── index.ts
├── services/            # Business logic
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── resource.service.ts
│   ├── email.service.ts
│   └── index.ts
├── repositories/        # Data access layer
│   ├── user.repository.ts
│   ├── resource.repository.ts
│   ├── base.repository.ts
│   └── index.ts
├── models/              # Data models
│   ├── user.model.ts
│   ├── resource.model.ts
│   └── index.ts
├── validators/          # Input validation schemas
│   ├── auth.validator.ts
│   ├── user.validator.ts
│   ├── resource.validator.ts
│   └── index.ts
├── utils/               # Utility functions
│   ├── jwt.util.ts
│   ├── password.util.ts
│   ├── logger.util.ts
│   └── index.ts
├── config/              # Configuration
│   ├── database.config.ts
│   ├── redis.config.ts
│   ├── app.config.ts
│   └── index.ts
└── app.ts              # Express application setup
```

## Middleware Pipeline

### Request Flow

```
Request
    ↓
1. Logging Middleware (Request ID, Timestamp)
    ↓
2. Security Middleware (CORS, Helmet, Rate Limiting)
    ↓
3. Body Parsing (JSON, URL-encoded)
    ↓
4. Authentication Middleware (JWT Validation)
    ↓
5. Authorization Middleware (Permission Check)
    ↓
6. Validation Middleware (Schema Validation)
    ↓
7. Route Handler (Business Logic)
    ↓
8. Response Middleware (Format Response)
    ↓
9. Error Handling Middleware (Error Response)
    ↓
Response
```

### Core Middleware Implementation

#### 1. Logging Middleware

```typescript
// middleware/logging.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.util';

export interface RequestWithId extends Request {
  id: string;
  startTime: number;
}

export const loggingMiddleware = (
  req: RequestWithId,
  res: Response,
  next: NextFunction
) => {
  req.id = uuidv4();
  req.startTime = Date.now();
  
  logger.info('Request started', {
    requestId: req.id,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    logger.info('Request completed', {
      requestId: req.id,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });
  
  next();
};
```

#### 2. Authentication Middleware

```typescript
// middleware/auth.middleware.ts
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RequestWithUser } from '../types/request.types';
import { UnauthorizedError } from '../utils/errors.util';
import { redisClient } from '../config/redis.config';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tokenId: string;
}

export const authenticateToken = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      throw new UnauthorizedError('Access token required');
    }
    
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JWTPayload;
    
    // Check if token is blacklisted (logout/revoked)
    const isBlacklisted = await redisClient.get(`blacklist:${decoded.tokenId}`);
    if (isBlacklisted) {
      throw new UnauthorizedError('Token has been revoked');
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid access token'));
    } else {
      next(error);
    }
  }
};

export const optionalAuth = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    await authenticateToken(req, res, next);
  } catch {
    // Continue without authentication
    next();
  }
};
```

#### 3. Authorization Middleware

```typescript
// middleware/authorization.middleware.ts
import { Response, NextFunction } from 'express';
import { RequestWithUser } from '../types/request.types';
import { ForbiddenError } from '../utils/errors.util';
import { UserService } from '../services/user.service';

export const authorize = (
  requiredPermissions: string[]
) => {
  return async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }
      
      const userService = new UserService();
      const permissions = await userService.getUserPermissions(req.user.userId);
      
      const hasPermission = requiredPermissions.some(permission =>
        permissions.includes(permission) ||
        permissions.includes('admin:all')
      );
      
      if (!hasPermission) {
        throw new ForbiddenError('Insufficient permissions');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const authorizeOwnerOrAdmin = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }
    
    const resourceId = req.params.id;
    const userId = req.user.userId;
    
    // Check if user is admin or owner of the resource
    const userService = new UserService();
    const permissions = await userService.getUserPermissions(userId);
    
    if (permissions.includes('admin:all')) {
      return next();
    }
    
    // Check ownership (implementation depends on resource type)
    const isOwner = await userService.isResourceOwner(userId, resourceId);
    
    if (!isOwner) {
      throw new ForbiddenError('Access denied to this resource');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
```

#### 4. Rate Limiting Middleware

```typescript
// middleware/rateLimit.middleware.ts
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from '../config/redis.config';

// General API rate limiting
export const generalRateLimit = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:general:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limiting for auth endpoints
export const authRateLimit = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many authentication attempts',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// User-specific rate limiting
export const userRateLimit = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:user:'
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5000, // limit each user to 5000 requests per hour
  keyGenerator: (req: any) => req.user?.userId || req.ip,
  message: {
    error: 'Too many requests from this user',
    retryAfter: '1 hour'
  }
});
```

#### 5. Validation Middleware

```typescript
// middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { BadRequestError } from '../utils/errors.util';

export const validate = (schema: {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        const { error, value } = schema.body.validate(req.body);
        if (error) {
          throw new BadRequestError(`Body validation error: ${error.details[0].message}`);
        }
        req.body = value;
      }
      
      if (schema.params) {
        const { error, value } = schema.params.validate(req.params);
        if (error) {
          throw new BadRequestError(`Params validation error: ${error.details[0].message}`);
        }
        req.params = value;
      }
      
      if (schema.query) {
        const { error, value } = schema.query.validate(req.query);
        if (error) {
          throw new BadRequestError(`Query validation error: ${error.details[0].message}`);
        }
        req.query = value;
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};
```

#### 6. Error Handling Middleware

```typescript
// middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.util';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('API Error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }
  
  // Duplicate key error
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    statusCode = 409;
    message = 'Duplicate resource';
  }
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(isDevelopment && { stack: err.stack })
    }
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found'
    }
  });
};
```

## Route Structure

### API Versioning

```typescript
// routes/index.ts
import express from 'express';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { resourceRoutes } from './resource.routes';
import { healthRoutes } from './health.routes';

const router = express.Router();

// API versioning
router.use('/v1/auth', authRoutes);
router.use('/v1/users', userRoutes);
router.use('/v1/resources', resourceRoutes);
router.use('/health', healthRoutes);

export { router as apiRoutes };
```

### Sample Route Implementation

```typescript
// routes/user.routes.ts
import express from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorize, authorizeOwnerOrAdmin } from '../middleware/authorization.middleware';
import { validate } from '../middleware/validation.middleware';
import { userValidators } from '../validators/user.validator';
import { userRateLimit } from '../middleware/rateLimit.middleware';

const router = express.Router();
const userController = new UserController();

// Apply rate limiting to all user routes
router.use(userRateLimit);

// Get all users (admin only)
router.get('/',
  authenticateToken,
  authorize(['users:read', 'admin:all']),
  validate({ query: userValidators.getUsersQuery }),
  userController.getUsers
);

// Get user by ID (owner or admin)
router.get('/:id',
  authenticateToken,
  authorizeOwnerOrAdmin,
  validate({ params: userValidators.getUserParams }),
  userController.getUserById
);

// Update user (owner or admin)
router.put('/:id',
  authenticateToken,
  authorizeOwnerOrAdmin,
  validate({
    params: userValidators.getUserParams,
    body: userValidators.updateUserBody
  }),
  userController.updateUser
);

// Delete user (admin only)
router.delete('/:id',
  authenticateToken,
  authorize(['users:delete', 'admin:all']),
  validate({ params: userValidators.getUserParams }),
  userController.deleteUser
);

export { router as userRoutes };
```

## Response Format Standardization

```typescript
// utils/response.util.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
  };
}

export const successResponse = <T>(
  data: T,
  meta?: any
): ApiResponse<T> => ({
  success: true,
  data,
  ...(meta && { meta })
});

export const errorResponse = (
  message: string,
  details?: any
): ApiResponse => ({
  success: false,
  error: {
    message,
    ...(details && { details })
  }
});
```

This middleware pipeline provides a robust foundation for request handling, security, validation, and error management in the REST API system.
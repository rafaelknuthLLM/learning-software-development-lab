# Security Architecture

## Overview

This document outlines the comprehensive security architecture for the REST API system, covering authentication, authorization, data protection, and security best practices.

## Security Principles

1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Users get minimum necessary permissions
3. **Zero Trust**: Verify every request regardless of source
4. **Fail Secure**: System fails to secure state when errors occur
5. **Security by Design**: Security built into every component

## Authentication Architecture

### JWT-Based Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │ API Gateway │    │Auth Service │    │  Database   │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │                  │
       │ 1. Login Request │                  │                  │
       ├─────────────────▶│                  │                  │
       │                  │ 2. Validate      │                  │
       │                  ├─────────────────▶│                  │
       │                  │                  │ 3. Check User    │
       │                  │                  ├─────────────────▶│
       │                  │                  │◀─────────────────┤
       │                  │ 4. Generate JWT  │                  │
       │                  │◀─────────────────┤                  │
       │ 5. JWT + Refresh │                  │                  │
       │◀─────────────────┤                  │                  │
       │                  │                  │                  │
       │ 6. API Request   │                  │                  │
       │    + JWT         │                  │                  │
       ├─────────────────▶│                  │                  │
       │                  │ 7. Verify JWT    │                  │
       │                  │ (middleware)     │                  │
       │                  │                  │                  │
       │ 8. API Response  │                  │                  │
       │◀─────────────────┤                  │                  │
```

### JWT Implementation

```typescript
// services/auth.service.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserRepository } from '../repositories/user.repository';
import { redisClient } from '../config/redis.config';

export class AuthService {
  private userRepository: UserRepository;
  
  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(email: string, password: string, ipAddress: string, userAgent: string) {
    // 1. Validate user credentials
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // 2. Generate token ID and JWT
    const tokenId = uuidv4();
    const accessToken = this.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role.name,
      tokenId
    });

    const refreshToken = this.generateRefreshToken(user.id, tokenId);

    // 3. Store session
    await this.storeSession({
      userId: user.id,
      tokenId,
      refreshToken,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // 4. Update last login
    await this.userRepository.updateLastLogin(user.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role.name
      }
    };
  }

  private generateAccessToken(payload: any): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      issuer: process.env.JWT_ISSUER || 'rest-api',
      audience: process.env.JWT_AUDIENCE || 'api-users'
    });
  }

  private generateRefreshToken(userId: string, tokenId: string): string {
    return jwt.sign(
      { userId, tokenId, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      {
        expiresIn: '7d',
        issuer: process.env.JWT_ISSUER || 'rest-api',
        audience: process.env.JWT_AUDIENCE || 'api-users'
      }
    );
  }

  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as any;

      // Verify session exists
      const session = await this.userRepository.getSessionByTokenId(decoded.tokenId);
      if (!session || session.expires_at < new Date()) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new tokens
      const user = await this.userRepository.findById(decoded.userId);
      const newTokenId = uuidv4();
      
      const newAccessToken = this.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role.name,
        tokenId: newTokenId
      });

      const newRefreshToken = this.generateRefreshToken(user.id, newTokenId);

      // Update session
      await this.userRepository.updateSession(session.id, {
        token_id: newTokenId,
        refresh_token: newRefreshToken
      });

      // Blacklist old tokens
      await this.blacklistToken(decoded.tokenId);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(tokenId: string): Promise<void> {
    await this.blacklistToken(tokenId);
    await this.userRepository.deleteSession(tokenId);
  }

  private async blacklistToken(tokenId: string): Promise<void> {
    const ttl = 15 * 60; // 15 minutes (access token expiry)
    await redisClient.setex(`blacklist:${tokenId}`, ttl, '1');
  }
}
```

## Authorization System

### Role-Based Access Control (RBAC)

```typescript
// services/authorization.service.ts
export class AuthorizationService {
  private userRepository: UserRepository;
  
  constructor() {
    this.userRepository = new UserRepository();
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const cacheKey = `permissions:${userId}`;
    
    // Try cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch from database
    const permissions = await this.userRepository.getUserPermissions(userId);
    const permissionNames = permissions.map(p => p.name);

    // Cache for 5 minutes
    await redisClient.setex(cacheKey, 300, JSON.stringify(permissionNames));

    return permissionNames;
  }

  async hasPermission(userId: string, requiredPermission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    
    return permissions.includes(requiredPermission) || 
           permissions.includes('admin:all');
  }

  async hasAnyPermission(userId: string, requiredPermissions: string[]): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    
    if (permissions.includes('admin:all')) {
      return true;
    }

    return requiredPermissions.some(permission => 
      permissions.includes(permission)
    );
  }

  async canAccessResource(userId: string, resourceType: string, resourceId: string, action: string): Promise<boolean> {
    // Check general permission
    const hasGeneralPermission = await this.hasPermission(userId, `${resourceType}:${action}`);
    if (hasGeneralPermission) {
      return true;
    }

    // Check resource ownership
    const isOwner = await this.userRepository.isResourceOwner(userId, resourceType, resourceId);
    if (isOwner && ['read', 'update'].includes(action)) {
      return true;
    }

    return false;
  }
}
```

## Input Validation & Sanitization

### Comprehensive Validation Schema

```typescript
// validators/auth.validator.ts
import Joi from 'joi';

export const authValidators = {
  loginSchema: {
    body: Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'any.required': 'Email is required'
        }),
      password: Joi.string()
        .min(8)
        .required()
        .messages({
          'string.min': 'Password must be at least 8 characters',
          'any.required': 'Password is required'
        })
    })
  },

  registerSchema: {
    body: Joi.object({
      email: Joi.string()
        .email()
        .required(),
      username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
      password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
        .messages({
          'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character'
        }),
      firstName: Joi.string()
        .min(1)
        .max(50)
        .required(),
      lastName: Joi.string()
        .min(1)
        .max(50)
        .required()
    })
  },

  refreshTokenSchema: {
    body: Joi.object({
      refreshToken: Joi.string().required()
    })
  }
};
```

## Data Protection

### Encryption Strategy

```typescript
// utils/encryption.util.ts
import crypto from 'crypto';

export class EncryptionUtil {
  private static algorithm = 'aes-256-gcm';
  private static secretKey = process.env.ENCRYPTION_KEY!; // 32 byte key

  static encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.secretKey);
    cipher.setAAD(Buffer.from('additional-data'));

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  static decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher(this.algorithm, this.secretKey);
    decipher.setAAD(Buffer.from('additional-data'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  static hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
```

## Security Headers

```typescript
// middleware/security.middleware.ts
import helmet from 'helmet';
import cors from 'cors';

export const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }),

  cors({
    origin: (origin, callback) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
];
```

## Security Monitoring & Logging

```typescript
// services/security-monitor.service.ts
export class SecurityMonitorService {
  private logger: Logger;
  
  constructor() {
    this.logger = new Logger('SecurityMonitor');
  }

  logFailedLogin(email: string, ipAddress: string, userAgent: string): void {
    this.logger.warn('Failed login attempt', {
      email,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
      severity: 'medium'
    });

    // Check for brute force attacks
    this.checkBruteForceAttempt(email, ipAddress);
  }

  logSuspiciousActivity(userId: string, activity: string, details: any): void {
    this.logger.error('Suspicious activity detected', {
      userId,
      activity,
      details,
      timestamp: new Date().toISOString(),
      severity: 'high'
    });

    // Trigger security alerts if needed
    this.triggerSecurityAlert(userId, activity, details);
  }

  private async checkBruteForceAttempt(email: string, ipAddress: string): Promise<void> {
    const emailKey = `failed_attempts:email:${email}`;
    const ipKey = `failed_attempts:ip:${ipAddress}`;
    
    const emailAttempts = await redisClient.incr(emailKey);
    const ipAttempts = await redisClient.incr(ipKey);
    
    await redisClient.expire(emailKey, 900); // 15 minutes
    await redisClient.expire(ipKey, 900);

    if (emailAttempts >= 5 || ipAttempts >= 10) {
      this.logger.error('Potential brute force attack', {
        email,
        ipAddress,
        emailAttempts,
        ipAttempts,
        severity: 'critical'
      });

      // Implement temporary lockout or additional security measures
      await this.implementTemporaryLockout(email, ipAddress);
    }
  }

  private async implementTemporaryLockout(email: string, ipAddress: string): Promise<void> {
    const lockoutDuration = 3600; // 1 hour in seconds
    
    await redisClient.setex(`lockout:email:${email}`, lockoutDuration, '1');
    await redisClient.setex(`lockout:ip:${ipAddress}`, lockoutDuration, '1');

    this.logger.warn('Temporary lockout implemented', {
      email,
      ipAddress,
      duration: lockoutDuration
    });
  }
}
```

## API Security Checklist

### ✅ Authentication & Authorization
- [x] JWT-based authentication with refresh tokens
- [x] Role-based access control (RBAC)
- [x] Permission-based authorization
- [x] Token blacklisting on logout
- [x] Session management with expiration

### ✅ Input Validation & Sanitization
- [x] Schema validation with Joi
- [x] SQL injection prevention
- [x] XSS protection
- [x] Input length limits
- [x] Special character handling

### ✅ Rate Limiting & DDoS Protection
- [x] API rate limiting per IP
- [x] User-specific rate limiting
- [x] Authentication endpoint protection
- [x] Redis-based rate limit storage

### ✅ Data Protection
- [x] Password hashing with bcrypt (salt rounds ≥ 12)
- [x] Sensitive data encryption
- [x] HTTPS enforcement
- [x] Secure cookie settings

### ✅ Security Headers
- [x] Helmet.js security headers
- [x] CORS configuration
- [x] Content Security Policy
- [x] HSTS headers

### ✅ Monitoring & Logging
- [x] Security event logging
- [x] Failed login attempt tracking
- [x] Suspicious activity detection
- [x] Brute force attack prevention

### ✅ Infrastructure Security
- [x] Environment variable management
- [x] Database connection security
- [x] Redis connection security
- [x] Secret rotation strategy

This security architecture provides comprehensive protection for the REST API system while maintaining usability and performance.
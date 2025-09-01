const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
require('dotenv').config();
require('express-async-errors');

const { connectDatabase } = require('../config/database');
const { globalErrorHandler, notFound } = require('./middleware/errorHandler');
const routes = require('./routes');
const winston = require('winston');

// Create Express app
const app = express();

// Trust proxy (for rate limiting and correct IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:3001'];
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ 
  limit: process.env.JSON_LIMIT || '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        error: 'Invalid JSON payload'
      });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: process.env.URLENCODED_LIMIT || '10mb' 
}));

app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: message => winston.info(message.trim()) }
  }));
}

// Request logging
app.use((req, res, next) => {
  winston.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check endpoint (before rate limiting)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}`, routes);

// Serve API documentation (if enabled)
if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_DOCS === 'true') {
  app.get('/api/docs', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'API Documentation',
      version: API_VERSION,
      baseUrl: `/api/${API_VERSION}`,
      endpoints: {
        auth: {
          register: 'POST /auth/register',
          login: 'POST /auth/login',
          refreshToken: 'POST /auth/refresh-token',
          profile: 'GET /auth/profile',
          updateProfile: 'PATCH /auth/profile',
          changePassword: 'PATCH /auth/change-password',
          logout: 'POST /auth/logout',
          logoutAll: 'POST /auth/logout-all',
          deactivate: 'DELETE /auth/deactivate'
        },
        posts: {
          getAllPosts: 'GET /posts',
          getPost: 'GET /posts/:id',
          createPost: 'POST /posts',
          updatePost: 'PATCH /posts/:id',
          deletePost: 'DELETE /posts/:id',
          searchPosts: 'GET /posts/search',
          likePost: 'POST /posts/:id/like',
          getPostStats: 'GET /posts/:id/stats'
        },
        users: {
          getAllUsers: 'GET /users (admin)',
          getUser: 'GET /users/:userId',
          updateUser: 'PATCH /users/:userId (admin)',
          deleteUser: 'DELETE /users/:userId (admin)',
          getUserPosts: 'GET /users/:userId/posts',
          getUserActivity: 'GET /users/:userId/activity',
          getDashboard: 'GET /users/dashboard/stats'
        }
      },
      authentication: {
        type: 'Bearer Token',
        header: 'Authorization: Bearer <token>',
        refreshToken: 'Cookie: refreshToken or Body: refreshToken'
      },
      rateLimit: {
        api: '100 requests per 15 minutes',
        auth: '5 requests per 15 minutes'
      }
    });
  });
}

// Handle 404 for undefined routes
app.use(notFound);

// Global error handling middleware
app.use(globalErrorHandler);

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  winston.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    winston.info('HTTP server closed.');
    
    // Close database connection
    require('mongoose').connection.close((err) => {
      winston.info('MongoDB connection closed.');
      process.exit(err ? 1 : 0);
    });
  });
};

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  winston.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  winston.error('Unhandled Rejection at:', promise, 'reason:', err);
  process.exit(1);
});

// Graceful shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Connect to database and start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start server
    const server = app.listen(PORT, HOST, () => {
      winston.info(`Server running on http://${HOST}:${PORT}`);
      winston.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      winston.info(`API Version: ${API_VERSION}`);
      winston.info(`Health check: http://${HOST}:${PORT}/health`);
      winston.info(`API docs: http://${HOST}:${PORT}/api/docs`);
    });

    // Store server reference for graceful shutdown
    global.server = server;

    // Server timeout configuration
    server.keepAliveTimeout = 65000; // Slightly higher than load balancer timeout
    server.headersTimeout = 66000; // Slightly higher than keepAliveTimeout

  } catch (error) {
    winston.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
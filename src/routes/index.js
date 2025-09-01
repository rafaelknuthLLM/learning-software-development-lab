const express = require('express');
const authRoutes = require('./auth');
const postRoutes = require('./posts');
const userRoutes = require('./users');
const { apiRateLimit } = require('../middleware/auth');

const router = express.Router();

// API health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0'
  });
});

// API info
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'REST API Backend',
    version: process.env.API_VERSION || '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      posts: '/api/v1/posts',
      users: '/api/v1/users'
    },
    documentation: process.env.API_DOCS_URL || '/api/docs'
  });
});

// Apply rate limiting to all API routes
router.use(apiRateLimit);

// Route definitions
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/users', userRoutes);

module.exports = router;
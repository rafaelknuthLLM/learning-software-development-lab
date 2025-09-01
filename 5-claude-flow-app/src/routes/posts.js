const express = require('express');
const postController = require('../controllers/postController');
const { authenticate, optionalAuth, authorize, checkOwnership } = require('../middleware/auth');
const { postValidation, queryValidation } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, queryValidation.pagination, queryValidation.search, postController.getAllPosts);
router.get('/search', queryValidation.search, postController.searchPosts);
router.get('/:id', optionalAuth, postController.getPost);

// Protected routes
router.use(authenticate); // All routes below require authentication

// User routes
router.post('/', postValidation.create, postController.createPost);
router.patch('/:id', postValidation.update, postController.updatePost);
router.delete('/:id', postController.deletePost);
router.post('/:id/like', postController.toggleLike);

// Author/Admin routes
router.get('/:id/stats', postController.getPostStats);

module.exports = router;
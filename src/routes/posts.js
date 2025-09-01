const express = require('express');
const postController = require('../controllers/postController');
const { authenticate, optionalAuth, authorize, checkOwnership } = require('../middleware/auth');
const { postValidation, paramValidation, queryValidation } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, queryValidation.pagination, queryValidation.search, postController.getAllPosts);
router.get('/search', queryValidation.search, postController.searchPosts);
router.get('/:id', optionalAuth, paramValidation.objectId, postController.getPost);

// Protected routes
router.use(authenticate); // All routes below require authentication

// User routes
router.post('/', postValidation.create, postController.createPost);
router.patch('/:id', paramValidation.objectId, postValidation.update, postController.updatePost);
router.delete('/:id', paramValidation.objectId, postController.deletePost);
router.post('/:id/like', paramValidation.objectId, postController.toggleLike);

// Author/Admin routes
router.get('/:id/stats', paramValidation.objectId, postController.getPostStats);

module.exports = router;
const express = require('express');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { queryValidation } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/:userId', optionalAuth, userController.getUser);
router.get('/:userId/posts', optionalAuth, queryValidation.pagination, postController.getUserPosts);
router.get('/:userId/activity', optionalAuth, queryValidation.pagination, userController.getUserActivity);

// Protected routes
router.use(authenticate); // All routes below require authentication

// User routes
router.get('/dashboard/stats', userController.getUserDashboard);
router.post('/:userId/follow', userController.toggleFollow);

// Admin only routes
router.get('/', authorize('admin'), queryValidation.pagination, userController.getAllUsers);
router.patch('/:userId', authorize('admin'), userController.updateUser);
router.delete('/:userId', authorize('admin'), userController.deleteUser);

module.exports = router;
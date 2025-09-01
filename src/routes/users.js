const express = require('express');
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { paramValidation, queryValidation } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/:userId', optionalAuth, paramValidation.userId, userController.getUser);
router.get('/:userId/posts', optionalAuth, paramValidation.userId, queryValidation.pagination, postController.getUserPosts);
router.get('/:userId/activity', optionalAuth, paramValidation.userId, queryValidation.pagination, userController.getUserActivity);

// Protected routes
router.use(authenticate); // All routes below require authentication

// User routes
router.get('/dashboard/stats', userController.getUserDashboard);
router.post('/:userId/follow', paramValidation.userId, userController.toggleFollow);

// Admin only routes
router.get('/', authorize('admin'), queryValidation.pagination, userController.getAllUsers);
router.patch('/:userId', authorize('admin'), paramValidation.userId, userController.updateUser);
router.delete('/:userId', authorize('admin'), paramValidation.userId, userController.deleteUser);

module.exports = router;
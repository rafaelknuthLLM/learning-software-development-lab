const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, authRateLimit } = require('../middleware/auth');
const { userValidation } = require('../middleware/validation');

const router = express.Router();

// Public routes with rate limiting
router.post('/register', authRateLimit, userValidation.register, authController.register);
router.post('/login', authRateLimit, userValidation.login, authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/profile', authController.getProfile);
router.patch('/profile', userValidation.updateProfile, authController.updateProfile);
router.patch('/change-password', userValidation.changePassword, authController.changePassword);
router.post('/logout', authController.logout);
router.post('/logout-all', authController.logoutAll);
router.delete('/deactivate', authController.deactivateAccount);

module.exports = router;
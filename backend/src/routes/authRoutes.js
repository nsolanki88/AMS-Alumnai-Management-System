const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateJWT } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// Public auth routes
router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/resend-otp', authLimiter, AuthController.resendOtp);
router.post('/refresh', AuthController.refresh);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.get('/me', authenticateJWT, AuthController.getMe);

module.exports = router;

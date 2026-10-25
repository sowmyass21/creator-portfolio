import express from 'express';
import { register, login, logout, getMe, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { 
  validateRegister, 
  validateLogin, 
  validateForgotPassword, 
  validateResetPassword 
} from '../middleware/validationMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user account (forces USER role by default)
 * @access  Public
 */
router.post('/register', authRateLimiter, validateRegister, register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & issue HTTP-only cookie
 * @access  Public
 */
router.post('/login', authRateLimiter, validateLogin, login);

/**
 * @route   POST /api/auth/logout
 * @desc    Clear HTTP-only cookie and logout user
 * @access  Public
 */
router.post('/logout', logout);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Generate password reset token and send instructions via email
 * @access  Public
 */
router.post('/forgot-password', authRateLimiter, validateForgotPassword, forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset user password using valid token and auto-login
 * @access  Public
 */
router.post('/reset-password', authRateLimiter, validateResetPassword, resetPassword);

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated user session details
 * @access  Private (Authenticated)
 */
router.get('/me', authenticate, getMe);

export default router;

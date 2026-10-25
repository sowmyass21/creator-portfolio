import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization || req.cookies?.token) {
    return authenticate(req, res, next);
  }
  next();
};

/**
 * @route   GET /api/profile
 * @desc    Get primary creator profile details for authenticated user
 * @access  Private (Authenticated)
 */
router.get('/', authenticate, getProfile);

/**
 * @route   PUT /api/profile
 * @desc    Update creator profile details
 * @access  Private (Authenticated)
 */
router.put('/', authenticate, updateProfile);

export default router;


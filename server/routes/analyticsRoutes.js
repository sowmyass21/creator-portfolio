import express from 'express';
import { 
  getOverview, 
  getHistory, 
  getPlatformAnalytics 
} from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce authentication on all analytics endpoints to isolate metrics by authenticated user
router.use(authenticate);

/**
 * @route   GET /api/analytics/overview
 * @desc    Get aggregated overview metrics & percentage growth rates for current user
 * @access  Private
 */
router.get('/overview', getOverview);

/**
 * @route   GET /api/analytics/history
 * @desc    Get historical time series analytics (range: 7d, 30d, 90d, 1y) for current user
 * @access  Private
 */
router.get('/history', getHistory);

/**
 * @route   GET /api/analytics/platform/:platform
 * @desc    Get platform specific historical analytics for current user
 * @access  Private
 */
router.get('/platform/:platform', getPlatformAnalytics);

export default router;

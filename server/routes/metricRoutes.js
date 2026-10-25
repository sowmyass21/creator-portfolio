import express from 'express';
import { getMetrics } from '../controllers/metricController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce authentication to isolate metrics by authenticated owner
router.use(authenticate);

/**
 * @route   GET /api/metrics
 * @desc    Get social metrics across platforms for authenticated user
 * @access  Private
 */
router.get('/', getMetrics);

export default router;

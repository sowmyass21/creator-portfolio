import express from 'express';
import { triggerSync, getSyncStatus } from '../controllers/syncController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/sync
 * @desc    Manually trigger platform metric synchronization
 * @access  Private (Authenticated)
 */
router.post('/', authenticate, triggerSync);

/**
 * @route   GET /api/sync/status
 * @desc    Get current sync status & last updated timestamp
 * @access  Public
 */
router.get('/status', getSyncStatus);

export default router;

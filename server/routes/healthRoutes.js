import express from 'express';
import { getHealth } from '../controllers/healthController.js';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Get API system status and database connectivity
 * @access  Public
 */
router.get('/', getHealth);

export default router;

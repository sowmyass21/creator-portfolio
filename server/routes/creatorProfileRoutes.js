import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  getCreatorProfile,
  confirmSocialProfile,
  syncLiveMetrics,
} from '../controllers/creatorProfileController.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getCreatorProfile);
router.post('/confirm-social', confirmSocialProfile);
router.post('/sync', syncLiveMetrics);

export default router;

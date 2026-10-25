import express from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { getAdminOverview, triggerSync, generateAiContent } from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication AND 'ADMIN' role
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/overview', getAdminOverview);
router.post('/sync', triggerSync);
router.post('/ai-generate', generateAiContent);

export default router;

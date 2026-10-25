import express from 'express';
import {
  generateContent,
  getAllContent,
  getApprovedContent,
  updateContent,
  toggleApproveContent,
  regenerateSectionContent,
  publishApprovedContent
} from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for public portfolio view to fetch approved AI content
router.get('/content/approved', getApprovedContent);

// Protected routes for admin / creator management
router.use(protect);

router.post('/generate', generateContent);
router.get('/content', getAllContent);
router.put('/content/:id', updateContent);
router.post('/content/:id/approve', toggleApproveContent);
router.post('/content/:id/regenerate', regenerateSectionContent);
router.post('/content/publish', publishApprovedContent);

export default router;


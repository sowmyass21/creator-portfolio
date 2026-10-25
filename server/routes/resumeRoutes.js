import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { resumeUploadMiddleware } from '../middleware/uploadMiddleware.js';
import {
  uploadResume,
  getResumeById,
  getResumeStatusById,
  getResumeDataById,
  updateResumeDataById,
  deleteResumeById,
  getResumeFileById,
  getResumeVersions,
  getResumeVersionById,
  applyResumeVersion,
  keepExistingResumeVersion,
  getResumeProfile,
  updateResumeProfile,
  getResumeStatus,
  getParsedResume,
  updateParsedResume,
} from '../controllers/resumeController.js';
import { sendError } from '../utils/responseHandler.js';

const router = express.Router();

router.use(authenticate);

// Custom upload handler wrapper to handle Multer errors cleanly
const handleUploadMiddleware = (req, res, next) => {
  resumeUploadMiddleware(req, res, (err) => {
    if (err) {
      const statusCode = err.statusCode || (err.code === 'LIMIT_FILE_SIZE' ? 400 : 400);
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? 'File size exceeds maximum limit of 10 MB.'
        : err.message || 'File upload error.';
      return sendError(res, message, statusCode);
    }
    next();
  });
};

router.post('/upload', handleUploadMiddleware, uploadResume);

// Static named routes
router.get('/versions', getResumeVersions);
router.get('/versions/:versionId', getResumeVersionById);
router.post('/versions/:versionId/apply', applyResumeVersion);
router.post('/versions/:versionId/keep-existing', keepExistingResumeVersion);

router.get('/profile', getResumeProfile);
router.put('/profile', updateResumeProfile);
router.get('/status', getResumeStatus);
router.get('/parsed', getParsedResume);
router.put('/parsed', updateParsedResume);

// Parameterized ID routes for Phase 17
router.get('/:id/data', getResumeDataById);
router.put('/:id/data', updateResumeDataById);

router.get('/:id/status', getResumeStatusById);
router.get('/:id/file', getResumeFileById);
router.get('/:id', getResumeById);
router.delete('/:id', deleteResumeById);

export default router;

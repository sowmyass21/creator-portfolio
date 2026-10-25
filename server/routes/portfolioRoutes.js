import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  createPortfolio,
  getPortfolio,
  getPortfolioById,
  updatePortfolioById,
  deletePortfolioById,
  generatePortfolio,
  updateCustomization,
  publishPortfolio,
  unpublishPortfolio,
  validateSlug,
  enhanceContent,
  acceptEnhancement,
} from '../controllers/portfolioController.js';

const router = express.Router();

// Allow optional authentication for GET /:slug so public visitors can view published portfolios while owners can view draft previews
const optionalAuthenticate = (req, res, next) => {
  if (req.headers.authorization || req.cookies?.token) {
    return authenticate(req, res, next);
  }
  next();
};

// Public/Owner GET by slug or ID
router.get('/:slug', optionalAuthenticate, getPortfolio);

// Protected Portfolio API Routes (Requires Auth)
router.use(authenticate);

router.post('/generate', generatePortfolio);
router.post('/publish', publishPortfolio);
router.post('/unpublish', unpublishPortfolio);
router.post('/:id/publish', publishPortfolio);
router.post('/:id/unpublish', unpublishPortfolio);

router.post('/', createPortfolio);
router.get('/', getPortfolio);
router.put('/customize', updateCustomization);
router.put('/:id', updatePortfolioById);
router.delete('/:id', deletePortfolioById);
router.post('/validate-slug', validateSlug);
router.post('/enhance-content', enhanceContent);
router.post('/accept-enhancement', acceptEnhancement);

export default router;

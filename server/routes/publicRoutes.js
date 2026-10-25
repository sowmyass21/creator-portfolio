import express from 'express';
import { getPublicPortfolioBySlug } from '../controllers/publicController.js';

const router = express.Router();

// Public endpoint (NO authentication middleware)
router.get('/portfolio/:slug', getPublicPortfolioBySlug);

export default router;

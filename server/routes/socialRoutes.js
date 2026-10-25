import express from 'express';
import { 
  getUniversalSocial, 
  getSocialPlatforms, 
  upsertSocialPlatform, 
  deleteSocialPlatform,
  getOAuthAuthorizeUrl,
  handleOAuthCallback
} from '../controllers/socialController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/social
 * @desc    Get universal normalized social metrics for the authenticated user
 * @access  Private (Authenticated)
 */
router.get('/', authenticate, getUniversalSocial);

/**
 * @route   GET /api/social/platforms
 * @desc    Get list of connected platforms for the authenticated user
 * @access  Private (Authenticated)
 */
router.get('/platforms', authenticate, getSocialPlatforms);

/**
 * @route   POST /api/social/platforms
 * @desc    Connect and verify social platform configuration for the authenticated user
 * @access  Private (Authenticated)
 */
router.post('/platforms', authenticate, upsertSocialPlatform);

/**
 * @route   DELETE /api/social/platforms/:platform
 * @desc    Disconnect social platform for the authenticated user
 * @access  Private (Authenticated)
 */
router.delete('/platforms/:platform', authenticate, deleteSocialPlatform);

/**
 * @route   GET /api/social/oauth/:platform/authorize
 * @desc    Generate OAuth authorization URL for connecting a platform
 * @access  Private (Authenticated)
 */
router.get('/oauth/:platform/authorize', authenticate, getOAuthAuthorizeUrl);

/**
 * @route   GET /api/social/oauth/:platform/callback
 * @desc    OAuth Callback handler from provider
 * @access  Public / Browser Redirect
 */
router.get('/oauth/:platform/callback', handleOAuthCallback);

export default router;

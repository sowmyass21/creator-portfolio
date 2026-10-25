import { sendSuccess, sendError } from '../utils/responseHandler.js';
import {
  getOrCreateCreatorProfile,
  confirmOrUpdateSocialAccount,
  syncCreatorProfileMetrics,
} from '../services/creatorProfileService.js';

/**
 * GET /api/creator-profile
 * Retrieve current user's unified Creator Profile
 */
export const getCreatorProfile = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const userId = req.user._id || req.user.id;
    const profile = await getOrCreateCreatorProfile(userId);

    return sendSuccess(res, profile, 'Creator profile loaded successfully');
  } catch (error) {
    console.error('[Get Creator Profile Error]:', error);
    return sendError(res, error.message || 'Failed to fetch creator profile', 500);
  }
};

/**
 * POST /api/creator-profile/confirm-social
 * Confirm, reject, add, or remove candidate social platform account
 */
export const confirmSocialProfile = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const userId = req.user._id || req.user.id;
    const { platform, handle, url, confirmAction = 'CONFIRM' } = req.body;

    if (!platform && confirmAction !== 'REMOVE') {
      return sendError(res, 'Platform parameter is required', 400);
    }

    const updatedProfile = await confirmOrUpdateSocialAccount(userId, {
      platform,
      handle,
      url,
      confirmAction,
    });

    return sendSuccess(
      res,
      updatedProfile,
      `Social account ${platform || handle} updated (${confirmAction}) successfully`
    );
  } catch (error) {
    console.error('[Confirm Social Profile Error]:', error);
    return sendError(res, error.message || 'Failed to update social account confirmation', 500);
  }
};

/**
 * POST /api/creator-profile/sync
 * Non-destructive synchronization of live social API metrics without requiring resume re-upload
 */
export const syncLiveMetrics = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const userId = req.user._id || req.user.id;
    const syncedProfile = await syncCreatorProfileMetrics(userId);

    if (!syncedProfile) {
      return sendError(res, 'Creator profile not found. Please upload a resume first.', 404);
    }

    return sendSuccess(
      res,
      syncedProfile,
      'Live social metrics synchronized successfully. Dynamic portfolio updated.'
    );
  } catch (error) {
    console.error('[Sync Live Metrics Error]:', error);
    return sendError(res, error.message || 'Failed to sync live social metrics', 500);
  }
};

export default {
  getCreatorProfile,
  confirmSocialProfile,
  syncLiveMetrics,
};

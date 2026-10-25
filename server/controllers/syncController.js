import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { syncAllPlatforms, getSyncStatusDetails } from '../services/syncService.js';

/**
 * @route   POST /api/sync
 * @desc    Manually trigger full synchronization across all connected platforms
 * @access  Private (Authenticated Users / Admins)
 */
export const triggerSync = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const userName = req.user ? req.user.name : 'Authenticated User';
    const result = await syncAllPlatforms(userId, `MANUAL_USER_TRIGGER (${userName})`);

    if (!result.success && result.message) {
      return sendError(res, result.message, 409); // 409 Conflict if duplicate job running
    }

    return sendSuccess(
      res,
      result,
      result.status === 'SUCCESS' 
        ? 'Synchronization completed successfully for all platforms.' 
        : 'Synchronization completed with partial status.',
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/sync/status
 * @desc    Get current sync status, last updated timestamp, and platform logs
 * @access  Public
 */
export const getSyncStatus = async (req, res, next) => {
  try {
    const details = getSyncStatusDetails();
    return sendSuccess(res, details, 'Sync status retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

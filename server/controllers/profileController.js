import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { getCreatorProfile, updateCreatorProfile } from '../services/profileService.js';

export const getProfile = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const profile = await getCreatorProfile(userId);
    
    if (!profile) {
      return sendError(res, 'Creator profile not found', 404);
    }

    return sendSuccess(res, profile, 'Profile retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const updatedProfile = await updateCreatorProfile(req.body, userId);
    return sendSuccess(res, updatedProfile, 'Profile updated successfully', 200);
  } catch (error) {
    next(error);
  }
};


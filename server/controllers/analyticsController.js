import { sendSuccess } from '../utils/responseHandler.js';
import { 
  getAnalyticsOverview, 
  getAnalyticsHistory, 
  getPlatformAnalyticsData 
} from '../services/analyticsService.js';

export const getOverview = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const overview = await getAnalyticsOverview(userId);
    return sendSuccess(res, overview, 'Analytics overview metrics retrieved', 200);
  } catch (error) {
    next(error);
  }
};

export const getHistory = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const { range, platform } = req.query;
    const history = await getAnalyticsHistory(userId, range || '30d', platform);
    return sendSuccess(res, history, `Historical analytics retrieved for range '${range || '30d'}'`, 200);
  } catch (error) {
    next(error);
  }
};

export const getPlatformAnalytics = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const { platform } = req.params;
    const data = await getPlatformAnalyticsData(userId, platform);
    return sendSuccess(res, data, `Analytics metrics retrieved for platform '${platform}'`, 200);
  } catch (error) {
    next(error);
  }
};

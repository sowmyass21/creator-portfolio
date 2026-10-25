import { sendSuccess } from '../utils/responseHandler.js';
import { getSocialMetrics, getAggregatedMetricSummary } from '../services/metricService.js';

export const getMetrics = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const { platform } = req.query;
    const metrics = await getSocialMetrics(userId, platform);
    const summary = await getAggregatedMetricSummary(userId);

    return sendSuccess(
      res,
      {
        summary,
        platforms: metrics
      },
      'Social metrics retrieved successfully',
      200
    );
  } catch (error) {
    next(error);
  }
};

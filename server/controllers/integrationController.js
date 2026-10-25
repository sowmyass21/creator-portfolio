import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { fetchGitHubMetrics } from '../services/githubService.js';
import { fetchYouTubeMetrics } from '../services/youtubeService.js';
import { fetchInstagramMetrics } from '../services/instagramService.js';
import { fetchLinkedInMetrics } from '../services/linkedinService.js';
import { fetchLeetCodeMetrics } from '../services/leetcodeService.js';
import { fetchCodeChefMetrics } from '../services/codechefService.js';

export const getGitHubMetrics = async (req, res, next) => {
  try {
    const { username, forceRefresh } = req.query;
    const isForce = forceRefresh === 'true' || forceRefresh === '1';

    const metrics = await fetchGitHubMetrics(username, isForce);

    return sendSuccess(
      res,
      metrics,
      `GitHub metrics retrieved successfully for '${metrics.username}'`,
      200,
      {
        source: metrics.source || 'LIVE_API',
        isCached: metrics.source !== 'LIVE_API',
        warning: metrics.warning || undefined
      }
    );
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

export const getYouTubeMetrics = async (req, res, next) => {
  try {
    const { channelId, forceRefresh } = req.query;
    const isForce = forceRefresh === 'true' || forceRefresh === '1';

    const metrics = await fetchYouTubeMetrics(channelId, isForce);

    return sendSuccess(
      res,
      metrics,
      `YouTube metrics retrieved successfully for channel '${metrics.channelName}'`,
      200,
      {
        source: metrics.source || 'LIVE_API',
        isCached: metrics.source !== 'LIVE_API',
        warning: metrics.warning || undefined
      }
    );
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

export const getInstagramMetrics = async (req, res, next) => {
  try {
    const { username, forceRefresh } = req.query;
    const isForce = forceRefresh === 'true' || forceRefresh === '1';

    const metrics = await fetchInstagramMetrics(username, isForce);

    return sendSuccess(
      res,
      metrics,
      `Instagram metrics retrieved successfully for '${metrics.username}'`,
      200,
      {
        source: metrics.source || 'LIVE_API',
        isCached: metrics.source !== 'LIVE_API'
      }
    );
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

export const getLinkedInMetrics = async (req, res, next) => {
  try {
    const { username, forceRefresh } = req.query;
    const isForce = forceRefresh === 'true' || forceRefresh === '1';

    const metrics = await fetchLinkedInMetrics(username, isForce);

    return sendSuccess(
      res,
      metrics,
      `LinkedIn metrics retrieved successfully for '${metrics.username}'`,
      200,
      {
        source: metrics.source || 'LIVE_API',
        isCached: metrics.source !== 'LIVE_API'
      }
    );
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

export const getLeetCodeMetrics = async (req, res, next) => {
  try {
    const { username, forceRefresh } = req.query;
    const isForce = forceRefresh === 'true' || forceRefresh === '1';

    const metrics = await fetchLeetCodeMetrics(username, isForce);

    return sendSuccess(
      res,
      metrics,
      `LeetCode metrics retrieved successfully for '${metrics.username}'`,
      200,
      {
        source: metrics.source || 'LIVE_API',
        isCached: metrics.source !== 'LIVE_API'
      }
    );
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

export const getCodeChefMetrics = async (req, res, next) => {
  try {
    const { username, forceRefresh } = req.query;
    const isForce = forceRefresh === 'true' || forceRefresh === '1';

    const metrics = await fetchCodeChefMetrics(username, isForce);

    return sendSuccess(
      res,
      metrics,
      `CodeChef metrics retrieved successfully for '${metrics.username}'`,
      200,
      {
        source: metrics.source || 'LIVE_API',
        isCached: metrics.source !== 'LIVE_API'
      }
    );
  } catch (error) {
    if (error.statusCode === 404) {
      return sendError(res, error.message, 404);
    }
    next(error);
  }
};

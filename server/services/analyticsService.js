import MetricSnapshot from '../models/MetricSnapshot.js';
import SocialMetric from '../models/SocialMetric.js';
import SocialPlatform from '../models/SocialPlatform.js';
import Project from '../models/Project.js';
import { checkDbStatus } from './dbService.js';

/**
 * Calculate date threshold from range code
 */
const getDateThreshold = (range) => {
  const now = new Date();
  switch (range) {
    case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '90d': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '1y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
};

/**
 * Get Analytics Overview Data - Strictly grounded in user's actual connected platforms
 */
export const getAnalyticsOverview = async (userId = null) => {
  const dbStatus = checkDbStatus();

  let platforms = [];
  if (dbStatus.isConnected && userId) {
    try {
      platforms = await SocialPlatform.find({ userId, enabled: true }).lean();
    } catch (e) {
      console.warn('[Analytics Service] Error fetching platforms:', e.message);
    }
  }

  const ytPlatform = platforms.find(p => p.platform?.toLowerCase() === 'youtube');
  const ghPlatform = platforms.find(p => p.platform?.toLowerCase() === 'github');

  const ytConfig = ytPlatform?.config || {};
  const ghConfig = ghPlatform?.config || {};

  const totalFollowers = (ghConfig.followers || 0) + (ytConfig.subscriberCount || 0);
  const totalSubscribers = ytConfig.subscriberCount || 0;
  const githubRepositories = ghConfig.publicRepositories !== undefined ? ghConfig.publicRepositories : 0;
  const githubStars = ghConfig.totalStars || 0;
  const totalViews = ytConfig.totalViews || 0;

  let totalProjects = 0;
  if (dbStatus.isConnected && userId) {
    try {
      totalProjects = await Project.countDocuments({ userId });
    } catch (e) {}
  }
  if (totalProjects === 0 && ghPlatform) totalProjects = githubRepositories;

  return {
    totalFollowers,
    totalSubscribers,
    githubRepositories,
    githubStars,
    totalViews,
    totalProjects,
    connectedPlatformsCount: platforms.length,
    lastSynchronizedTimestamp: ytPlatform?.lastSynced || ghPlatform?.lastSynced || (platforms.length > 0 ? new Date().toISOString() : null),
    changes: {
      followersChange: null,
      viewsChange: null,
      hasSufficientData: false
    }
  };
};

/**
 * Get Historical Chart Time Series Data - Strictly using real actual metric baseline
 */
export const getAnalyticsHistory = async (userId = null, range = '30d', platformFilter = null) => {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
  const step = Math.max(1, Math.floor(days / 6));
  const now = Date.now();

  const overview = await getAnalyticsOverview(userId);
  const realFollowers = overview.totalFollowers || 0;
  const realViews = overview.totalViews || 0;
  const realStars = overview.githubStars || 0;

  const series = [];
  for (let i = days; i >= 0; i -= step) {
    const ts = new Date(now - i * 24 * 60 * 60 * 1000);
    series.push({
      date: ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: ts,
      followers: realFollowers,
      views: realViews,
      stars: realStars
    });
  }

  return {
    range,
    platformFilter: platformFilter || 'All',
    pointsCount: series.length,
    series
  };
};

/**
 * Get Platform Specific Analytics
 */
export const getPlatformAnalyticsData = async (userId = null, platformName) => {
  const history = await getAnalyticsHistory(userId, '30d', platformName);
  return {
    platform: platformName,
    timeframe: '30d',
    history
  };
};

export default {
  getAnalyticsOverview,
  getAnalyticsHistory,
  getPlatformAnalyticsData
};

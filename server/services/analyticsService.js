import MetricSnapshot from '../models/MetricSnapshot.js';
import SocialMetric from '../models/SocialMetric.js';
import SocialPlatform from '../models/SocialPlatform.js';
import Project from '../models/Project.js';
import { checkDbStatus } from './dbService.js';

import { getSocialMetrics } from './metricService.js';

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
    platforms = await getSocialMetrics(userId);
  }

  let totalFollowers = 0;
  let totalSubscribers = 0;
  let githubRepositories = 0;
  let githubStars = 0;
  let totalViews = 0;

  for (const p of platforms) {
    const platName = (p.platform || '').toLowerCase();
    totalFollowers += Number(p.followers || 0);
    totalViews += Number(p.totalViews || 0);

    if (platName === 'youtube') {
      totalSubscribers = Number(p.followers || 0);
    }
    if (platName === 'github') {
      githubRepositories = Number(p.contentCount || 0);
      githubStars = Number(p.stars || 0);
    }
  }

  let totalProjects = 0;
  if (dbStatus.isConnected && userId) {
    try {
      totalProjects = await Project.countDocuments({ userId });
    } catch (e) {}
  }
  if (totalProjects === 0 && githubRepositories > 0) {
    totalProjects = githubRepositories;
  }

  const latestSync = platforms.reduce((latest, p) => {
    if (!p.lastSynced) return latest;
    const d = new Date(p.lastSynced);
    return (!latest || d > new Date(latest)) ? p.lastSynced : latest;
  }, null);

  return {
    totalFollowers,
    totalSubscribers,
    githubRepositories,
    githubStars,
    totalViews,
    totalProjects,
    connectedPlatformsCount: platforms.length,
    lastSynchronizedTimestamp: latestSync || (platforms.length > 0 ? new Date().toISOString() : null),
    platforms: platforms.map(p => ({
      _id: p._id,
      platform: p.platform,
      handle: p.handle || p.username,
      username: p.username || p.handle,
      profileUrl: p.profileUrl,
      followers: Number(p.followers || 0),
      totalViews: Number(p.totalViews || 0),
      contentCount: Number(p.contentCount || 0),
      stars: Number(p.stars || 0),
      engagementRate: Number(p.engagementRate || 0),
      weeklyGrowthRate: Number(p.weeklyGrowthRate || 0),
      monthlyGrowthRate: Number(p.monthlyGrowthRate || 0),
      topContentTitle: p.topContentTitle || null,
      topContentUrl: p.topContentUrl || null,
      enabled: p.enabled !== false,
      lastSynced: p.lastSynced,
      config: p.config || {}
    })),
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
  let realFollowers = overview.totalFollowers || 0;
  let realViews = overview.totalViews || 0;
  let realStars = overview.githubStars || 0;
  let realEngagement = 0;

  if (platformFilter && platformFilter.toLowerCase() !== 'all') {
    const specificPlat = overview.platforms.find(
      p => p.platform?.toLowerCase() === platformFilter.toLowerCase()
    );
    if (specificPlat) {
      realFollowers = specificPlat.followers || 0;
      realViews = specificPlat.totalViews || 0;
      realStars = specificPlat.stars || 0;
      realEngagement = specificPlat.engagementRate || 0;
    } else {
      realFollowers = 0;
      realViews = 0;
      realStars = 0;
      realEngagement = 0;
    }
  }

  const series = [];
  for (let i = days; i >= 0; i -= step) {
    const ts = new Date(now - i * 24 * 60 * 60 * 1000);
    series.push({
      date: ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      timestamp: ts,
      followers: realFollowers,
      views: realViews,
      stars: realStars,
      engagement: realEngagement
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

import SocialMetric from '../models/SocialMetric.js';
import SocialPlatform from '../models/SocialPlatform.js';
import { checkDbStatus } from './dbService.js';

export const getSocialMetrics = async (userId = null, platformFilter = null) => {
  const dbStatus = checkDbStatus();

  if (!dbStatus.isConnected || !userId) {
    return [];
  }

  try {
    const [rawPlatforms, rawMetrics] = await Promise.all([
      SocialPlatform.find({ userId, enabled: true }).lean().catch(() => []),
      SocialMetric.find({ userId }).select('-__v').lean().catch(() => [])
    ]);

    const metricsMap = new Map();
    rawMetrics.forEach(m => {
      if (m.platform) {
        metricsMap.set(m.platform.toLowerCase(), m);
      }
    });

    const merged = [];
    const processedPlatforms = new Set();

    for (const p of rawPlatforms) {
      const platKey = (p.platform || '').toLowerCase();
      processedPlatforms.add(platKey);
      const m = metricsMap.get(platKey);
      const cfg = p.config || {};

      let followers = 0;
      let totalViews = 0;
      let contentCount = 0;
      let stars = 0;
      let engagementRate = 0;

      if (platKey === 'youtube') {
        followers = Number(cfg.subscriberCount || m?.followers || 0);
        totalViews = Number(cfg.totalViews || m?.totalViews || 0);
        contentCount = Number(cfg.videoCount || m?.contentCount || 0);
      } else if (platKey === 'github') {
        followers = Number(cfg.followers || m?.followers || 0);
        contentCount = Number(cfg.publicRepositories !== undefined ? cfg.publicRepositories : (m?.contentCount || 0));
        stars = Number(cfg.totalStars || 0);
        totalViews = Number(m?.totalViews || 0);
      } else if (platKey === 'linkedin') {
        followers = Number(cfg.connections || cfg.followers || m?.followers || 0);
        totalViews = Number(cfg.views || m?.totalViews || 0);
        contentCount = Number(cfg.posts || m?.contentCount || 0);
      } else if (platKey === 'leetcode') {
        followers = Number(cfg.rating || m?.followers || 0);
        contentCount = Number(cfg.totalSolved || m?.contentCount || 0);
        totalViews = Number(m?.totalViews || 0);
      } else if (platKey === 'codechef') {
        followers = Number(cfg.rating || m?.followers || 0);
        contentCount = Number(cfg.problemsSolved || m?.contentCount || 0);
        stars = Number(cfg.stars ? String(cfg.stars).replace(/[^0-9]/g, '') : 0);
        totalViews = Number(m?.totalViews || 0);
      } else if (platKey === 'instagram') {
        followers = Number(cfg.followers || m?.followers || 0);
        contentCount = Number(cfg.mediaCount || m?.contentCount || 0);
        totalViews = Number(m?.totalViews || 0);
      } else {
        followers = Number(cfg.followers || cfg.subscriberCount || cfg.connections || cfg.rating || m?.followers || 0);
        totalViews = Number(cfg.totalViews || cfg.views || m?.totalViews || 0);
        contentCount = Number(cfg.contentCount || cfg.publicRepositories || cfg.videoCount || cfg.totalSolved || m?.contentCount || 0);
      }

      engagementRate = Number(m?.engagementRate || cfg.engagementRate || 0);

      merged.push({
        _id: m?._id || p._id,
        userId,
        platform: p.platform,
        handle: p.username || m?.handle || '',
        username: p.username || m?.handle || '',
        profileUrl: p.profileUrl || m?.profileUrl || '',
        followers,
        totalViews,
        contentCount,
        stars,
        engagementRate,
        weeklyGrowthRate: Number(m?.weeklyGrowthRate || 0),
        monthlyGrowthRate: Number(m?.monthlyGrowthRate || 0),
        topContentTitle: m?.topContentTitle || (cfg.pinnedRepo?.name || cfg.topVideo?.title || null),
        topContentUrl: m?.topContentUrl || (cfg.pinnedRepo?.url || cfg.topVideo?.url || null),
        enabled: p.enabled !== false,
        lastSynced: p.lastSynced || m?.lastUpdated || m?.updatedAt || new Date(),
        config: cfg,
        history: m?.history || []
      });
    }

    // Include any SocialMetric that was not in rawPlatforms
    for (const m of rawMetrics) {
      const platKey = (m.platform || '').toLowerCase();
      if (!processedPlatforms.has(platKey)) {
        merged.push({
          _id: m._id,
          userId,
          platform: m.platform,
          handle: m.handle,
          username: m.handle,
          profileUrl: m.profileUrl,
          followers: Number(m.followers || 0),
          totalViews: Number(m.totalViews || 0),
          contentCount: Number(m.contentCount || 0),
          stars: 0,
          engagementRate: Number(m.engagementRate || 0),
          weeklyGrowthRate: Number(m.weeklyGrowthRate || 0),
          monthlyGrowthRate: Number(m.monthlyGrowthRate || 0),
          topContentTitle: m.topContentTitle || null,
          topContentUrl: m.topContentUrl || null,
          enabled: true,
          lastSynced: m.lastUpdated || m.updatedAt || new Date(),
          config: {},
          history: m.history || []
        });
      }
    }

    if (platformFilter) {
      const reg = new RegExp(platformFilter, 'i');
      return merged.filter(item => reg.test(item.platform));
    }

    return merged;
  } catch (err) {
    console.warn('[MetricService] DB error fetching metrics:', err.message);
    return [];
  }
};

export const getAggregatedMetricSummary = async (userId = null) => {
  const metrics = await getSocialMetrics(userId);

  const totalFollowers = metrics.reduce((acc, curr) => acc + (Number(curr.followers) || 0), 0);
  const totalViews = metrics.reduce((acc, curr) => acc + (Number(curr.totalViews) || 0), 0);
  const totalContent = metrics.reduce((acc, curr) => acc + (Number(curr.contentCount) || 0), 0);
  const totalStars = metrics.reduce((acc, curr) => acc + (Number(curr.stars) || 0), 0);
  const avgEngagement = metrics.length > 0
    ? (metrics.reduce((acc, curr) => acc + (Number(curr.engagementRate) || 0), 0) / metrics.length).toFixed(1)
    : 0;

  return {
    totalFollowers,
    totalViews,
    totalContent,
    totalStars,
    avgEngagementRate: Number(avgEngagement),
    platformCount: metrics.length,
    lastCalculated: new Date()
  };
};

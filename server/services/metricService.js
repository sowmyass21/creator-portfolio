import SocialMetric from '../models/SocialMetric.js';
import { checkDbStatus } from './dbService.js';

export const getSocialMetrics = async (userId = null, platformFilter = null) => {
  const dbStatus = checkDbStatus();

  if (dbStatus.isConnected && userId) {
    try {
      const query = { userId };
      if (platformFilter) {
        query.platform = new RegExp(platformFilter, 'i');
      }
      const metrics = await SocialMetric.find(query).select('-__v');
      return metrics || [];
    } catch (err) {
      console.warn('[MetricService] DB error fetching metrics:', err.message);
    }
  }

  return [];
};

export const getAggregatedMetricSummary = async (userId = null) => {
  const metrics = await getSocialMetrics(userId);

  const totalFollowers = metrics.reduce((acc, curr) => acc + (curr.followers || 0), 0);
  const totalViews = metrics.reduce((acc, curr) => acc + (curr.totalViews || 0), 0);
  const totalContent = metrics.reduce((acc, curr) => acc + (curr.contentCount || 0), 0);
  const avgEngagement = metrics.length > 0
    ? (metrics.reduce((acc, curr) => acc + (curr.engagementRate || 0), 0) / metrics.length).toFixed(1)
    : 0;

  return {
    totalFollowers,
    totalViews,
    totalContent,
    avgEngagementRate: Number(avgEngagement),
    platformCount: metrics.length,
    lastCalculated: new Date()
  };
};

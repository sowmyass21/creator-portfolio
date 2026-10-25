import cron from 'node-cron';
import { fetchGitHubMetrics } from './githubService.js';
import { fetchYouTubeMetrics } from './youtubeService.js';
import { getUniversalSocialMetrics } from './integrations/index.js';
import MetricSnapshot from '../models/MetricSnapshot.js';
import SocialPlatform from '../models/SocialPlatform.js';
import { checkDbStatus } from './dbService.js';

// Synchronization State & Locks
let isSyncRunning = false;
let lastSyncTimestamp = null;
let lastSuccessfulSync = null;
let lastError = null;
let currentSyncStatus = 'IDLE'; // IDLE, SYNCING, SUCCESS, PARTIAL_FAILURE, FAILED
let syncLogs = [];

/**
 * Platform specific sync functions
 */

export const syncGitHub = async (userId = null) => {
  try {
    if (!userId) {
      return { status: 'SKIPPED', platform: 'GitHub', message: 'User ID is required to isolate platform sync' };
    }
    console.log(`[Sync Service] Syncing GitHub metrics for user: ${userId}...`);
    const query = { platform: 'GitHub', enabled: true, userId };

    const platformRecord = await SocialPlatform.findOne(query);
    if (!platformRecord || !platformRecord.username) {
      return { status: 'SUCCESS', platform: 'GitHub', metrics: null, message: 'GitHub not connected' };
    }

    const username = platformRecord.username;
    const data = await fetchGitHubMetrics(username, true);

    const dbStatus = checkDbStatus();
    if (dbStatus.isConnected && data.followers !== undefined && userId) {
      await MetricSnapshot.create({
        platform: 'GitHub',
        metricName: 'followers',
        value: data.followers || 0,
        timestamp: new Date()
      });
      await MetricSnapshot.create({
        platform: 'GitHub',
        metricName: 'stars',
        value: data.totalStars || 0,
        timestamp: new Date()
      });

      // Keep SocialMetric in sync strictly scoped to THIS user
      const SocialMetric = (await import('../models/SocialMetric.js')).default;
      await SocialMetric.findOneAndUpdate(
        { userId, platform: 'GitHub' },
        {
          $set: {
            userId,
            platform: 'GitHub',
            handle: username,
            profileUrl: `https://github.com/${username}`,
            followers: data.followers || 0,
            contentCount: data.publicRepositories || 0,
            totalViews: data.totalStars || 0,
            topContentTitle: data.popularRepositories?.[0]?.name ? `${data.popularRepositories[0].name} (${data.popularRepositories[0].stars || 0} Stars)` : username,
            topContentUrl: data.popularRepositories?.[0]?.repositoryUrl || `https://github.com/${username}`,
            lastUpdated: new Date()
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    return { status: 'SUCCESS', platform: 'GitHub', metrics: data };
  } catch (error) {
    console.error('[Sync Service Error - GitHub]:', error.message);
    return { status: 'FAILED', platform: 'GitHub', error: error.message };
  }
};

export const syncYouTube = async (userId = null) => {
  try {
    if (!userId) {
      return { status: 'SKIPPED', platform: 'YouTube', message: 'User ID is required to isolate platform sync' };
    }
    console.log(`[Sync Service] Syncing YouTube metrics for user: ${userId}...`);
    const query = { platform: 'YouTube', enabled: true, userId };

    const platformRecord = await SocialPlatform.findOne(query);
    if (!platformRecord || !platformRecord.username) {
      return { status: 'SUCCESS', platform: 'YouTube', metrics: null, message: 'YouTube not connected' };
    }

    const handle = platformRecord.username;
    const data = await fetchYouTubeMetrics(handle, true);

    const dbStatus = checkDbStatus();
    if (dbStatus.isConnected && data.subscriberCount !== undefined && userId) {
      await MetricSnapshot.create({
        platform: 'YouTube',
        metricName: 'subscribers',
        value: data.subscriberCount || 0,
        timestamp: new Date()
      });
      await MetricSnapshot.create({
        platform: 'YouTube',
        metricName: 'views',
        value: data.totalViews || 0,
        timestamp: new Date()
      });

      // Keep SocialMetric in sync strictly scoped to THIS user
      const SocialMetric = (await import('../models/SocialMetric.js')).default;
      await SocialMetric.findOneAndUpdate(
        { userId, platform: 'YouTube' },
        {
          $set: {
            userId,
            platform: 'YouTube',
            handle: handle,
            profileUrl: `https://youtube.com/${handle}`,
            followers: data.subscriberCount || 0,
            totalViews: data.totalViews || 0,
            contentCount: data.videoCount || 0,
            topContentTitle: data.latestVideos?.[0]?.title ? `${data.latestVideos[0].title} (${data.latestVideos[0].viewCount || 0} views)` : 'YouTube Channel',
            topContentUrl: data.latestVideos?.[0]?.videoUrl || `https://youtube.com/${handle}`,
            lastUpdated: new Date()
          }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    return { status: 'SUCCESS', platform: 'YouTube', metrics: data };
  } catch (error) {
    console.error('[Sync Service Error - YouTube]:', error.message);
    return { status: 'FAILED', platform: 'YouTube', error: error.message };
  }
};

export const syncSocialPlatforms = async (userId = null) => {
  try {
    console.log(`[Sync Service] Syncing Universal Social Platforms for user: ${userId || 'global'}...`);
    const data = await getUniversalSocialMetrics(userId, true);

    const dbStatus = checkDbStatus();
    if (dbStatus.isConnected && data.summary) {
      await MetricSnapshot.create({
        platform: 'Global',
        metricName: 'totalFollowers',
        value: data.summary.totalFollowers || 0,
        timestamp: new Date()
      });
      await MetricSnapshot.create({
        platform: 'Global',
        metricName: 'totalViews',
        value: data.summary.totalViews || 0,
        timestamp: new Date()
      });
    }

    return { status: 'SUCCESS', platform: 'UniversalSocial', summary: data.summary };
  } catch (error) {
    console.error('[Sync Service Error - UniversalSocial]:', error.message);
    return { status: 'FAILED', platform: 'UniversalSocial', error: error.message };
  }
};

/**
 * Master Sync All Platforms Function with Duplicate Job Prevention & Partial Failure Handling
 */
export const syncAllPlatforms = async (userId = null, triggeredBy = 'SYSTEM_CRON') => {
  // Prevent duplicate concurrent sync jobs
  if (isSyncRunning) {
    console.warn('[Sync Service Warning] Synchronization job already in progress. Skipping duplicate request.');
    return {
      success: false,
      message: 'Synchronization job is already running in the background.',
      status: currentSyncStatus,
      lastSyncTimestamp
    };
  }

  isSyncRunning = true;
  currentSyncStatus = 'SYNCING';
  lastSyncTimestamp = new Date();
  console.log(`==================================================`);
  console.log(`🔄 [Sync Service] Starting full sync job (${triggeredBy}) for user: ${userId || 'global'} at ${lastSyncTimestamp.toISOString()}`);
  console.log(`==================================================`);

  try {
    // Partial Failure Handling: Execute all platform syncs concurrently with Promise.allSettled
    const results = await Promise.allSettled([
      syncGitHub(userId),
      syncYouTube(userId),
      syncSocialPlatforms(userId)
    ]);

    const platformSummaries = results.map((res, idx) => {
      if (res.status === 'fulfilled') return res.value;
      return { status: 'FAILED', platform: idx === 0 ? 'GitHub' : idx === 1 ? 'YouTube' : 'UniversalSocial', error: res.reason?.message || 'Unknown failure' };
    });

    const failedCount = platformSummaries.filter(p => p.status === 'FAILED').length;
    const successCount = platformSummaries.filter(p => p.status === 'SUCCESS').length;

    if (failedCount === 0) {
      currentSyncStatus = 'SUCCESS';
      lastSuccessfulSync = new Date();
      lastError = null;
    } else if (successCount > 0) {
      currentSyncStatus = 'PARTIAL_FAILURE';
      lastSuccessfulSync = new Date();
      lastError = `${failedCount} platform(s) experienced partial failure during sync.`;
    } else {
      currentSyncStatus = 'FAILED';
      lastError = 'All platform synchronization attempts failed.';
    }

    const logEntry = {
      timestamp: lastSyncTimestamp,
      status: currentSyncStatus,
      triggeredBy,
      userId,
      successCount,
      failedCount,
      details: platformSummaries
    };

    syncLogs.unshift(logEntry);
    if (syncLogs.length > 20) syncLogs.pop(); // Keep last 20 logs

    // Update SocialPlatform syncStatus in MongoDB if connected
    const dbStatus = checkDbStatus();
    if (dbStatus.isConnected) {
      try {
        const updateQuery = userId ? { userId } : {};
        await SocialPlatform.updateMany(updateQuery, {
          lastSynced: lastSyncTimestamp,
          syncStatus: currentSyncStatus
        });

        // Trigger non-destructive live metric sync for active CreatorProfile records
        const CreatorProfile = (await import('../models/CreatorProfile.js')).default;
        const { syncCreatorProfileMetrics } = await import('./creatorProfileService.js');
        if (userId) {
          await syncCreatorProfileMetrics(userId).catch(() => {});
        } else {
          const activeProfiles = await CreatorProfile.find({}).select('userId');
          for (const p of activeProfiles) {
            await syncCreatorProfileMetrics(p.userId).catch(() => {});
          }
        }
      } catch (e) {
        console.warn('[Sync Service] CreatorProfile background sync note:', e.message);
      }
    }

    console.log(`[Sync Service] Full sync job completed. Status: ${currentSyncStatus} (${successCount} succeeded, ${failedCount} failed)`);
    return {
      success: currentSyncStatus !== 'FAILED',
      status: currentSyncStatus,
      lastSyncTimestamp,
      lastSuccessfulSync,
      lastError,
      platformSummaries
    };

  } catch (error) {
    currentSyncStatus = 'FAILED';
    lastError = error.message;
    console.error('[Sync Service Master Error]:', error.message);
    return {
      success: false,
      status: 'FAILED',
      lastSyncTimestamp,
      lastError: error.message
    };
  } finally {
    isSyncRunning = false;
  }
};

/**
 * Get Current Sync Service Status Details
 */
export const getSyncStatusDetails = () => {
  return {
    isSyncRunning,
    currentSyncStatus,
    lastSyncTimestamp,
    lastSuccessfulSync,
    lastError,
    cronSchedule: process.env.SYNC_CRON_SCHEDULE || '0 * * * * (Every 1 Hour)',
    recentLogs: syncLogs.slice(0, 5)
  };
};

/**
 * Initialize Node-Cron Scheduler
 */
export const initCronScheduler = () => {
  const cronExpression = process.env.SYNC_CRON_SCHEDULE || '0 * * * *'; // Default every 1 hour

  if (!cron.validate(cronExpression)) {
    console.warn(`[Sync Service Warning] Invalid cron expression '${cronExpression}'. Falling back to '0 * * * *'.`);
  }

  console.log(`[Sync Service] Initializing Automated Node-Cron Scheduler (${cronExpression})...`);
  
  cron.schedule(cron.validate(cronExpression) ? cronExpression : '0 * * * *', async () => {
    console.log('[Node-Cron Trigger] Cron schedule fired. Triggering automated metric synchronization...');
    await syncAllPlatforms('CRON_SCHEDULER');
  });
};

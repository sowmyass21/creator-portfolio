import { sendSuccess } from '../utils/responseHandler.js';

export const getAdminOverview = async (req, res) => {
  return sendSuccess(
    res,
    {
      systemStatus: 'Operational',
      syncQueueLength: 0,
      activeIntegrations: ['GitHub', 'YouTube', 'Substack', 'Twitter/X'],
      lastSyncTimestamp: new Date().toISOString(),
      authorizedAdmin: req.user.name
    },
    'Admin overview metrics fetched successfully',
    200
  );
};

export const triggerSync = async (req, res) => {
  return sendSuccess(
    res,
    {
      status: 'SyncInitiated',
      jobId: `sync_job_${Date.now()}`,
      syncedPlatforms: ['GitHub', 'YouTube', 'Substack']
    },
    'Social metrics sync job initiated successfully by Admin',
    200
  );
};

export const generateAiContent = async (req, res) => {
  const { prompt, type } = req.body;
  return sendSuccess(
    res,
    {
      generatedContent: `[AI Generated Portfolio ${type || 'Bio'}]: High-performance creator with 250K+ developer reach, specializing in React, Node.js, and automated metric aggregations.`,
      promptUsed: prompt || 'Generate developer portfolio bio'
    },
    'AI content generation completed',
    200
  );
};

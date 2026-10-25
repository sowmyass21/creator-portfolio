import SocialPlatform from '../../models/SocialPlatform.js';
import { checkDbStatus } from '../dbService.js';
import GitHubIntegration from './github/githubIntegration.js';
import YouTubeIntegration from './youtube/youtubeIntegration.js';
import InstagramIntegration from './instagram/instagramIntegration.js';
import LinkedInIntegration from './linkedin/linkedinIntegration.js';
import LeetCodeIntegration from './leetcode/leetcodeIntegration.js';
import CodeChefIntegration from './codechef/codechefIntegration.js';

/**
 * Universal Registry mapping platform names to Integration classes.
 * Adding a new platform (e.g., Substack, Twitch) requires ONLY adding an entry here!
 */
export const INTEGRATION_REGISTRY = {
  GitHub: GitHubIntegration,
  YouTube: YouTubeIntegration,
  Instagram: InstagramIntegration,
  LinkedIn: LinkedInIntegration,
  LeetCode: LeetCodeIntegration,
  CodeChef: CodeChefIntegration,
};

/**
 * Factory helper to instantiate an integration class
 */
export const createIntegration = (platform, username, config = {}) => {
  const IntegrationClass = INTEGRATION_REGISTRY[platform];
  if (!IntegrationClass) {
    throw new Error(`Integration for platform '${platform}' is not supported in the registry.`);
  }
  return new IntegrationClass(username, config);
};

/**
 * Fetch and aggregate normalized metrics across all connected social platforms for a specific user
 */
export const getUniversalSocialMetrics = async (userId = null, forceRefresh = false) => {
  const dbStatus = checkDbStatus();
  let platformsToSync = [];

  // Read platform configs for this authenticated user only
  if (dbStatus.isConnected && userId) {
    try {
      const dbPlatforms = await SocialPlatform.find({ userId, enabled: true });
      if (dbPlatforms && dbPlatforms.length > 0) {
        platformsToSync = dbPlatforms.map(p => ({
          platform: p.platform,
          username: p.username,
          profileUrl: p.profileUrl,
          config: p.config instanceof Map ? Object.fromEntries(p.config) : (p.config || {})
        }));
      }
    } catch (err) {
      console.warn('[Universal Social] DB error reading user platforms:', err.message);
    }
  }

  if (platformsToSync.length === 0) {
    return {
      summary: {
        totalFollowers: 0,
        totalViews: 0,
        totalPosts: 0,
        connectedCount: 0,
        lastCalculated: new Date()
      },
      platforms: []
    };
  }

  // Execute normalizeData() concurrently across all registered integrations
  const results = await Promise.allSettled(
    platformsToSync.map(async (platConfig) => {
      const { platform, username, config } = platConfig;
      if (!INTEGRATION_REGISTRY[platform]) {
        console.warn(`[Universal Social] Skipping unregistered platform '${platform}'`);
        return null;
      }
      const instance = createIntegration(platform, username, config);
      return await instance.normalizeData();
    })
  );

  const normalizedPlatforms = results
    .filter(res => res.status === 'fulfilled' && res.value !== null)
    .map(res => res.value);

  // Compute aggregated total reach and engagement summary
  const totalFollowers = normalizedPlatforms.reduce((acc, p) => acc + (p.followers || 0), 0);
  const totalViews = normalizedPlatforms.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalPosts = normalizedPlatforms.reduce((acc, p) => acc + (p.posts || 0), 0);

  return {
    summary: {
      totalFollowers,
      totalViews,
      totalPosts,
      connectedCount: normalizedPlatforms.length,
      lastCalculated: new Date()
    },
    platforms: normalizedPlatforms
  };
};

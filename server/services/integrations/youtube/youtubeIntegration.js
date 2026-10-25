import BaseIntegration from '../BaseIntegration.js';
import { fetchYouTubeMetrics } from '../../youtubeService.js';

export class YouTubeIntegration extends BaseIntegration {
  constructor(channelId = null, config = {}) {
    super('YouTube', channelId || process.env.YOUTUBE_CHANNEL_ID || 'UC_elenacodes_dev_123', config);
  }

  async getProfile() {
    const data = await fetchYouTubeMetrics(this.username);
    return {
      channelName: data.channelName,
      customUrl: data.customUrl,
      profileImage: data.profileImage
    };
  }

  async getMetrics() {
    const data = await fetchYouTubeMetrics(this.username);
    return {
      subscriberCount: data.subscriberCount,
      totalViews: data.totalViews,
      videoCount: data.videoCount
    };
  }

  async getContent() {
    const data = await fetchYouTubeMetrics(this.username);
    return data.latestVideos || [];
  }

  async normalizeData() {
    try {
      const rawData = await fetchYouTubeMetrics(this.username);

      // YouTube does not natively provide a "following" count, so set following to null!
      return {
        platform: 'YouTube',
        username: rawData.customUrl || rawData.channelName,
        profileUrl: `https://youtube.com/${rawData.customUrl || ''}`,
        followers: rawData.subscriberCount ?? null,
        following: null, // Explicit null as per prompt requirement
        views: rawData.totalViews ?? null,
        posts: rawData.videoCount ?? null,
        engagement: rawData.subscriberCount > 0 
          ? Number(((rawData.totalViews / rawData.subscriberCount)).toFixed(1)) 
          : null,
        profileImage: rawData.profileImage ?? null,
        lastUpdated: rawData.lastFetchedAt || new Date(),
        content: rawData.latestVideos || []
      };
    } catch (err) {
      console.warn(`[YouTubeIntegration Error]: ${err.message}`);
      return {
        platform: 'YouTube',
        username: this.username || '@creator',
        profileUrl: `https://youtube.com/${this.username || ''}`,
        followers: 0,
        following: null,
        views: 0,
        posts: 0,
        engagement: 0,
        profileImage: '',
        lastUpdated: new Date(),
        content: []
      };
    }
  }
}

export default YouTubeIntegration;

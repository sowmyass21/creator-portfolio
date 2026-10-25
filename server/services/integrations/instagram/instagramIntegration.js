import BaseIntegration from '../BaseIntegration.js';
import { fetchInstagramMetrics, parseInstagramUsername } from '../../instagramService.js';

export class InstagramIntegration extends BaseIntegration {
  constructor(username = '', config = {}) {
    super('Instagram', parseInstagramUsername(username), config);
  }

  async getProfile() {
    const data = await fetchInstagramMetrics(this.username);
    return {
      username: data.username,
      profileImage: data.profileImage,
      bio: data.bio
    };
  }

  async getMetrics() {
    const data = await fetchInstagramMetrics(this.username);
    return {
      followers: data.followers,
      following: data.following,
      posts: data.posts,
      engagement: data.engagement
    };
  }

  async getContent() {
    const data = await fetchInstagramMetrics(this.username);
    return data.content || [];
  }

  async normalizeData() {
    const data = await fetchInstagramMetrics(this.username);
    return {
      platform: 'Instagram',
      username: data.username,
      profileUrl: data.profileUrl,
      followers: data.followers,
      following: data.following,
      views: null,
      posts: data.posts,
      engagement: data.engagement ? parseFloat(data.engagement) : null,
      profileImage: data.profileImage,
      lastUpdated: data.lastUpdated || new Date(),
      content: data.content || []
    };
  }
}

export default InstagramIntegration;

import BaseIntegration from '../BaseIntegration.js';
import { fetchLinkedInMetrics, parseLinkedInUsername } from '../../linkedinService.js';

export class LinkedInIntegration extends BaseIntegration {
  constructor(username = '', config = {}) {
    super('LinkedIn', parseLinkedInUsername(username), config);
  }

  async getProfile() {
    const data = await fetchLinkedInMetrics(this.username);
    return {
      username: data.username,
      profileImage: data.profileImage,
      headline: data.headline
    };
  }

  async getMetrics() {
    const data = await fetchLinkedInMetrics(this.username);
    return {
      followers: data.followers,
      connections: data.following,
      posts: data.posts,
      views: data.views,
      engagement: data.engagement
    };
  }

  async getContent() {
    const data = await fetchLinkedInMetrics(this.username);
    return data.content || [];
  }

  async normalizeData() {
    const data = await fetchLinkedInMetrics(this.username);
    return {
      platform: 'LinkedIn',
      username: data.username,
      profileUrl: data.profileUrl,
      headline: data.headline,
      followers: data.followers,
      following: data.following,
      views: data.views,
      posts: data.posts,
      engagement: data.engagement ? parseFloat(data.engagement) : null,
      profileImage: data.profileImage,
      lastUpdated: data.lastUpdated || new Date(),
      content: data.content || []
    };
  }
}

export default LinkedInIntegration;

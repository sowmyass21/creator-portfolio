import BaseIntegration from '../BaseIntegration.js';
import { fetchLeetCodeMetrics, parseLeetCodeUsername } from '../../leetcodeService.js';

export class LeetCodeIntegration extends BaseIntegration {
  constructor(username = '', config = {}) {
    super('LeetCode', parseLeetCodeUsername(username), config);
  }

  async getProfile() {
    const data = await fetchLeetCodeMetrics(this.username);
    return {
      username: data.username,
      profileUrl: data.profileUrl,
      avatar: data.avatar,
      ranking: data.ranking
    };
  }

  async getMetrics() {
    const data = await fetchLeetCodeMetrics(this.username);
    return {
      totalSolved: data.totalSolved,
      easySolved: data.easySolved,
      mediumSolved: data.mediumSolved,
      hardSolved: data.hardSolved,
      acceptanceRate: data.acceptanceRate,
      contestRating: data.contestRating,
      badgesCount: data.badgesCount
    };
  }

  async getContent() {
    const data = await fetchLeetCodeMetrics(this.username);
    return data.recentSubmissions || [];
  }

  async normalizeData() {
    const data = await fetchLeetCodeMetrics(this.username);
    return {
      platform: 'LeetCode',
      username: data.username,
      profileUrl: data.profileUrl,
      followers: data.contestRating || data.ranking || null,
      following: null,
      views: null,
      posts: data.totalSolved,
      engagement: data.acceptanceRate ? parseFloat(data.acceptanceRate) : null,
      profileImage: data.avatar,
      lastUpdated: data.lastUpdated || new Date(),
      totalSolved: data.totalSolved,
      easySolved: data.easySolved,
      mediumSolved: data.mediumSolved,
      hardSolved: data.hardSolved,
      ranking: data.ranking,
      contestRating: data.contestRating,
      acceptanceRate: data.acceptanceRate,
      badgesCount: data.badgesCount,
      content: data.recentSubmissions || []
    };
  }
}

export default LeetCodeIntegration;

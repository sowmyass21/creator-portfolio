import BaseIntegration from '../BaseIntegration.js';
import { fetchCodeChefMetrics, parseCodeChefUsername } from '../../codechefService.js';

export class CodeChefIntegration extends BaseIntegration {
  constructor(username = '', config = {}) {
    super('CodeChef', parseCodeChefUsername(username), config);
  }

  async getProfile() {
    const data = await fetchCodeChefMetrics(this.username);
    return {
      username: data.username,
      profileUrl: data.profileUrl,
      stars: data.stars,
      division: data.division
    };
  }

  async getMetrics() {
    const data = await fetchCodeChefMetrics(this.username);
    return {
      rating: data.rating,
      highestRating: data.highestRating,
      stars: data.stars,
      division: data.division,
      totalSolved: data.totalSolved,
      globalRank: data.globalRank,
      countryRank: data.countryRank,
      contestsCount: data.contestsCount
    };
  }

  async getContent() {
    const data = await fetchCodeChefMetrics(this.username);
    return data.recentProblems || [];
  }

  async normalizeData() {
    const data = await fetchCodeChefMetrics(this.username);
    return {
      platform: 'CodeChef',
      username: data.username,
      profileUrl: data.profileUrl,
      followers: data.rating || null,
      following: null,
      views: null,
      posts: data.totalSolved,
      engagement: null,
      profileImage: 'https://cdn.codechef.com/images/cc-logo.svg',
      lastUpdated: data.lastUpdated || new Date(),
      stars: data.stars,
      rating: data.rating,
      highestRating: data.highestRating,
      division: data.division,
      totalSolved: data.totalSolved,
      globalRank: data.globalRank,
      countryRank: data.countryRank,
      contestsCount: data.contestsCount,
      content: data.recentProblems || []
    };
  }
}

export default CodeChefIntegration;

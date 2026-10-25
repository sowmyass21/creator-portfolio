import BaseIntegration from '../BaseIntegration.js';
import { fetchGitHubMetrics } from '../../githubService.js';

export class GitHubIntegration extends BaseIntegration {
  constructor(username = null, config = {}) {
    super('GitHub', username || process.env.GITHUB_USERNAME || 'elenacodes', config);
  }

  async getProfile() {
    const data = await fetchGitHubMetrics(this.username);
    return {
      username: data.username,
      avatar: data.avatar,
      bio: data.bio,
      accountCreatedAt: data.accountCreatedAt
    };
  }

  async getMetrics() {
    const data = await fetchGitHubMetrics(this.username);
    return {
      followers: data.followers,
      following: data.following,
      totalStars: data.totalStars,
      publicRepositories: data.publicRepositories,
      publicGists: data.publicGists
    };
  }

  async getContent() {
    const data = await fetchGitHubMetrics(this.username);
    return data.popularRepositories || [];
  }

  async normalizeData() {
    try {
      const rawData = await fetchGitHubMetrics(this.username);

      // Common normalized format (using null for unavailable metrics)
      return {
        platform: 'GitHub',
        username: rawData.username,
        profileUrl: `https://github.com/${rawData.username}`,
        followers: rawData.followers ?? null,
        following: rawData.following ?? null,
        views: rawData.totalStars ?? null, // Star count mapped to reach/views
        posts: rawData.publicRepositories ?? null, // Repos count mapped to posts/items
        engagement: rawData.publicRepositories > 0 
          ? Number((rawData.totalStars / rawData.publicRepositories).toFixed(1)) 
          : null,
        profileImage: rawData.avatar ?? null,
        lastUpdated: rawData.lastFetchedAt || new Date(),
        extra: {
          totalForks: rawData.totalForks,
          topLanguages: rawData.topLanguages
        },
        content: rawData.popularRepositories || []
      };
    } catch (err) {
      console.warn(`[GitHubIntegration Error]: ${err.message}`);
      return {
        platform: 'GitHub',
        username: this.username,
        profileUrl: `https://github.com/${this.username}`,
        followers: 0,
        following: 0,
        views: 0,
        posts: 0,
        engagement: 0,
        profileImage: `https://avatars.githubusercontent.com/${this.username}`,
        lastUpdated: new Date(),
        content: []
      };
    }
  }
}

export default GitHubIntegration;

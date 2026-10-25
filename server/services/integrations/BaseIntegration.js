/**
 * Base Integration Class enforcing common platform interface contract.
 * Every social platform integration MUST extend or implement this contract:
 * - getProfile()
 * - getMetrics()
 * - getContent()
 * - normalizeData()
 */
export class BaseIntegration {
  constructor(platformName, username, config = {}) {
    this.platform = platformName;
    this.username = username;
    this.config = config;
  }

  /**
   * Fetch raw profile details
   */
  async getProfile() {
    throw new Error(`getProfile() must be implemented by ${this.platform} integration.`);
  }

  /**
   * Fetch raw platform metrics
   */
  async getMetrics() {
    throw new Error(`getMetrics() must be implemented by ${this.platform} integration.`);
  }

  /**
   * Fetch platform published content items (videos, repos, posts)
   */
  async getContent() {
    throw new Error(`getContent() must be implemented by ${this.platform} integration.`);
  }

  /**
   * Normalize raw data into common Universal Social Data Schema.
   * Format:
   * {
   *   platform: string,
   *   username: string,
   *   profileUrl: string,
   *   followers: number | null,
   *   following: number | null,
   *   views: number | null,
   *   posts: number | null,
   *   engagement: number | null,
   *   profileImage: string | null,
   *   lastUpdated: Date,
   *   content: Array
   * }
   */
  async normalizeData() {
    throw new Error(`normalizeData() must be implemented by ${this.platform} integration.`);
  }
}

export default BaseIntegration;

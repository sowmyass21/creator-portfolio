import axios from 'axios';
import GitHubMetric from '../models/GitHubMetric.js';
import SocialMetric from '../models/SocialMetric.js';
import { checkDbStatus } from './dbService.js';

// In-Memory cache store keyed by username
const inMemoryCacheMap = new Map();
const CACHE_DURATION_MS = (parseInt(process.env.GITHUB_CACHE_TTL_MINUTES, 10) || 15) * 60 * 1000;

/**
 * Fetch and normalize GitHub metrics from GitHub REST API
 * @param {string} overrideUsername - GitHub username (optional override)
 * @param {boolean} forceRefresh - Ignore cache if true
 */
export const fetchGitHubMetrics = async (overrideUsername = null, forceRefresh = false) => {
  const username = overrideUsername || process.env.GITHUB_USERNAME;
  if (!username) {
    const notFoundError = new Error('GitHub username is required.');
    notFoundError.statusCode = 400;
    throw notFoundError;
  }
  const dbStatus = checkDbStatus();
  const now = Date.now();
  const cacheKey = username.toLowerCase();

  // 1. Check in-memory cache first (must match requested username)
  const cachedEntry = inMemoryCacheMap.get(cacheKey);
  if (!forceRefresh && cachedEntry && (now - cachedEntry.timestamp < CACHE_DURATION_MS)) {
    console.log(`[GitHub Service] Returning in-memory cached metrics for '${username}'`);
    return { ...cachedEntry.data, source: 'IN_MEMORY_CACHE' };
  }

  // 2. Try fetching from live GitHub REST API
  try {
    console.log(`[GitHub Service] Fetching live metrics for user '${username}' from GitHub API...`);
    
    const headers = {
      'User-Agent': 'CreatorPulse-App',
      'Accept': 'application/vnd.github.v3+json'
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const axiosOptions = {
      headers,
      timeout: 8000
    };

    // Parallel requests for User profile and Repositories
    const [userRes, reposRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, axiosOptions),
      axios.get(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, axiosOptions)
    ]);

    const userData = userRes.data;
    const reposData = Array.isArray(reposRes.data) ? reposRes.data : [];

    // Normalize Repositories data
    const normalizedRepos = reposData.map(repo => ({
      name: repo.name,
      description: repo.description || '',
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      language: repo.language || 'Other',
      topics: repo.topics || [],
      repositoryUrl: repo.html_url,
      homepage: repo.homepage || '',
      updatedAt: repo.updated_at ? new Date(repo.updated_at) : new Date()
    }));

    // Calculate aggregated stars, forks, and language distribution
    const totalStars = normalizedRepos.reduce((acc, r) => acc + r.stars, 0);
    const totalForks = normalizedRepos.reduce((acc, r) => acc + r.forks, 0);

    const langCounts = {};
    normalizedRepos.forEach(r => {
      if (r.language) {
        langCounts[r.language] = (langCounts[r.language] || 0) + 1;
      }
    });

    const totalRepoCount = normalizedRepos.length || 1;
    const topLanguages = Object.entries(langCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Number(((count / totalRepoCount) * 100).toFixed(1))
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const popularRepositories = [...normalizedRepos]
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 6);

    const normalizedData = {
      username: userData.login,
      avatar: userData.avatar_url,
      bio: userData.bio || '',
      followers: userData.followers || 0,
      following: userData.following || 0,
      publicRepositories: userData.public_repos || 0,
      publicGists: userData.public_gists || 0,
      accountCreatedAt: new Date(userData.created_at),
      totalStars,
      totalForks,
      topLanguages,
      popularRepositories,
      lastFetchedAt: new Date(),
      source: 'LIVE_API'
    };

    // Update in-memory cache Map
    inMemoryCacheMap.set(cacheKey, { data: normalizedData, timestamp: now });

    // Persist normalized data to MongoDB if connected
    if (dbStatus.isConnected) {
      await GitHubMetric.findOneAndUpdate(
        { username: normalizedData.username.toLowerCase() },
        normalizedData,
        { upsert: true, new: true }
      );
    }

    return normalizedData;

  } catch (error) {
    console.warn(`[GitHub Service Warning] API request failed (${error.response?.status || error.message}).`);

    // Check if error is 404 User Not Found
    if (error.response?.status === 404) {
      const notFoundError = new Error(`GitHub user '${username}' not found on GitHub.`);
      notFoundError.statusCode = 404;
      throw notFoundError;
    }

    // Attempt MongoDB fallback read for existing cached record
    if (dbStatus.isConnected) {
      try {
        const cachedDbRecord = await GitHubMetric.findOne({ username: username.toLowerCase() });
        if (cachedDbRecord) {
          const dbObj = cachedDbRecord.toObject();
          dbObj.source = 'DATABASE_CACHE';
          dbObj.warning = 'GitHub API rate limit or network timeout. Serving cached database record.';
          return dbObj;
        }
      } catch (dbErr) {
        console.error('[GitHub Service DB Fallback Error]:', dbErr.message);
      }
    }

    // Clean Fallback for requested user without fake inflated numbers
    const fallbackData = {
      username,
      avatar: `https://avatars.githubusercontent.com/${username}`,
      bio: '',
      followers: 0,
      following: 0,
      publicRepositories: 0,
      publicGists: 0,
      accountCreatedAt: new Date(),
      totalStars: 0,
      totalForks: 0,
      topLanguages: [],
      popularRepositories: [],
      lastFetchedAt: new Date(),
      source: 'FALLBACK',
      warning: 'GitHub API temporarily unavailable. Serving fallback metrics.'
    };
    return fallbackData;
  }
};

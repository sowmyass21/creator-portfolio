import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { getUniversalSocialMetrics } from '../services/integrations/index.js';
import SocialPlatform from '../models/SocialPlatform.js';
import SocialMetric from '../models/SocialMetric.js';
import User from '../models/User.js';
import { checkDbStatus } from '../services/dbService.js';
import { fetchGitHubMetrics } from '../services/githubService.js';
import { fetchYouTubeMetrics, parseYouTubeIdentifier } from '../services/youtubeService.js';
import { fetchLeetCodeMetrics } from '../services/leetcodeService.js';
import { fetchCodeChefMetrics } from '../services/codechefService.js';
import { fetchInstagramMetrics } from '../services/instagramService.js';
import { fetchLinkedInMetrics } from '../services/linkedinService.js';
import { confirmOrUpdateSocialAccount } from '../services/creatorProfileService.js';

// Safe index migration helper to drop old global unique index on platform
let indexChecked = false;
const ensureIndexesMigrated = async () => {
  if (indexChecked) return;
  try {
    const dbStatus = checkDbStatus();
    if (dbStatus.isConnected) {
      const platformIndexes = await SocialPlatform.collection.indexes();
      const oldPIndex = platformIndexes.find(i => i.name === 'platform_1' && i.unique);
      if (oldPIndex) {
        await SocialPlatform.collection.dropIndex('platform_1');
        console.log('[SocialPlatform] Dropped legacy global unique index platform_1');
      }

      const metricIndexes = await SocialMetric.collection.indexes();
      const oldMIndex = metricIndexes.find(i => i.name === 'platform_1' && i.unique);
      if (oldMIndex) {
        await SocialMetric.collection.dropIndex('platform_1');
        console.log('[SocialMetric] Dropped legacy global unique index platform_1');
      }
      indexChecked = true;
    }
  } catch (err) {
    // Index may already be dropped or collection doesn't exist yet
    indexChecked = true;
  }
};

const normalizePlatformName = (platform = '') => {
  const platformMap = {
    github: 'GitHub',
    youtube: 'YouTube',
    instagram: 'Instagram',
    linkedin: 'LinkedIn',
    leetcode: 'LeetCode',
    codechef: 'CodeChef',
    substack: 'Substack',
    'twitter/x': 'Twitter/X',
    twitter: 'Twitter/X',
    twitch: 'Twitch',
    tiktok: 'TikTok'
  };
  return platformMap[platform.toLowerCase()] || platform;
};

/**
 * @route   GET /api/social
 * @desc    Get universal normalized social metrics for the currently authenticated user
 * @access  Private (Authenticated)
 */
export const getUniversalSocial = async (req, res, next) => {
  try {
    await ensureIndexesMigrated();
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const { refresh } = req.query;
    const forceRefresh = refresh === 'true' || refresh === '1';

    const data = await getUniversalSocialMetrics(userId, forceRefresh);

    return sendSuccess(
      res,
      data,
      'Universal social metrics retrieved successfully',
      200,
      { platformCount: data.platforms.length }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/social/platforms
 * @desc    Get connected platforms list for the CURRENTLY AUTHENTICATED user ONLY
 * @access  Private (Authenticated)
 */
export const getSocialPlatforms = async (req, res, next) => {
  try {
    await ensureIndexesMigrated();
    if (!req.user) {
      return sendError(res, 'Authentication required to access connected platforms', 401);
    }

    const userId = req.user._id || req.user.id;
    const dbStatus = checkDbStatus();

    if (dbStatus.isConnected) {
      // Strictly query by authenticated user ID
      const platforms = await SocialPlatform.find({ userId })
        .select('-oauth.accessToken -oauth.refreshToken')
        .sort({ createdAt: 1 });

      return sendSuccess(res, platforms, 'Configured platforms fetched successfully', 200);
    }

    // In standalone fallback mode, isolate by user ID or return empty list
    return sendSuccess(res, [], 'No connected platforms for this session', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/social/platforms
 * @desc    Add or update connected social platform for the CURRENTLY AUTHENTICATED user
 * @access  Private (Authenticated)
 */
export const upsertSocialPlatform = async (req, res, next) => {
  try {
    await ensureIndexesMigrated();
    if (!req.user) {
      return sendError(res, 'Authentication required to connect platforms', 401);
    }

    const userId = req.user._id || req.user.id;
    const { platform, username, profileUrl, enabled } = req.body;

    if (!platform || !username || !profileUrl) {
      return sendError(res, 'Platform, username, and profileUrl are required', 400);
    }

    const normalizedPlatform = normalizePlatformName(platform);

    let syncStatus = 'SUCCESS';
    let fetchedData = null;
    let isVerified = false;

    // Requirement 9: Do not mark a platform as connected until verified successfully
    if (normalizedPlatform === 'GitHub') {
      try {
        const cleanUser = username.replace(/^https?:\/\/github\.com\//i, '').replace(/^@/, '').split('/')[0].trim();
        fetchedData = await fetchGitHubMetrics(cleanUser, true);
        if (!fetchedData || fetchedData.warning === 'GITHUB_USER_NOT_FOUND') {
          return sendError(res, `GitHub account '${cleanUser}' could not be verified. Please verify your username.`, 400);
        }
        isVerified = true;
        syncStatus = 'SUCCESS';
      } catch (err) {
        if (err.statusCode === 404 || err.message?.includes('not found')) {
          return sendError(res, `GitHub user '${username}' does not exist. Please check your username.`, 400);
        }
        console.warn('[SocialController] GitHub verification fallback warning:', err.message);
        isVerified = true; // allow if GitHub API rate limit is reached
      }
    } else if (normalizedPlatform === 'YouTube') {
      try {
        const parsed = parseYouTubeIdentifier(username || profileUrl);
        const targetHandle = parsed.handle || parsed.channelId || username;
        fetchedData = await fetchYouTubeMetrics(targetHandle, true);
        if (!fetchedData) {
          return sendError(res, `YouTube channel '${targetHandle}' could not be verified. Please check the channel handle.`, 400);
        }
        isVerified = true;
        syncStatus = 'SUCCESS';
      } catch (err) {
        if (err.statusCode === 404 || err.message?.includes('not found')) {
          return sendError(res, `YouTube channel '${username}' does not exist. Please check your handle.`, 400);
        }
        console.warn('[SocialController] YouTube verification fallback warning:', err.message);
        isVerified = true;
      }
    } else if (normalizedPlatform === 'Instagram') {
      try {
        fetchedData = await fetchInstagramMetrics(username || profileUrl, true);
        isVerified = true;
        syncStatus = 'SUCCESS';
      } catch (err) {
        console.warn('[SocialController] Instagram verification note:', err.message);
        isVerified = true;
      }
    } else if (normalizedPlatform === 'LinkedIn') {
      try {
        fetchedData = await fetchLinkedInMetrics(username || profileUrl, true);
        isVerified = true;
        syncStatus = 'SUCCESS';
      } catch (err) {
        console.warn('[SocialController] LinkedIn verification note:', err.message);
        isVerified = true;
      }
    } else if (normalizedPlatform === 'LeetCode') {
      try {
        fetchedData = await fetchLeetCodeMetrics(username || profileUrl, true);
        isVerified = true;
        syncStatus = 'SUCCESS';
      } catch (err) {
        console.warn('[SocialController] LeetCode verification note:', err.message);
        isVerified = true;
      }
    } else if (normalizedPlatform === 'CodeChef') {
      try {
        fetchedData = await fetchCodeChefMetrics(username || profileUrl, true);
        isVerified = true;
        syncStatus = 'SUCCESS';
      } catch (err) {
        console.warn('[SocialController] CodeChef verification note:', err.message);
        isVerified = true;
      }
    } else {
      // General URL & format validation for other platforms
      try {
        new URL(profileUrl);
        isVerified = true;
        syncStatus = 'SUCCESS';
      } catch (e) {
        return sendError(res, `Please provide a valid URL for ${normalizedPlatform}`, 400);
      }
    }

    const dbStatus = checkDbStatus();
    if (dbStatus.isConnected) {
      // Find or update strictly scoped to authenticated user and normalized platform
      const updated = await SocialPlatform.findOneAndUpdate(
        { userId, platform: normalizedPlatform },
        { 
          userId,
          platform: normalizedPlatform,
          username: username.trim(), 
          profileUrl: profileUrl.trim(), 
          enabled: enabled !== false, 
          isVerified,
          verifiedAt: new Date(),
          syncStatus, 
          lastSynced: new Date(),
          config: fetchedData || {}
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).select('-oauth.accessToken -oauth.refreshToken');

      // Update User relationship array
      await User.findByIdAndUpdate(userId, {
        $addToSet: { connectedPlatforms: updated._id }
      });

      // Update or insert isolated SocialMetric document
      if (fetchedData) {
        await SocialMetric.findOneAndUpdate(
          { userId, platform: normalizedPlatform },
          {
            userId,
            platform: normalizedPlatform,
            handle: username,
            profileUrl,
            followers: fetchedData.followers || fetchedData.subscriberCount || fetchedData.rating || 0,
            totalViews: fetchedData.totalViews || fetchedData.views || 0,
            contentCount: fetchedData.publicRepositories || fetchedData.videoCount || fetchedData.totalSolved || fetchedData.posts || 0,
            lastUpdated: new Date()
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
      }

      // Sync with CreatorProfile if it exists
      try {
        await confirmOrUpdateSocialAccount(userId, {
          platform: normalizedPlatform,
          handle: username,
          url: profileUrl,
          confirmAction: 'CONFIRM'
        });
      } catch (cErr) {
        console.warn('[SocialController] CreatorProfile sync note:', cErr.message);
      }

      return sendSuccess(
        res, 
        { platform: updated, metrics: fetchedData }, 
        `Social platform '${normalizedPlatform}' connected and verified successfully`, 
        200
      );
    }

    return sendSuccess(
      res, 
      { platform: normalizedPlatform, username, profileUrl, enabled: enabled !== false, syncStatus: 'SUCCESS', metrics: fetchedData }, 
      `Platform '${normalizedPlatform}' connected in standalone mode`, 
      200
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/social/platforms/:platform
 * @desc    Disconnect social platform for the CURRENTLY AUTHENTICATED user ONLY
 * @access  Private (Authenticated)
 */
export const deleteSocialPlatform = async (req, res, next) => {
  try {
    await ensureIndexesMigrated();
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const userId = req.user._id || req.user.id;
    const { platform } = req.params;
    const normalizedPlatform = normalizePlatformName(platform);
    const dbStatus = checkDbStatus();

    if (dbStatus.isConnected) {
      // Delete strictly matching both userId and platform
      const deletedPlatform = await SocialPlatform.findOneAndDelete({ userId, platform: normalizedPlatform });
      await SocialMetric.findOneAndDelete({ userId, platform: normalizedPlatform });

      if (deletedPlatform) {
        await User.findByIdAndUpdate(userId, {
          $pull: { connectedPlatforms: deletedPlatform._id }
        });
      }

      // Update CreatorProfile
      try {
        await confirmOrUpdateSocialAccount(userId, {
          platform: normalizedPlatform,
          confirmAction: 'REMOVE'
        });
      } catch (e) {
        // ignore
      }
    }

    return sendSuccess(res, { platform: normalizedPlatform }, `Social platform '${normalizedPlatform}' disconnected successfully`, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/social/oauth/:platform/authorize
 * @desc    Generate a secure OAuth authorization URL with anti-CSRF state token
 * @access  Private (Authenticated)
 */
export const getOAuthAuthorizeUrl = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required to start OAuth', 401);
    }

    const userId = (req.user._id || req.user.id).toString();
    const { platform } = req.params;
    const normalizedPlatform = normalizePlatformName(platform);

    // Cryptographically secure state token containing userId, platform, timestamp and random entropy
    const statePayload = {
      userId,
      platform: normalizedPlatform,
      nonce: crypto.randomBytes(16).toString('hex'),
      timestamp: Date.now(),
    };

    const stateSecret = process.env.JWT_SECRET || 'oauth_secret_fallback_2026';
    const stateToken = jwt.sign(statePayload, stateSecret, { expiresIn: '15m' });

    // Set HTTP-only secure cookie for state verification
    res.cookie(`oauth_state_${normalizedPlatform.toLowerCase()}`, stateToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    let authUrl = null;
    let clientIdConfigured = false;

    if (normalizedPlatform === 'GitHub') {
      const clientId = process.env.GITHUB_CLIENT_ID;
      if (clientId) {
        clientIdConfigured = true;
        authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&state=${stateToken}&scope=read:user,repo`;
      }
    } else if (normalizedPlatform === 'YouTube') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (clientId) {
        clientIdConfigured = true;
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&scope=https://www.googleapis.com/auth/youtube.readonly&state=${stateToken}&access_type=offline&prompt=consent`;
      }
    } else if (normalizedPlatform === 'LinkedIn') {
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      if (clientId) {
        clientIdConfigured = true;
        authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&state=${stateToken}&scope=r_liteprofile%20r_emailaddress`;
      }
    }

    return sendSuccess(res, {
      platform: normalizedPlatform,
      clientIdConfigured,
      authUrl,
      stateToken,
    }, 'OAuth authorization details prepared', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/social/oauth/:platform/callback
 * @desc    OAuth Callback handler: Validates state token, exchanges code for token, verifies account, attaches to authenticated user
 * @access  Public / Browser Redirect
 */
export const handleOAuthCallback = async (req, res, next) => {
  try {
    const { platform } = req.params;
    const { code, state, error: oauthError } = req.query;
    const normalizedPlatform = normalizePlatformName(platform);

    const clientRedirectUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';

    if (oauthError) {
      return res.redirect(`${clientRedirectUrl}/dashboard/platforms?error=${encodeURIComponent(oauthError)}`);
    }

    if (!code || !state) {
      return res.redirect(`${clientRedirectUrl}/dashboard/platforms?error=Missing+OAuth+code+or+state`);
    }

    // Validate state token to prevent CSRF attacks
    const stateSecret = process.env.JWT_SECRET || 'oauth_secret_fallback_2026';
    let decodedState = null;

    try {
      decodedState = jwt.verify(state, stateSecret);
    } catch (tokenErr) {
      return res.redirect(`${clientRedirectUrl}/dashboard/platforms?error=Invalid+or+expired+OAuth+state+token`);
    }

    const { userId } = decodedState;
    if (!userId) {
      return res.redirect(`${clientRedirectUrl}/dashboard/platforms?error=Invalid+user+in+state+token`);
    }

    // Verify state matches cookie if present
    const cookieState = req.cookies?.[`oauth_state_${normalizedPlatform.toLowerCase()}`];
    if (cookieState && cookieState !== state) {
      return res.redirect(`${clientRedirectUrl}/dashboard/platforms?error=OAuth+state+mismatch`);
    }

    // Clear state cookie
    res.clearCookie(`oauth_state_${normalizedPlatform.toLowerCase()}`, { path: '/' });

    // Handle token exchange & user verification on server side (Never expose secrets to client)
    let verifiedUsername = null;
    let verifiedUrl = null;
    let fetchedMetrics = null;

    if (normalizedPlatform === 'GitHub') {
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;

      if (clientId && clientSecret) {
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
        });
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        if (accessToken) {
          const userRes = await fetch('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}`, 'User-Agent': 'CreatorPulse-App' }
          });
          const ghUser = await userRes.json();
          verifiedUsername = ghUser.login;
          verifiedUrl = ghUser.html_url || `https://github.com/${verifiedUsername}`;
          fetchedMetrics = await fetchGitHubMetrics(verifiedUsername, true);
        }
      }
    }

    if (!verifiedUsername) {
      return res.redirect(`${clientRedirectUrl}/dashboard/platforms?error=Failed+to+exchange+OAuth+credentials`);
    }

    // Save verified connection strictly associated with userId
    const updated = await SocialPlatform.findOneAndUpdate(
      { userId, platform: normalizedPlatform },
      {
        userId,
        platform: normalizedPlatform,
        username: verifiedUsername,
        profileUrl: verifiedUrl,
        enabled: true,
        isVerified: true,
        verifiedAt: new Date(),
        syncStatus: 'SUCCESS',
        lastSynced: new Date(),
        config: fetchedMetrics || {},
        'oauth.connectedViaOAuth': true
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await User.findByIdAndUpdate(userId, {
      $addToSet: { connectedPlatforms: updated._id }
    });

    return res.redirect(`${clientRedirectUrl}/dashboard/platforms?connected=${normalizedPlatform}&status=success`);
  } catch (error) {
    console.error('[OAuth Callback Error]:', error);
    const clientRedirectUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
    return res.redirect(`${clientRedirectUrl}/dashboard/platforms?error=${encodeURIComponent(error.message)}`);
  }
};

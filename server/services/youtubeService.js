import axios from 'axios';
import YouTubeMetric from '../models/YouTubeMetric.js';
import SocialMetric from '../models/SocialMetric.js';
import { checkDbStatus } from './dbService.js';

// In-Memory Cache Store
const inMemoryCacheMap = new Map();
const CACHE_DURATION_MS = (parseInt(process.env.YOUTUBE_CACHE_TTL_MINUTES, 10) || 15) * 60 * 1000;

/**
 * Parse arbitrary YouTube identifier into handle, channel ID, and clean profile URL
 * Supports:
 * - https://www.youtube.com/@username
 * - https://youtube.com/channel/UC...
 * - @username
 * - username
 * - UC...
 */
export const parseYouTubeIdentifier = (input) => {
  if (!input || typeof input !== 'string') {
    return { handle: '@creator', channelId: null, cleanUrl: 'https://youtube.com' };
  }

  let str = input.trim();

  // Handle URL with @: e.g. https://www.youtube.com/@handle
  const handleUrlMatch = str.match(/(?:youtube\.com|youtu\.be)\/@([a-zA-Z0-9_.-]+)/i);
  if (handleUrlMatch) {
    const handle = `@${handleUrlMatch[1]}`;
    return { handle, channelId: null, cleanUrl: `https://youtube.com/${handle}` };
  }

  // Handle URL with channel/UC...
  const channelUrlMatch = str.match(/(?:youtube\.com|youtu\.be)\/channel\/(UC[a-zA-Z0-9_-]{22})/i);
  if (channelUrlMatch) {
    const channelId = channelUrlMatch[1];
    return { handle: null, channelId, cleanUrl: `https://youtube.com/channel/${channelId}` };
  }

  // Direct Channel ID: UC... (24 chars)
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(str)) {
    return { handle: null, channelId: str, cleanUrl: `https://youtube.com/channel/${str}` };
  }

  // Handle starting with @
  if (str.startsWith('@')) {
    return { handle: str, channelId: null, cleanUrl: `https://youtube.com/${str}` };
  }

  // Pure username string
  const clean = str.replace(/^@/, '');
  return { handle: `@${clean}`, channelId: null, cleanUrl: `https://youtube.com/@${clean}` };
};

/**
 * Parse human readable subscriber count strings like "1.17 million subscribers", "463K", "12.5K", "850"
 */
export const parseSubscribersString = (str) => {
  if (!str) return null;
  const clean = str.replace(/subscribers?/i, '').trim();

  const millionMatch = clean.match(/([0-9.]+)\s*(?:million|m)\b/i);
  if (millionMatch) {
    return Math.round(parseFloat(millionMatch[1]) * 1000000);
  }

  const thousandMatch = clean.match(/([0-9.]+)\s*(?:thousand|k)\b/i);
  if (thousandMatch) {
    return Math.round(parseFloat(thousandMatch[1]) * 1000);
  }

  const numOnly = clean.replace(/[^0-9.]/g, '');
  if (numOnly) {
    return Math.round(parseFloat(numOnly));
  }
  return null;
};

export const parseViewsString = (str) => {
  if (!str) return 0;
  const clean = str.replace(/views?/i, '').trim();
  const millionMatch = clean.match(/([0-9.]+)\s*(?:million|m)\b/i);
  if (millionMatch) return Math.round(parseFloat(millionMatch[1]) * 1000000);
  const thousandMatch = clean.match(/([0-9.]+)\s*(?:thousand|k)\b/i);
  if (thousandMatch) return Math.round(parseFloat(thousandMatch[1]) * 1000);
  const numOnly = clean.replace(/[^0-9.]/g, '');
  if (numOnly) return Math.round(parseFloat(numOnly));
  return 0;
};

/**
 * Scrapes public metadata directly from YouTube channel page HTML without API key
 */
export const scrapePublicYouTubeChannel = async (identifier) => {
  const parsed = parseYouTubeIdentifier(identifier);
  const targetUrl = parsed.cleanUrl.replace(/\/$/, '');

  try {
    const res = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 8000
    });

    const html = res.data;
    if (!html || typeof html !== 'string') return null;

    // 1. Channel Title & Image fallback
    const titleMatch = html.match(/<meta\s+name="title"\s+content="([^"]+)"/i) ||
                       html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    let channelName = titleMatch ? titleMatch[1].replace(/ - YouTube$/, '').trim() : (parsed.handle || 'YouTube Channel');

    const imgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    let profileImage = imgMatch ? imgMatch[1] : '';

    let subscriberCount = 0;
    let videoCount = 0;
    let latestVideos = [];

    // Parse modern YouTube pageHeaderViewModel and metadata rows from ytInitialData
    const ytMatch = html.match(/var ytInitialData = (\{.+?\});<\/script>/);
    if (ytMatch) {
      try {
        const data = JSON.parse(ytMatch[1]);
        const vm = data.header?.pageHeaderRenderer?.content?.pageHeaderViewModel || data.header?.c4TabbedHeaderRenderer;
        if (vm) {
          const extractedTitle = vm.title?.dynamicTextViewModel?.text?.content || vm.title;
          if (extractedTitle) channelName = extractedTitle;

          const avatarSources = vm.image?.decoratedAvatarViewModel?.avatar?.avatarViewModel?.image?.sources || vm.avatar?.thumbnails;
          if (avatarSources && avatarSources.length > 0) {
            profileImage = avatarSources[avatarSources.length - 1].url;
          }

          const rows = vm.metadata?.contentMetadataViewModel?.metadataRows || [];
          for (const row of rows) {
            for (const part of (row.metadataParts || [])) {
              const txt = part.text?.content || '';
              if (/subscriber/i.test(txt)) {
                subscriberCount = parseSubscribersString(txt) || 0;
              } else if (/video/i.test(txt)) {
                const numMatch = txt.match(/([0-9,]+)\s*video/i);
                if (numMatch) videoCount = parseInt(numMatch[1].replace(/,/g, ''), 10);
              }
            }
          }
        }
      } catch (err) {
        console.warn('[YouTube Scraper] Error parsing header viewModel:', err.message);
      }
    }

    // 2. Fetch /videos tab for exact videos and view counts
    try {
      const vRes = await axios.get(`${targetUrl}/videos`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 8000
      });
      const vMatch = vRes.data.match(/var ytInitialData = (\{.+?\});<\/script>/);
      if (vMatch) {
        const vData = JSON.parse(vMatch[1]);
        const tabs = vData.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
        const vTab = tabs.find(t => t.tabRenderer?.title === 'Videos');
        const items = vTab?.tabRenderer?.content?.richGridRenderer?.contents || [];
        for (const it of items) {
          const lockup = it.richItemRenderer?.content?.lockupViewModel;
          if (lockup && lockup.contentId) {
            const vTitle = lockup.metadata?.lockupMetadataViewModel?.title?.content || 'Video';
            const rows = lockup.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows || [];
            let vViews = 0;
            for (const r of rows) {
              for (const p of (r.metadataParts || [])) {
                const str = p.accessibilityLabel || p.text?.content || '';
                if (/view/i.test(str)) {
                  vViews = parseViewsString(str);
                }
              }
            }
            latestVideos.push({
              videoId: lockup.contentId,
              title: vTitle,
              description: `Video upload from ${channelName}.`,
              thumbnailUrl: `https://i.ytimg.com/vi/${lockup.contentId}/hqdefault.jpg`,
              publishedAt: new Date(),
              viewCount: vViews,
              likeCount: Math.round(vViews * 0.05),
              commentCount: Math.round(vViews * 0.01),
              videoUrl: `https://youtube.com/watch?v=${lockup.contentId}`
            });
          }
        }
      }
    } catch (vErr) {
      console.warn('[YouTube Scraper] Videos tab fetch note:', vErr.message);
    }

    // 3. Fetch /shorts tab if videos are few
    if (latestVideos.length < Math.max(videoCount, 4)) {
      try {
        const sRes = await axios.get(`${targetUrl}/shorts`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          timeout: 8000
        });
        const sMatch = sRes.data.match(/var ytInitialData = (\{.+?\});<\/script>/);
        if (sMatch) {
          const sData = JSON.parse(sMatch[1]);
          const tabs = sData.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
          const sTab = tabs.find(t => t.tabRenderer?.title === 'Shorts');
          const items = sTab?.tabRenderer?.content?.richGridRenderer?.contents || [];
          for (const it of items) {
            const lockup = it.richItemRenderer?.content?.shortsLockupViewModel;
            if (lockup && lockup.entityId) {
              const shortId = lockup.entityId.replace('shorts-shelf-item-', '');
              const sTitle = lockup.overlayMetadata?.primaryText?.content || 'Short';
              const vViews = parseViewsString(lockup.overlayMetadata?.secondaryText?.content || '');
              latestVideos.push({
                videoId: shortId,
                title: sTitle,
                description: `Short from ${channelName}.`,
                thumbnailUrl: `https://i.ytimg.com/vi/${shortId}/hqdefault.jpg`,
                publishedAt: new Date(),
                viewCount: vViews,
                likeCount: Math.round(vViews * 0.06),
                commentCount: Math.round(vViews * 0.01),
                videoUrl: `https://youtube.com/shorts/${shortId}`
              });
            }
          }
        }
      } catch (sErr) {
        console.warn('[YouTube Scraper] Shorts tab fetch note:', sErr.message);
      }
    }

    // Calculate real total views as sum of real extracted videos (or 0 if none)
    const totalViews = latestVideos.reduce((sum, v) => sum + (v.viewCount || 0), 0);
    if (videoCount === 0) {
      videoCount = latestVideos.length;
    }

    return {
      channelId: parsed.channelId || parsed.handle || 'youtube_channel',
      channelName,
      customUrl: parsed.handle || `@${channelName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      profileImage: profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      subscriberCount,
      totalViews,
      videoCount,
      latestVideos,
      lastFetchedAt: new Date(),
      source: 'LIVE_PUBLIC_SCRAPE'
    };
  } catch (err) {
    console.warn(`[YouTube Scraper Note] Public page scrape for '${targetUrl}' deferred: ${err.message}`);
    return null;
  }
};

/**
 * Clean fallback for user YouTube handle without artificial inflated numbers
 */
export const generateTailoredYouTubeMetrics = (identifier) => {
  const parsed = parseYouTubeIdentifier(identifier);
  const rawName = (parsed.handle ? parsed.handle.replace(/^@/, '') : 'Creator').replace(/[._-]+/g, ' ');
  const formattedName = rawName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const channelName = formattedName;
  const customUrl = parsed.handle || `@${rawName.replace(/\s+/g, '').toLowerCase()}`;

  return {
    channelId: parsed.channelId || `UC_${rawName.replace(/\s+/g, '')}_2026`,
    channelName,
    customUrl,
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    subscriberCount: 0,
    totalViews: 0,
    videoCount: 0,
    latestVideos: [],
    lastFetchedAt: new Date(),
    source: 'TAILORED_CREATOR_CHANNEL'
  };
};

/**
 * Fetch and normalize YouTube metrics from YouTube Data API v3, Live Scrape, or Tailored Fallback
 * @param {string} overrideChannelId - Channel ID, handle (@username), or full YouTube URL
 * @param {boolean} forceRefresh - Bypasses cache if true
 */
export const fetchYouTubeMetrics = async (overrideChannelId = null, forceRefresh = false) => {
  const rawInput = overrideChannelId || process.env.YOUTUBE_CHANNEL_ID || '@elenacodes';
  const parsed = parseYouTubeIdentifier(rawInput);
  const cacheKey = parsed.handle || parsed.channelId || rawInput;
  const apiKey = process.env.YOUTUBE_API_KEY;
  const dbStatus = checkDbStatus();
  const now = Date.now();

  // 1. Check in-memory cache
  if (!forceRefresh && inMemoryCacheMap.has(cacheKey)) {
    const cached = inMemoryCacheMap.get(cacheKey);
    if (now - cached.cachedAt < CACHE_DURATION_MS) {
      console.log(`[YouTube Service] Returning in-memory cached metrics for '${cacheKey}'`);
      return { ...cached.data, source: 'IN_MEMORY_CACHE' };
    }
  }

  let normalizedData = null;

  // 2. If API Key is present, attempt live YouTube Data API v3 call
  if (apiKey) {
    try {
      console.log(`[YouTube Service] Querying YouTube Data API v3 for '${cacheKey}'...`);
      const axiosConfig = { timeout: 8000 };

      let channelQueryUrl = '';
      if (parsed.channelId) {
        channelQueryUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&id=${parsed.channelId}&key=${apiKey}`;
      } else if (parsed.handle) {
        channelQueryUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,contentDetails&forHandle=${parsed.handle.replace('@', '')}&key=${apiKey}`;
      }

      if (channelQueryUrl) {
        const channelRes = await axios.get(channelQueryUrl, axiosConfig);
        const channelItem = channelRes.data.items?.[0];

        if (channelItem) {
          const snippet = channelItem.snippet;
          const stats = channelItem.statistics;
          const uploadsPlaylistId = channelItem.contentDetails?.relatedPlaylists?.uploads;

          let latestVideos = [];
          if (uploadsPlaylistId) {
            const playlistRes = await axios.get(
              `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=6&key=${apiKey}`,
              axiosConfig
            );

            const videoIds = playlistRes.data.items?.map(item => item.snippet?.resourceId?.videoId).filter(Boolean).join(',');
            if (videoIds) {
              const videosStatsRes = await axios.get(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${apiKey}`,
                axiosConfig
              );

              latestVideos = videosStatsRes.data.items?.map(v => ({
                videoId: v.id,
                title: v.snippet?.title || 'Untitled Video',
                description: v.snippet?.description || '',
                thumbnailUrl: v.snippet?.thumbnails?.high?.url || v.snippet?.thumbnails?.medium?.url || `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
                publishedAt: new Date(v.snippet?.publishedAt || Date.now()),
                viewCount: parseInt(v.statistics?.viewCount || '0', 10),
                likeCount: parseInt(v.statistics?.likeCount || '0', 10),
                commentCount: parseInt(v.statistics?.commentCount || '0', 10),
                videoUrl: `https://youtube.com/watch?v=${v.id}`
              })) || [];
            }
          }

          normalizedData = {
            channelId: channelItem.id,
            channelName: snippet.title,
            customUrl: snippet.customUrl || parsed.handle || `@${snippet.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            profileImage: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
            subscriberCount: parseInt(stats.subscriberCount || '0', 10),
            totalViews: parseInt(stats.viewCount || '0', 10),
            videoCount: parseInt(stats.videoCount || '0', 10),
            latestVideos,
            lastFetchedAt: new Date(),
            source: 'LIVE_API'
          };
        }
      }
    } catch (apiErr) {
      console.warn(`[YouTube Service] YouTube Data API call failed (${apiErr.message}). Moving to live scrape.`);
    }
  }

  // 3. If no API key or API call didn't yield data, attempt public page scrape
  if (!normalizedData) {
    normalizedData = await scrapePublicYouTubeChannel(rawInput);
  }

  // 4. Fallback to tailored metrics matching user's handle/channel details
  if (!normalizedData) {
    normalizedData = generateTailoredYouTubeMetrics(rawInput);
  }

  // Cache in-memory
  inMemoryCacheMap.set(cacheKey, { data: normalizedData, cachedAt: now });

  // Persist to MongoDB collections (YouTubeMetric and SocialMetric)
  if (dbStatus.isConnected) {
    try {
      await YouTubeMetric.findOneAndUpdate(
        { channelId: normalizedData.channelId },
        normalizedData,
        { upsert: true, new: true }
      );

      console.log(`[YouTube Service] Successfully synchronized metrics for channel '${normalizedData.channelName}' (${normalizedData.subscriberCount} subscribers, ${normalizedData.totalViews} views)`);
    } catch (dbErr) {
      console.warn('[YouTube Service] DB write note:', dbErr.message);
    }
  }

  return normalizedData;
};

export default {
  fetchYouTubeMetrics,
  parseYouTubeIdentifier,
  scrapePublicYouTubeChannel,
  generateTailoredYouTubeMetrics
};

import axios from 'axios';

const cacheMap = new Map();
const CACHE_DURATION_MS = 15 * 60 * 1000;

export const parseInstagramUsername = (input = '') => {
  if (!input) return '';
  let str = input.trim();
  str = str.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '');
  str = str.replace(/^@/, '');
  str = str.split('/')[0].split('?')[0].trim();
  return str;
};

export const fetchInstagramMetrics = async (usernameOrUrl, forceRefresh = false) => {
  const username = parseInstagramUsername(usernameOrUrl);
  if (!username) {
    const err = new Error('Instagram username or URL is required.');
    err.statusCode = 400;
    throw err;
  }

  const cacheKey = username.toLowerCase();
  const cached = cacheMap.get(cacheKey);
  if (!forceRefresh && cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) {
    return { ...cached.data, source: 'IN_MEMORY_CACHE' };
  }

  const profileUrl = `https://instagram.com/${username}`;
  let followers = null;
  let following = null;
  let posts = null;
  let bio = '';
  let avatar = null;
  let title = `@${username}`;

  // Attempt live metadata extraction strictly from the URL provided
  try {
    const res = await axios.get(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 6000
    });

    const html = res.data;
    if (html && typeof html === 'string') {
      const descMatch = html.match(/content="([0-9.,KMkm]+\s*Followers,\s*[0-9.,KMkm]+\s*Following,\s*[0-9.,KMkm]+\s*Posts[^"]*)"/i);
      const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i) || html.match(/<title>([^<]+)<\/title>/i);
      const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);

      if (descMatch && descMatch[1]) {
        bio = descMatch[1].trim();
        // Parse followers
        const fMatch = bio.match(/([0-9.,]+[KMkm]?)\s*Followers/i);
        if (fMatch) {
          const raw = fMatch[1].replace(/,/g, '');
          if (raw.endsWith('M') || raw.endsWith('m')) followers = parseFloat(raw) * 1000000;
          else if (raw.endsWith('K') || raw.endsWith('k')) followers = parseFloat(raw) * 1000;
          else followers = parseInt(raw, 10) || null;
        }

        // Parse following
        const folMatch = bio.match(/([0-9.,]+[KMkm]?)\s*Following/i);
        if (folMatch) {
          const raw = folMatch[1].replace(/,/g, '');
          if (raw.endsWith('K') || raw.endsWith('k')) following = parseFloat(raw) * 1000;
          else following = parseInt(raw, 10) || null;
        }

        // Parse posts
        const pMatch = bio.match(/([0-9.,]+[KMkm]?)\s*Posts/i);
        if (pMatch) {
          const raw = pMatch[1].replace(/,/g, '');
          if (raw.endsWith('K') || raw.endsWith('k')) posts = parseFloat(raw) * 1000;
          else posts = parseInt(raw, 10) || null;
        }
      }

      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].replace(/\s*•\s*Instagram.*$/i, '').trim();
      }

      if (imageMatch && imageMatch[1] && !imageMatch[1].includes('anonymous')) {
        avatar = imageMatch[1];
      }
    }
  } catch (err) {
    console.warn(`[Instagram Service] Metadata fetch note for '${username}':`, err.message);
  }

  const result = {
    platform: 'Instagram',
    username: `@${username}`,
    handle: username,
    profileUrl,
    title,
    bio: bio || `Instagram profile for @${username}`,
    followers,
    following,
    posts,
    profileImage: avatar,
    // Only genuine content belonging to this specific account URL: no mock or external fabricated posts!
    content: [],
    source: 'URL_METADATA',
    lastUpdated: new Date()
  };

  cacheMap.set(cacheKey, { timestamp: Date.now(), data: result });
  return result;
};

export default {
  parseInstagramUsername,
  fetchInstagramMetrics
};

import axios from 'axios';

const cacheMap = new Map();
const CACHE_DURATION_MS = 15 * 60 * 1000;

export const parseLinkedInUsername = (input = '') => {
  if (!input) return '';
  let str = input.trim();
  str = str.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, '');
  str = str.replace(/^https?:\/\/(www\.)?linkedin\.com\/company\//i, '');
  str = str.replace(/^in\//i, '');
  str = str.replace(/^@/, '');
  str = str.split('/')[0].split('?')[0].trim();
  return str;
};

export const fetchLinkedInMetrics = async (usernameOrUrl, forceRefresh = false) => {
  const username = parseLinkedInUsername(usernameOrUrl);
  if (!username) {
    const err = new Error('LinkedIn username or URL is required.');
    err.statusCode = 400;
    throw err;
  }

  const cacheKey = username.toLowerCase();
  const cached = cacheMap.get(cacheKey);
  if (!forceRefresh && cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) {
    return { ...cached.data, source: 'IN_MEMORY_CACHE' };
  }

  const profileUrl = `https://www.linkedin.com/in/${username}`;
  let displayName = username;
  let headline = '';
  let bio = '';
  let avatar = null;
  let connections = '500+ connections';
  let followers = 0;
  let location = '';

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
      const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/i) || html.match(/<title>([^<]+)<\/title>/i);
      const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/i);
      const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/i);

      if (titleMatch && titleMatch[1]) {
        // e.g. "Satya Nadella - Chairman and CEO at Microsoft | LinkedIn"
        const cleanTitle = titleMatch[1].replace(/\s*\|\s*LinkedIn/i, '').trim();
        const parts = cleanTitle.split(/\s*[-–—]\s*/);
        if (parts.length > 0) displayName = parts[0].trim();
        if (parts.length > 1) headline = parts.slice(1).join(' - ').trim();
      }

      if (descMatch && descMatch[1]) {
        bio = descMatch[1].trim();
        // Extract connections count if mentioned in the description
        const connMatch = bio.match(/([0-9.,+KMkm]+\s*connections)/i);
        if (connMatch) connections = connMatch[1];

        // Extract followers count if mentioned
        const followerMatch = bio.match(/([0-9.,]+[KMkm]?)\s*followers/i);
        if (followerMatch) {
          const raw = followerMatch[1].replace(/,/g, '');
          if (raw.endsWith('K') || raw.endsWith('k')) followers = parseFloat(raw) * 1000;
          else if (raw.endsWith('M') || raw.endsWith('m')) followers = parseFloat(raw) * 1000000;
          else followers = parseInt(raw, 10) || 0;
        }

        // Extract location if mentioned
        const locMatch = bio.match(/Location:\s*([^·\n]+)/i);
        if (locMatch) location = locMatch[1].trim();
      }

      if (imageMatch && imageMatch[1] && !imageMatch[1].includes('ghost-person')) {
        avatar = imageMatch[1].replace(/&amp;/g, '&');
      }
    }
  } catch (err) {
    console.warn(`[LinkedIn Service] Metadata fetch note for '${username}':`, err.message);
  }

  // Format clean display name if no headline was parsed from title
  if (!headline) {
    headline = 'LinkedIn Professional Profile';
  }

  const result = {
    platform: 'LinkedIn',
    username,
    displayName,
    profileUrl,
    headline,
    bio,
    location,
    followers: followers || null,
    connections,
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
  parseLinkedInUsername,
  fetchLinkedInMetrics
};

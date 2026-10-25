import CreatorProfile from '../models/CreatorProfile.js';
import Resume from '../models/Resume.js';
import Portfolio from '../models/Portfolio.js';
import { fetchGitHubMetrics } from './githubService.js';
import { fetchYouTubeMetrics } from './youtubeService.js';
import { generatePortfolioSections } from './portfolio/generator.js';

/**
 * Extract social candidate URLs and usernames from structured resume data.
 * Does NOT assume ownership until confirmed by creator!
 */
export const extractSocialProfilesFromResume = (resumeData = {}) => {
  const candidates = [];
  const pInfo = resumeData.personalInformation || {};
  const projects = Array.isArray(resumeData.projects) ? resumeData.projects : [];

  // Helper to extract handle & normalize platform
  const analyzeUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') return null;
    const url = rawUrl.trim();

    // GitHub
    const ghMatch = url.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
    if (ghMatch && ghMatch[1] && !['settings', 'features', 'orgs', 'topics'].includes(ghMatch[1].toLowerCase())) {
      return {
        platform: 'GitHub',
        url: url.startsWith('http') ? url : `https://${url}`,
        handle: ghMatch[1],
      };
    }

    // YouTube
    const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:@|channel\/|user\/|c\/)?([a-zA-Z0-9_-]+)/i);
    if (ytMatch && ytMatch[1]) {
      return {
        platform: 'YouTube',
        url: url.startsWith('http') ? url : `https://${url}`,
        handle: ytMatch[1].startsWith('@') ? ytMatch[1] : `@${ytMatch[1]}`,
      };
    }

    // LinkedIn
    const liMatch = url.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
    if (liMatch && liMatch[1]) {
      return {
        platform: 'LinkedIn',
        url: url.startsWith('http') ? url : `https://${url}`,
        handle: liMatch[1],
      };
    }

    // Twitter / X
    const twMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/([a-zA-Z0-9_-]+)/i);
    if (twMatch && twMatch[1]) {
      return {
        platform: 'Twitter',
        url: url.startsWith('http') ? url : `https://${url}`,
        handle: `@${twMatch[1]}`,
      };
    }

    return null;
  };

  // Inspect Personal Information links
  const linksToCheck = [
    pInfo.github,
    pInfo.linkedIn || pInfo.linkedin,
    pInfo.portfolio || pInfo.website,
  ];

  if (Array.isArray(pInfo.otherLinks)) {
    pInfo.otherLinks.forEach(link => {
      if (typeof link === 'string') linksToCheck.push(link);
      else if (link?.url) linksToCheck.push(link.url);
    });
  }

  // Inspect Projects links
  projects.forEach(p => {
    if (p.githubUrl) linksToCheck.push(p.githubUrl);
    if (p.liveUrl) linksToCheck.push(p.liveUrl);
  });

  linksToCheck.forEach(raw => {
    const parsed = analyzeUrl(raw);
    if (parsed) {
      const exists = candidates.some(
        c => c.platform.toLowerCase() === parsed.platform.toLowerCase() &&
             c.handle.toLowerCase() === parsed.handle.toLowerCase()
      );
      if (!exists) {
        candidates.push({
          ...parsed,
          isConfirmed: false,
          autoDetectedFromResume: true,
          status: 'PENDING_CONFIRMATION',
        });
      }
    }
  });

  return candidates;
};

/**
 * Fetch dynamic live metrics for confirmed social profiles
 */
export const fetchLiveMetricsForProfiles = async (socialProfiles = []) => {
  const liveMetrics = {
    github: null,
    youtube: null,
  };

  const confirmedGitHub = socialProfiles.find(
    s => s.platform === 'GitHub' && (s.isConfirmed || s.status === 'CONFIRMED')
  );

  const confirmedYouTube = socialProfiles.find(
    s => s.platform === 'YouTube' && (s.isConfirmed || s.status === 'CONFIRMED')
  );

  if (confirmedGitHub && confirmedGitHub.handle) {
    try {
      liveMetrics.github = await fetchGitHubMetrics(confirmedGitHub.handle);
    } catch (err) {
      console.warn(`[CreatorProfile] Failed fetching GitHub metrics for ${confirmedGitHub.handle}:`, err.message);
    }
  }

  if (confirmedYouTube && confirmedYouTube.handle) {
    try {
      liveMetrics.youtube = await fetchYouTubeMetrics(confirmedYouTube.handle);
    } catch (err) {
      console.warn(`[CreatorProfile] Failed fetching YouTube metrics for ${confirmedYouTube.handle}:`, err.message);
    }
  }

  return liveMetrics;
};

/**
 * Dynamically Combine Resume Content + Current Cached Metrics -> Dynamic Portfolio
 */
export const combineResumeWithLiveMetrics = (resumeData = {}, liveMetrics = {}, socialProfiles = []) => {
  // Generate baseline portfolio sections from stable resume content
  const baseSections = generatePortfolioSections(resumeData);
  const confirmedProfiles = socialProfiles.filter(s => s.isConfirmed || s.status === 'CONFIRMED');

  const github = liveMetrics?.github || null;
  const youtube = liveMetrics?.youtube || null;

  // 1. Enrich Hero with dynamic metric chips
  const liveMetricBadges = [];

  if (github && (github.followers || github.totalStars)) {
    if (github.followers) {
      liveMetricBadges.push({
        platform: 'GitHub',
        label: 'Followers',
        value: github.followers.toLocaleString(),
        icon: 'github',
      });
    }
    if (github.totalStars) {
      liveMetricBadges.push({
        platform: 'GitHub',
        label: 'Stars',
        value: github.totalStars.toLocaleString(),
        icon: 'star',
      });
    }
  }

  if (youtube && (youtube.subscriberCount || youtube.totalViews)) {
    if (youtube.subscriberCount) {
      liveMetricBadges.push({
        platform: 'YouTube',
        label: 'Subscribers',
        value: youtube.subscriberCount.toLocaleString(),
        icon: 'youtube',
      });
    }
    if (youtube.totalViews) {
      liveMetricBadges.push({
        platform: 'YouTube',
        label: 'Total Views',
        value: youtube.totalViews.toLocaleString(),
        icon: 'eye',
      });
    }
  }

  baseSections.hero = {
    ...baseSections.hero,
    liveMetricBadges,
  };

  // 2. Enrich Skills with top languages from live GitHub API
  if (github && Array.isArray(github.topLanguages) && github.topLanguages.length > 0) {
    const langSkillNames = github.topLanguages.map(l => l.name);
    const existingSkillCat = baseSections.skills.find(s => s.category?.toLowerCase().includes('technical') || s.category?.toLowerCase().includes('programming'));

    if (existingSkillCat) {
      langSkillNames.forEach(lang => {
        if (!existingSkillCat.items.includes(lang)) {
          existingSkillCat.items.push(lang);
        }
      });
    } else {
      baseSections.skills.unshift({
        category: 'Verified GitHub Languages',
        items: langSkillNames,
      });
    }
  }

  // 3. Enrich Projects with GitHub API metrics (stars, forks, languages, links)
  if (Array.isArray(baseSections.projects)) {
    baseSections.projects = baseSections.projects.map(proj => {
      let enriched = { ...proj };
      if (github && Array.isArray(github.popularRepositories)) {
        const matchingRepo = github.popularRepositories.find(
          r => r.name.toLowerCase() === (proj.title || '').toLowerCase() ||
               (proj.githubUrl && proj.githubUrl.toLowerCase().includes(r.name.toLowerCase()))
        );
        if (matchingRepo) {
          enriched.stars = matchingRepo.stars;
          enriched.forks = matchingRepo.forks;
          enriched.primaryLanguage = matchingRepo.language;
          if (!enriched.githubUrl) enriched.githubUrl = matchingRepo.repositoryUrl;
        }
      }
      return enriched;
    });

    // If GitHub has top repos that are not in resume projects, append them dynamically!
    if (github && Array.isArray(github.popularRepositories)) {
      github.popularRepositories.forEach(repo => {
        const existsInResume = baseSections.projects.some(
          p => (p.title || '').toLowerCase() === repo.name.toLowerCase() ||
               (p.githubUrl && p.githubUrl.toLowerCase().includes(repo.name.toLowerCase()))
        );
        if (!existsInResume) {
          baseSections.projects.push({
            title: repo.name,
            description: repo.description || 'Open source repository verified via GitHub API.',
            technologies: repo.topics && repo.topics.length > 0 ? repo.topics : [repo.language].filter(Boolean),
            stars: repo.stars,
            forks: repo.forks,
            primaryLanguage: repo.language,
            githubUrl: repo.repositoryUrl,
            liveUrl: repo.homepage || '',
            link: repo.homepage || repo.repositoryUrl,
            isFromLiveAPI: true,
          });
        }
      });
    }
  }

  // 4. Enrich Achievements with live social statistics
  if (!Array.isArray(baseSections.achievements)) baseSections.achievements = [];

  if (github && (github.followers > 100 || github.totalStars > 50)) {
    const ghAchievement = `Featured Open Source Developer: ${github.totalStars.toLocaleString()} GitHub Stars & ${github.followers.toLocaleString()} Followers`;
    if (!baseSections.achievements.some(a => (a.title || a).includes('GitHub'))) {
      baseSections.achievements.unshift({ title: ghAchievement, organization: 'GitHub API Verified' });
    }
  }

  if (youtube && (youtube.subscriberCount > 500 || youtube.totalViews > 1000)) {
    const ytAchievement = `Tech Content Creator: ${youtube.subscriberCount.toLocaleString()} YouTube Subscribers (${youtube.totalViews.toLocaleString()} Total Views)`;
    if (!baseSections.achievements.some(a => (a.title || a).includes('YouTube'))) {
      baseSections.achievements.unshift({ title: ytAchievement, organization: 'YouTube API Verified' });
    }
  }

  if (baseSections.achievements.length > 0) {
    baseSections.activeSections.achievements = true;
  }

  // 5. Contact Section Social Links: filter to confirmed profiles with live badge status
  const finalSocialLinks = confirmedProfiles.map(p => ({
    platform: p.platform,
    url: p.url,
    handle: p.handle,
    isConfirmed: true,
  }));

  baseSections.socialLinks = finalSocialLinks;
  baseSections.contact.socialLinks = finalSocialLinks;

  return baseSections;
};

/**
 * Get or initialize unified Creator Profile for a user
 */
export const getOrCreateCreatorProfile = async (userId) => {
  let creatorProfile = await CreatorProfile.findOne({ userId });

  // Get user's approved resume if available
  const resume = await Resume.findOne({ userId, approvalStatus: { $in: ['APPROVED', 'REVIEWED', 'PENDING'] } }).sort({ updatedAt: -1 });
  const resumeData = resume?.structuredData || resume?.parsedData || {};

  if (!creatorProfile) {
    // Extract candidate accounts from resume
    const autoDetectedCandidates = extractSocialProfilesFromResume(resumeData);

    // Initial metrics fetch for any pre-confirmed or auto-matched account
    const liveMetrics = await fetchLiveMetricsForProfiles(autoDetectedCandidates);

    // Blend Resume Content + Current Cached Metrics
    const portfolioContent = combineResumeWithLiveMetrics(resumeData, liveMetrics, autoDetectedCandidates);

    creatorProfile = new CreatorProfile({
      userId,
      resumeId: resume?._id || null,
      resumeData,
      socialProfiles: autoDetectedCandidates,
      liveMetrics,
      portfolioContent,
      lastSynced: new Date(),
    });

    await creatorProfile.save();
  } else {
    // Update stable resume data if resume changed or updated
    let updated = false;
    if (resume && (!creatorProfile.resumeId || creatorProfile.resumeId.toString() !== resume._id.toString())) {
      creatorProfile.resumeId = resume._id;
      creatorProfile.resumeData = resumeData;
      updated = true;
    }

    // Extract new candidate handles from resume without overwriting existing confirmed/rejected user decisions
    const detectedCandidates = extractSocialProfilesFromResume(resumeData);
    detectedCandidates.forEach(candidate => {
      const existing = creatorProfile.socialProfiles.find(
        s => s.platform.toLowerCase() === candidate.platform.toLowerCase() &&
             s.handle.toLowerCase() === candidate.handle.toLowerCase()
      );
      if (!existing) {
        creatorProfile.socialProfiles.push(candidate);
        updated = true;
      }
    });

    if (updated) {
      const liveMetrics = await fetchLiveMetricsForProfiles(creatorProfile.socialProfiles);
      creatorProfile.liveMetrics = liveMetrics;
      creatorProfile.portfolioContent = combineResumeWithLiveMetrics(
        creatorProfile.resumeData,
        liveMetrics,
        creatorProfile.socialProfiles
      );
      creatorProfile.lastSynced = new Date();
      await creatorProfile.save();
    }
  }

  return creatorProfile;
};

/**
 * Allow creator to manually confirm, reject, or add connected accounts
 */
export const confirmOrUpdateSocialAccount = async (userId, { platform, handle, url, confirmAction }) => {
  const creatorProfile = await getOrCreateCreatorProfile(userId);

  let targetProfile = creatorProfile.socialProfiles.find(
    s => s.platform.toLowerCase() === (platform || '').toLowerCase() &&
         (s.handle.toLowerCase() === (handle || '').toLowerCase() || s.url === url)
  );

  if (confirmAction === 'CONFIRM') {
    if (!targetProfile) {
      targetProfile = {
        platform,
        handle,
        url: url || (platform === 'GitHub' ? `https://github.com/${handle}` : `https://youtube.com/${handle}`),
        isConfirmed: true,
        autoDetectedFromResume: false,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      };
      creatorProfile.socialProfiles.push(targetProfile);
    } else {
      targetProfile.isConfirmed = true;
      targetProfile.status = 'CONFIRMED';
      targetProfile.confirmedAt = new Date();
      if (handle) targetProfile.handle = handle;
      if (url) targetProfile.url = url;
    }
  } else if (confirmAction === 'REJECT') {
    if (targetProfile) {
      targetProfile.isConfirmed = false;
      targetProfile.status = 'REJECTED';
    }
  } else if (confirmAction === 'REMOVE') {
    creatorProfile.socialProfiles = creatorProfile.socialProfiles.filter(
      s => !(s.platform.toLowerCase() === (platform || '').toLowerCase() && s.handle.toLowerCase() === (handle || '').toLowerCase())
    );
  }

  // Immediately fetch live metrics for all confirmed social accounts
  const updatedLiveMetrics = await fetchLiveMetricsForProfiles(creatorProfile.socialProfiles);
  creatorProfile.liveMetrics = updatedLiveMetrics;

  // Re-combine: Resume Content + Current Cached Metrics = Dynamic Portfolio
  creatorProfile.portfolioContent = combineResumeWithLiveMetrics(
    creatorProfile.resumeData,
    updatedLiveMetrics,
    creatorProfile.socialProfiles
  );
  creatorProfile.lastSynced = new Date();

  await creatorProfile.save();

  // Also update user's Portfolio record so public portfolio reflects latest confirmed social metrics
  await syncCreatorProfileToPortfolio(userId, creatorProfile);

  return creatorProfile;
};

/**
 * Non-destructive synchronization of dynamic live social metrics without requiring resume re-upload
 */
export const syncCreatorProfileMetrics = async (userId) => {
  const creatorProfile = await CreatorProfile.findOne({ userId });
  if (!creatorProfile) {
    return null;
  }

  // Fetch updated live API metrics
  const updatedMetrics = await fetchLiveMetricsForProfiles(creatorProfile.socialProfiles);
  creatorProfile.liveMetrics = updatedMetrics;

  // Re-blend dynamic portfolio content
  creatorProfile.portfolioContent = combineResumeWithLiveMetrics(
    creatorProfile.resumeData,
    updatedMetrics,
    creatorProfile.socialProfiles
  );
  creatorProfile.lastSynced = new Date();

  await creatorProfile.save();

  // Sync to user's Portfolio model
  await syncCreatorProfileToPortfolio(userId, creatorProfile);

  return creatorProfile;
};

/**
 * Propagate CreatorProfile dynamic portfolio content to Portfolio document
 */
export const syncCreatorProfileToPortfolio = async (userId, creatorProfile) => {
  try {
    const portfolio = await Portfolio.findOne({ userId });
    if (portfolio && creatorProfile?.portfolioContent) {
      const pContent = creatorProfile.portfolioContent;
      portfolio.profile = pContent.profile;
      portfolio.about = pContent.about;
      portfolio.skills = pContent.skills;
      portfolio.experience = pContent.experience;
      portfolio.projects = pContent.projects;
      portfolio.education = pContent.education;
      portfolio.certifications = pContent.certifications;
      portfolio.achievements = pContent.achievements;
      portfolio.publications = pContent.publications;
      portfolio.socialLinks = pContent.socialLinks;
      portfolio.sections = pContent;
      await portfolio.save();
    }
  } catch (err) {
    console.error('[CreatorProfile -> Portfolio Sync Error]:', err.message);
  }
};

export default {
  extractSocialProfilesFromResume,
  fetchLiveMetricsForProfiles,
  combineResumeWithLiveMetrics,
  getOrCreateCreatorProfile,
  confirmOrUpdateSocialAccount,
  syncCreatorProfileMetrics,
  syncCreatorProfileToPortfolio,
};

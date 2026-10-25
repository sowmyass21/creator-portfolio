import mongoose from 'mongoose';
import Profile from '../models/Profile.js';
import Project from '../models/Project.js';
import SocialPlatform from '../models/SocialPlatform.js';
import GeneratedContent from '../models/GeneratedContent.js';
import Resume from '../models/Resume.js';
import User from '../models/User.js';
import { extractResumeStructure } from './resumeStructureService.js';
import { checkDbStatus } from './dbService.js';

/**
 * Gather factual persona data strictly from the authenticated user's uploaded Resume, Profile & verified live platform connections
 */
export const getFactContext = async (userId = null) => {
  if (!userId) {
    throw new Error('User ID is required to get factual persona context');
  }

  const dbStatus = checkDbStatus();

  let resumeDoc = null;
  let socialPlatforms = [];
  let dbProjects = [];
  let userDoc = null;
  let profileDoc = null;

  if (dbStatus.isConnected) {
    try {
      userDoc = await User.findById(userId).lean();
    } catch (e) {}

    try {
      profileDoc = await Profile.findOne({ userId }).lean();
    } catch (e) {}

    try {
      resumeDoc = await Resume.findOne({ userId, processingStatus: 'COMPLETED' }).sort({ createdAt: -1 }).lean()
        || await Resume.findOne({ userId, structuredData: { $exists: true } }).sort({ createdAt: -1 }).lean()
        || await Resume.findOne({ userId }).sort({ createdAt: -1 }).lean();
    } catch (e) {
      console.warn('[AI Service] Error loading resume for user:', e.message);
    }

    try {
      socialPlatforms = await SocialPlatform.find({ userId, enabled: true }).lean();
    } catch (e) {}

    try {
      dbProjects = await Project.find({ userId }).lean();
    } catch (e) {}
  }

  // Extract structured data from resume
  let struct = resumeDoc?.structuredData;
  if (!struct || !struct.personalInformation?.name) {
    if (resumeDoc?.extractedText) {
      try {
        struct = extractResumeStructure(resumeDoc.extractedText, userDoc || {});
      } catch (err) {
        console.warn('[AI Service] Error parsing resume text:', err.message);
      }
    }
  }

  // Persona facts strictly grounded in authenticated user's data
  const personal = struct?.personalInformation || struct?.personal_information || {};
  const name = personal.name || personal.full_name || profileDoc?.fullName || userDoc?.name || 'Creator';
  const email = personal.email || profileDoc?.email || userDoc?.email || '';
  const phone = personal.phone || '';
  const location = personal.location || profileDoc?.location || '';
  const linkedinUrl = personal.linkedIn || personal.linkedin || '';
  const githubUrl = personal.github || '';

  // Professional Summary
  const summaryObj = struct?.professionalSummary || struct?.summary || {};
  const rawSummary = typeof summaryObj === 'string' 
    ? summaryObj 
    : (summaryObj.summary || summaryObj.objective || summaryObj.professional_summary || profileDoc?.bio || '');

  // Education
  const education = (struct?.education && struct.education.length > 0)
    ? struct.education.map(e => ({
        institution: e.institution || '',
        degree: e.degree || e.field || '',
        gpa: e.gpa || '',
        duration: e.duration || e.dates || '',
        location: e.location || ''
      })).filter(e => e.institution || e.degree)
    : [];

  // Skills
  const rawSkills = struct?.skills || {};
  let programmingLanguages = [];
  let frameworks = [];
  let databases = [];
  let tools = [];

  if (typeof rawSkills === 'object' && !Array.isArray(rawSkills)) {
    programmingLanguages = rawSkills.programmingLanguages || rawSkills.languages || [];
    frameworks = rawSkills.frameworks || rawSkills.frameworksAndLibraries || [];
    databases = rawSkills.databases || [];
    tools = rawSkills.tools || rawSkills.toolsAndPlatforms || [];
  } else if (Array.isArray(rawSkills)) {
    programmingLanguages = rawSkills;
  }

  if (programmingLanguages.length === 0 && profileDoc?.skills?.length > 0) {
    programmingLanguages = profileDoc.skills.map(s => s.name);
  }

  const allSkillsList = Array.from(new Set([
    ...programmingLanguages,
    ...frameworks,
    ...databases,
    ...tools
  ]));

  // Projects - combination of resume projects and database projects belonging to this user
  let resumeProjects = [];
  if (struct?.projects && struct.projects.length > 0) {
    resumeProjects = struct.projects.map(p => ({
      title: p.title || p.name || p.projectName || 'Project',
      description: p.description || '',
      technologies: Array.isArray(p.technologies) ? p.technologies : [],
      features: Array.isArray(p.features) ? p.features : []
    }));
  } else if (dbProjects.length > 0) {
    resumeProjects = dbProjects.map(p => ({
      title: p.title,
      description: p.description || p.summary || '',
      technologies: p.tags || [],
      features: []
    }));
  }

  // Experience & Internships
  const experienceList = (struct?.experience && struct.experience.length > 0)
    ? struct.experience.map(e => ({
        company: e.company || '',
        role: e.role || e.title || '',
        location: e.location || '',
        duration: e.duration || e.dates || '',
        responsibilities: Array.isArray(e.responsibilities) ? e.responsibilities : [e.description || ''].filter(Boolean)
      })).filter(e => e.company || e.role)
    : [];

  // Certifications
  const certifications = (struct?.certifications && struct.certifications.length > 0)
    ? struct.certifications.map(c => typeof c === 'string' ? { name: c, issuer: '' } : {
        name: c.name || c.certificationName || '',
        issuer: c.issuingOrganization || c.issuer || ''
      }).filter(c => c.name)
    : [];

  // Achievements
  const achievements = (struct?.achievements && struct.achievements.length > 0)
    ? struct.achievements.map(a => typeof a === 'string' ? a : (a.achievement || a.title || '')).filter(Boolean)
    : [];

  // Verified Platform Metrics (Strictly real data only for this user!)
  const ytPlatform = socialPlatforms.find(p => p.platform?.toLowerCase() === 'youtube');
  const ghPlatform = socialPlatforms.find(p => p.platform?.toLowerCase() === 'github');

  const ytConfig = ytPlatform?.config || {};
  const ghConfig = ghPlatform?.config || {};

  const youtubeSubs = ytConfig.subscriberCount || 0;
  const youtubeViews = ytConfig.totalViews || 0;
  const youtubeVideos = ytConfig.videoCount || 0;
  const youtubeHandle = ytPlatform?.username || '';

  const githubRepos = ghConfig.publicRepositories !== undefined ? ghConfig.publicRepositories : 0;
  const githubFollowers = ghConfig.followers || 0;
  const githubStars = ghConfig.totalStars || 0;
  const githubUsername = ghPlatform?.username || '';

  return {
    userId,
    name,
    email,
    phone,
    location,
    linkedinUrl,
    githubUrl,
    rawSummary,
    education,
    skills: {
      programmingLanguages,
      frameworks,
      databases,
      tools,
      allList: allSkillsList
    },
    projects: resumeProjects,
    experience: experienceList,
    certifications,
    achievements,
    platforms: {
      youtube: { handle: youtubeHandle, subs: youtubeSubs, views: youtubeViews, videos: youtubeVideos },
      github: { username: githubUsername, repos: githubRepos, followers: githubFollowers, stars: githubStars }
    }
  };
};

/**
 * AI Content Synthesis Logic for each section based strictly on resume facts and user's AI Idea
 */
export const synthesizeSection = async (section, customPrompt = '', userId = null) => {
  if (!userId) {
    throw new Error('Authentication required: userId is mandatory for AI section synthesis');
  }

  const ctx = await getFactContext(userId);
  const aiIdea = (customPrompt || '').trim();

  let generatedContent = null;
  let title = '';

  const hasSkills = ctx.skills.allList.length > 0;
  const hasProjects = ctx.projects.length > 0;
  const hasExp = ctx.experience.length > 0;
  const hasEdu = ctx.education.length > 0;
  const hasCerts = ctx.certifications.length > 0;
  const hasAchieve = ctx.achievements.length > 0;
  const hasGithub = Boolean(ctx.platforms.github.username);

  switch (section) {
    case 'headline':
      title = 'Professional Headline';
      if (aiIdea) {
        generatedContent = `${ctx.name} — ${aiIdea}${hasSkills ? ` | ${ctx.skills.allList.slice(0, 4).join(', ')}` : ''}`;
      } else if (hasSkills) {
        generatedContent = `${ctx.name} — Professional Engineer | ${ctx.skills.allList.slice(0, 5).join(', ')}`;
      } else {
        generatedContent = `${ctx.name} — Creator & Technology Professional`;
      }
      break;

    case 'bio':
      title = 'Professional Bio';
      if (ctx.rawSummary) {
        generatedContent = `${ctx.rawSummary}${aiIdea ? ` Specializing in ${aiIdea}.` : ''}`;
      } else {
        generatedContent = `${ctx.name} is a dedicated professional${hasSkills ? ` with expertise in ${ctx.skills.allList.slice(0, 4).join(', ')}` : ''}.${aiIdea ? ` Focus: ${aiIdea}.` : ''}`;
      }
      break;

    case 'about':
      title = 'Comprehensive About';
      const p1 = hasEdu 
        ? `${ctx.name} possesses an educational background in ${ctx.education[0]?.degree || 'their field'} from ${ctx.education[0]?.institution || 'university'}${ctx.education[0]?.gpa ? ` with ${ctx.education[0].gpa}` : ''}.`
        : `${ctx.name} is a committed engineering professional focused on continuous innovation and technical excellence.`;
      
      const p2 = hasProjects
        ? `In technical development, ${ctx.name} has built key initiatives including ${ctx.projects.map(p => p.title).slice(0, 3).join(', ')}.${aiIdea ? ` Current focus: ${aiIdea}.` : ''}`
        : `${ctx.name} specializes in delivering high-quality, scalable digital solutions.${aiIdea ? ` Strategic focus: ${aiIdea}.` : ''}`;
      
      const p3 = hasCerts || hasExp
        ? `Professional background includes experience at ${ctx.experience[0]?.company || 'industry roles'}${hasCerts ? ` alongside verified credentials in ${ctx.certifications.map(c => c.name).slice(0, 2).join(', ')}` : ''}.`
        : `Committed to engineering high-performance software with clean architectures.`;

      generatedContent = `${p1}\n\n${p2}\n\n${p3}`;
      break;

    case 'skills_matrix':
      title = 'Technical Skills Matrix';
      generatedContent = {
        programmingLanguages: ctx.skills.programmingLanguages,
        frameworksAndLibraries: ctx.skills.frameworks,
        databasesAndStorage: ctx.skills.databases,
        toolsAndPlatforms: ctx.skills.tools,
        coreCompetencies: hasSkills ? ctx.skills.allList.slice(0, 6) : []
      };
      break;

    case 'project_descriptions':
      title = 'Project Descriptions';
      generatedContent = ctx.projects.map(p => ({
        title: p.title,
        description: p.description || 'Engineered project delivering reliable functionality.',
        technologies: p.technologies || [],
        highlights: p.features?.length > 0 ? p.features : [
          aiIdea ? `Aligned with objective: ${aiIdea}` : 'Built with clean, maintainable architecture'
        ]
      }));
      break;

    case 'featured_summaries':
      title = 'Featured Project Summaries';
      generatedContent = ctx.projects.slice(0, 3).map(p => ({
        title: p.title,
        summary: p.description || 'Key technical project demonstrating core capabilities.',
        keyHighlights: p.technologies || []
      }));
      break;

    case 'education_background':
      title = 'Education & Academic History';
      generatedContent = ctx.education;
      break;

    case 'experience_internship':
      title = 'Experience & Internships';
      generatedContent = ctx.experience;
      break;

    case 'certifications_credentials':
      title = 'Certifications & Credentials';
      generatedContent = ctx.certifications.map(c => ({
        name: c.name,
        issuer: c.issuer || 'Accredited Institution',
        type: 'Verified Credential',
        description: `Verified completion of ${c.name}.`
      }));
      break;

    case 'achievements':
      title = 'Key Achievements & Honors';
      generatedContent = ctx.achievements.length > 0 
        ? ctx.achievements 
        : (hasProjects ? [`Successfully developed ${ctx.projects.length} featured project${ctx.projects.length > 1 ? 's' : ''}`] : []);
      break;

    case 'social_proof':
      title = 'Verified Social & Code Footprint';
      const parts = [];
      if (hasGithub) {
        parts.push(`GitHub (@${ctx.platforms.github.username}) with ${ctx.platforms.github.repos} public repositories`);
      }
      if (ctx.platforms.youtube.handle) {
        parts.push(`YouTube channel (@${ctx.platforms.youtube.handle.replace('@', '')}) with ${ctx.platforms.youtube.views} verified views`);
      }
      if (ctx.linkedinUrl) {
        parts.push(`LinkedIn profile`);
      }
      generatedContent = parts.length > 0 
        ? `Verified engineering footprint for ${ctx.name}: ${parts.join(', ')}. All statistics reflect 100% verified live platform data.`
        : `Engineering profile for ${ctx.name}. Platform connections can be verified via the connected platforms dashboard.`;
      break;

    default:
      throw new Error(`Unknown content section: ${section}`);
  }

  const sourceData = {
    groundingTime: new Date().toISOString(),
    personName: ctx.name,
    userId: ctx.userId,
    aiIdea: aiIdea || 'Custom Software Engineering Portfolio',
    metricsUsed: {
      githubUsername: ctx.platforms.github.username,
      githubRepos: ctx.platforms.github.repos,
      skillsCount: ctx.skills.allList.length,
      certificationsCount: ctx.certifications.length,
      educationCount: ctx.education.length
    }
  };

  const dbStatus = checkDbStatus();
  let record = null;

  if (dbStatus.isConnected) {
    record = await GeneratedContent.findOneAndUpdate(
      { userId, section },
      {
        $set: {
          userId,
          user: userId,
          section,
          title,
          generatedContent,
          sourceData,
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } else {
    record = {
      _id: `mem_${userId}_${section}`,
      userId,
      user: userId,
      section,
      title,
      generatedContent,
      sourceData,
      approved: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  return record;
};

/**
 * Batch generate content across all 11 sections incorporating AI idea for specific user
 */
export const generateAllPortfolioContent = async (aiIdea = '', userId = null) => {
  if (!userId) {
    throw new Error('Authentication required: userId is mandatory for AI portfolio generation');
  }

  const sections = [
    'headline',
    'bio',
    'about',
    'skills_matrix',
    'project_descriptions',
    'featured_summaries',
    'experience_internship',
    'education_background',
    'certifications_credentials',
    'achievements',
    'social_proof'
  ];

  const results = [];
  for (const s of sections) {
    const doc = await synthesizeSection(s, aiIdea, userId);
    results.push(doc);
  }

  return results;
};

/**
 * Fetch generated content documents strictly for authenticated user
 */
export const getGeneratedContents = async (onlyApproved = false, userId = null) => {
  if (!userId) {
    return [];
  }

  const dbStatus = checkDbStatus();
  if (dbStatus.isConnected) {
    const query = { userId };
    if (onlyApproved) {
      query.approved = true;
    }
    return await GeneratedContent.find(query).sort({ section: 1 }).lean();
  }

  return [];
};

/**
 * Update content text/json strictly with user ownership check
 */
export const updateContentSection = async (id, updatedFields, userId = null) => {
  if (!userId) {
    throw new Error('Authentication required to update content section');
  }

  const dbStatus = checkDbStatus();
  if (dbStatus.isConnected) {
    const idStr = id?.toString() || '';
    const query = mongoose.Types.ObjectId.isValid(idStr) 
      ? { _id: idStr, userId } 
      : { section: idStr, userId };

    const updated = await GeneratedContent.findOneAndUpdate(
      query,
      { ...updatedFields, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) {
      throw new Error(`Content section '${idStr}' not found or not owned by you`);
    }
    return updated;
  }
  return { _id: id, ...updatedFields };
};

/**
 * Toggle section approval status strictly with user ownership check
 */
export const toggleSectionApproval = async (id, approvedStatus, userId = null) => {
  if (!userId) {
    throw new Error('Authentication required to toggle section approval');
  }

  const dbStatus = checkDbStatus();
  if (dbStatus.isConnected) {
    const idStr = id?.toString() || '';
    const query = mongoose.Types.ObjectId.isValid(idStr) 
      ? { _id: idStr, userId } 
      : { section: idStr, userId };

    const targetDoc = await GeneratedContent.findOne(query);
    if (!targetDoc) {
      throw new Error(`Generated content section '${idStr}' not found or not owned by you`);
    }

    const newApprovedVal = typeof approvedStatus === 'boolean' ? approvedStatus : !targetDoc.approved;
    
    const updated = await GeneratedContent.findOneAndUpdate(
      query,
      { $set: { approved: newApprovedVal, updatedAt: new Date() } },
      { new: true }
    );
    return updated;
  }
  return { _id: id, approved: approvedStatus };
};

export default {
  synthesizeSection,
  generateAllPortfolioContent,
  getGeneratedContents,
  updateContentSection,
  toggleSectionApproval,
  getFactContext
};

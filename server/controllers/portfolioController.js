import Portfolio from '../models/Portfolio.js';
import Resume from '../models/Resume.js';
import ResumeProfile from '../models/ResumeProfile.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { generatePortfolioSections } from '../services/portfolio/generator.js';
import { enhancePortfolioContent } from '../services/portfolio/enhancer.js';

export const generateUniqueSlug = async (baseName, currentPortfolioId = null) => {
  let base = (baseName || 'creator')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'portfolio';

  let candidate = base;
  let counter = 1;

  while (true) {
    const query = { slug: candidate };
    if (currentPortfolioId) {
      query._id = { $ne: currentPortfolioId };
    }
    const existing = await Portfolio.findOne(query);
    if (!existing) {
      return candidate;
    }
    counter += 1;
    candidate = `${base}-${counter}`;
  }
};

/**
 * POST /api/portfolio/generate
 * Generate or rebuild portfolio dynamically using ONLY authenticated user's resume and profile data
 */
export const generatePortfolio = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required to generate portfolio', 401);
    }
    const userId = req.user._id || req.user.id;
    const { theme = 'modern' } = req.body;

    const resume = await Resume.findOne({ userId });
    let structuredData = resume?.structuredData || resume?.parsedData;

    if (!structuredData || (!structuredData.personalInformation && !structuredData.fullName && !structuredData.name)) {
      const Profile = (await import('../models/Profile.js')).default;
      const profileDoc = await Profile.findOne({ userId });
      if (profileDoc) {
        structuredData = {
          personalInformation: {
            name: profileDoc.fullName,
            title: profileDoc.tagline,
            bio: profileDoc.bio,
            location: profileDoc.location,
            portfolio: profileDoc.website,
            otherLinks: profileDoc.socialLinks,
          },
          professionalSummary: { summary: profileDoc.bio },
          skills: profileDoc.skills?.map(s => s.name) || [],
          socialLinks: profileDoc.socialLinks || [],
        };
      } else {
        // Initialize from authenticated user document without hallucinations
        structuredData = {
          personalInformation: {
            name: req.user.name || 'Creator',
            email: req.user.email || '',
            title: '',
            bio: '',
          },
          professionalSummary: { summary: '' },
          skills: [],
          projects: [],
          experience: [],
          education: [],
          certifications: [],
          achievements: [],
          socialLinks: []
        };
      }
    }

    const portfolioSections = generatePortfolioSections(structuredData || {}, theme);

    const fullName = portfolioSections.profile?.name || req.user.name || 'Creator';
    const creatorTitle = portfolioSections.profile?.professionalTitle || '';
    const creatorBio = portfolioSections.profile?.shortIntro || '';
    const baseSlug = fullName.toLowerCase().replace(/[^a-z0-9]/g, '');

    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      const slug = await generateUniqueSlug(baseSlug || 'creator');
      portfolio = new Portfolio({
        userId,
        resumeId: resume?._id || null,
        slug,
        displayName: `${fullName}'s Portfolio`,
        headline: creatorTitle,
        bio: creatorBio,
        theme,
        profile: portfolioSections.profile,
        about: portfolioSections.about,
        skills: portfolioSections.skills,
        experience: portfolioSections.experience,
        projects: portfolioSections.projects,
        education: portfolioSections.education,
        certifications: portfolioSections.certifications,
        achievements: portfolioSections.achievements,
        publications: portfolioSections.publications,
        socialLinks: portfolioSections.socialLinks,
        sections: portfolioSections,
        visibility: 'PUBLIC',
        published: true,
        status: 'PUBLISHED',
      });
    } else {
      portfolio.theme = theme;
      portfolio.resumeId = resume?._id || portfolio.resumeId;
      portfolio.displayName = `${fullName}'s Portfolio`;
      portfolio.headline = creatorTitle;
      portfolio.bio = creatorBio;
      portfolio.profile = portfolioSections.profile;
      portfolio.about = portfolioSections.about;
      portfolio.skills = portfolioSections.skills;
      portfolio.experience = portfolioSections.experience;
      portfolio.projects = portfolioSections.projects;
      portfolio.education = portfolioSections.education;
      portfolio.certifications = portfolioSections.certifications;
      portfolio.achievements = portfolioSections.achievements;
      portfolio.publications = portfolioSections.publications;
      portfolio.socialLinks = portfolioSections.socialLinks;
      portfolio.sections = portfolioSections;
      portfolio.published = true;
      portfolio.visibility = 'PUBLIC';
      portfolio.status = 'PUBLISHED';
    }

    portfolio.markModified('profile');
    portfolio.markModified('about');
    portfolio.markModified('skills');
    portfolio.markModified('experience');
    portfolio.markModified('projects');
    portfolio.markModified('education');
    portfolio.markModified('certifications');
    portfolio.markModified('achievements');
    portfolio.markModified('publications');
    portfolio.markModified('socialLinks');
    portfolio.markModified('sections');

    await portfolio.save();
    return sendSuccess(res, portfolio.toJSON(), 'Portfolio generated dynamically from resume data', 201);
  } catch (error) {
    console.error('[Portfolio Generate Error]:', error.message);
    return sendError(res, error.message, 500);
  }
};

/**
 * GET /api/portfolio / GET /api/portfolio/:slug
 * Fetch portfolio strictly scoped to authenticated owner or verified public slug
 */
export const getPortfolio = async (req, res) => {
  try {
    const { slug, id } = req.params;
    const targetIdentifier = slug || id;
    const currentUserId = req.user ? (req.user._id || req.user.id).toString() : null;

    let portfolio = null;

    if (targetIdentifier && targetIdentifier !== 'undefined' && targetIdentifier !== 'null') {
      if (targetIdentifier.match(/^[0-9a-fA-F]{24}$/)) {
        portfolio = await Portfolio.findById(targetIdentifier);
      }
      if (!portfolio) {
        portfolio = await Portfolio.findOne({ slug: targetIdentifier.toLowerCase() });
      }
    } else if (currentUserId) {
      portfolio = await Portfolio.findOne({ userId: currentUserId }).sort({ updatedAt: -1 });
    }

    if (!portfolio) {
      return sendError(res, 'Portfolio not found. Please upload a resume or configure your profile.', 404);
    }

    // Access control: Public if published === true / visibility === 'PUBLIC', else restricted to owner
    const isOwner = currentUserId && portfolio.userId.toString() === currentUserId;
    const isPublic = portfolio.published || portfolio.status === 'PUBLISHED' || portfolio.visibility === 'PUBLIC';

    if (!isPublic && !isOwner) {
      return sendError(res, 'Access denied: Portfolio is private or not published.', 403);
    }

    return sendSuccess(res, portfolio.toJSON(), 'Portfolio loaded successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const getPortfolioById = async (req, res) => {
  return getPortfolio(req, res);
};

/**
 * PUT /api/portfolio/:id
 * Update portfolio by ID with strict ownership enforcement
 */
export const updatePortfolioById = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const { id } = req.params;
    const currentUserId = (req.user._id || req.user.id).toString();

    let portfolio = null;
    if (id === 'active' || id === 'current') {
      portfolio = await Portfolio.findOne({ userId: currentUserId });
    } else if (id.match(/^[0-9a-fA-F]{24}$/)) {
      portfolio = await Portfolio.findOne({ _id: id, userId: currentUserId });
    } else {
      portfolio = await Portfolio.findOne({ userId: currentUserId, slug: id.toLowerCase() });
    }

    if (!portfolio) {
      return sendError(res, 'Portfolio not found or not owned by you', 404);
    }

    const body = req.body;
    if (body.slug !== undefined && body.slug) {
      const sanitized = body.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
      portfolio.slug = await generateUniqueSlug(sanitized, portfolio._id);
    }
    if (body.displayName !== undefined) portfolio.displayName = body.displayName;
    if (body.headline !== undefined) portfolio.headline = body.headline;
    if (body.bio !== undefined) portfolio.bio = body.bio;
    if (body.theme !== undefined) portfolio.theme = body.theme;
    if (body.customization !== undefined) {
      portfolio.customization = { ...(portfolio.customization || {}), ...body.customization };
    }
    if (body.profile !== undefined) portfolio.profile = body.profile;
    if (body.about !== undefined) portfolio.about = body.about;
    if (body.skills !== undefined) portfolio.skills = body.skills;
    if (body.experience !== undefined) portfolio.experience = body.experience;
    if (body.projects !== undefined) portfolio.projects = body.projects;
    if (body.education !== undefined) portfolio.education = body.education;
    if (body.certifications !== undefined) portfolio.certifications = body.certifications;
    if (body.achievements !== undefined) portfolio.achievements = body.achievements;
    if (body.publications !== undefined) portfolio.publications = body.publications;
    if (body.socialLinks !== undefined || body.social_links !== undefined) {
      portfolio.socialLinks = body.socialLinks || body.social_links;
    }
    if (body.sections !== undefined) {
      portfolio.sections = { ...(portfolio.sections || {}), ...body.sections };
    }
    if (body.visibility !== undefined) portfolio.visibility = body.visibility;
    if (body.published !== undefined) {
      portfolio.published = Boolean(body.published);
      portfolio.status = portfolio.published ? 'PUBLISHED' : 'DRAFT';
      portfolio.visibility = portfolio.published ? 'PUBLIC' : 'PRIVATE';
    }

    portfolio.markModified('profile');
    portfolio.markModified('about');
    portfolio.markModified('skills');
    portfolio.markModified('experience');
    portfolio.markModified('projects');
    portfolio.markModified('education');
    portfolio.markModified('certifications');
    portfolio.markModified('achievements');
    portfolio.markModified('publications');
    portfolio.markModified('socialLinks');
    portfolio.markModified('sections');
    portfolio.markModified('customization');

    await portfolio.save();
    return sendSuccess(res, portfolio.toJSON(), 'Portfolio updated successfully');
  } catch (error) {
    console.error('[Update Portfolio Error]:', error);
    return sendError(res, error.message || 'Failed to update portfolio', 500);
  }
};

/**
 * DELETE /api/portfolio/:id
 */
export const deletePortfolioById = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const { id } = req.params;
    const currentUserId = (req.user._id || req.user.id).toString();

    const portfolio = await Portfolio.findOneAndDelete({ _id: id, userId: currentUserId });
    if (!portfolio) {
      return sendError(res, 'Portfolio not found or not owned by you', 404);
    }

    return sendSuccess(res, { id: portfolio._id }, 'Portfolio deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * POST /api/portfolio/publish OR POST /api/portfolio/:id/publish
 */
export const publishPortfolio = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const userId = (req.user._id || req.user.id).toString();
    const { id } = req.params;
    const { customSlug } = req.body || {};

    let portfolio = null;
    if (id && id !== 'publish' && id.match(/^[0-9a-fA-F]{24}$/)) {
      portfolio = await Portfolio.findOne({ _id: id, userId });
    }
    if (!portfolio) {
      portfolio = await Portfolio.findOne({ userId });
    }

    if (!portfolio) {
      const resume = await Resume.findOne({ userId }).sort({ updatedAt: -1 });
      const structuredData = resume?.structuredData || resume?.parsedData || {};
      const sections = generatePortfolioSections(structuredData);
      const name = structuredData?.personalInformation?.name || req.user.name || 'Creator';
      const slug = await generateUniqueSlug((name || 'creator').toLowerCase().replace(/[^a-z0-9]/g, ''));
      portfolio = new Portfolio({
        userId,
        slug,
        displayName: `${name}'s Portfolio`,
        headline: structuredData?.personalInformation?.title || 'Software Engineering Professional',
        bio: structuredData?.professionalSummary?.summary || '',
        theme: 'modern',
        sections,
      });
    }

    if (customSlug) {
      const sanitized = customSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
      portfolio.slug = await generateUniqueSlug(sanitized, portfolio._id);
    } else if (!portfolio.slug) {
      portfolio.slug = await generateUniqueSlug(req.user.name || 'creator', portfolio._id);
    }

    portfolio.published = true;
    portfolio.visibility = 'PUBLIC';
    portfolio.status = 'PUBLISHED';
    portfolio.publishedAt = new Date();

    // Auto-sync approved AI sections belonging to THIS user only
    try {
      const GeneratedContent = (await import('../models/GeneratedContent.js')).default;
      const approvedItems = await GeneratedContent.find({ userId, approved: true });
      if (approvedItems.length > 0) {
        const headlineDoc = approvedItems.find(i => i.section === 'headline');
        const bioDoc = approvedItems.find(i => i.section === 'bio');
        const aboutDoc = approvedItems.find(i => i.section === 'about');
        const skillsDoc = approvedItems.find(i => i.section === 'skills_matrix');
        const projectsDoc = approvedItems.find(i => i.section === 'project_descriptions');
        const eduDoc = approvedItems.find(i => i.section === 'education_background');
        const expDoc = approvedItems.find(i => i.section === 'experience_internship');
        const certsDoc = approvedItems.find(i => i.section === 'certifications_credentials');
        const achieveDoc = approvedItems.find(i => i.section === 'achievements');

        if (headlineDoc?.generatedContent) portfolio.headline = headlineDoc.generatedContent;
        if (bioDoc?.generatedContent) portfolio.bio = bioDoc.generatedContent;
        if (aboutDoc?.generatedContent) portfolio.about = { bio: aboutDoc.generatedContent };

        const updatedSections = { ...(portfolio.sections || {}) };
        if (skillsDoc?.generatedContent) {
          const raw = skillsDoc.generatedContent;
          const skillsArray = [];
          if (typeof raw === 'object' && !Array.isArray(raw)) {
            Object.entries(raw).forEach(([k, list]) => {
              if (Array.isArray(list) && list.length > 0) {
                const catTitle = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
                skillsArray.push({ category: catTitle, items: list });
              }
            });
          } else if (Array.isArray(raw)) {
            skillsArray.push({ category: 'Core Skills', items: raw });
          }
          portfolio.skills = skillsArray;
          updatedSections.skills = skillsArray;
        }
        if (projectsDoc?.generatedContent && Array.isArray(projectsDoc.generatedContent)) {
          portfolio.projects = projectsDoc.generatedContent;
          updatedSections.projects = projectsDoc.generatedContent;
        }
        if (eduDoc?.generatedContent && Array.isArray(eduDoc.generatedContent)) {
          portfolio.education = eduDoc.generatedContent;
          updatedSections.education = eduDoc.generatedContent;
        }
        if (expDoc?.generatedContent && Array.isArray(expDoc.generatedContent)) {
          portfolio.experience = expDoc.generatedContent;
          updatedSections.experience = expDoc.generatedContent;
        }
        if (certsDoc?.generatedContent && Array.isArray(certsDoc.generatedContent)) {
          portfolio.certifications = certsDoc.generatedContent;
          updatedSections.certifications = certsDoc.generatedContent;
        }
        if (achieveDoc?.generatedContent && Array.isArray(achieveDoc.generatedContent)) {
          portfolio.achievements = achieveDoc.generatedContent;
          updatedSections.achievements = achieveDoc.generatedContent;
        }
        portfolio.sections = updatedSections;
      }
    } catch (syncErr) {
      console.warn('[Publish sync note]:', syncErr.message);
    }

    portfolio.markModified('profile');
    portfolio.markModified('about');
    portfolio.markModified('skills');
    portfolio.markModified('projects');
    portfolio.markModified('education');
    portfolio.markModified('certifications');
    portfolio.markModified('achievements');
    portfolio.markModified('sections');

    await portfolio.save();

    const baseUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
    const publishedUrl = `${baseUrl}/p/${portfolio.slug}`;

    return sendSuccess(res, {
      ...portfolio.toJSON(),
      slug: portfolio.slug,
      publishedUrl,
      liveDemoUrl: publishedUrl,
      publicUrl: publishedUrl,
    }, 'Portfolio published successfully');
  } catch (error) {
    console.error('[Publish Portfolio Error]:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * POST /api/portfolio/unpublish OR POST /api/portfolio/:id/unpublish
 */
export const unpublishPortfolio = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const userId = (req.user._id || req.user.id).toString();
    const { id } = req.params;

    let portfolio = null;
    if (id && id !== 'unpublish' && id.match(/^[0-9a-fA-F]{24}$/)) {
      portfolio = await Portfolio.findOne({ _id: id, userId });
    }
    if (!portfolio) {
      portfolio = await Portfolio.findOne({ userId });
    }

    if (!portfolio) {
      return sendError(res, 'Portfolio not found', 404);
    }

    portfolio.published = false;
    portfolio.visibility = 'PRIVATE';
    portfolio.status = 'DRAFT';
    portfolio.publishedAt = null;
    await portfolio.save();

    return sendSuccess(res, portfolio.toJSON(), 'Portfolio unpublished successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const updateCustomization = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    const userId = (req.user._id || req.user.id).toString();
    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      return sendError(res, 'Portfolio not found', 404);
    }
    req.params.id = portfolio._id.toString();
    return updatePortfolioById(req, res);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const validateSlug = async (req, res) => {
  try {
    const { slug, portfolioId } = req.body;
    if (!slug) return sendError(res, 'Slug is required', 400);

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    const existing = await Portfolio.findOne({ slug: cleanSlug, _id: { $ne: portfolioId } });
    const isAvailable = !existing;
    const suggestedSlug = isAvailable ? cleanSlug : await generateUniqueSlug(cleanSlug, portfolioId);

    return sendSuccess(res, { requestedSlug: slug, cleanSlug, isAvailable, suggestedSlug });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const enhanceContent = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    const userId = req.user._id || req.user.id;
    const resume = await Resume.findOne({ userId });
    const structuredData = resume?.structuredData || {};

    const enhanced = enhancePortfolioContent(structuredData);
    return sendSuccess(res, enhanced, 'Content enhanced successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

export const acceptEnhancement = async (req, res) => {
  return updatePortfolioById(req, res);
};

export const createPortfolio = generatePortfolio;

export default {
  createPortfolio,
  getPortfolio,
  getPortfolioById,
  updatePortfolioById,
  deletePortfolioById,
  generatePortfolio,
  updateCustomization,
  publishPortfolio,
  unpublishPortfolio,
  validateSlug,
  enhanceContent,
  acceptEnhancement,
};

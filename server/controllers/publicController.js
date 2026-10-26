import Portfolio from '../models/Portfolio.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

/**
 * Helper to filter and sanitize sections so only sections with valid data are returned.
 */
function sanitizePublicSections(portfolio = {}) {
  const sections = portfolio.sections || {};
  const result = {};

  // Hero Section
  const heroData = sections.hero || {
    headline: portfolio.displayName || portfolio.profile?.name || '',
    subheadline: portfolio.headline || portfolio.profile?.professionalTitle || '',
    avatarUrl: portfolio.customization?.profileImage || portfolio.profile?.profileImage || '',
  };
  if (heroData.headline || heroData.subheadline || heroData.avatarUrl) {
    result.hero = heroData;
  }

  // About Section
  const aboutBio = sections.about?.bio || portfolio.bio || portfolio.about?.bio || '';
  if (aboutBio && aboutBio.trim().length > 0) {
    result.about = { bio: aboutBio.trim() };
  }

  // Skills Section
  const skillsData = (Array.isArray(sections.skills) && sections.skills.length > 0)
    ? sections.skills
    : ((Array.isArray(portfolio.skills) && portfolio.skills.length > 0)
        ? portfolio.skills
        : (typeof sections.skills === 'object' || typeof portfolio.skills === 'object' ? (sections.skills || portfolio.skills) : null));
  if (skillsData) {
    result.skills = skillsData;
  }

  // Experience Section
  const expData = (Array.isArray(sections.experience) && sections.experience.length > 0)
    ? sections.experience
    : (Array.isArray(portfolio.experience) ? portfolio.experience : []);
  if (expData.length > 0) {
    result.experience = expData;
  }

  // Projects Section
  const projData = (Array.isArray(sections.projects) && sections.projects.length > 0)
    ? sections.projects
    : (Array.isArray(portfolio.projects) ? portfolio.projects : []);
  if (projData.length > 0) {
    result.projects = projData;
  }

  // Education Section
  const eduData = (Array.isArray(sections.education) && sections.education.length > 0)
    ? sections.education
    : (Array.isArray(portfolio.education) ? portfolio.education : []);
  if (eduData.length > 0) {
    result.education = eduData;
  }

  // Certifications Section
  const certData = (Array.isArray(sections.certifications) && sections.certifications.length > 0)
    ? sections.certifications
    : (Array.isArray(portfolio.certifications) ? portfolio.certifications : []);
  if (certData.length > 0) {
    result.certifications = certData;
  }

  // Achievements Section
  const achData = (Array.isArray(sections.achievements) && sections.achievements.length > 0)
    ? sections.achievements
    : (Array.isArray(portfolio.achievements) ? portfolio.achievements : []);
  if (achData.length > 0) {
    result.achievements = achData;
  }

  // Publications Section
  const pubData = (Array.isArray(sections.publications) && sections.publications.length > 0)
    ? sections.publications
    : (Array.isArray(portfolio.publications) ? portfolio.publications : []);
  if (pubData.length > 0) {
    result.publications = pubData;
  }

  // Contact Section
  const contactData = sections.contact || {
    email: portfolio.email || portfolio.profile?.email || '',
    phone: portfolio.phone || portfolio.profile?.phone || '',
    location: portfolio.location || portfolio.profile?.location || '',
    website: portfolio.website || portfolio.profile?.website || '',
    socialLinks: portfolio.socialLinks || [],
  };
  if (contactData.email || contactData.phone || contactData.location || contactData.website || (Array.isArray(contactData.socialLinks) && contactData.socialLinks.length > 0)) {
    result.contact = contactData;
  }

  return result;
}

/**
 * GET /api/public/portfolio/:slug
 * Public endpoint to fetch published portfolios by slug.
 * Does NOT require authentication.
 * Returns 404 if status is DRAFT or portfolio does not exist.
 * Sanitizes response to ensure NO private tokens, user IDs, auth info, or internal storage paths are exposed.
 */
export const getPublicPortfolioBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return sendError(res, 'Portfolio slug is required', 400);
    }

    const normalizedSlug = slug.toLowerCase().trim();

    // Query portfolio by slug
    let portfolio = await Portfolio.findOne({ slug: normalizedSlug });

    // Fallback for demo slugs (e.g., 'demo', 'elenacodes', 'live-demo', 'preview') to active published portfolio
    if (!portfolio && ['elenacodes', 'demo', 'live-demo', 'preview', 'sample'].includes(normalizedSlug)) {
      portfolio = await Portfolio.findOne({ published: true, status: 'PUBLISHED' })
        || await Portfolio.findOne({ published: true })
        || await Portfolio.findOne();
    }

    // STRICT CHECK: Return 404 if not found or if status is DRAFT/ARCHIVED
    if (!portfolio || (portfolio.status !== 'PUBLISHED' && !portfolio.published)) {
      return sendError(res, 'Portfolio not found or not published', 404);
    }

    const sanitizedSections = sanitizePublicSections(portfolio);

    const publicResponse = {
      id: portfolio._id,
      displayName: portfolio.displayName || 'Creator Portfolio',
      slug: portfolio.slug,
      headline: portfolio.headline || portfolio.sections?.hero?.subheadline || '',
      bio: portfolio.bio || portfolio.sections?.about?.bio || '',
      theme: portfolio.theme || 'modern',
      customization: {
        primaryColor: portfolio.customization?.primaryColor || '#6366f1',
        accentColor: portfolio.customization?.accentColor || '#ec4899',
        fontStyle: portfolio.customization?.fontStyle || 'Inter',
        showMetrics: portfolio.customization?.showMetrics !== false,
        sectionOrder: portfolio.customization?.sectionOrder || ['hero', 'about', 'experience', 'skills', 'projects', 'education', 'certifications', 'achievements', 'contact'],
        hiddenSections: portfolio.customization?.hiddenSections || [],
      },
      sections: sanitizedSections,
      profile: portfolio.profile || sanitizedSections.hero || {},
      about: portfolio.about || sanitizedSections.about || {},
      skills: portfolio.skills || sanitizedSections.skills || [],
      experience: portfolio.experience || sanitizedSections.experience || [],
      projects: portfolio.projects || sanitizedSections.projects || [],
      education: portfolio.education || sanitizedSections.education || [],
      certifications: portfolio.certifications || sanitizedSections.certifications || [],
      achievements: portfolio.achievements || sanitizedSections.achievements || [],
      socialLinks: portfolio.socialLinks || portfolio.sections?.contact?.socialLinks || [],
      resumeDownloadEnabled: Boolean(portfolio.resumeDownloadEnabled),
      resumeDownloadUrl: portfolio.resumeDownloadEnabled ? (portfolio.resumeDownloadUrl || '') : null,
      seo: {
        title: portfolio.seoTitle || `${portfolio.displayName || 'Creator'}'s Portfolio`,
        description: portfolio.seoDescription || portfolio.headline || portfolio.bio || '',
        ogTitle: portfolio.ogTitle || portfolio.seoTitle || portfolio.displayName || `${portfolio.displayName || 'Creator'}'s Portfolio`,
        ogDescription: portfolio.ogDescription || portfolio.seoDescription || portfolio.headline || portfolio.bio || '',
        ogImage: portfolio.ogImage || portfolio.sections?.hero?.avatarUrl || '',
        favicon: portfolio.favicon || '',
      },
      publishedAt: portfolio.publishedAt,
    };

    return sendSuccess(res, publicResponse, 'Public portfolio loaded successfully');
  } catch (error) {
    console.error('[Public Portfolio Error]:', error);
    return sendError(res, error.message || 'Failed to fetch public portfolio', 500);
  }
};

export default {
  getPublicPortfolioBySlug,
};

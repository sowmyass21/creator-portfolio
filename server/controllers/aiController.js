import aiService from '../services/aiService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

/**
 * POST /api/ai/generate
 * Trigger AI content generation for all sections or a single section for the authenticated user
 */
export const generateContent = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required for AI content generation', 401);
    }
    const userId = req.user._id || req.user.id;
    const { section, aiIdea } = req.body;

    if (section) {
      const doc = await aiService.synthesizeSection(section, aiIdea, userId);
      return sendSuccess(res, doc, `Successfully generated content for section '${section}'`, 200);
    }

    const docs = await aiService.generateAllPortfolioContent(aiIdea, userId);
    return sendSuccess(res, docs, 'Successfully generated AI portfolio content across all sections', 200, {
      count: docs.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai/content
 * Get all draft & approved generated content sections for authenticated user
 */
export const getAllContent = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required to view generated content', 401);
    }
    const userId = req.user._id || req.user.id;
    const items = await aiService.getGeneratedContents(false, userId);
    return sendSuccess(res, items, 'Generated content sections fetched successfully', 200, {
      count: items.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/ai/content/approved
 * Route to get approved content sections for portfolio rendering
 */
export const getApprovedContent = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id) : (req.query.userId || null);
    if (!userId) {
      return sendSuccess(res, [], 'No user context provided for approved content', 200, { count: 0 });
    }
    const items = await aiService.getGeneratedContents(true, userId);
    return sendSuccess(res, items, 'Approved content sections retrieved', 200, {
      count: items.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/ai/content/:id
 * Edit content text or parameters manually with ownership check
 */
export const updateContent = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required to update content', 401);
    }
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { generatedContent, title, approved } = req.body;

    const updated = await aiService.updateContentSection(id, {
      ...(generatedContent !== undefined && { generatedContent }),
      ...(title !== undefined && { title }),
      ...(approved !== undefined && { approved })
    }, userId);

    return sendSuccess(res, updated, 'Content section updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/content/:id/approve
 * Toggle or set approval status for a section with ownership check
 */
export const toggleApproveContent = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required to toggle approval', 401);
    }
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { approved } = req.body;

    const updated = await aiService.toggleSectionApproval(id, approved, userId);
    return sendSuccess(res, updated, `Section approval updated to ${updated.approved}`, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/content/:id/regenerate
 * Regenerate content for a specific section
 */
export const regenerateSectionContent = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required to regenerate content', 401);
    }
    const userId = req.user._id || req.user.id;
    const { section, aiIdea } = req.body;
    const targetSection = section || req.params.id;

    if (!targetSection) {
      return sendError(res, 'Section name is required for regeneration', 400);
    }

    const doc = await aiService.synthesizeSection(targetSection, aiIdea, userId);
    return sendSuccess(res, doc, `Section '${targetSection}' regenerated successfully`, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/ai/content/publish
 * Publish all approved AI sections to live portfolio profile for authenticated user
 */
export const publishApprovedContent = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required to publish AI content', 401);
    }
    const userId = req.user._id || req.user.id;
    const approvedItems = await aiService.getGeneratedContents(true, userId);
    
    // Find headline and bio sections if present and update creator profile
    const headlineDoc = approvedItems.find(i => i.section === 'headline');
    const bioDoc = approvedItems.find(i => i.section === 'bio');

    const updateData = {};
    if (headlineDoc && typeof headlineDoc.generatedContent === 'string') {
      updateData.tagline = headlineDoc.generatedContent;
    }
    if (bioDoc && typeof bioDoc.generatedContent === 'string') {
      updateData.bio = bioDoc.generatedContent;
    }

    if (Object.keys(updateData).length > 0) {
      const { updateCreatorProfile } = await import('../services/profileService.js');
      await updateCreatorProfile(updateData, userId);
    }

    // Synchronize approved AI sections directly into Portfolio document
    try {
      const Portfolio = (await import('../models/Portfolio.js')).default;
      let portfolio = await Portfolio.findOne({ userId });

      if (portfolio && approvedItems.length > 0) {
        if (headlineDoc?.generatedContent && typeof headlineDoc.generatedContent === 'string') {
          portfolio.headline = headlineDoc.generatedContent;
        }
        if (bioDoc?.generatedContent && typeof bioDoc.generatedContent === 'string') {
          portfolio.bio = bioDoc.generatedContent;
        }

        const aboutDoc = approvedItems.find(i => i.section === 'about');
        if (aboutDoc?.generatedContent && typeof aboutDoc.generatedContent === 'string') {
          portfolio.about = { bio: aboutDoc.generatedContent };
        }

        const skillsDoc = approvedItems.find(i => i.section === 'skills_matrix');
        const projectsDoc = approvedItems.find(i => i.section === 'project_descriptions');
        const eduDoc = approvedItems.find(i => i.section === 'education_background');
        const expDoc = approvedItems.find(i => i.section === 'experience_internship');
        const certsDoc = approvedItems.find(i => i.section === 'certifications_credentials');
        const achieveDoc = approvedItems.find(i => i.section === 'achievements');

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
        portfolio.markModified('profile');
        portfolio.markModified('about');
        portfolio.markModified('skills');
        portfolio.markModified('projects');
        portfolio.markModified('education');
        portfolio.markModified('certifications');
        portfolio.markModified('achievements');
        portfolio.markModified('sections');

        await portfolio.save();
      }
    } catch (pErr) {
      console.warn('[publishApprovedContent] Portfolio sync note:', pErr.message);
    }

    return sendSuccess(res, {
      approvedCount: approvedItems.length,
      sections: approvedItems.map(i => i.section)
    }, 'Approved content published and synced to portfolio', 200);
  } catch (error) {
    next(error);
  }
};

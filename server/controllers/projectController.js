import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { 
  getCreatorProjects, getProjectBySlug, createProject, 
  updateProject, deleteProject, toggleFeatureProject 
} from '../services/projectService.js';

export const getProjects = async (req, res, next) => {
  try {
    const { category, featured } = req.query;
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const projects = await getCreatorProjects({ category, featured }, userId);

    return sendSuccess(
      res, 
      projects, 
      'Projects fetched successfully', 
      200, 
      { total: projects.length, categoryFilter: category || 'All' }
    );
  } catch (error) {
    next(error);
  }
};

export const getSingleProject = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user ? (req.user._id || req.user.id) : null;
    const project = await getProjectBySlug(slug, userId);

    if (!project) {
      return sendError(res, `Project with slug '${slug}' not found`, 404);
    }

    return sendSuccess(res, project, 'Project retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const createProjectHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required to create a project', 401);
    }
    const userId = req.user._id || req.user.id;
    const { title, description, summary, category, thumbnailUrl } = req.body;
    if (!title || !description || !summary || !category || !thumbnailUrl) {
      return sendError(res, 'title, summary, description, category, and thumbnailUrl are required', 400);
    }
    const created = await createProject(req.body, userId);
    return sendSuccess(res, created, 'Project created successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateProjectHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required to update a project', 401);
    }
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const updated = await updateProject(id, req.body, userId);
    if (!updated) {
      return sendError(res, 'Project not found or not owned by you', 404);
    }
    return sendSuccess(res, updated, 'Project updated successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const deleteProjectHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required to delete a project', 401);
    }
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const deleted = await deleteProject(id, userId);
    if (!deleted) {
      return sendError(res, 'Project not found or not owned by you', 404);
    }
    return sendSuccess(res, deleted, 'Project deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};

export const toggleFeatureHandler = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required to feature a project', 401);
    }
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { featured } = req.body;
    const updated = await toggleFeatureProject(id, featured, userId);
    if (!updated) {
      return sendError(res, 'Project not found or not owned by you', 404);
    }
    return sendSuccess(res, updated, `Project ${featured ? 'featured' : 'unfeatured'} successfully`, 200);
  } catch (error) {
    next(error);
  }
};

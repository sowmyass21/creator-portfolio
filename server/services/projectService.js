import Project from '../models/Project.js';
import { checkDbStatus } from './dbService.js';

export const getCreatorProjects = async (filters = {}, userId = null) => {
  const dbStatus = checkDbStatus();
  
  if (dbStatus.isConnected && userId) {
    try {
      const query = { userId };
      if (filters.category && filters.category !== 'All') {
        query.category = filters.category;
      }
      if (filters.featured === 'true' || filters.featured === true) {
        query.featured = true;
      }

      const projects = await Project.find(query).sort({ displayOrder: 1, createdAt: -1 }).select('-__v');
      return projects || [];
    } catch (err) {
      console.warn('[ProjectService] DB error finding user projects:', err.message);
      return [];
    }
  }

  return [];
};

export const getProjectBySlug = async (slug, userId = null) => {
  const dbStatus = checkDbStatus();

  if (dbStatus.isConnected) {
    try {
      const query = { slug: slug.toLowerCase() };
      if (userId) {
        query.userId = userId;
      }
      const project = await Project.findOne(query).select('-__v');
      return project;
    } catch (err) {
      console.warn('[ProjectService] DB error finding project by slug:', err.message);
      return null;
    }
  }

  return null;
};

export const createProject = async (projectData, userId) => {
  if (!userId) {
    throw new Error('Authentication required to create a project');
  }

  const dbStatus = checkDbStatus();
  
  const cleanTitle = (projectData.title || '').trim();
  let baseSlug = projectData.slug || cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  if (!baseSlug) baseSlug = `project-${Date.now()}`;

  if (dbStatus.isConnected) {
    try {
      // Ensure slug is unique for this user
      let candidateSlug = baseSlug;
      let counter = 1;
      while (await Project.findOne({ userId, slug: candidateSlug })) {
        candidateSlug = `${baseSlug}-${counter}`;
        counter++;
      }

      const newProj = new Project({
        ...projectData,
        userId,
        slug: candidateSlug,
        displayOrder: projectData.displayOrder || 0,
        publishedAt: projectData.publishedAt || new Date()
      });
      await newProj.save();
      return newProj;
    } catch (err) {
      console.error('[ProjectService] DB create error:', err.message);
      throw err;
    }
  }

  return {
    _id: `proj_${Date.now()}`,
    userId,
    ...projectData,
    slug: baseSlug,
    publishedAt: new Date()
  };
};

export const updateProject = async (id, projectData, userId) => {
  if (!userId) {
    throw new Error('Authentication required to update a project');
  }

  const dbStatus = checkDbStatus();

  if (dbStatus.isConnected) {
    try {
      const updated = await Project.findOneAndUpdate(
        { _id: id, userId },
        { $set: projectData },
        { new: true, runValidators: true }
      );
      return updated;
    } catch (err) {
      console.error('[ProjectService] DB update error:', err.message);
      throw err;
    }
  }

  return null;
};

export const deleteProject = async (id, userId) => {
  if (!userId) {
    throw new Error('Authentication required to delete a project');
  }

  const dbStatus = checkDbStatus();

  if (dbStatus.isConnected) {
    try {
      const deleted = await Project.findOneAndDelete({ _id: id, userId });
      return deleted;
    } catch (err) {
      console.error('[ProjectService] DB delete error:', err.message);
      throw err;
    }
  }

  return null;
};

export const toggleFeatureProject = async (id, featured, userId) => {
  return await updateProject(id, { featured }, userId);
};

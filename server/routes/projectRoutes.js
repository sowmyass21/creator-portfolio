import express from 'express';
import { 
  getProjects, getSingleProject, createProjectHandler, 
  updateProjectHandler, deleteProjectHandler, toggleFeatureHandler 
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/projects
 * @desc    Get all creator projects for authenticated user
 * @access  Private (Authenticated)
 */
router.get('/', authenticate, getProjects);

/**
 * @route   GET /api/projects/:slug
 * @desc    Get single project details by slug
 * @access  Public
 */
router.get('/:slug', getSingleProject);

/**
 * @route   POST /api/projects
 * @desc    Create a new portfolio project
 * @access  Private (Authenticated)
 */
router.post('/', authenticate, createProjectHandler);

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project details
 * @access  Private (Authenticated)
 */
router.put('/:id', authenticate, updateProjectHandler);

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete project
 * @access  Private (Authenticated)
 */
router.delete('/:id', authenticate, deleteProjectHandler);

/**
 * @route   PATCH /api/projects/:id/feature
 * @desc    Feature or unfeature project
 * @access  Private (Authenticated)
 */
router.patch('/:id/feature', authenticate, toggleFeatureHandler);

export default router;


import express from 'express';
import healthRoutes from './healthRoutes.js';
import profileRoutes from './profileRoutes.js';
import projectRoutes from './projectRoutes.js';
import metricRoutes from './metricRoutes.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import integrationRoutes from './integrationRoutes.js';
import socialRoutes from './socialRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import syncRoutes from './syncRoutes.js';
import aiRoutes from './aiRoutes.js';
import resumeRoutes from './resumeRoutes.js';
import portfolioRoutes from './portfolioRoutes.js';
import publicRoutes from './publicRoutes.js';
import creatorProfileRoutes from './creatorProfileRoutes.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/projects', projectRoutes);
router.use('/metrics', metricRoutes);
router.use('/admin', adminRoutes);
router.use('/integrations', integrationRoutes);
router.use('/social', socialRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/sync', syncRoutes);
router.use('/ai', aiRoutes);
router.use('/resume', resumeRoutes);
router.use('/portfolio', portfolioRoutes);
router.use('/public', publicRoutes);
router.use('/creator-profile', creatorProfileRoutes);

export default router;

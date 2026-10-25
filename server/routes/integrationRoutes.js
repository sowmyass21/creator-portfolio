import express from 'express';
import { 
  getGitHubMetrics, 
  getYouTubeMetrics,
  getInstagramMetrics,
  getLinkedInMetrics,
  getLeetCodeMetrics,
  getCodeChefMetrics
} from '../controllers/integrationController.js';

const router = express.Router();

/**
 * @route   GET /api/integrations/github
 * @desc    Fetch normalized GitHub user profile, repos, stars, languages & metrics
 * @access  Public
 */
router.get('/github', getGitHubMetrics);

/**
 * @route   GET /api/integrations/youtube
 * @desc    Fetch normalized YouTube channel statistics, subscribers, views & latest videos
 * @access  Public
 */
router.get('/youtube', getYouTubeMetrics);

/**
 * @route   GET /api/integrations/instagram
 * @desc    Fetch normalized Instagram profile, followers, posts & recent content
 * @access  Public
 */
router.get('/instagram', getInstagramMetrics);

/**
 * @route   GET /api/integrations/linkedin
 * @desc    Fetch normalized LinkedIn profile, followers, connections, impressions & recent posts
 * @access  Public
 */
router.get('/linkedin', getLinkedInMetrics);

/**
 * @route   GET /api/integrations/leetcode
 * @desc    Fetch normalized LeetCode questions solved, difficulty breakdown, ranking & submissions
 * @access  Public
 */
router.get('/leetcode', getLeetCodeMetrics);

/**
 * @route   GET /api/integrations/codechef
 * @desc    Fetch normalized CodeChef stars, rating, problems solved, rank & division
 * @access  Public
 */
router.get('/codechef', getCodeChefMetrics);

export default router;

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor to attach Bearer token and handle FormData Content-Type correctly
apiClient.interceptors.request.use(
  (config) => {
    // If payload is FormData, remove application/json so browser sets multipart/form-data boundary
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      if (config.headers.common) {
        delete config.headers.common['Content-Type'];
      }
    }
    const token = typeof window !== 'undefined' 
      ? (localStorage.getItem('token') || sessionStorage.getItem('token'))
      : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg = error.response?.data?.message || error.message || 'Network request failed';
    const err = new Error(errorMsg);
    err.status = error.response?.status;
    err.response = error.response;
    err.data = error.response?.data;
    return Promise.reject(err);
  }
);

export const apiService = {
  // Health
  getHealth: () => apiClient.get('/health'),

  // Auth
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),

  // Profile & Portfolio
  getProfile: () => apiClient.get('/profile'),
  updateProfile: (data) => apiClient.put('/profile', data),
  getProjects: (params) => apiClient.get('/projects', { params }),
  getProjectBySlug: (slug) => apiClient.get(`/projects/${slug}`),
  createProject: (data) => apiClient.post('/projects', data),
  updateProject: (id, data) => apiClient.put(`/projects/${id}`, data),
  deleteProject: (id) => apiClient.delete(`/projects/${id}`),
  toggleFeatureProject: (id, featured) => apiClient.patch(`/projects/${id}/feature`, { featured }),
  getMetrics: (platform) => apiClient.get('/metrics', { params: { platform } }),

  // Universal Social API
  getUniversalSocial: (refresh = false) => apiClient.get('/social', { params: { refresh } }),
  getSocialPlatforms: () => apiClient.get('/social/platforms'),
  upsertSocialPlatform: (data) => apiClient.post('/social/platforms', data),
  deleteSocialPlatform: (platform) => apiClient.delete(`/social/platforms/${platform}`),
  getOAuthAuthorizeUrl: (platform) => apiClient.get(`/social/oauth/${platform}/authorize`),

  // Platform Integrations
  getGitHubMetrics: (username, forceRefresh = false) => 
    apiClient.get('/integrations/github', { params: { username, forceRefresh } }),

  getYouTubeMetrics: (channelId, forceRefresh = false) => 
    apiClient.get('/integrations/youtube', { params: { channelId, forceRefresh } }),

  getInstagramMetrics: (username, forceRefresh = false) => 
    apiClient.get('/integrations/instagram', { params: { username, forceRefresh } }),

  getLinkedInMetrics: (username, forceRefresh = false) => 
    apiClient.get('/integrations/linkedin', { params: { username, forceRefresh } }),

  getLeetCodeMetrics: (username, forceRefresh = false) => 
    apiClient.get('/integrations/leetcode', { params: { username, forceRefresh } }),

  getCodeChefMetrics: (username, forceRefresh = false) => 
    apiClient.get('/integrations/codechef', { params: { username, forceRefresh } }),

  // Dynamic Analytics
  getAnalyticsOverview: () => apiClient.get('/analytics/overview'),
  getAnalyticsHistory: (range = '30d', platform = null) => 
    apiClient.get('/analytics/history', { params: { range, platform } }),
  getPlatformAnalytics: (platform) => apiClient.get(`/analytics/platform/${platform}`),

  // Automated Sync System (Phase 7)
  triggerManualSync: () => apiClient.post('/sync'),
  getSyncStatus: () => apiClient.get('/sync/status'),

  // AI Content Generator (Phase 8)
  getAiContent: () => apiClient.get('/ai/content'),
  getApprovedAiContent: () => apiClient.get('/ai/content/approved'),
  generateAiContent: (data) => apiClient.post('/ai/generate', data),
  updateAiContent: (id, data) => apiClient.put(`/ai/content/${id}`, data),
  toggleApproveAiContent: (id, approved) => apiClient.post(`/ai/content/${id}/approve`, { approved }),
  regenerateAiSection: (id, section, aiIdea) => apiClient.post(`/ai/content/${id}/regenerate`, { section, aiIdea }),
  publishAiContent: () => apiClient.post('/ai/content/publish'),

  // Admin & Dashboard
  getAdminOverview: () => apiClient.get('/admin/overview'),
  triggerSync: () => apiClient.post('/admin/sync'),

  // AI Resume → Dynamic Portfolio Builder
  uploadResume: (data) => {
    const token = typeof window !== 'undefined'
      ? (localStorage.getItem('token') || sessionStorage.getItem('token'))
      : null;
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      headers['x-auth-token'] = token;
    }
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      delete headers['Content-Type'];
      return apiClient.post('/resume/upload', data, { 
        headers: {
          ...headers,
          'Content-Type': undefined
        },
        timeout: 120000 
      });
    }
    return apiClient.post('/resume/upload', data, { 
      headers,
      timeout: 120000 
    });
  },
  getResumeById: (id) => apiClient.get(`/resume/${id}`),
  getResumeStatusById: (id) => apiClient.get(`/resume/${id}/status`),
  getResumeData: (id) => apiClient.get(`/resume/${id || 'active'}/data`),
  updateResumeData: (id, structuredData) => apiClient.put(`/resume/${id || 'active'}/data`, { structuredData }),
  deleteResumeById: (id) => apiClient.delete(`/resume/${id}`),
  getResumeStatus: () => apiClient.get('/resume/status'),
  getResumeVersions: () => apiClient.get('/resume/versions'),
  getResumeVersionById: (versionId) => apiClient.get(`/resume/versions/${versionId}`),
  applyResumeVersion: (versionId) => apiClient.post(`/resume/versions/${versionId}/apply`),
  keepExistingResumeVersion: (versionId) => apiClient.post(`/resume/versions/${versionId}/keep-existing`),
  getResumeProfile: (resumeId) => {
    const endpoint = (resumeId && resumeId !== 'profile') ? `/resume/${resumeId}/profile` : '/resume/profile';
    return apiClient.get(endpoint);
  },
  updateResumeProfile: (resumeId, profileData) => {
    const endpoint = (resumeId && resumeId !== 'profile') ? `/resume/${resumeId}/profile` : '/resume/profile';
    return apiClient.put(endpoint, { profileData });
  },
  getParsedResume: () => apiClient.get('/resume/parsed'),
  updateParsedResume: (data) => apiClient.put('/resume/parsed', { parsedData: data }),
  getPortfolioBuilder: () => apiClient.get('/portfolio'),
  generatePortfolio: (theme = 'modern-minimal') => apiClient.post('/portfolio/generate', { theme }),
  updatePortfolioCustomize: (data) => apiClient.put('/portfolio/customize', data),
  publishPortfolio: (customSlug) => apiClient.post('/portfolio/publish', { customSlug }),
  publishPortfolioById: (id, customSlug) => apiClient.post(`/portfolio/${id}/publish`, { customSlug }),
  unpublishPortfolio: () => apiClient.post('/portfolio/unpublish'),
  unpublishPortfolioById: (id) => apiClient.post(`/portfolio/${id}/unpublish`),
  validateSlug: (slug, portfolioId) => apiClient.post('/portfolio/validate-slug', { slug, portfolioId }),
  enhancePortfolioContent: (profileData) => apiClient.post('/portfolio/enhance-content', { profileData }),
  acceptEnhancedContent: (section, content) => apiClient.post('/portfolio/accept-enhancement', { section, content }),
  getPublicPortfolio: (slug) => apiClient.get(`/public/portfolio/${slug}`),

  // Resume Grounding Validation
  getPortfolioGroundingReport: (resumeId) =>
    apiClient.get(`/resume/${resumeId || 'status'}/grounding-report`),

  // Unified Creator Profile & Live Social Metrics (Phase 19)
  getCreatorProfile: () => apiClient.get('/creator-profile'),
  confirmSocialProfile: (data) => apiClient.post('/creator-profile/confirm-social', data),
  syncCreatorProfileMetrics: () => apiClient.post('/creator-profile/sync'),
};

export default apiService;

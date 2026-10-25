import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';

// Route Protection wrappers
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';

// Lazy-loaded Public Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PortfolioViewPage = lazy(() => import('./pages/PortfolioViewPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Lazy-loaded Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Lazy-loaded Dashboard Layout & Sub-pages
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const DashboardProfile = lazy(() => import('./pages/dashboard/DashboardProfile'));
const DashboardProjects = lazy(() => import('./pages/dashboard/DashboardProjects'));
const DashboardPlatforms = lazy(() => import('./pages/dashboard/DashboardPlatforms'));
const DashboardAnalytics = lazy(() => import('./pages/dashboard/DashboardAnalytics'));
const DashboardContent = lazy(() => import('./pages/dashboard/DashboardContent'));
const DashboardSettings = lazy(() => import('./pages/dashboard/DashboardSettings'));

// Lazy-loaded AI Resume Portfolio Builder Module Pages
const PortfolioDashboard = lazy(() => import('./pages/portfolio/PortfolioDashboard'));
const ResumeUpload = lazy(() => import('./pages/portfolio/ResumeUpload'));
const ResumeReview = lazy(() => import('./pages/portfolio/ResumeReview'));
const PortfolioProfile = lazy(() => import('./pages/portfolio/PortfolioProfile'));
const PortfolioCustomize = lazy(() => import('./pages/portfolio/PortfolioCustomize'));
const PortfolioPreviewPage = lazy(() => import('./pages/portfolio/PortfolioPreview'));
const PortfolioPublish = lazy(() => import('./pages/portfolio/PortfolioPublish'));

const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#090d16] text-slate-400 font-mono text-xs gap-3">
    <div className="w-8 h-8 border-3 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin"></div>
    <span>Loading CreatorPulse...</span>
  </div>
);

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PortfolioProvider>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Marketing Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Auth Routes (Public Only) */}
                <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
                <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
                <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPasswordPage /></PublicOnlyRoute>} />
                <Route path="/reset-password" element={<PublicOnlyRoute><ResetPasswordPage /></PublicOnlyRoute>} />

                {/* Protected AI Resume Portfolio Builder Module Routes */}
                <Route path="/portfolio" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<PortfolioDashboard />} />
                  <Route path="upload" element={<ResumeUpload />} />
                  <Route path="review" element={<ResumeReview />} />
                  <Route path="profile" element={<PortfolioProfile />} />
                  <Route path="customize" element={<PortfolioCustomize />} />
                  <Route path="preview" element={<PortfolioPreviewPage />} />
                  <Route path="publish" element={<PortfolioPublish />} />
                </Route>

                {/* Public Creator Portfolio Views (NO Auth required) */}
                <Route path="/p/:slug" element={<PortfolioViewPage />} />
                <Route path="/portfolio/:slug" element={<PortfolioViewPage />} />

                {/* Protected Dashboard Routes */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route index element={<DashboardHome />} />
                  <Route path="resume" element={<ResumeUpload />} />
                  <Route path="resume/review" element={<ResumeReview />} />
                  <Route path="portfolio/preview" element={<PortfolioPreviewPage />} />
                  <Route path="profile" element={<DashboardProfile />} />
                  <Route path="projects" element={<DashboardProjects />} />
                  <Route path="platforms" element={<DashboardPlatforms />} />
                  <Route path="analytics" element={<DashboardAnalytics />} />
                  <Route path="content" element={<DashboardContent />} />
                  <Route path="settings" element={<DashboardSettings />} />
                </Route>

                {/* 404 Handler */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </Router>
        </PortfolioProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import LivePortfolioPreview from '../../components/portfolio/LivePortfolioPreview';
import PublishSuccessModal from '../../components/portfolio/PublishSuccessModal';
import { compileResumeAndAiPortfolio } from '../../utils/portfolioCompiler';
import { 
  FileText, Upload, Pencil, Palette, Eye, Globe, 
  ArrowRight, CheckCircle2, Clock, Copy, Check, ExternalLink, 
  BarChart3, AlertCircle, Sparkles, ChevronRight, Layers, Cpu,
  Sun, Moon, Send
} from 'lucide-react';

export const PortfolioDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [portfolioData, setPortfolioData] = useState(null);
  const [resumeStatus, setResumeStatus] = useState(null);
  const [resumeProfile, setResumeProfile] = useState(null);
  const [aiSections, setAiSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [previewColorMode, setPreviewColorMode] = useState('dark');
  const [publishing, setPublishing] = useState(false);

  // Live Demo Popup Modal on Publish
  const [publishModal, setPublishModal] = useState({
    isOpen: false,
    liveDemoUrl: '',
    slug: 'portfolio'
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      const [portfolioRes, statusRes, profileRes, aiRes, resumeDataRes, parsedRes] = await Promise.all([
        apiService.getPortfolioBuilder().catch(() => null),
        apiService.getResumeStatus().catch(() => null),
        apiService.getResumeProfile().catch(() => null),
        apiService.getAiContent().catch(() => null),
        apiService.getResumeData('active').catch(() => null),
        apiService.getParsedResume().catch(() => null),
      ]);

      if (portfolioRes?.data) setPortfolioData(portfolioRes.data);
      if (statusRes?.data) setResumeStatus(statusRes.data);

      const mergedProfile = {
        ...(profileRes?.data || {}),
        profileData: profileRes?.data?.profileData || resumeDataRes?.data?.structuredData || resumeDataRes?.data || profileRes?.data?.parsedData || parsedRes?.data?.parsedData,
        structuredData: resumeDataRes?.data?.structuredData || resumeDataRes?.data || profileRes?.data?.profileData || parsedRes?.data?.parsedData,
      };
      setResumeProfile(mergedProfile);

      if (aiRes?.data) setAiSections(aiRes.data);
    } catch (err) {
      console.error('[PortfolioDashboard] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPortfolioData(null);
    setResumeStatus(null);
    setResumeProfile(null);
    setAiSections([]);
    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user?._id || user?.id, fetchDashboardData]);

  // Compiled portfolio grounded on resume data + AI generator enhancements
  const compiledPortfolio = useMemo(() => {
    return compileResumeAndAiPortfolio(portfolioData || {}, resumeProfile || {}, aiSections, previewColorMode);
  }, [portfolioData, resumeProfile, aiSections, previewColorMode]);

  // Profile Completeness Calculation
  const calculateCompleteness = () => {
    const sections = compiledPortfolio?.sections || portfolioData?.sections || {};
    const personal = resumeProfile?.profileData?.personal_information || {};
    const contact = sections.contact || {};
    const socialLinks = portfolioData?.socialLinks || contact.socialLinks || [];

    let score = 0;
    const missing = [];

    // 1. Basic Profile Info (15%)
    if (personal.full_name || compiledPortfolio?.displayName) {
      score += 15;
    } else {
      missing.push('Full Name & Basic Info');
    }

    // 2. Headline & Bio (15%)
    if (compiledPortfolio?.headline || sections.hero?.headline || compiledPortfolio?.bio || sections.about?.bio) {
      score += 15;
    } else {
      missing.push('Professional Headline & Bio');
    }

    // 3. Work Experience (15%)
    if (Array.isArray(sections.experience) && sections.experience.length > 0) {
      score += 15;
    } else {
      missing.push('Work Experience');
    }

    // 4. Education (15%)
    if (Array.isArray(sections.education) && sections.education.length > 0) {
      score += 15;
    } else {
      missing.push('Education');
    }

    // 5. Projects (15%)
    if (Array.isArray(sections.projects) && sections.projects.length > 0) {
      score += 15;
    } else {
      missing.push('Projects');
    }

    // 6. Skills (10%)
    if (Array.isArray(sections.skills) && sections.skills.length > 0) {
      score += 10;
    } else {
      missing.push('Skills');
    }

    // 7. GitHub URL / Social Links (10%)
    const hasGithub = (socialLinks || []).some(s => 
      s.platform?.toLowerCase().includes('github') || s.url?.toLowerCase().includes('github.com')
    ) || Boolean(personal.github);

    if (hasGithub) {
      score += 10;
    } else {
      missing.push('GitHub URL');
    }

    // 8. Certifications (5%)
    if (Array.isArray(sections.certifications) && sections.certifications.length > 0) {
      score += 5;
    } else {
      missing.push('Certifications');
    }

    return { score, missing };
  };

  const completeness = calculateCompleteness();

  const isPublished = Boolean(portfolioData?.published || portfolioData?.status === 'PUBLISHED' || portfolioData?.meta?.isPublished);
  const currentSlug = compiledPortfolio?.slug || portfolioData?.slug || user?.slug || user?.username || profile?.handle?.replace('@', '') || 'portfolio';
  const publicUrl = `${window.location.origin}/p/${currentSlug}`;
  const activeTheme = portfolioData?.theme || 'modern';
  const lastUpdated = portfolioData?.updatedAt ? new Date(portfolioData.updatedAt).toLocaleString() : 'Just now';

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Publish button handler that publishes portfolio and pops up live demo URL
  const handlePublish = async () => {
    setPublishing(true);
    try {
      const portId = portfolioData?._id || portfolioData?.id || 'publish';
      const targetSlug = currentSlug;

      let res = null;
      try {
        res = await apiService.publishPortfolioById(portId, targetSlug);
      } catch (err) {
        res = await apiService.publishPortfolio(targetSlug);
      }

      // Also ensure any approved AI content is synced
      try {
        await apiService.publishAiContent();
      } catch (aiErr) {
        console.warn('AI Content publish sync note:', aiErr.message);
      }

      const finalSlug = res?.data?.slug || targetSlug;
      const demoUrl = res?.data?.liveDemoUrl || res?.data?.publishedUrl || `${window.location.origin}/p/${finalSlug}`;

      // Open Live Demo URL Modal
      setPublishModal({
        isOpen: true,
        liveDemoUrl: demoUrl,
        slug: finalSlug
      });

      await fetchDashboardData();
    } catch (err) {
      console.error('[PortfolioDashboard] Publish failed:', err);
    } finally {
      setPublishing(false);
    }
  };

  // Visual Step Workflow Pipeline Definitions
  const workflowSteps = [
    { id: 'upload', label: 'Resume', desc: 'Upload PDF/DOCX', icon: Upload, path: '/portfolio/upload' },
    { id: 'extract', label: 'Extract', desc: 'Text parsing', icon: Cpu, path: '/portfolio/upload' },
    { id: 'review', label: 'Review', desc: 'Edit profile data', icon: Pencil, path: '/portfolio/profile' },
    { id: 'customize', label: 'Customize', desc: 'Themes & styling', icon: Palette, path: '/portfolio/customize' },
    { id: 'preview', label: 'Preview', desc: 'Desktop, Tablet, Mobile', icon: Eye, path: '/portfolio/preview' },
    { id: 'publish', label: 'Publish', desc: 'Issue public URL', icon: Globe, path: '/portfolio/publish' },
  ];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin"></div>
        <div className="text-xs font-mono text-slate-400">Loading AI Resume Portfolio...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {/* Live Demo Popup Modal on Publish */}
      <PublishSuccessModal
        isOpen={publishModal.isOpen}
        onClose={() => setPublishModal(prev => ({ ...prev, isOpen: false }))}
        liveDemoUrl={publishModal.liveDemoUrl}
        slug={publishModal.slug}
      />

      {/* HERO DASHBOARD BANNER & MAIN ACTIONS */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-brand-indigo/10 via-brand-purple/10 to-transparent relative overflow-hidden shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-brand-purple/10 border border-brand-purple/20 text-brand-purple">
              <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
              <span>AI RESUME → DYNAMIC PORTFOLIO CONTROL CENTER</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              AI Resume Portfolio
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Transform your resume into a live, interactive creator portfolio based on your verified credentials and enhanced with AI generator highlights.
            </p>
          </div>

          {/* MAIN ACTIONS BAR */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <Link
              to="/portfolio/upload"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold hover:scale-[1.02] transition-all shadow-md flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Resume</span>
            </Link>

            <Link
              to="/portfolio/profile"
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-purple text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-all"
            >
              <Pencil className="w-4 h-4 text-brand-purple" />
              <span>Edit Profile</span>
            </Link>

            <Link
              to="/portfolio/customize"
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-brand-purple text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 transition-all"
            >
              <Palette className="w-4 h-4 text-brand-pink" />
              <span>Customize</span>
            </Link>

            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-pink text-white text-xs font-bold hover:scale-[1.02] transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <Globe className={`w-4 h-4 ${publishing ? 'animate-spin' : ''}`} />
              <span>{publishing ? 'Publishing...' : 'Publish Live'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* VISUAL WORKFLOW PIPELINE: Resume ↓ Extract ↓ Review ↓ Customize ↓ Preview ↓ Publish */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-purple" />
              Visual Builder Workflow Pipeline
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              End-to-end flow from resume parsing to live portfolio deployment
            </p>
          </div>
        </div>

        {/* WORKFLOW PIPELINE GRID */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {workflowSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="relative flex flex-col">
                <Link
                  to={step.path}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-brand-purple hover:bg-brand-purple/5 transition-all flex flex-col items-center text-center space-y-2 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-brand-purple/10 text-brand-purple flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-brand-purple transition-colors">
                      {step.label}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                      {step.desc}
                    </div>
                  </div>
                </Link>

                {idx < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-400 dark:text-slate-600">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CENTERPIECE: LIVE INTERACTIVE DYNAMIC PORTFOLIO PREVIEW */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-purple animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Live Interactive Dynamic Portfolio
              </h2>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                RESUME + AI GROUNDED
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive preview directly compiling your resume data and AI generator enhancements.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Color Mode Toggle */}
            <button
              onClick={() => setPreviewColorMode(prev => prev === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-950 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
              title="Toggle Light / Dark Mode"
            >
              {previewColorMode === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] text-slate-200">Dark Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-brand-purple" />
                  <span className="text-[11px] text-slate-200">Light Mode</span>
                </>
              )}
            </button>

            {/* Direct Publish Button */}
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:scale-[1.02] transition-transform"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{publishing ? 'Publishing...' : 'Publish'}</span>
            </button>

            {/* External Public Link */}
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Open public portfolio"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Live Interactive Preview Component */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl bg-slate-950/20">
          <LivePortfolioPreview
            portfolio={compiledPortfolio}
            colorMode={previewColorMode}
            onColorModeChange={setPreviewColorMode}
          />
        </div>
      </div>

      {/* DASHBOARD OVERVIEW METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* 1. PORTFOLIO STATUS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">Portfolio Status</span>
            <div className="flex items-center gap-3 pt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase flex items-center gap-1.5 ${
                isPublished 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isPublished ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                {isPublished ? 'PUBLISHED' : 'DRAFT'}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isPublished 
              ? 'Your portfolio is live and publicly accessible via your unique handle' 
              : 'Portfolio is in draft mode. Click Publish when ready to deploy.'}
          </p>
          <button
            onClick={handlePublish}
            className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1 pt-2"
          >
            <span>Publish Live Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. RESUME SOURCE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-brand-purple" />
              Resume Source
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate pt-1">
              {resumeStatus?.filename || 'No resume uploaded yet'}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Parsing Status:</span>
            <span className="font-mono text-emerald-400 font-bold uppercase">
              {resumeStatus?.status || 'COMPLETED'}
            </span>
          </div>
          <Link
            to="/portfolio/upload"
            className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1 pt-2"
          >
            <span>Upload New Resume</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3. LAST UPDATED */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-pink" />
              Last Updated
            </span>
            <div className="text-sm font-mono font-bold text-slate-900 dark:text-white pt-1">
              {lastUpdated}
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automatically synchronized with backend database edits
          </p>
          <Link
            to="/portfolio/profile"
            className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1 pt-2"
          >
            <span>Edit Profile Data</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4. CURRENT THEME */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-brand-purple" />
              Current Theme
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white capitalize pt-1 flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-brand-purple/10 border border-brand-purple/20 text-brand-purple font-mono uppercase text-xs">
                {activeTheme}
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            8 Templates: Simple, Minimal, Modern, Developer, Creative, Executive, Cyberpunk, Elegance
          </p>
          <Link
            to="/portfolio/customize"
            className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1 pt-2"
          >
            <span>Switch Theme Options</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 5. PUBLIC URL */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-purple" />
              Public Web URL
            </span>
            <div className="text-xs font-mono font-bold text-brand-purple truncate pt-1">
              /p/{currentSlug}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {isPublished && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-brand-purple text-white text-xs font-bold flex items-center gap-1 shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visit</span>
              </a>
            )}
          </div>
        </div>

        {/* 6. PROFILE COMPLETENESS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Profile Completeness
              </span>
              <span className="text-sm font-extrabold font-mono text-brand-purple">
                {completeness.score}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-pink transition-all duration-500"
                style={{ width: `${completeness.score}%` }}
              ></div>
            </div>
          </div>

          {completeness.missing.length > 0 ? (
            <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Missing sections:</span>
              <ul className="space-y-0.5 font-mono text-[11px] text-amber-400">
                {completeness.missing.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1">
                    <span>- {item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All recommended sections complete!</span>
            </div>
          )}

          <Link
            to="/portfolio/profile"
            className="text-xs font-bold text-brand-purple hover:underline flex items-center gap-1 pt-1"
          >
            <span>Complete Profile Sections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 7. PORTFOLIO ANALYTICS */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 flex flex-col justify-between col-span-1 md:col-span-2 lg:col-span-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Portfolio Analytics & Viewer Insights</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track unique visitors, referrer traffic, and project click rates on your public portfolio.
                </p>
              </div>
            </div>

            <span className="px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 shrink-0">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Analytics coming soon</span>
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PortfolioDashboard;

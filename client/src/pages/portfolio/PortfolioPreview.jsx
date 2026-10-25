import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import LivePortfolioPreview from '../../components/portfolio/LivePortfolioPreview';
import PublishSuccessModal from '../../components/portfolio/PublishSuccessModal';
import { compileResumeAndAiPortfolio } from '../../utils/portfolioCompiler';
import { 
  Eye, Monitor, Tablet, Smartphone, Pencil, 
  Globe, RefreshCw, Sparkles, CheckCircle2, Save, EyeOff, AlertCircle, RotateCcw,
  Sun, Moon, ExternalLink, Layers, Feather, Layout, Terminal, Zap, Shield, Award
} from 'lucide-react';

const THEME_OPTIONS = [
  { id: 'simple', name: '1. Classic Simple', badge: 'Resume Clean', icon: Feather },
  { id: 'minimal', name: '2. Minimalist', badge: 'Monochrome', icon: Layout },
  { id: 'modern', name: '3. Modern Studio', badge: 'Popular', icon: Sparkles },
  { id: 'developer', name: '4. Developer Terminal', badge: 'Code First', icon: Terminal },
  { id: 'creative', name: '5. Creative Showcase', badge: 'Showcase', icon: Zap },
  { id: 'executive', name: '6. Executive Leadership', badge: 'Leadership', icon: Shield },
  { id: 'cyberpunk', name: '7. Cyberpunk Neon', badge: 'High Tech', icon: Zap },
  { id: 'elegance', name: '8. Luxury Elegance', badge: 'Premium', icon: Award },
];

export const PortfolioPreviewPage = () => {
  const navigate = useNavigate();
  const [portfolioData, setPortfolioData] = useState(null);
  const [resumeProfile, setResumeProfile] = useState(null);
  const [aiSections, setAiSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'
  const [actionMessage, setActionMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [colorMode, setColorMode] = useState('dark');
  const [selectedTheme, setSelectedTheme] = useState(null);

  // Live Demo Popup Modal on Publish
  const [publishModal, setPublishModal] = useState({
    isOpen: false,
    liveDemoUrl: '',
    slug: 'shahukarisowmya'
  });

  const fetchPortfolioData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [portRes, profRes, aiRes, resumeDataRes, parsedRes] = await Promise.all([
        apiService.getPortfolioBuilder().catch(() => null),
        apiService.getResumeProfile().catch(() => null),
        apiService.getAiContent().catch(() => null),
        apiService.getResumeData('active').catch(() => null),
        apiService.getParsedResume().catch(() => null),
      ]);

      if (portRes?.data && (portRes.data._id || portRes.data.id || Object.keys(portRes.data).length > 0)) {
        setPortfolioData(portRes.data);
        if (portRes.data.theme || portRes.data.meta?.theme) {
          setSelectedTheme(portRes.data.theme || portRes.data.meta?.theme);
        }
      } else {
        setPortfolioData(null);
      }

      const mergedProfile = {
        ...(profRes?.data || {}),
        profileData: profRes?.data?.profileData || resumeDataRes?.data?.structuredData || resumeDataRes?.data || profRes?.data?.parsedData || parsedRes?.data?.parsedData,
        structuredData: resumeDataRes?.data?.structuredData || resumeDataRes?.data || profRes?.data?.profileData || parsedRes?.data?.parsedData,
      };
      setResumeProfile(mergedProfile);

      if (aiRes?.data) setAiSections(aiRes.data);
    } catch (err) {
      console.error('[PortfolioPreview] Failed to fetch portfolio:', err);
      if (err.status === 404 || err.response?.status === 404) {
        setPortfolioData(null);
      } else {
        setError('Unable to load portfolio');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolioData();
  }, [fetchPortfolioData]);

  // Compiled portfolio grounded on resume data + AI generator enhancements
  const compiledPortfolio = useMemo(() => {
    const raw = compileResumeAndAiPortfolio(portfolioData || {}, resumeProfile || {}, aiSections, colorMode);
    if (selectedTheme && raw) {
      return {
        ...raw,
        theme: selectedTheme,
        customization: {
          ...(raw.customization || {}),
          theme: selectedTheme,
        },
      };
    }
    return raw;
  }, [portfolioData, resumeProfile, aiSections, colorMode, selectedTheme]);

  // Generate / Regenerate Portfolio dynamically from resume data
  const handleGeneratePortfolio = async () => {
    setIsProcessing(true);
    setActionMessage(null);
    setError(null);
    try {
      const res = await apiService.generatePortfolio();
      if (res?.data) {
        setPortfolioData(res.data);
        if (res.data.theme) setSelectedTheme(res.data.theme);
        setActionMessage('Portfolio dynamically generated from resume data!');
        setTimeout(() => setActionMessage(null), 3500);
      }
    } catch (err) {
      console.error('[PortfolioPreview] Generation error:', err);
      navigate('/dashboard/resume/upload');
    } finally {
      setIsProcessing(false);
    }
  };

  // Save Portfolio Customizations / State
  const handleSave = async () => {
    if (!compiledPortfolio) return;
    setIsProcessing(true);
    setActionMessage(null);
    try {
      const targetTheme = selectedTheme || compiledPortfolio.theme || 'modern';
      const payload = {
        ...compiledPortfolio,
        theme: targetTheme,
        customization: {
          ...(compiledPortfolio.customization || {}),
          theme: targetTheme,
        },
        meta: {
          ...(compiledPortfolio.meta || {}),
          theme: targetTheme,
        },
      };
      await apiService.updatePortfolioCustomize(payload);
      setActionMessage('Portfolio template and changes saved successfully!');
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err) {
      setActionMessage(`Save error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Publish Portfolio and immediately display Live Demo URL
  const handlePublish = async () => {
    setIsProcessing(true);
    setActionMessage(null);
    try {
      const portId = portfolioData?.id || portfolioData?._id || 'publish';
      const targetSlug = compiledPortfolio?.slug || portfolioData?.slug || 'shahukarisowmya';

      let res = null;
      try {
        res = await apiService.publishPortfolioById(portId, targetSlug);
      } catch (err) {
        res = await apiService.publishPortfolio(targetSlug);
      }

      // Also ensure approved AI content is synced
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

      await fetchPortfolioData();
      setActionMessage(`Published live! Access at: ${demoUrl}`);
    } catch (err) {
      setActionMessage(`Publish error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Unpublish Portfolio
  const handleUnpublish = async () => {
    if (!portfolioData) return;
    setIsProcessing(true);
    setActionMessage(null);
    try {
      const portId = portfolioData.id || portfolioData._id || 'unpublish';
      await apiService.unpublishPortfolioById(portId);
      await fetchPortfolioData();
      setActionMessage('Portfolio unpublished and switched to private draft.');
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err) {
      setActionMessage(`Unpublish error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 1. Loading state
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin"></div>
        <div className="text-xs font-mono text-slate-400">Loading portfolio preview...</div>
      </div>
    );
  }

  // 2. API Error state
  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h2 className="text-lg font-bold text-white">Unable to load portfolio</h2>
          <p className="text-xs text-slate-400">
            An unexpected error occurred while communicating with the server.
          </p>
        </div>
        <button
          onClick={fetchPortfolioData}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // 3. Success state
  const activeTheme = selectedTheme || compiledPortfolio?.theme || 'modern';
  const isPublished = Boolean(portfolioData?.published || portfolioData?.status === 'PUBLISHED');
  const publicUrl = `${window.location.origin}/p/${compiledPortfolio?.slug || 'shahukarisowmya'}`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">

      {/* Live Demo Popup Modal on Publish */}
      <PublishSuccessModal
        isOpen={publishModal.isOpen}
        onClose={() => setPublishModal(prev => ({ ...prev, isOpen: false }))}
        liveDemoUrl={publishModal.liveDemoUrl}
        slug={publishModal.slug}
      />

      {/* HEADER TOOLBAR & NAVIGATION CONTROL PANEL */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-5 border border-[#E4E7EC] dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* TITLE & LIVE STATUS */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#6D5EF7]/10 border border-[#6D5EF7]/20 text-[#6D5EF7]">
                <Eye className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-extrabold text-[#172033] dark:text-white tracking-tight">
                AI Resume Portfolio Preview
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                isPublished
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-[#16803D] dark:text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-[#A15C00] dark:text-amber-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {isPublished ? 'PUBLICLY PUBLISHED' : 'PRIVATE DRAFT'}
              </span>
            </div>
            <p className="text-xs text-[#667085] dark:text-slate-400">
              Grounded on Shahukari Sowmya's uploaded resume and enriched with AI Generator deep dives.
            </p>
          </div>

          {/* VIEWPORT & COLOR MODE CONTROLS */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Light / Dark Mode Toggle */}
            <button
              onClick={() => setColorMode(prev => prev === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1.5 rounded-xl border border-[#E4E7EC] dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold flex items-center gap-1.5 hover:border-[#6D5EF7] transition-colors shadow-xs"
              title="Toggle Light / Dark Mode"
            >
              {colorMode === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#A15C00]" />
                  <span className="text-[11px] text-[#172033] dark:text-slate-200">Dark Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-[#6D5EF7]" />
                  <span className="text-[11px] text-[#172033] dark:text-slate-200">Light Mode</span>
                </>
              )}
            </button>

            {/* Viewport Selectors */}
            <div className="flex items-center p-1 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800">
              <button
                onClick={() => setViewport('desktop')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewport === 'desktop'
                    ? 'bg-[#6D5EF7] text-white shadow-sm'
                    : 'text-[#667085] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>

              <button
                onClick={() => setViewport('tablet')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewport === 'tablet'
                    ? 'bg-[#6D5EF7] text-white shadow-sm'
                    : 'text-[#667085] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tablet</span>
              </button>

              <button
                onClick={() => setViewport('mobile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewport === 'mobile'
                    ? 'bg-[#6D5EF7] text-white shadow-sm'
                    : 'text-[#667085] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>

          {/* ACTION BUTTONS: EDIT, REGENERATE, SAVE, PUBLISH, UNPUBLISH */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate('/portfolio/customize')}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#E4E7EC] dark:border-slate-700 hover:border-[#6D5EF7] text-xs font-bold text-[#172033] dark:text-slate-200 flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Pencil className="w-3.5 h-3.5 text-[#6D5EF7]" />
              <span>Edit Content</span>
            </button>

            <button
              onClick={handleGeneratePortfolio}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#E4E7EC] dark:border-slate-700 hover:border-[#6D5EF7] text-xs font-bold text-[#172033] dark:text-slate-200 flex items-center gap-1.5 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#6D5EF7] ${isProcessing ? 'animate-spin' : ''}`} />
              <span>Regenerate</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-[#E4E7EC] dark:border-slate-700 hover:border-[#6D5EF7] text-xs font-bold text-[#172033] dark:text-slate-200 flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-[#16803D]" />
              <span>Save Theme</span>
            </button>

            {isPublished ? (
              <button
                onClick={handleUnpublish}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Unpublish</span>
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-[#6D5EF7] hover:bg-[#5B4CE6] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Publish Live Demo</span>
              </button>
            )}
          </div>

        </div>

        {/* DYNAMIC TEMPLATE SELECTOR (SIMPLE TO MODERN) */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#6D5EF7]" />
              Templates (Simple to Modern):
            </span>
            <span className="text-[10px] font-mono text-[#6D5EF7] font-bold">
              Active: {THEME_OPTIONS.find(t => t.id === activeTheme)?.name || activeTheme}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {THEME_OPTIONS.map((t) => {
              const isSelected = activeTheme === t.id;
              const IconComp = t.icon || Sparkles;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#6D5EF7] text-white shadow-sm scale-[1.02]'
                      : 'bg-[#F8F9FC] dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 text-[#667085] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{t.name}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {t.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {actionMessage && (
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-xs font-mono font-bold text-emerald-400 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{actionMessage}</span>
            </div>
            {isPublished && (
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="text-brand-purple hover:underline flex items-center gap-1"
              >
                <span>Visit Live Portfolio</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* RENDER VIEWPORT CONTAINER WITH LIVE PORTFOLIO PREVIEW */}
      <div className="w-full transition-all duration-300">
        <LivePortfolioPreview 
          portfolio={compiledPortfolio} 
          theme={activeTheme} 
          viewport={viewport} 
          colorMode={colorMode}
          onColorModeChange={setColorMode}
        />
      </div>
    </div>
  );
};

export default PortfolioPreviewPage;

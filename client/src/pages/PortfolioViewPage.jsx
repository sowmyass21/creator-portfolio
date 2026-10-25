import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PortfolioRenderer from '../components/portfolio/PortfolioRenderer';
import SeoHead from '../components/SeoHead';
import ThemeToggle from '../components/ThemeToggle';
import { 
  Sparkles, Download, Mail, EyeOff, ArrowLeft, Globe, 
  ExternalLink, Menu, X, CheckCircle2, Pencil 
} from 'lucide-react';

export const PortfolioViewPage = () => {
  const { slug, username } = useParams();
  const targetSlug = slug || username;
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();

  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchPublicPortfolio = async () => {
      setLoading(true);
      setErrorStatus(null);
      try {
        const res = await apiService.getPublicPortfolio(targetSlug);
        if (res?.data) {
          setPortfolioData(res.data);
        } else {
          setErrorStatus(404);
        }
      } catch (err) {
        console.error('[PublicPortfolio] Fetch error:', err);
        setErrorStatus(404);
      } finally {
        setLoading(false);
      }
    };

    if (targetSlug) {
      fetchPublicPortfolio();
    }
  }, [targetSlug]);

  // Loading Screen
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center font-mono text-xs space-y-4 ${
        theme === 'light' ? 'bg-slate-50 text-slate-600' : 'bg-slate-950 text-slate-400'
      }`}>
        <div className="w-10 h-10 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin"></div>
        <span>Loading published portfolio...</span>
      </div>
    );
  }

  // 404 / Draft Status Screen
  if (errorStatus === 404 || !portfolioData) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6 ${
        theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-slate-950 text-white'
      }`}>
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
          <EyeOff className="w-8 h-8" />
        </div>

        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-extrabold tracking-tight">Portfolio Not Published</h1>
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            The portfolio at <code className="text-brand-purple">/p/{targetSlug}</code> is either private, currently in draft mode, or does not exist.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold shadow-md flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            <span>Creator Login</span>
          </Link>
        </div>
      </div>
    );
  }

  // Published Portfolio Data
  const seo = portfolioData.seo || {};
  const activeTheme = portfolioData.theme || 'modern';
  const isLight = theme === 'light';

  return (
    <div className={`min-h-screen transition-colors duration-300 selection:bg-brand-purple/30 ${
      isLight ? 'bg-[#f8fafc] text-slate-900' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* SEO Metadata Handler */}
      <SeoHead
        title={seo.title || `${portfolioData.displayName}'s Portfolio`}
        description={seo.description || portfolioData.headline || portfolioData.bio || ''}
        image={seo.ogImage || portfolioData.sections?.hero?.avatarUrl}
        url={window.location.href}
        creatorName={portfolioData.displayName}
        type="profile"
      />

      {/* TOP RESPONSIVE PUBLIC NAVIGATION BAR */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors ${
        isLight ? 'bg-white/90 border-slate-200/90 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]' : 'bg-slate-900/85 border-slate-800 shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* BRAND / NAME */}
          <Link to={`/p/${portfolioData.slug}`} className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-indigo to-brand-purple p-[1px]">
              <div className={`w-full h-full rounded-[11px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
                <Sparkles className="w-4 h-4 text-brand-purple" />
              </div>
            </div>
            <span className={`font-extrabold text-sm tracking-tight group-hover:text-brand-purple transition-colors ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}>
              {portfolioData.displayName}
            </span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className={`hidden md:flex items-center gap-6 text-xs font-semibold ${
            isLight ? 'text-slate-700' : 'text-slate-400'
          }`}>
            {portfolioData.sections?.hero && <a href="#hero" className="hover:text-brand-purple transition-colors">Home</a>}
            {portfolioData.sections?.about && <a href="#about" className="hover:text-brand-purple transition-colors">About</a>}
            {portfolioData.sections?.skills && <a href="#skills" className="hover:text-brand-purple transition-colors">Skills</a>}
            <a href="#works" className="hover:text-brand-purple transition-colors">Projects & Experience</a>
            {portfolioData.sections?.education && <a href="#education" className="hover:text-brand-purple transition-colors">Education</a>}
            {portfolioData.sections?.contact && <a href="#contact" className="hover:text-brand-purple transition-colors">Contact</a>}
          </nav>

          {/* ACTIONS & CONTROLS */}
          <div className="flex items-center gap-3">
            {/* EDIT PORTFOLIO BUTTON FOR LOGGED IN USERS */}
            {isAuthenticated && (
              <Link
                to="/dashboard/content"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-purple bg-brand-purple/10 border border-brand-purple/30 hover:bg-brand-purple/20 transition-all shadow-sm"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>AI Studio</span>
              </Link>
            )}

            {/* LIGHT / DARK MODE TOGGLE */}
            <ThemeToggle />

            {/* DOWNLOADABLE RESUME BUTTON (IF ENABLED BY USER) */}
            {portfolioData.resumeDownloadEnabled && portfolioData.resumeDownloadUrl && (
              <a
                href={portfolioData.resumeDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isLight 
                    ? 'text-slate-700 bg-white border border-slate-200 hover:border-brand-purple hover:text-brand-purple' 
                    : 'text-slate-200 bg-slate-800 border border-slate-700 hover:border-brand-purple hover:text-white'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-brand-purple" />
                <span>Resume</span>
              </a>
            )}

            {/* DIRECT CONTACT BUTTON */}
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-pink shadow-md hover:scale-[1.02] transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Contact</span>
            </a>

            {/* MOBILE MENU TOGGLE */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-1.5 rounded-lg ${
                isLight ? 'text-slate-700 bg-slate-100' : 'text-slate-400 bg-slate-800 hover:text-white'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU OVERLAY */}
        {mobileMenuOpen && (
          <div className={`md:hidden px-4 py-4 border-b space-y-3 text-xs font-semibold ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            {portfolioData.sections?.about && (
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="block py-1">About</a>
            )}
            {portfolioData.sections?.skills && (
              <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="block py-1">Skills</a>
            )}
            <a href="#works" onClick={() => setMobileMenuOpen(false)} className="block py-1">Projects & Experience</a>
            {portfolioData.sections?.education && (
              <a href="#education" onClick={() => setMobileMenuOpen(false)} className="block py-1">Education</a>
            )}
            {portfolioData.sections?.contact && (
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="block py-1">Contact</a>
            )}
          </div>
        )}
      </header>

      {/* RENDER DYNAMIC PUBLIC PORTFOLIO VIA SHARED PortfolioRenderer */}
      <main className="w-full py-8">
        <PortfolioRenderer 
          portfolioData={portfolioData} 
          theme={activeTheme} 
          customization={{
            ...portfolioData.customization,
            colorMode: theme || 'dark',
          }} 
        />
      </main>
    </div>
  );
};

export default PortfolioViewPage;

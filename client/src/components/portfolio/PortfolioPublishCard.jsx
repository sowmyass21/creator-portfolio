import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { 
  Globe, CheckCircle2, AlertTriangle, Eye, Save, 
  Power, Copy, Check, ExternalLink, RefreshCw, Sparkles, ShieldCheck 
} from 'lucide-react';

export const PortfolioPublishCard = ({
  portfolioData = {},
  onSaveDraft,
  onPublish,
  onUnpublish,
  isProcessing = false,
}) => {
  const navigate = useNavigate();

  const isPublished = portfolioData?.status === 'PUBLISHED' || portfolioData?.meta?.isPublished || false;
  const portfolioId = portfolioData?._id || portfolioData?.id;
  const currentSlug = portfolioData?.slug || portfolioData?.meta?.slug || 'my-portfolio';

  const [customSlug, setCustomSlug] = useState(currentSlug);
  const [slugStatus, setSlugStatus] = useState({ checking: false, isAvailable: true, message: '' });
  const [copied, setCopied] = useState(false);

  // Sync customSlug if portfolioData changes
  useEffect(() => {
    if (portfolioData?.slug) {
      setCustomSlug(portfolioData.slug);
    }
  }, [portfolioData]);

  // Live Slug Uniqueness Validation
  const handleSlugChange = async (val) => {
    const formatted = val.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    setCustomSlug(formatted);

    if (!formatted) return;

    setSlugStatus({ checking: true, isAvailable: true, message: 'Validating slug availability...' });
    try {
      const res = await apiService.validateSlug(formatted, portfolioId);
      if (res?.data) {
        setSlugStatus({
          checking: false,
          isAvailable: res.data.isAvailable,
          message: res.data.isAvailable
            ? 'Slug is available!'
            : `Slug taken. Suggested: ${res.data.suggestedSlug}`,
          suggested: res.data.suggestedSlug,
        });
      }
    } catch (err) {
      setSlugStatus({ checking: false, isAvailable: true, message: '' });
    }
  };

  const publicUrl = `${window.location.origin}/p/${customSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Pre-publishing Checklist Analysis
  const sections = portfolioData?.sections || {};
  const meta = portfolioData?.meta || {};
  const hero = sections.hero || {};
  const about = sections.about || {};
  const contact = sections.contact || {};

  const checklistItems = [
    {
      id: 'profile',
      label: 'Profile Information',
      complete: Boolean(hero.headline || portfolioData.displayName || portfolioData.bio),
      detail: hero.headline || portfolioData.displayName ? 'Name & Profile configured' : 'Profile details recommended',
    },
    {
      id: 'headline',
      label: 'Professional Headline',
      complete: Boolean(hero.headline || hero.subheadline || portfolioData.headline),
      detail: hero.headline || portfolioData.headline ? 'Headline configured' : 'Headline missing — optional',
    },
    {
      id: 'projects',
      label: 'Projects',
      complete: Array.isArray(sections.projects) && sections.projects.length > 0,
      detail: Array.isArray(sections.projects) && sections.projects.length > 0 
        ? `${sections.projects.length} project(s) added` 
        : 'No projects added — optional section',
    },
    {
      id: 'skills',
      label: 'Skills',
      complete: Array.isArray(sections.skills) && sections.skills.length > 0,
      detail: Array.isArray(sections.skills) && sections.skills.length > 0
        ? `${sections.skills.length} skill category(ies)`
        : 'No skills listed — optional section',
    },
    {
      id: 'contact',
      label: 'Contact Information',
      complete: Boolean(contact.email || contact.phone || contact.location || contact.website),
      detail: contact.email || contact.location ? 'Contact details configured' : 'Contact info missing — optional',
    },
    {
      id: 'theme',
      label: 'Theme Selected',
      complete: Boolean(meta.theme || portfolioData.theme),
      detail: `Active theme: ${(meta.theme || portfolioData.theme || 'modern').toUpperCase()}`,
    },
    {
      id: 'seo',
      label: 'SEO Information',
      complete: Boolean(portfolioData.seoTitle || portfolioData.seoDescription),
      detail: portfolioData.seoTitle ? 'SEO metadata configured' : 'SEO info missing — optional defaults apply',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* STATUS & SLUG CONFIGURATION CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              isPublished 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Publication Status</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  isPublished 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}>
                  {isPublished ? '● PUBLISHED' : '○ DRAFT'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isPublished 
                  ? 'Your portfolio is live and publicly accessible around the world' 
                  : 'Your portfolio is saved as draft and only visible in preview mode'}
              </p>
            </div>
          </div>

          {/* ACTION BUTTON BAR: SAVE DRAFT, PREVIEW, PUBLISH / UNPUBLISH */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onSaveDraft}
              disabled={isProcessing}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-slate-400" />
              <span>Save Draft</span>
            </button>

            <button
              onClick={() => navigate('/portfolio/preview')}
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-brand-purple hover:text-brand-purple transition-all flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-brand-purple" />
              <span>Preview</span>
            </button>

            {isPublished ? (
              <button
                onClick={onUnpublish}
                disabled={isProcessing}
                className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/20 flex items-center gap-1.5 transition-all"
              >
                <Power className="w-3.5 h-3.5" />
                <span>Unpublish</span>
              </button>
            ) : (
              <button
                onClick={() => onPublish(customSlug)}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-pink text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-brand-purple/20 hover:scale-[1.02] transition-all"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Publish Portfolio</span>
              </button>
            )}
          </div>
        </div>

        {/* CUSTOM SLUG INPUT & UNIQUE URL GENERATION */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Custom Public URL Slug
          </label>

          <div className="flex rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden focus-within:border-brand-purple transition-colors">
            <span className="px-3.5 py-2.5 text-xs font-mono text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 flex items-center bg-slate-100 dark:bg-slate-900">
              {window.location.origin}/p/
            </span>
            <input
              type="text"
              value={customSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
              placeholder="sowmya-shahukari"
            />
          </div>

          {/* SLUG STATUS FEEDBACK */}
          {slugStatus.message && (
            <div className="flex items-center gap-2 text-[11px] font-mono">
              {slugStatus.checking ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-purple" />
              ) : slugStatus.isAvailable ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className={slugStatus.isAvailable ? 'text-emerald-400' : 'text-amber-400'}>
                {slugStatus.message}
              </span>
              {!slugStatus.isAvailable && slugStatus.suggested && (
                <button
                  type="button"
                  onClick={() => handleSlugChange(slugStatus.suggested)}
                  className="underline text-brand-purple font-bold ml-1 hover:text-white"
                >
                  Use Suggestion
                </button>
              )}
            </div>
          )}

          {/* PUBLIC URL DISPLAY CARD */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5 truncate">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Public Web Address</span>
              <div className="text-xs font-mono font-semibold text-brand-purple truncate">
                {publicUrl}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>

              {isPublished && (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Visit Portfolio</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PRE-PUBLISHING READINESS CHECKLIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-purple" />
              Pre-Publishing Readiness Checklist
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Warnings display missing optional content. Publishing is never blocked by optional sections.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                item.complete
                  ? 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80'
                  : 'bg-amber-500/5 border-amber-500/20'
              }`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                item.complete ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
              }`}>
                {item.complete ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</span>
                  <span className={`px-2 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                    item.complete
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {item.complete ? 'Complete' : 'Optional Warning'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PortfolioPublishCard;

import React, { useState } from 'react';
import { 
  Globe, Check, Copy, ExternalLink, Sparkles, X, 
  ShieldCheck, ArrowUpRight 
} from 'lucide-react';

export const PublishSuccessModal = ({
  isOpen,
  onClose,
  liveDemoUrl,
  slug,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const url = liveDemoUrl || `${window.location.origin}/p/${slug || 'shahukarisowmya'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenDemo = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-pink" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-indigo to-brand-purple text-white flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>LIVE & INTERACTIVE DEMO ACTIVE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Portfolio Published Live!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Your resume-grounded dynamic portfolio is now publicly accessible with interactive Light and Dark modes.
            </p>
          </div>
        </div>

        {/* Live URL Display Card with Copy */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
            Public Live Demo Web Address
          </span>
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs sm:text-sm font-mono font-bold text-brand-purple truncate">
              {url}
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-purple flex items-center gap-1.5 shrink-0 transition-all shadow-sm"
              title="Copy URL"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-[11px]">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleOpenDemo}
            className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-pink text-white text-xs font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
          >
            <Globe className="w-4 h-4" />
            <span>Open Live Demo</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishSuccessModal;

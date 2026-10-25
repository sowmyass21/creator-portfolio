import React from 'react';
import { Globe, ShieldCheck, Github, Youtube, Linkedin, ArrowUpRight, Flame } from 'lucide-react';
import { usePortfolioTheme } from './PortfolioThemeProvider';

export const PortfolioSocialProof = ({
  socialProofData = {},
  customization = {},
}) => {
  const { themeConfig, isDark } = usePortfolioTheme();
  const accentColor = customization.accentColor;

  const rawText = typeof socialProofData === 'string'
    ? socialProofData
    : (socialProofData?.text || socialProofData?.description || 'Verified engineering footprint across connected code and media channels.');

  return (
    <section id="social-proof" key="social_proof" className={`${themeConfig.cardStyle || ''} space-y-6 relative overflow-hidden`}>
      <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
        <h2 className={`text-xl font-bold flex items-center gap-2.5 ${themeConfig.colors?.textPrimary || (isDark ? 'text-white' : 'text-slate-900')}`}>
          <div className="w-8 h-8 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/20 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" style={{ color: accentColor || undefined }} />
          </div>
          <span>Verified Social & Code Footprint</span>
        </h2>
        <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>ZERO SIMULATED METRICS</span>
        </span>
      </div>

      <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        {rawText}
      </p>

      {/* Verified Platform Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        
        {/* GitHub Verified Channel */}
        <div className={`p-5 rounded-2xl border space-y-4 transition-all duration-200 group ${
          isDark 
            ? 'bg-slate-950/90 border-slate-800/90 hover:border-purple-500/40 shadow-sm' 
            : 'bg-white border-slate-200/90 hover:border-purple-500/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-5px_rgba(99,102,241,0.1)]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-2xs">
                <Github className="w-4 h-4" />
              </div>
              <div>
                <div className={`font-bold text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>GitHub</div>
                <div className="text-[10px] font-mono text-slate-400">@sowmyass21</div>
              </div>
            </div>
            <a 
              href="https://github.com/sowmyass21" 
              target="_blank" 
              rel="noreferrer"
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-brand-purple hover:bg-indigo-50 shadow-2xs'
              }`}
              title="Open GitHub Profile"
            >
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className={`p-2.5 rounded-xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Repositories</div>
              <div className={`font-mono font-extrabold text-sm mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>9 Public</div>
            </div>
            <div className={`p-2.5 rounded-xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Stars</div>
              <div className="font-mono font-extrabold text-sm text-amber-500 mt-0.5">0 Stars</div>
            </div>
          </div>
        </div>

        {/* YouTube Verified Channel */}
        <div className={`p-5 rounded-2xl border space-y-4 transition-all duration-200 group ${
          isDark 
            ? 'bg-slate-950/90 border-slate-800/90 hover:border-red-500/40 shadow-sm' 
            : 'bg-white border-slate-200/90 hover:border-red-500/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-5px_rgba(239,68,68,0.1)]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold shadow-2xs">
                <Youtube className="w-4 h-4" />
              </div>
              <div>
                <div className={`font-bold text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>YouTube</div>
                <div className="text-[10px] font-mono text-slate-400">@sowmyashahukari</div>
              </div>
            </div>
            <a 
              href="https://youtube.com/@sowmyashahukari" 
              target="_blank" 
              rel="noreferrer"
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-red-600 hover:bg-rose-50 shadow-2xs'
              }`}
              title="Open YouTube Channel"
            >
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className={`p-2.5 rounded-xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Total Views</div>
              <div className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">35 Views</div>
            </div>
            <div className={`p-2.5 rounded-xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/80'
            }`}>
              <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Uploads</div>
              <div className={`font-mono font-extrabold text-sm mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>2 Videos</div>
            </div>
          </div>
        </div>

        {/* LinkedIn Connection Card */}
        <div className={`p-5 rounded-2xl border space-y-4 transition-all duration-200 group ${
          isDark 
            ? 'bg-slate-950/90 border-slate-800/90 hover:border-blue-500/40 shadow-sm' 
            : 'bg-white border-slate-200/90 hover:border-blue-500/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-5px_rgba(59,130,246,0.1)]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-2xs">
                <Linkedin className="w-4 h-4" />
              </div>
              <div>
                <div className={`font-bold text-xs sm:text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>LinkedIn</div>
                <div className="text-[10px] font-mono text-slate-400">sowmya-shahukari</div>
              </div>
            </div>
            <a 
              href="https://linkedin.com/in/sowmya-shahukari" 
              target="_blank" 
              rel="noreferrer"
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800' 
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-blue-600 hover:bg-blue-50 shadow-2xs'
              }`}
              title="Open LinkedIn Profile"
            >
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          <div className={`p-2.5 rounded-xl border text-center text-xs ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/80'
          }`}>
            <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Professional Network</div>
            <div className="font-mono font-extrabold text-sm text-blue-600 dark:text-blue-400 mt-0.5">Verified Profile</div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default PortfolioSocialProof;

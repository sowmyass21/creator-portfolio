import React from 'react';
import { Award, Star, Trophy, Shield, Cpu } from 'lucide-react';
import { usePortfolioTheme } from './PortfolioThemeProvider';

export const PortfolioAchievements = ({
  achievementsData = [],
  customization = {},
}) => {
  const { themeConfig, isDark } = usePortfolioTheme();
  const themeId = themeConfig.id || 'modern';
  const accentColor = customization.accentColor;

  if (!achievementsData || achievementsData.length === 0) return null;

  // 1. DEVELOPER TERMINAL TEMPLATE
  if (themeId === 'developer') {
    return (
      <section id="achievements" key="achievements" className="rounded-2xl bg-[#090d16] border border-emerald-900/50 shadow-2xl overflow-hidden font-mono text-xs">
        <div className="bg-[#050811] px-4 py-3 border-b border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] text-emerald-400 font-bold ml-2">bash: ~/achievements/trophies.log</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">[LOGGED_HONORS: {achievementsData.length}]</span>
        </div>

        <div className="p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="text-emerald-500 font-bold">$</span>
            <span>grep -i "milestone" ./achievements.db</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievementsData.map((ach, idx) => {
              const title = typeof ach === 'string' ? ach : (ach.title || ach.achievement || '');
              const desc = typeof ach === 'string' ? '' : (ach.description || ach.organization || '');

              return (
                <div key={idx} className="p-4 rounded-xl bg-[#0c1220] border border-emerald-900/40 space-y-1.5 hover:border-emerald-500/40 transition-colors">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <span>★</span>
                    <span className="text-white">{title}</span>
                  </div>
                  {desc && <div className="text-[11px] text-slate-400 pl-4">{desc}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // 2. CYBERPUNK NEON TEMPLATE
  if (themeId === 'cyberpunk') {
    return (
      <section id="achievements" key="achievements" className="rounded-2xl bg-black border border-cyan-500/40 shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)] overflow-hidden font-mono p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center text-cyan-300">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-cyan-400 tracking-widest block font-bold">// TROPHY_CACHE</span>
              <h2 className="text-lg font-black text-white tracking-wide">MILESTONES_&_HONORS</h2>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/40 font-bold">
            TIER: GOLD
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievementsData.map((ach, idx) => {
            const title = typeof ach === 'string' ? ach : (ach.title || ach.achievement || '');
            const desc = typeof ach === 'string' ? '' : (ach.description || ach.organization || '');

            return (
              <div key={idx} className="p-4 rounded-xl bg-[#05070d] border border-cyan-500/30 space-y-1 hover:border-fuchsia-500/50 transition-colors">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <span className="text-fuchsia-400">⚡</span>
                  <span className="text-white">{title}</span>
                </div>
                {desc && <div className="text-[11px] text-cyan-200/70 pl-4">{desc}</div>}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // 3. EXECUTIVE LEADERSHIP TEMPLATE
  if (themeId === 'executive') {
    return (
      <section id="achievements" key="achievements" className="rounded-2xl bg-[#0f1523] border-t-4 border-t-amber-400 border-x border-b border-slate-800 shadow-2xl p-7 md:p-10 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-sans text-amber-400 uppercase tracking-widest font-bold">PROVEN EXCELLENCE</span>
              <h2 className="text-xl font-serif font-bold text-white">Distinguished Honors & Industry Recognitions</h2>
            </div>
          </div>
          <span className="text-xs font-serif italic text-amber-200/80">Track Record of Success</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievementsData.map((ach, idx) => {
            const title = typeof ach === 'string' ? ach : (ach.title || ach.achievement || '');
            const desc = typeof ach === 'string' ? '' : (ach.description || ach.organization || '');

            return (
              <div key={idx} className="p-5 rounded-xl bg-[#0a0e17] border border-amber-500/20 space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-serif font-bold text-amber-300">
                  <Star className="w-4 h-4 text-amber-400 shrink-0 fill-amber-400/20" />
                  <span className="text-white">{title}</span>
                </div>
                {desc && <div className="text-xs text-slate-400 pl-6">{desc}</div>}
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // 4. CLASSIC SIMPLE & MINIMALIST TEMPLATES
  if (themeId === 'simple' || themeId === 'minimal') {
    return (
      <section id="achievements" key="achievements" className={`p-6 sm:p-8 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-4`}>
        <div className="border-b pb-3 border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Key Achievements
          </h2>
          <span className="text-[11px] text-slate-400">Honors & Milestones</span>
        </div>

        <div className="space-y-3">
          {achievementsData.map((ach, idx) => {
            const title = typeof ach === 'string' ? ach : (ach.title || ach.achievement || '');
            const desc = typeof ach === 'string' ? '' : (ach.description || ach.organization || '');

            return (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <span className="text-slate-400 mt-0.5">•</span>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{title}</span>
                  {desc && <span className="text-slate-500 dark:text-slate-400 ml-1.5">— {desc}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // 5. MODERN STUDIO / CREATIVE / LUXURY ELEGANCE (DEFAULT)
  return (
    <section id="achievements" key="achievements" className={`${themeConfig.cardStyle || ''} space-y-6 relative overflow-hidden`}>
      <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
        <h2 className={`text-xl font-bold flex items-center gap-2.5 ${themeConfig.colors?.textPrimary || (isDark ? 'text-white' : 'text-slate-900')}`}>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 text-amber-400" style={{ color: accentColor || undefined }} />
          </div>
          <span>Key Achievements & Milestones</span>
        </h2>
        <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          PROVEN TRACK RECORD
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievementsData.map((ach, idx) => {
          const title = typeof ach === 'string' ? ach : (ach.title || ach.achievement || '');
          const desc = typeof ach === 'string' ? '' : (ach.description || ach.organization || '');

          return (
            <div 
              key={idx} 
              className={`p-5 rounded-2xl border flex items-start gap-3.5 transition-all duration-200 group ${
                isDark 
                  ? 'bg-slate-950/90 border-slate-800/90 hover:border-amber-400/40 text-slate-200 shadow-sm' 
                  : 'bg-white border-slate-200/90 hover:border-amber-400/40 text-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_25px_-5px_rgba(245,158,11,0.1)]'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                isDark 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                  : 'bg-amber-50 border-amber-200 text-amber-600 shadow-2xs'
              }`}>
                <Star className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className={`font-bold text-sm transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900 group-hover:text-amber-600'
                }`}>
                  {title}
                </div>
                {desc && (
                  <div className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {desc}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PortfolioAchievements;

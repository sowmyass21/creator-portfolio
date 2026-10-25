import React from 'react';
import { User, Sparkles, CheckCircle2, Terminal, Shield, Cpu, FileText } from 'lucide-react';
import { usePortfolioTheme } from './PortfolioThemeProvider';

export const PortfolioAbout = ({
  aboutData = {},
  customization = {},
}) => {
  const { themeConfig, isDark } = usePortfolioTheme();
  const themeId = themeConfig.id || 'modern';
  const accentColor = customization.accentColor;

  const rawBio = aboutData.bio || '';
  const paragraphs = rawBio.split(/\n\n+/).filter(Boolean);

  const highlightItems = Array.isArray(aboutData.highlights) && aboutData.highlights.length > 0
    ? aboutData.highlights
    : [
        'Full Stack & Modern Web Architectures',
        'Production Solutions & RESTful APIs',
        'Continuous Integration & High-Quality Code',
      ];

  // 1. DEVELOPER TERMINAL TEMPLATE
  if (themeId === 'developer') {
    return (
      <section id="about" key="about" className="rounded-2xl bg-[#090d16] border border-emerald-900/50 shadow-2xl overflow-hidden font-mono text-xs">
        {/* Terminal Header Bar */}
        <div className="bg-[#050811] px-4 py-3 border-b border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] text-emerald-400 font-bold ml-2">bash: ~/about/biography.md</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">UTF-8 • markdown</span>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 text-emerald-400 text-xs">
            <span className="text-emerald-500 font-bold">$</span>
            <span>cat ~/.user_profile.md --pretty</span>
          </div>

          <div className="space-y-3 bg-[#0c1220]/80 p-5 rounded-xl border border-emerald-900/30">
            {paragraphs.length > 0 ? (
              paragraphs.map((para, idx) => (
                <div key={idx} className="flex items-start gap-4 text-slate-300 leading-relaxed">
                  <span className="text-slate-600 select-none font-mono text-[11px]">{String(idx + 1).padStart(2, '0')}</span>
                  <p className="flex-1">{para}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-300 leading-relaxed">{rawBio}</p>
            )}
          </div>

          {/* Developer Competency Checklist */}
          {highlightItems.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">// CORE_ATTRIBUTES</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {highlightItems.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 flex items-center gap-2 text-[11px]">
                    <span className="text-emerald-400">➜</span>
                    <span className="font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // 2. CYBERPUNK NEON TEMPLATE
  if (themeId === 'cyberpunk') {
    return (
      <section id="about" key="about" className="rounded-2xl bg-black border border-cyan-500/40 shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)] overflow-hidden font-mono p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center text-cyan-300">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-cyan-400 tracking-widest block font-bold">// TELEMETRY_STREAM</span>
              <h2 className="text-lg font-black text-white tracking-wide">BIOGRAPHICAL_NEURAL_LOG</h2>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded bg-fuchsia-950/60 text-fuchsia-300 border border-fuchsia-500/40 font-bold">
            STATUS: ACTIVE
          </span>
        </div>

        <div className="p-5 rounded-xl bg-[#05070d] border border-cyan-500/20 space-y-4">
          {paragraphs.length > 0 ? (
            paragraphs.map((para, idx) => (
              <p key={idx} className="text-xs sm:text-sm text-cyan-100 leading-relaxed">
                <span className="text-cyan-400 font-bold mr-2">&gt;&gt;</span>
                {para}
              </p>
            ))
          ) : (
            <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed">{rawBio}</p>
          )}
        </div>

        {highlightItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {highlightItems.slice(0, 3).map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center gap-2.5 text-xs text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]" />
                <span className="font-bold">{item}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  // 3. EXECUTIVE LEADERSHIP TEMPLATE
  if (themeId === 'executive') {
    return (
      <section id="about" key="about" className="rounded-2xl bg-[#0f1523] border-t-4 border-t-amber-400 border-x border-b border-slate-800 shadow-2xl p-7 md:p-10 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-sans text-amber-400 uppercase tracking-widest font-bold">EXECUTIVE DOSSIER</span>
              <h2 className="text-xl font-serif font-bold text-white">Leadership Profile & Professional Philosophy</h2>
            </div>
          </div>
          <span className="text-xs font-serif italic text-amber-200/80">Confidential Briefing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-8 space-y-4">
            {paragraphs.length > 0 ? (
              paragraphs.map((para, idx) => (
                <p key={idx} className="text-xs sm:text-sm font-sans leading-relaxed text-slate-300">
                  {para}
                </p>
              ))
            ) : (
              <p className="text-xs sm:text-sm font-sans leading-relaxed text-slate-300">{rawBio}</p>
            )}
          </div>

          <div className="md:col-span-4 p-5 rounded-xl bg-[#0a0e17] border border-amber-500/20 space-y-3">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Strategic Pillars</div>
            <div className="space-y-2">
              {highlightItems.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 4. CLASSIC SIMPLE & MINIMALIST TEMPLATES
  if (themeId === 'simple' || themeId === 'minimal') {
    return (
      <section id="about" key="about" className={`p-6 sm:p-8 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-5`}>
        <div className="border-b pb-3 border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Professional Summary
          </h2>
          <span className="text-[11px] text-slate-400">About Me</span>
        </div>

        <div className="space-y-3">
          {paragraphs.length > 0 ? (
            paragraphs.map((para, idx) => (
              <p key={idx} className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {para}
              </p>
            ))
          ) : (
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{rawBio}</p>
          )}
        </div>

        {highlightItems.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-2">
            {highlightItems.map((item, idx) => (
              <span key={idx} className="px-3 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                • {item}
              </span>
            ))}
          </div>
        )}
      </section>
    );
  }

  // 5. MODERN STUDIO / CREATIVE / LUXURY ELEGANCE (DEFAULT)
  return (
    <section id="about" key="about" className={`${themeConfig.cardStyle || ''} space-y-6 relative overflow-hidden`}>
      <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
        <h2 className={`text-xl font-bold flex items-center gap-2.5 ${themeConfig.colors?.textPrimary || (isDark ? 'text-white' : 'text-slate-900')}`}>
          <div className="w-8 h-8 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/20 flex items-center justify-center shrink-0">
            <User className="w-4 h-4" style={{ color: accentColor || undefined }} />
          </div>
          <span>Professional Background & Overview</span>
        </h2>
        <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
          PROFILE OVERVIEW
        </span>
      </div>

      <div className="space-y-4 max-w-4xl">
        {paragraphs.length > 0 ? (
          paragraphs.map((para, idx) => (
            <p 
              key={idx} 
              className={`text-xs sm:text-sm leading-relaxed ${themeConfig.colors?.textSecondary || (isDark ? 'text-slate-300' : 'text-slate-700')}`}
            >
              {para}
            </p>
          ))
        ) : (
          <p className={`text-xs sm:text-sm leading-relaxed ${themeConfig.colors?.textSecondary || (isDark ? 'text-slate-300' : 'text-slate-700')}`}>
            {rawBio}
          </p>
        )}
      </div>

      {highlightItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {highlightItems.slice(0, 3).map((item, idx) => (
            <div 
              key={idx} 
              className={`p-3.5 rounded-xl border flex items-center gap-3 transition-colors ${
                isDark 
                  ? 'bg-slate-950/80 border-slate-800 text-slate-300' 
                  : 'bg-indigo-50/50 border-indigo-100 text-slate-800 shadow-2xs'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <div className="text-xs font-semibold">{item}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default PortfolioAbout;

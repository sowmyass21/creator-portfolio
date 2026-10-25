import React from 'react';
import { Sparkles, ExternalLink, Github, CheckCircle2 } from 'lucide-react';
import { usePortfolioTheme } from './PortfolioThemeProvider';

export const PortfolioProjects = ({
  projectsData = [],
  customization = {},
}) => {
  const { themeConfig, isDark } = usePortfolioTheme();
  const projectCardStyle = customization.projectCardStyle || 'grid';
  const accentColor = customization.accentColor;

  const gridClass = projectCardStyle === 'compact-list'
    ? 'grid grid-cols-1 gap-4'
    : projectCardStyle === 'feature-cards'
    ? 'grid grid-cols-1 gap-6'
    : 'grid grid-cols-1 md:grid-cols-2 gap-6';

  return (
    <section id="projects" key="projects" className={`${themeConfig.cardStyle || ''} space-y-6 relative overflow-hidden`}>
      <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
        <h2 className={`text-xl font-bold flex items-center gap-2.5 ${themeConfig.colors?.textPrimary || (isDark ? 'text-white' : 'text-slate-900')}`}>
          <div className="w-8 h-8 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" style={{ color: accentColor || undefined }} />
          </div>
          <span>Featured Projects & Systems</span>
        </h2>
        <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
          PRODUCTION ARCHITECTURES
        </span>
      </div>

      <div className={gridClass}>
        {projectsData.map((proj, idx) => {
          const pTitle = proj.title || proj.projectName || proj.name || 'Project';
          const pLink = proj.link || proj.liveUrl || proj.githubUrl || proj.live_url || proj.github_url;
          const pDesc = proj.description || '';
          const pTechs = Array.isArray(proj.technologies) ? proj.technologies : [];
          const pFeatures = Array.isArray(proj.features) ? proj.features : (Array.isArray(proj.highlights) ? proj.highlights : []);

          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 group relative overflow-hidden ${
                isDark
                  ? 'bg-slate-950/90 border-slate-800/90 hover:border-brand-purple/40 shadow-xl'
                  : 'bg-white border-slate-200/90 hover:border-brand-purple/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_-5px_rgba(99,102,241,0.12)] hover:-translate-y-0.5'
              }`}
            >
              {/* Subtle hover gradient top accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-purple/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className={`text-base font-bold tracking-tight transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900 group-hover:text-brand-purple'
                  }`}>
                    {pTitle}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(proj.githubUrl || proj.github_url || (pLink && pLink.includes('github'))) && (
                      <a
                        href={proj.githubUrl || proj.github_url || pLink}
                        target="_blank"
                        rel="noreferrer"
                        className={`p-2 rounded-xl transition-all ${
                          isDark 
                            ? 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800' 
                            : 'bg-slate-100 text-slate-700 hover:text-brand-purple hover:bg-indigo-50 border border-slate-200/80 shadow-2xs'
                        }`}
                        title="View GitHub Repository"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {(proj.liveUrl || proj.live_url || (pLink && !pLink.includes('github'))) && (
                      <a
                        href={proj.liveUrl || proj.live_url || pLink}
                        target="_blank"
                        rel="noreferrer"
                        className={`p-2 rounded-xl transition-all ${
                          isDark 
                            ? 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800' 
                            : 'bg-slate-100 text-slate-700 hover:text-brand-purple hover:bg-indigo-50 border border-slate-200/80 shadow-2xs'
                        }`}
                        title="Open Live Application"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {pDesc && (
                  <p className={`text-xs sm:text-[13px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {pDesc}
                  </p>
                )}

                {pFeatures.length > 0 && (
                  <ul className="space-y-1.5 pt-1">
                    {pFeatures.map((feat, fIdx) => (
                      <li key={fIdx} className={`text-[11px] sm:text-xs font-mono flex items-start gap-2 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {pTechs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/80 dark:border-slate-800/60">
                  {pTechs.map((tech, tIdx) => (
                    <span 
                      key={tIdx} 
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium transition-colors ${
                        isDark 
                          ? 'bg-slate-900 text-slate-300 border border-slate-800' 
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100'
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PortfolioProjects;

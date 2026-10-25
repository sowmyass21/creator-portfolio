import React from 'react';
import { Briefcase, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { usePortfolioTheme } from './PortfolioThemeProvider';

export const PortfolioExperience = ({
  experienceData = [],
  customization = {},
}) => {
  const { themeConfig, isDark } = usePortfolioTheme();
  const accentColor = customization.accentColor;

  if (!Array.isArray(experienceData) || experienceData.length === 0) {
    return null;
  }

  return (
    <section id="experience" key="experience" className={`${themeConfig.cardStyle || ''} space-y-6 relative overflow-hidden`}>
      <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
        <h2 className={`text-xl font-bold flex items-center gap-2.5 ${themeConfig.colors?.textPrimary || (isDark ? 'text-white' : 'text-slate-900')}`}>
          <div className="w-8 h-8 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/20 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4" style={{ color: accentColor || undefined }} />
          </div>
          <span>Experience & Industrial Internships</span>
        </h2>
        <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
          CAREER TIMELINE
        </span>
      </div>

      <div className="space-y-4">
        {experienceData.map((exp, idx) => {
          const eTitle = exp.title || exp.role || exp.job_title || 'Position';
          const eCompany = exp.company || '';
          const eLocation = exp.location || '';
          const eStart = exp.startDate || exp.start_date || '';
          const eEnd = exp.endDate || exp.end_date || (exp.current ? 'Present' : '');
          const eDuration = exp.duration || (eStart ? `${eStart} — ${eEnd || 'Present'}` : '');
          const eDesc = exp.description || '';
          const eBullets = Array.isArray(exp.responsibilities) 
            ? exp.responsibilities 
            : (Array.isArray(exp.highlights) 
                ? exp.highlights 
                : (typeof exp.responsibilities === 'string' && exp.responsibilities.includes('\n') 
                    ? exp.responsibilities.split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean) 
                    : []));

          return (
            <div 
              key={idx} 
              className={`p-6 rounded-2xl border space-y-3.5 transition-all duration-200 group ${
                isDark 
                  ? 'bg-slate-950/90 border-slate-800/90 hover:border-brand-purple/40 shadow-sm' 
                  : 'bg-white border-slate-200/90 hover:border-brand-purple/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-5px_rgba(99,102,241,0.1)]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b pb-3.5 border-slate-200/80 dark:border-slate-800/60">
                <div>
                  <h3 className={`text-base font-bold transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900 group-hover:text-brand-purple'
                  }`}>
                    {eTitle}
                  </h3>
                  {eCompany && (
                    <div className="text-xs sm:text-sm font-semibold text-brand-purple mt-0.5 inline-flex items-center gap-1.5">
                      <span>{eCompany}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {eDuration && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border ${
                      isDark 
                        ? 'bg-slate-900 text-slate-300 border-slate-800' 
                        : 'bg-slate-100 text-slate-700 border-slate-200/80 shadow-2xs'
                    }`}>
                      <Calendar className="w-3.5 h-3.5 text-brand-purple" />
                      {eDuration}
                    </span>
                  )}
                  {eLocation && (
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border ${
                      isDark 
                        ? 'bg-slate-900 text-slate-300 border-slate-800' 
                        : 'bg-slate-100 text-slate-700 border-slate-200/80 shadow-2xs'
                    }`}>
                      <MapPin className="w-3.5 h-3.5 text-brand-indigo" />
                      {eLocation}
                    </span>
                  )}
                </div>
              </div>

              {eDesc && (
                <p className={`text-xs sm:text-[13px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {eDesc}
                </p>
              )}

              {eBullets.length > 0 && (
                <ul className="space-y-2 pt-1">
                  {eBullets.map((b, bIdx) => (
                    <li key={bIdx} className={`text-xs sm:text-[13px] flex items-start gap-2.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-purple shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PortfolioExperience;

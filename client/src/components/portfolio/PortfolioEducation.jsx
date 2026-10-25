import React from 'react';
import { GraduationCap, Award, MapPin, Calendar, Terminal, Shield, Cpu, BookOpen } from 'lucide-react';
import { usePortfolioTheme } from './PortfolioThemeProvider';

export const PortfolioEducation = ({
  educationData = [],
  customization = {},
}) => {
  const { themeConfig, isDark } = usePortfolioTheme();
  const themeId = themeConfig.id || 'modern';
  const accentColor = customization.accentColor;

  if (!educationData || educationData.length === 0) return null;

  // 1. DEVELOPER TERMINAL TEMPLATE
  if (themeId === 'developer') {
    return (
      <section id="education" key="education" className="rounded-2xl bg-[#090d16] border border-emerald-900/50 shadow-2xl overflow-hidden font-mono text-xs">
        <div className="bg-[#050811] px-4 py-3 border-b border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] text-emerald-400 font-bold ml-2">bash: ~/academics/manifest.json</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-mono">[STATUS: 200 OK]</span>
        </div>

        <div className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="text-emerald-500 font-bold">$</span>
            <span>cat /etc/academics.manifest | grep --degree</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {educationData.map((edu, idx) => {
              const degree = edu.degree || 'Degree';
              const institution = edu.institution || edu.school || '';
              const field = edu.field || edu.field_of_study || '';
              const gpa = edu.gpa || '';
              const duration = edu.duration || edu.dates || ((edu.startYear || edu.startDate) ? `${edu.startYear || edu.startDate} — ${edu.endYear || edu.endDate || 'Present'}` : '');
              const location = edu.location || '';

              return (
                <div key={idx} className="p-5 rounded-xl bg-[#0c1220] border border-emerald-900/40 space-y-3 hover:border-emerald-500/50 transition-colors">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold">[{institution}]</span>
                    {gpa && <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">GPA: {gpa}</span>}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{degree}</h3>
                    {field && <div className="text-[11px] text-slate-400 mt-0.5">field: "{field}"</div>}
                  </div>
                  <div className="pt-2 border-t border-emerald-900/30 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>{duration || 'Graduated'}</span>
                    <span>{location}</span>
                  </div>
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
      <section id="education" key="education" className="rounded-2xl bg-black border border-cyan-500/40 shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)] overflow-hidden font-mono p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center text-cyan-300">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-cyan-400 tracking-widest block font-bold">// ARCHIVE_RECORD</span>
              <h2 className="text-lg font-black text-white tracking-wide">ACADEMIC_CREDENTIALS</h2>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold">
            VERIFIED_NODE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {educationData.map((edu, idx) => {
            const degree = edu.degree || 'Degree';
            const institution = edu.institution || edu.school || '';
            const field = edu.field || edu.field_of_study || '';
            const gpa = edu.gpa || '';
            const duration = edu.duration || edu.dates || ((edu.startYear || edu.startDate) ? `${edu.startYear || edu.startDate} — ${edu.endYear || edu.endDate || 'Present'}` : '');

            return (
              <div key={idx} className="p-5 rounded-xl bg-[#05070d] border border-cyan-500/30 space-y-3 hover:border-fuchsia-500/50 transition-colors">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-cyan-400 font-bold tracking-wider">INSTITUTION // {institution}</span>
                  {gpa && <span className="text-fuchsia-400 font-extrabold">[GPA: {gpa}]</span>}
                </div>
                <h3 className="text-sm font-extrabold text-white">{degree}</h3>
                {field && <div className="text-xs text-cyan-300/80">{field}</div>}
                <div className="text-[10px] text-cyan-400/60 pt-2 border-t border-cyan-500/20">{duration}</div>
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
      <section id="education" key="education" className="rounded-2xl bg-[#0f1523] border-t-4 border-t-amber-400 border-x border-b border-slate-800 shadow-2xl p-7 md:p-10 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-sans text-amber-400 uppercase tracking-widest font-bold">INSTITUTIONAL FOUNDATIONS</span>
              <h2 className="text-xl font-serif font-bold text-white">Academic Qualifications & Honors</h2>
            </div>
          </div>
          <span className="text-xs font-serif italic text-amber-200/80">Accredited Credentials</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {educationData.map((edu, idx) => {
            const degree = edu.degree || 'Degree';
            const institution = edu.institution || edu.school || '';
            const field = edu.field || edu.field_of_study || '';
            const gpa = edu.gpa || '';
            const duration = edu.duration || edu.dates || ((edu.startYear || edu.startDate) ? `${edu.startYear || edu.startDate} — ${edu.endYear || edu.endDate || 'Present'}` : '');
            const location = edu.location || '';

            return (
              <div key={idx} className="p-6 rounded-xl bg-[#0a0e17] border border-amber-500/20 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-serif font-bold text-amber-300">{institution}</span>
                  {gpa && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-bold">GPA {gpa}</span>}
                </div>
                <h3 className="text-base font-serif font-bold text-white">{degree}</h3>
                {field && <div className="text-xs text-slate-300">{field}</div>}
                <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>{duration}</span>
                  {location && <span>{location}</span>}
                </div>
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
      <section id="education" key="education" className={`p-6 sm:p-8 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-5`}>
        <div className="border-b pb-3 border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Education
          </h2>
          <span className="text-[11px] text-slate-400">Academic Background</span>
        </div>

        <div className="space-y-4">
          {educationData.map((edu, idx) => {
            const degree = edu.degree || 'Degree';
            const institution = edu.institution || edu.school || '';
            const field = edu.field || edu.field_of_study || '';
            const gpa = edu.gpa || '';
            const duration = edu.duration || edu.dates || ((edu.startYear || edu.startDate) ? `${edu.startYear || edu.startDate} — ${edu.endYear || edu.endDate || 'Present'}` : '');
            const location = edu.location || '';

            return (
              <div key={idx} className="pb-4 last:pb-0 border-b last:border-0 border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{degree}</h3>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {institution} {field ? `— ${field}` : ''}
                  </div>
                  {gpa && <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">GPA: {gpa}</div>}
                </div>
                <div className="text-xs text-slate-500 font-mono text-left sm:text-right shrink-0">
                  <div>{duration}</div>
                  {location && <div>{location}</div>}
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
    <section id="education" key="education" className={`${themeConfig.cardStyle || ''} space-y-6 relative overflow-hidden`}>
      <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
        <h2 className={`text-xl font-bold flex items-center gap-2.5 ${themeConfig.colors?.textPrimary || (isDark ? 'text-white' : 'text-slate-900')}`}>
          <div className="w-8 h-8 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/20 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" style={{ color: accentColor || undefined }} />
          </div>
          <span>Education & Academic Foundations</span>
        </h2>
        <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          ACADEMIC EXCELLENCE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {educationData.map((edu, idx) => {
          const degree = edu.degree || 'Degree';
          const institution = edu.institution || edu.school || '';
          const field = edu.field || edu.field_of_study || '';
          const gpa = edu.gpa || '';
          const duration = edu.duration || edu.dates || ((edu.startYear || edu.startDate) ? `${edu.startYear || edu.startDate} — ${edu.endYear || edu.endDate || 'Present'}` : '');
          const location = edu.location || '';

          return (
            <div 
              key={idx} 
              className={`p-6 rounded-2xl border space-y-4 flex flex-col justify-between transition-all duration-200 group ${
                isDark 
                  ? 'bg-slate-950/90 border-slate-800/90 hover:border-brand-purple/40 shadow-sm' 
                  : 'bg-white border-slate-200/90 hover:border-brand-purple/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-5px_rgba(99,102,241,0.1)] hover:-translate-y-0.5'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-brand-purple uppercase tracking-wider">
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span>{institution}</span>
                  </div>
                  {gpa && (
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold border shrink-0 ${
                      isDark 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                    }`}>
                      {gpa}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className={`text-sm sm:text-base font-extrabold leading-snug transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900 group-hover:text-brand-purple'
                  }`}>
                    {degree}
                  </h3>
                  {field && !degree.toLowerCase().includes(field.toLowerCase()) && (
                    <div className="text-xs text-brand-purple font-medium mt-0.5">
                      {field}
                    </div>
                  )}
                </div>
              </div>

              <div className={`pt-3 border-t border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between text-xs font-mono ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {duration && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-purple" />
                    {duration}
                  </span>
                )}
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-indigo" />
                    {location}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PortfolioEducation;

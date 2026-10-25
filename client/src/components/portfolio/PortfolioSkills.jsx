import React from 'react';
import { Code2, Cpu, Database, Cloud, Terminal, Layers, Shield, Zap, Check } from 'lucide-react';
import { usePortfolioTheme } from './PortfolioThemeProvider';

export const PortfolioSkills = ({
  skillsData = [],
  customization = {},
}) => {
  const { themeConfig, themeKey, isDark } = usePortfolioTheme();
  const currentTheme = themeKey ? themeKey.toLowerCase().trim() : 'modern';
  const accentColor = customization.accentColor;

  const isDeveloper = currentTheme.includes('developer') || currentTheme.includes('terminal');
  const isCyberpunk = currentTheme.includes('cyberpunk') || currentTheme.includes('neon');
  const isExecutive = currentTheme.includes('executive');
  const isSimple = currentTheme.includes('simple');
  const isMinimal = currentTheme.includes('minimal');

  const normalizedSkills = React.useMemo(() => {
    if (!skillsData) return [];
    if (Array.isArray(skillsData)) {
      if (skillsData.length === 0) return [];
      const hasCategories = skillsData.some(item => typeof item === 'object' && item !== null && (item.category || item.name || item.items));
      if (hasCategories) {
        return skillsData.map(group => {
          if (typeof group === 'string') return { category: 'Core Skills', items: [group] };
          return {
            category: group.category || group.name || 'Core Skills',
            items: Array.isArray(group.items) ? group.items : (Array.isArray(group.skills) ? group.skills : (group.items ? [String(group.items)] : []))
          };
        }).filter(g => g.items && g.items.length > 0);
      }
      return [{ category: 'Core Technical Stack', items: skillsData.map(String).filter(Boolean) }];
    } else if (typeof skillsData === 'object' && skillsData !== null) {
      return Object.entries(skillsData)
        .filter(([_, val]) => (Array.isArray(val) && val.length > 0) || (typeof val === 'string' && val.trim().length > 0))
        .map(([key, val]) => ({
          category: key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).trim(),
          items: Array.isArray(val) ? val.map(String) : val.split(',').map(s => s.trim()).filter(Boolean)
        }));
    }
    return [];
  }, [skillsData]);

  if (normalizedSkills.length === 0) return null;

  // 1. DEVELOPER TERMINAL SKILLS
  if (isDeveloper) {
    return (
      <section id="skills" className="rounded-2xl border border-emerald-900/60 bg-[#070b12] text-emerald-300 font-mono p-6 sm:p-8 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-emerald-900/50 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-emerald-200">
              $ cat /etc/tech_stack.manifest
            </h2>
          </div>
          <span className="text-[10px] text-emerald-500 font-bold">[200 OK]</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {normalizedSkills.map((group, idx) => {
            const catName = group.category || 'Tech Stack';
            const items = Array.isArray(group.items) ? group.items : [];
            return (
              <div key={idx} className="p-4 rounded-xl border border-emerald-900/40 bg-[#0a101d] space-y-2.5">
                <div className="text-xs font-bold text-emerald-400 flex items-center justify-between border-b border-emerald-900/30 pb-1.5">
                  <span>┌── [{catName}]</span>
                  <span className="text-[10px] text-slate-500">{items.length} pkgs</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-2">
                  {items.map((skill, sIdx) => (
                    <span key={sIdx} className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[11px]">
                      ➜ {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // 2. CYBERPUNK NEON SKILLS
  if (isCyberpunk) {
    return (
      <section id="skills" className="rounded-3xl border-2 border-cyan-500/50 bg-[#03060c] p-6 sm:p-8 space-y-6 shadow-[0_0_30px_-5px_rgba(6,182,212,0.25)] font-mono">
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider">
              // CORE_STACK_MATRIX
            </h2>
          </div>
          <span className="text-[10px] text-fuchsia-400 font-bold">[VERIFIED_CORES]</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {normalizedSkills.map((group, idx) => {
            const catName = group.category || 'Stack';
            const items = Array.isArray(group.items) ? group.items : [];
            return (
              <div key={idx} className="p-5 rounded-2xl border border-cyan-500/30 bg-[#070b16] space-y-3 shadow-[0_0_15px_-4px_rgba(6,182,212,0.15)]">
                <div className="text-xs font-bold text-cyan-300 uppercase tracking-widest flex items-center justify-between">
                  <span>[{catName}]</span>
                  <span className="text-fuchsia-400 text-[10px]">0x{idx + 1}A</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((skill, sIdx) => (
                    <span key={sIdx} className="px-2 py-0.5 rounded bg-black border border-cyan-500/40 text-cyan-300 text-[11px] hover:border-fuchsia-500 transition-colors">
                      #{skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // 3. EXECUTIVE LEADERSHIP SKILLS
  if (isExecutive) {
    return (
      <section id="skills" className="rounded-2xl border-t-4 border-t-amber-400 border-x border-b border-slate-800 bg-[#0b101c] p-7 md:p-9 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Strategic Competencies & Technical Mastery</span>
          </h2>
          <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/30 uppercase">
            ENTERPRISE CAPABILITIES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {normalizedSkills.map((group, idx) => {
            const catName = group.category || 'Competency';
            const items = Array.isArray(group.items) ? group.items : [];
            return (
              <div key={idx} className="p-5 rounded-xl border border-slate-800 bg-[#0f1728] space-y-3">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                  <span>{catName}</span>
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((skill, sIdx) => (
                    <span key={sIdx} className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // 4. CLASSIC SIMPLE & MINIMALIST SKILLS
  if (isSimple || isMinimal) {
    return (
      <section id="skills" className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Technical Skills & Areas of Expertise
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {normalizedSkills.map((group, idx) => {
            const catName = group.category || 'Category';
            const items = Array.isArray(group.items) ? group.items : [];
            return (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-2">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                  {catName}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {items.map((skill, sIdx) => (
                    <span key={sIdx} className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  // 5. MODERN STUDIO & DEFAULT SKILLS
  return (
    <section id="skills" key="skills" className={`${themeConfig.cardStyle || ''} space-y-6 relative overflow-hidden`}>
      <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
        <h2 className={`text-xl font-bold flex items-center gap-2.5 ${themeConfig.colors?.textPrimary || (isDark ? 'text-white' : 'text-slate-900')}`}>
          <div className="w-8 h-8 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/20 flex items-center justify-center shrink-0">
            <Code2 className="w-4 h-4" style={{ color: accentColor || undefined }} />
          </div>
          <span>Technical Skills & Core Stack</span>
        </h2>
        <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
          COMPETENCY MATRIX
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {normalizedSkills.map((group, idx) => {
          const catName = group.category || 'Skills';
          const items = Array.isArray(group.items) ? group.items : [];

          return (
            <div 
              key={idx} 
              className={`p-5 rounded-2xl border transition-all duration-200 space-y-3.5 group ${
                isDark 
                  ? 'bg-slate-950/90 border-slate-800/90 hover:border-brand-purple/40 shadow-sm' 
                  : 'bg-white border-slate-200/90 hover:border-brand-purple/40 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.04)] hover:shadow-[0_10px_25px_-5px_rgba(99,102,241,0.08)] hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider font-mono ${
                  isDark ? 'text-slate-200' : 'text-slate-800 group-hover:text-brand-purple transition-colors'
                }`}>
                  {catName}
                </span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isDark 
                    ? 'bg-slate-900 text-slate-400 border-slate-800' 
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {items.length}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {items.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className={`px-2.5 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
                      isDark 
                        ? 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-brand-purple/50 hover:text-white' 
                        : 'bg-slate-50 hover:bg-indigo-50/60 text-slate-700 hover:text-brand-purple border border-slate-200/80 hover:border-brand-purple/40 shadow-2xs'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PortfolioSkills;

import React from 'react';
import { Eye, EyeOff, GripVertical, Layers } from 'lucide-react';

export const PortfolioSectionEditor = ({ hiddenSections = [], onToggleSection }) => {
  const sections = [
    { id: 'hero', name: 'Hero / Headline', description: 'Main intro, avatar, title & tagline' },
    { id: 'about', name: 'About & Bio', description: 'Summary bio and key career highlights' },
    { id: 'skills', name: 'Skills & Expertise', description: 'Technical skills, tools & frameworks' },
    { id: 'experience', name: 'Work Experience', description: 'Roles, companies & employment history' },
    { id: 'projects', name: 'Featured Projects', description: 'Case studies, code repos & accomplishments' },
    { id: 'education', name: 'Education & Certs', description: 'Degrees, institutions & certifications' },
    { id: 'contact', name: 'Contact Info', description: 'Email, location, social links & website' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand-purple" />
          Portfolio Section Layout
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Toggle section visibility on your public portfolio page</p>
      </div>

      <div className="space-y-2.5">
        {sections.map((sec) => {
          const isHidden = hiddenSections.includes(sec.id);
          return (
            <div
              key={sec.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                isHidden
                  ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                <div>
                  <h4 className="text-xs font-bold">{sec.name}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{sec.description}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggleSection && onToggleSection(sec.id)}
                className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  isHidden
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    : 'bg-brand-indigo/10 text-brand-purple hover:bg-brand-indigo/20'
                }`}
              >
                {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="hidden sm:inline">{isHidden ? 'Hidden' : 'Visible'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PortfolioSectionEditor;

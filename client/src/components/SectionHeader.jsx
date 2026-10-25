import React from 'react';

export const SectionHeader = ({ badge, title, description, align = 'left', className = '' }) => {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`max-w-3xl space-y-3 ${alignClass} ${className}`}>
      {badge && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-indigo/10 border border-brand-indigo/30 text-[11px] font-mono font-semibold text-brand-purple">
          {badge}
        </div>
      )}
      <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;

import React from 'react';
import { ExternalLink, Github, Star, Sparkles, ArrowUpRight } from 'lucide-react';

export const ProjectCard = ({ project, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(project)}
      className="group glass-card rounded-2xl overflow-hidden border border-slate-800 hover:border-brand-purple/50 transition-all duration-300 hover:shadow-glow cursor-pointer flex flex-col h-full"
    >
      {/* Card Image Banner */}
      <div className="relative aspect-video overflow-hidden bg-slate-900">
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-80"></div>
        
        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900/80 backdrop-blur-md text-brand-purple border border-slate-700/60">
            {project.category}
          </span>
        </div>

        {/* Featured Star */}
        {project.featured && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30 flex items-center gap-1 backdrop-blur-md">
            <Star className="w-3 h-3 fill-amber-300" />
            Featured
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex flex-col justify-between flex-grow space-y-4">
        
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-white group-hover:text-brand-purple transition-colors flex items-center justify-between">
            {project.title}
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-brand-purple group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {project.summary}
          </p>
        </div>

        {/* Dynamic Metric Badge Pill */}
        {project.metrics && project.metrics.length > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-1.5">
              <span className="text-brand-indigo font-bold">{project.metrics[0].label}:</span>
              <span className="text-white font-bold">{project.metrics[0].value}</span>
            </span>
          </div>
        )}

        {/* Tech Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60">
          {project.tags?.slice(0, 4).map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-slate-800/60 text-slate-400 text-[10px] font-mono border border-slate-700/40"
            >
              {tag}
            </span>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ProjectCard;

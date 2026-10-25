import React, { useEffect } from 'react';
import { X, ExternalLink, Github, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const ProjectModal = ({ project, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="glass-card w-full max-w-2xl rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/80">
          <div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-indigo/10 text-brand-purple border border-brand-indigo/30">
              {project.category}
            </span>
            <h3 id="modal-title" className="text-xl font-bold text-white mt-1">{project.title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-purple"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Project Image */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-video">
            <img
              src={project.thumbnailUrl}
              alt={project.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-300 font-mono uppercase tracking-wider">
              Project Overview
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Metrics Highlights Grid */}
          {project.metrics && project.metrics.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-300 font-mono uppercase tracking-wider">
                Key Performance Metrics
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {project.metrics.map((m, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
                    <div className="text-xs text-slate-400 font-medium">{m.label}</div>
                    <div className="text-lg font-bold text-white font-mono mt-0.5">{m.value}</div>
                    {m.change && <div className="text-[10px] text-emerald-400 font-mono">{m.change}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tech Stack Tags */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-300 font-mono uppercase tracking-wider">
              Technologies Used
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-800">
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-indigo to-brand-purple flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <ExternalLink className="w-4 h-4" /> Live Application
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 border border-slate-700 flex items-center gap-2 hover:bg-slate-700 transition-colors"
              >
                <Github className="w-4 h-4" /> Source Code
              </a>
            )}
            {project.articleUrl && (
              <a
                href={project.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 flex items-center gap-2 hover:bg-slate-800 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-orange-400" /> Read Case Study
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectModal;

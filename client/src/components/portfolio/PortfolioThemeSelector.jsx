import React, { useState } from 'react';
import { Palette, Check, Sparkles, Terminal, Shield, Feather, Layout, Zap, Award } from 'lucide-react';
import { THEMES } from './themeConfig';

export const PortfolioThemeSelector = ({
  selectedTheme = 'modern',
  onSelectTheme,
  primaryColor = '#6366f1',
  onChangeColor,
}) => {
  const [activeCategory, setActiveCategory] = useState('ALL');

  const themesList = [
    {
      id: 'simple',
      name: '1. Classic Simple',
      category: 'simple',
      description: 'Clean resume-inspired structure, subtle borders, balanced spacing, distraction-free reading.',
      bgClass: 'bg-slate-900/90 border-slate-700/80',
      badge: THEMES.simple.badge,
      icon: Feather,
    },
    {
      id: 'minimal',
      name: '2. Minimalist',
      category: 'simple',
      description: 'Clean typography, fine line borders, compact spacing, monochrome focus.',
      bgClass: 'bg-slate-950 border-slate-800',
      badge: THEMES.minimal.badge,
      icon: Layout,
    },
    {
      id: 'modern',
      name: '3. Modern Studio',
      category: 'modern',
      description: 'Vibrant indigo accents, balanced cards, pill buttons, split hero.',
      bgClass: 'bg-slate-900 border-indigo-900/50',
      badge: THEMES.modern.badge,
      icon: Sparkles,
    },
    {
      id: 'developer',
      name: '4. Developer Terminal',
      category: 'developer',
      description: 'Monospace terminal vibes, emerald & cyan prompt badges, dark command center aesthetic.',
      bgClass: 'bg-[#090d16] border-emerald-900/50',
      badge: THEMES.developer.badge,
      icon: Terminal,
    },
    {
      id: 'creative',
      name: '5. Creative Showcase',
      category: 'modern',
      description: 'Generous padding, rounded cards, purple highlights, banner hero.',
      bgClass: 'bg-purple-950/40 border-purple-800/40',
      badge: THEMES.creative.badge,
      icon: Zap,
    },
    {
      id: 'executive',
      name: '6. Executive Leadership',
      category: 'executive',
      description: 'Midnight navy canvas, gold accents, top border highlight cards.',
      bgClass: 'bg-[#0a0e17] border-amber-900/40',
      badge: THEMES.executive.badge,
      icon: Shield,
    },
    {
      id: 'cyberpunk',
      name: '7. Cyberpunk Neon',
      category: 'modern',
      description: 'Electric cyan and magenta glows, pitch black canvas, high-tech grid styling.',
      bgClass: 'bg-black border-cyan-800/50',
      badge: THEMES.cyberpunk.badge,
      icon: Zap,
    },
    {
      id: 'elegance',
      name: '8. Luxury Elegance',
      category: 'executive',
      description: 'Deep charcoal canvas, rose gold accents, soft rounded cards, refined editorial magazine feel.',
      bgClass: 'bg-[#0d0f14] border-rose-900/40',
      badge: THEMES.elegance.badge,
      icon: Award,
    },
  ];

  const colorOptions = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  const normalizedSelected = themesList.some(t => t.id === selectedTheme)
    ? selectedTheme
    : (selectedTheme.includes('simple') || selectedTheme.includes('classic'))
    ? 'simple'
    : selectedTheme.includes('minimal')
    ? 'minimal'
    : selectedTheme.includes('developer') || selectedTheme.includes('terminal')
    ? 'developer'
    : selectedTheme.includes('cyberpunk')
    ? 'cyberpunk'
    : selectedTheme.includes('elegance')
    ? 'elegance'
    : selectedTheme.includes('creative')
    ? 'creative'
    : selectedTheme.includes('executive')
    ? 'executive'
    : 'modern';

  const filteredThemes = activeCategory === 'ALL'
    ? themesList
    : themesList.filter(t => t.category === activeCategory.toLowerCase());

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-brand-purple" />
            Dynamic Portfolio Templates & Themes
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose from Simple to Ultra-Modern resume templates with 1-click live preview
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold">
          {['ALL', 'SIMPLE', 'MODERN', 'DEVELOPER', 'EXECUTIVE'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                activeCategory === cat
                  ? 'bg-brand-purple text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredThemes.map((t) => {
          const isSelected = normalizedSelected === t.id;
          const Icon = t.icon;

          return (
            <div
              key={t.id}
              onClick={() => onSelectTheme(t.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                t.bgClass
              } ${
                isSelected
                  ? 'ring-2 ring-brand-purple border-brand-purple shadow-lg scale-[1.01]'
                  : 'hover:border-slate-500 hover:scale-[1.005]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-brand-purple" />
                  </div>
                  {t.name}
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/10 text-white font-semibold">
                  {t.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed mb-1 pr-6">{t.description}</p>

              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-brand-purple text-white flex items-center justify-center shadow-md">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Primary Accent Picker */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">Primary Accent Color</span>
          <span className="text-[10px] text-slate-400">Customizes badges, buttons & borders across all templates</span>
        </div>
        <div className="flex items-center gap-2">
          {colorOptions.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChangeColor && onChangeColor(c)}
              className={`w-6 h-6 rounded-full transition-transform ${
                primaryColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioThemeSelector;

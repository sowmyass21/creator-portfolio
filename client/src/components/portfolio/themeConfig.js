/**
 * Reusable Theme & Template Configuration for Dynamic Portfolio System
 * Comprehensive collection spanning from Clean Simple to Ultra-Modern, Developer, and Executive.
 * Fully supports Dark Mode and Light Mode with vibrant aesthetics, dual-layer shadows,
 * crisp borders, and radiant ambient contrast.
 */

export const THEMES = {
  simple: {
    id: 'simple',
    name: 'Classic Simple',
    badge: 'Clean & Classic',
    description: 'Clean resume-inspired structure, subtle borders, balanced spacing, distraction-free reading.',
    fontFamily: 'font-sans',
    category: 'simple',
    sectionArrangement: ['hero', 'about', 'skills', 'showcase', 'education', 'achievements', 'contact'],
    heroLayout: 'centered',
    dark: {
      containerClass: 'bg-slate-950 text-slate-100 font-sans',
      spacingClass: 'space-y-8 p-6 md:p-10 max-w-5xl mx-auto',
      colors: {
        bg: 'bg-slate-950',
        cardBg: 'bg-slate-900/60',
        border: 'border-slate-800',
        accent: 'text-slate-300',
        badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
      },
      buttonStyle: 'px-5 py-2 rounded-xl bg-slate-200 text-slate-900 hover:bg-white text-xs font-semibold transition-all shadow-sm',
      cardStyle: 'p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-sm transition-all',
      navStyle: 'flex items-center gap-4 text-xs font-medium text-slate-400',
    },
    light: {
      containerClass: 'bg-[#fafafa] text-slate-800 font-sans',
      spacingClass: 'space-y-8 p-6 md:p-10 max-w-5xl mx-auto',
      colors: {
        bg: 'bg-[#fafafa]',
        cardBg: 'bg-white',
        border: 'border-slate-200',
        accent: 'text-slate-700',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        textPrimary: 'text-slate-900',
        textSecondary: 'text-slate-600',
        textMuted: 'text-slate-500',
      },
      buttonStyle: 'px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-all shadow-sm',
      cardStyle: 'p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] transition-all',
      navStyle: 'flex items-center gap-4 text-xs font-medium text-slate-600',
    }
  },

  minimal: {
    id: 'minimal',
    name: 'Minimalist',
    badge: 'Monochrome',
    description: 'Crisp typography, fine line borders, compact spacing, ultra-clean monochrome precision.',
    fontFamily: 'font-sans',
    category: 'simple',
    sectionArrangement: ['hero', 'about', 'skills', 'showcase', 'education', 'achievements', 'contact'],
    heroLayout: 'centered',
    dark: {
      containerClass: 'bg-slate-950 text-slate-100 font-sans',
      spacingClass: 'space-y-8 p-6 md:p-10 max-w-6xl mx-auto',
      colors: {
        bg: 'bg-slate-950',
        cardBg: 'bg-slate-900/70',
        border: 'border-slate-800/90',
        accent: 'text-slate-200',
        badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
      },
      buttonStyle: 'px-5 py-2.5 rounded-xl bg-slate-100 text-slate-900 hover:bg-white text-xs font-semibold transition-all shadow-md',
      cardStyle: 'p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800/90 shadow-xl backdrop-blur-md',
      navStyle: 'flex items-center gap-4 text-xs font-medium text-slate-400',
    },
    light: {
      containerClass: 'bg-slate-100/70 text-slate-900 font-sans',
      spacingClass: 'space-y-8 p-6 md:p-10 max-w-6xl mx-auto',
      colors: {
        bg: 'bg-slate-100/70',
        cardBg: 'bg-white',
        border: 'border-slate-200/90',
        accent: 'text-slate-900',
        badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
        textPrimary: 'text-slate-900',
        textSecondary: 'text-slate-700',
        textMuted: 'text-slate-500',
      },
      buttonStyle: 'px-5 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-all shadow-md',
      cardStyle: 'p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_-5px_rgba(0,0,0,0.09)] transition-all',
      navStyle: 'flex items-center gap-4 text-xs font-medium text-slate-600',
    }
  },

  modern: {
    id: 'modern',
    name: 'Modern Studio',
    badge: 'Popular',
    description: 'Vibrant indigo accents, balanced cards, pill buttons, responsive split hero layout.',
    fontFamily: 'font-sans',
    category: 'modern',
    sectionArrangement: ['hero', 'about', 'skills', 'showcase', 'education', 'achievements', 'contact'],
    heroLayout: 'split',
    dark: {
      containerClass: 'bg-slate-950 text-white font-sans',
      spacingClass: 'space-y-10 p-6 md:p-10 max-w-6xl mx-auto',
      colors: {
        bg: 'bg-slate-950',
        cardBg: 'bg-slate-900/90',
        border: 'border-slate-800',
        accent: 'text-brand-purple',
        badgeBg: 'bg-brand-purple/10 text-brand-purple border-brand-purple/20',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
      },
      buttonStyle: 'px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-pink text-white text-xs font-bold shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-all',
      cardStyle: 'p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl hover:border-slate-700 transition-all',
      navStyle: 'flex items-center gap-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold',
    },
    light: {
      containerClass: 'bg-slate-50/90 text-slate-900 font-sans',
      spacingClass: 'space-y-10 p-6 md:p-10 max-w-6xl mx-auto',
      colors: {
        bg: 'bg-slate-50/90',
        cardBg: 'bg-white',
        border: 'border-slate-200/90',
        accent: 'text-brand-purple',
        badgeBg: 'bg-indigo-50 text-brand-purple border-indigo-200/80',
        textPrimary: 'text-slate-900',
        textSecondary: 'text-slate-700',
        textMuted: 'text-slate-500',
      },
      buttonStyle: 'px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-pink text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:scale-[1.02] transition-all',
      cardStyle: 'p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_35px_-5px_rgba(99,102,241,0.12)] hover:border-brand-purple/40 transition-all duration-300',
      navStyle: 'flex items-center gap-2 p-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold shadow-sm',
    }
  },

  developer: {
    id: 'developer',
    name: 'Developer Terminal',
    badge: 'Code First',
    description: 'Monospace terminal vibes, emerald & cyan prompt badges, dark command center aesthetic.',
    fontFamily: 'font-mono',
    category: 'developer',
    sectionArrangement: ['hero', 'about', 'skills', 'showcase', 'education', 'achievements', 'contact'],
    heroLayout: 'terminal',
    dark: {
      containerClass: 'bg-[#090d16] text-emerald-300 font-mono',
      spacingClass: 'space-y-10 p-6 md:p-10 max-w-6xl mx-auto',
      colors: {
        bg: 'bg-[#090d16]',
        cardBg: 'bg-[#0c1220]/95',
        border: 'border-emerald-900/40',
        accent: 'text-emerald-400',
        badgeBg: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/60',
        textPrimary: 'text-emerald-100',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
      },
      buttonStyle: 'px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/60 text-emerald-300 hover:bg-emerald-500/30 text-xs font-mono font-bold transition-all shadow-md',
      cardStyle: 'p-6 sm:p-8 rounded-2xl bg-[#0c1220]/95 border border-emerald-900/50 shadow-2xl backdrop-blur-md relative',
      navStyle: 'flex items-center gap-3 p-2 rounded-xl bg-black/60 border border-emerald-900/40 text-xs font-mono text-emerald-400',
    },
    light: {
      containerClass: 'bg-slate-50 text-slate-800 font-mono',
      spacingClass: 'space-y-10 p-6 md:p-10 max-w-6xl mx-auto',
      colors: {
        bg: 'bg-slate-50',
        cardBg: 'bg-white',
        border: 'border-slate-300',
        accent: 'text-emerald-600',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        textPrimary: 'text-slate-900',
        textSecondary: 'text-slate-700',
        textMuted: 'text-slate-500',
      },
      buttonStyle: 'px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-mono font-bold transition-all shadow-sm',
      cardStyle: 'p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] hover:border-emerald-500/40 transition-all',
      navStyle: 'flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-emerald-700 shadow-sm',
    }
  },

  creative: {
    id: 'creative',
    name: 'Creative Showcase',
    badge: 'Expressive',
    description: 'Generous padding, purple highlights, expressive rounded cards, banner hero layout.',
    fontFamily: 'font-sans',
    category: 'modern',
    sectionArrangement: ['hero', 'about', 'showcase', 'skills', 'education', 'achievements', 'contact'],
    heroLayout: 'banner',
    dark: {
      containerClass: 'bg-slate-950 text-slate-100 font-sans',
      spacingClass: 'space-y-12 p-8 md:p-12 max-w-6xl mx-auto',
      colors: {
        bg: 'bg-slate-950',
        cardBg: 'bg-purple-950/20',
        border: 'border-purple-800/30',
        accent: 'text-purple-400',
        badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
        textPrimary: 'text-white',
        textSecondary: 'text-purple-200',
        textMuted: 'text-purple-300/70',
      },
      buttonStyle: 'px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold hover:scale-105 transition-all shadow-lg shadow-purple-900/30',
      cardStyle: 'p-7 sm:p-9 rounded-3xl bg-purple-950/20 border border-purple-800/30 shadow-2xl backdrop-blur-sm',
      navStyle: 'flex items-center gap-3 px-4 py-2 rounded-2xl bg-purple-950/40 border border-purple-800/30 text-xs font-semibold text-purple-300',
    },
    light: {
      containerClass: 'bg-purple-50/40 text-slate-900 font-sans',
      spacingClass: 'space-y-12 p-8 md:p-12 max-w-6xl mx-auto',
      colors: {
        bg: 'bg-purple-50/40',
        cardBg: 'bg-white',
        border: 'border-purple-200/90',
        accent: 'text-purple-600',
        badgeBg: 'bg-purple-100/80 text-purple-800 border-purple-200',
        textPrimary: 'text-slate-900',
        textSecondary: 'text-slate-700',
        textMuted: 'text-purple-800/60',
      },
      buttonStyle: 'px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold hover:scale-105 transition-all shadow-md',
      cardStyle: 'p-7 sm:p-9 rounded-3xl bg-white border border-purple-200/90 shadow-[0_4px_30px_-5px_rgba(147,51,234,0.08)] hover:shadow-[0_12px_40px_-5px_rgba(147,51,234,0.15)] transition-all',
      navStyle: 'flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-purple-200 text-xs font-semibold text-purple-800 shadow-sm',
    }
  },

  executive: {
    id: 'executive',
    name: 'Executive Leadership',
    badge: 'Authoritative',
    description: 'Midnight navy canvas, gold accents, top border highlight cards, structured corporate presence.',
    fontFamily: 'font-serif',
    category: 'executive',
    sectionArrangement: ['hero', 'about', 'showcase', 'education', 'skills', 'achievements', 'contact'],
    heroLayout: 'executive',
    dark: {
      containerClass: 'bg-[#0a0e17] text-slate-100 font-sans',
      spacingClass: 'space-y-10 p-8 md:p-10 max-w-6xl mx-auto',
      colors: {
        bg: 'bg-[#0a0e17]',
        cardBg: 'bg-[#0f1523]',
        border: 'border-slate-800',
        accent: 'text-amber-400',
        badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
      },
      buttonStyle: 'px-6 py-2.5 rounded-xl bg-slate-800 border border-amber-500/40 text-amber-200 text-xs font-semibold hover:bg-slate-700 transition-all shadow-md',
      cardStyle: 'p-7 sm:p-9 rounded-2xl bg-[#0f1523] border-t-4 border-t-amber-400 border-x border-b border-slate-800 shadow-2xl',
      navStyle: 'flex items-center gap-6 border-b border-slate-800 pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400',
    },
    light: {
      containerClass: 'bg-slate-100/90 text-slate-900 font-sans',
      spacingClass: 'space-y-10 p-8 md:p-10 max-w-6xl mx-auto',
      colors: {
        bg: 'bg-slate-100/90',
        cardBg: 'bg-white',
        border: 'border-slate-200/90',
        accent: 'text-amber-600',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        textPrimary: 'text-slate-900',
        textSecondary: 'text-slate-700',
        textMuted: 'text-slate-500',
      },
      buttonStyle: 'px-6 py-2.5 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-slate-800 transition-all shadow-md',
      cardStyle: 'p-7 sm:p-9 rounded-2xl bg-white border-t-4 border-t-amber-500 border-x border-b border-slate-200/90 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_35px_-5px_rgba(217,119,6,0.12)] transition-all',
      navStyle: 'flex items-center gap-6 border-b border-slate-300 pb-3 text-xs font-semibold uppercase tracking-wider text-slate-700',
    }
  },

  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    badge: 'Futuristic',
    description: 'Electric cyan and magenta glows, pitch black canvas, high-tech grid styling, bold futurism.',
    fontFamily: 'font-mono',
    category: 'modern',
    sectionArrangement: ['hero', 'skills', 'showcase', 'about', 'education', 'achievements', 'contact'],
    heroLayout: 'banner',
    dark: {
      containerClass: 'bg-black text-cyan-200 font-mono',
      spacingClass: 'space-y-10 p-6 md:p-10 max-w-6xl mx-auto',
      colors: {
        bg: 'bg-black',
        cardBg: 'bg-[#05070d]/90',
        border: 'border-cyan-500/40',
        accent: 'text-cyan-400',
        badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50',
        textPrimary: 'text-white',
        textSecondary: 'text-cyan-100',
        textMuted: 'text-cyan-400/60',
      },
      buttonStyle: 'px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/30 hover:scale-[1.03] transition-all',
      cardStyle: 'p-6 sm:p-8 rounded-2xl bg-[#05070d]/90 border border-cyan-500/40 shadow-[0_0_25px_-5px_rgba(6,182,212,0.15)] hover:border-fuchsia-500/60 transition-all duration-300',
      navStyle: 'flex items-center gap-2 p-1.5 rounded-xl bg-black border border-cyan-500/40 text-xs font-mono text-cyan-300',
    },
    light: {
      containerClass: 'bg-slate-100 text-slate-900 font-mono',
      spacingClass: 'space-y-10 p-6 md:p-10 max-w-6xl mx-auto',
      colors: {
        bg: 'bg-slate-100',
        cardBg: 'bg-white',
        border: 'border-cyan-300',
        accent: 'text-cyan-700',
        badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        textPrimary: 'text-slate-900',
        textSecondary: 'text-slate-700',
        textMuted: 'text-slate-500',
      },
      buttonStyle: 'px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-fuchsia-600 text-white font-extrabold text-xs shadow-md hover:scale-[1.02] transition-all',
      cardStyle: 'p-6 sm:p-8 rounded-2xl bg-white border border-cyan-200 shadow-[0_4px_20px_-4px_rgba(6,182,212,0.12)] hover:border-cyan-400 transition-all',
      navStyle: 'flex items-center gap-2 p-1.5 rounded-xl bg-white border border-cyan-200 text-xs font-mono text-cyan-800 shadow-sm',
    }
  },

  elegance: {
    id: 'elegance',
    name: 'Luxury Elegance',
    badge: 'Premium Editorial',
    description: 'Deep charcoal canvas, rose gold accents, soft rounded cards, refined editorial magazine feel.',
    fontFamily: 'font-serif',
    category: 'executive',
    sectionArrangement: ['hero', 'about', 'skills', 'showcase', 'education', 'achievements', 'contact'],
    heroLayout: 'split',
    dark: {
      containerClass: 'bg-[#0d0f14] text-slate-100 font-serif',
      spacingClass: 'space-y-10 p-6 md:p-10 max-w-6xl mx-auto',
      colors: {
        bg: 'bg-[#0d0f14]',
        cardBg: 'bg-[#141824]/85',
        border: 'border-rose-900/30',
        accent: 'text-rose-400',
        badgeBg: 'bg-rose-950/50 text-rose-300 border-rose-800/40',
        textPrimary: 'text-white',
        textSecondary: 'text-slate-300',
        textMuted: 'text-slate-400',
      },
      buttonStyle: 'px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 text-white text-xs font-semibold shadow-lg shadow-rose-900/20 hover:scale-[1.02] transition-all',
      cardStyle: 'p-7 sm:p-9 rounded-3xl bg-[#141824]/85 border border-rose-900/30 shadow-2xl backdrop-blur-md hover:border-rose-700/50 transition-all',
      navStyle: 'flex items-center gap-3 p-2 rounded-2xl bg-[#0d0f14] border border-rose-900/30 text-xs font-semibold text-rose-300',
    },
    light: {
      containerClass: 'bg-[#fcfaf7] text-slate-900 font-serif',
      spacingClass: 'space-y-10 p-6 md:p-10 max-w-6xl mx-auto',
      colors: {
        bg: 'bg-[#fcfaf7]',
        cardBg: 'bg-white',
        border: 'border-rose-100',
        accent: 'text-rose-700',
        badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
        textPrimary: 'text-slate-900',
        textSecondary: 'text-slate-700',
        textMuted: 'text-slate-500',
      },
      buttonStyle: 'px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-amber-700 text-white text-xs font-semibold shadow-md hover:scale-[1.02] transition-all',
      cardStyle: 'p-7 sm:p-9 rounded-3xl bg-white border border-rose-100 shadow-[0_4px_25px_-5px_rgba(244,63,94,0.06)] hover:shadow-[0_10px_35px_-5px_rgba(244,63,94,0.12)] transition-all',
      navStyle: 'flex items-center gap-3 p-2 rounded-2xl bg-white border border-rose-100 text-xs font-semibold text-rose-800 shadow-sm',
    }
  },
};

/**
 * Maps theme ID and colorMode ('dark' | 'light') to resolved theme configuration
 */
export const getThemeConfig = (themeKey = 'modern', colorMode = 'dark') => {
  const normalizedKey = themeKey ? themeKey.toLowerCase().trim() : 'modern';
  let baseTheme = THEMES.modern;

  if (normalizedKey.includes('simple') || normalizedKey.includes('classic')) baseTheme = THEMES.simple;
  else if (normalizedKey.includes('minimal')) baseTheme = THEMES.minimal;
  else if (normalizedKey.includes('developer') || normalizedKey.includes('terminal') || normalizedKey.includes('code')) baseTheme = THEMES.developer;
  else if (normalizedKey.includes('cyberpunk') || normalizedKey.includes('neon')) baseTheme = THEMES.cyberpunk;
  else if (normalizedKey.includes('elegance') || normalizedKey.includes('luxury')) baseTheme = THEMES.elegance;
  else if (normalizedKey.includes('creative')) baseTheme = THEMES.creative;
  else if (normalizedKey.includes('executive')) baseTheme = THEMES.executive;

  const mode = colorMode === 'light' ? 'light' : 'dark';
  const modeStyles = baseTheme[mode] || baseTheme.dark;

  return {
    id: baseTheme.id,
    name: baseTheme.name,
    badge: baseTheme.badge,
    description: baseTheme.description,
    category: baseTheme.category,
    fontFamily: baseTheme.fontFamily,
    sectionArrangement: baseTheme.sectionArrangement,
    heroLayout: baseTheme.heroLayout,
    colorMode: mode,
    isDark: mode === 'dark',
    ...modeStyles
  };
};

export default {
  THEMES,
  getThemeConfig,
};

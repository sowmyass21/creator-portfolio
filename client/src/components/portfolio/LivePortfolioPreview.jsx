import React, { useState } from 'react';
import PortfolioRenderer from './PortfolioRenderer';
import { Monitor, Tablet, Smartphone, Sparkles, Globe, Sun, Moon, ExternalLink } from 'lucide-react';

/**
 * LivePortfolioPreview Component
 * Dynamically renders the live interactive portfolio using PortfolioRenderer.
 * Supports Desktop (Full Width), Tablet (768px Centered), and Mobile (375px Centered)
 * responsive CSS reflow with interactive internal scrolling and Light/Dark Mode toggle.
 */
export const LivePortfolioPreview = ({
  portfolio,
  portfolioData,
  data,
  previewConfig = {},
  theme,
  customization,
  viewport: viewportProp = 'desktop',
  colorMode: colorModeProp = 'dark',
  onColorModeChange,
}) => {
  const [currentViewport, setCurrentViewport] = useState(viewportProp);
  const [currentColorMode, setCurrentColorMode] = useState(colorModeProp);

  const activePortfolio = portfolio || portfolioData || data;
  const activeCustomization = customization || previewConfig || {};
  const activeTheme = theme || activeCustomization.theme || activePortfolio?.theme || 'modern';
  const slug = activePortfolio?.slug || 'creator';

  const toggleColorMode = () => {
    const newMode = currentColorMode === 'dark' ? 'light' : 'dark';
    setCurrentColorMode(newMode);
    if (onColorModeChange) onColorModeChange(newMode);
  };

  const isDark = currentColorMode === 'dark';

  const renderContent = () => (
    <PortfolioRenderer
      portfolio={activePortfolio}
      theme={activeTheme}
      customization={{
        ...activeCustomization,
        colorMode: currentColorMode,
      }}
    />
  );

  return (
    <div className="w-full space-y-3">
      {/* Interactive Preview Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
        
        {/* Device Viewport Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setCurrentViewport('desktop')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              currentViewport === 'desktop'
                ? 'bg-brand-purple text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Desktop</span>
          </button>

          <button
            onClick={() => setCurrentViewport('tablet')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              currentViewport === 'tablet'
                ? 'bg-brand-purple text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet (768px)</span>
          </button>

          <button
            onClick={() => setCurrentViewport('mobile')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              currentViewport === 'mobile'
                ? 'bg-brand-purple text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile (375px)</span>
          </button>
        </div>

        {/* Live URL Pill & Controls */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleColorMode}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-amber-400 hover:bg-slate-800'
                : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm'
            }`}
            title="Toggle Light / Dark Mode in Preview"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="text-white text-[11px]">Dark Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-brand-purple" />
                <span className="text-slate-900 text-[11px]">Light Mode</span>
              </>
            )}
          </button>

          {/* External Link */}
          <a
            href={`/p/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-brand-purple transition-colors"
            title="Open in new window"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Frame Canvas */}
      {currentViewport === 'tablet' ? (
        <div className="w-full flex justify-center py-4 bg-slate-950/40 rounded-2xl">
          <div className={`w-[768px] max-w-full rounded-[36px] border-[12px] shadow-2xl overflow-hidden relative my-2 transition-colors duration-300 ${
            isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-300 bg-slate-100'
          }`}>
            {/* Tablet Header */}
            <div className={`px-4 py-2.5 text-center border-b flex items-center justify-between ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'
            }`}>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              </div>
              <div className={`flex items-center gap-1.5 text-[10px] font-mono px-3 py-1 rounded-full border ${
                isDark ? 'text-slate-400 bg-slate-950 border-slate-800' : 'text-slate-700 bg-white border-slate-300 shadow-sm'
              }`}>
                <Globe className="w-3 h-3 text-brand-purple shrink-0" />
                <span>http://localhost:5173/p/{slug}</span>
              </div>
              <span className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>Tablet (768px)</span>
            </div>

            {/* Interactive Scrollable Canvas */}
            <div className={`w-full h-[650px] overflow-y-auto custom-scrollbar ${isDark ? 'bg-slate-950' : 'bg-[#f8fafc]'}`}>
              {renderContent()}
            </div>
          </div>
        </div>
      ) : currentViewport === 'mobile' ? (
        <div className="w-full flex justify-center py-4 bg-slate-950/40 rounded-2xl">
          <div className={`w-[375px] max-w-full rounded-[44px] border-[14px] shadow-2xl overflow-hidden relative my-2 transition-colors duration-300 ${
            isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-300 bg-slate-100'
          }`}>
            {/* Mobile Speaker Notch */}
            <div className={`py-3 text-center border-b flex items-center justify-center ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'
            }`}>
              <div className={`w-16 h-3 rounded-full border flex items-center justify-center ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'
              }`}>
                <div className="w-2 h-2 rounded-full bg-slate-500"></div>
              </div>
            </div>

            {/* Interactive Scrollable Canvas */}
            <div className={`w-full h-[600px] overflow-y-auto custom-scrollbar ${isDark ? 'bg-slate-950' : 'bg-[#f8fafc]'}`}>
              {renderContent()}
            </div>

            {/* Mobile Home Bar */}
            <div className={`py-2 text-center flex justify-center border-t ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-200 border-slate-300'
            }`}>
              <div className="w-28 h-1 rounded-full bg-slate-500"></div>
            </div>
          </div>
        </div>
      ) : (
        /* Desktop View (Default) */
        <div className={`w-full rounded-2xl border shadow-2xl overflow-hidden transition-colors duration-300 ${
          isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
        }`}>
          {/* Desktop Browser Bar */}
          <div className={`px-4 py-3 flex items-center justify-between gap-4 border-b ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            </div>
            <div className={`flex-1 max-w-xl mx-auto px-4 py-1.5 rounded-xl border text-[11px] font-mono truncate text-center flex items-center justify-center gap-2 ${
              isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-300 text-slate-700 shadow-sm'
            }`}>
              <Globe className="w-3.5 h-3.5 text-brand-purple shrink-0" />
              <span className="truncate">http://localhost:5173/p/{slug}</span>
            </div>
            <div className={`text-[10px] font-mono hidden sm:block ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              Desktop View ({isDark ? 'Dark' : 'Light'})
            </div>
          </div>

          {/* Interactive Scrollable Canvas */}
          <div className={`w-full min-h-[650px] max-h-[750px] overflow-y-auto custom-scrollbar ${isDark ? 'bg-slate-950' : 'bg-[#f8fafc]'}`}>
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default LivePortfolioPreview;

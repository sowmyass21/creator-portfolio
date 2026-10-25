import React from 'react';
import { Sparkles } from 'lucide-react';
import { getThemeConfig } from './themeConfig';
import PortfolioThemeProvider from './PortfolioThemeProvider';
import PortfolioSectionRenderer from './PortfolioSectionRenderer';

export const PortfolioRenderer = ({
  portfolio,
  portfolioData,
  data,
  theme: themeProp,
  customization: customizationProp,
}) => {
  const payload = portfolio || portfolioData || data;

  if (!payload) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 text-brand-purple flex items-center justify-center">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
        <div className="space-y-1 max-w-sm">
          <h3 className="text-sm font-bold text-white">No Portfolio Data Provided</h3>
          <p className="text-xs text-slate-400">
            Please upload a resume or generate your portfolio to populate live preview sections.
          </p>
        </div>
      </div>
    );
  }

  // Extract sections, customization & theme
  const meta = payload.meta || {};
  const customization = customizationProp || payload.customization || {};
  const sections = payload.sections || payload;

  const themeKey = themeProp || customization.theme || meta.theme || payload.theme || 'modern';
  const colorMode = customization.colorMode || 'dark';
  const themeConfig = getThemeConfig(themeKey, colorMode);

  // Merge projects, experience (internships), and certifications into a unified showcase section
  const mergedSectionOrder = React.useMemo(() => {
    const raw = Array.isArray(customization.sectionOrder) && customization.sectionOrder.length > 0
      ? customization.sectionOrder
      : themeConfig.sectionArrangement;

    const result = [];
    let showcaseAdded = false;

    raw.forEach((key) => {
      if (['projects', 'experience', 'certifications', 'showcase', 'works', 'projects_experience_certs'].includes(key)) {
        if (!showcaseAdded) {
          result.push('showcase');
          showcaseAdded = true;
        }
      } else {
        result.push(key);
      }
    });

    if (!showcaseAdded) {
      result.push('showcase');
    }

    return result;
  }, [customization.sectionOrder, themeConfig.sectionArrangement]);

  const fontStyle = customization.fontStyle || 'Inter';

  return (
    <PortfolioThemeProvider theme={themeKey} colorMode={colorMode} customization={customization}>
      <div 
        className={`w-full min-h-screen relative transition-colors duration-300 ${
          colorMode === 'light' ? 'bg-[#f8fafc] text-slate-900' : 'bg-[#090d16] text-white'
        }`}
        style={{
          fontFamily: fontStyle ? `'${fontStyle}', sans-serif` : undefined,
        }}
      >
        {/* Subtle Ambient Background Lighting Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            background: colorMode === 'light'
              ? 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.08) 0%, rgba(248, 250, 252, 0) 70%)'
              : 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, rgba(9, 13, 22, 0) 75%)',
          }}
        />

        {/* Portfolio Content Container */}
        <div className={`relative z-10 w-full ${themeConfig.containerClass} ${themeConfig.spacingClass}`}>
          {mergedSectionOrder.map((sectionKey) => (
            <PortfolioSectionRenderer
              key={sectionKey}
              sectionKey={sectionKey}
              payload={payload}
              sections={sections}
              themeConfig={themeConfig}
              customization={customization}
            />
          ))}
        </div>
      </div>
    </PortfolioThemeProvider>
  );
};

export default PortfolioRenderer;

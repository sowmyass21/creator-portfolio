import React, { createContext, useContext, useState, useEffect } from 'react';
import { getThemeConfig } from './themeConfig';

const PortfolioThemeContext = createContext({
  themeConfig: getThemeConfig('modern', 'dark'),
  themeKey: 'modern',
  colorMode: 'dark',
  isDark: true,
  toggleColorMode: () => {},
  customization: {},
});

export const usePortfolioTheme = () => useContext(PortfolioThemeContext);

export const PortfolioThemeProvider = ({
  theme = 'modern',
  colorMode: colorModeProp,
  customization = {},
  children,
}) => {
  const initialMode = colorModeProp || customization.colorMode || 'dark';
  const [colorMode, setColorMode] = useState(initialMode);

  useEffect(() => {
    if (colorModeProp) {
      setColorMode(colorModeProp);
    }
  }, [colorModeProp]);

  const toggleColorMode = () => {
    setColorMode(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const themeConfig = getThemeConfig(theme, colorMode);

  const value = {
    themeConfig,
    themeKey: theme,
    colorMode,
    setColorMode,
    isDark: colorMode === 'dark',
    toggleColorMode,
    customization,
  };

  return (
    <PortfolioThemeContext.Provider value={value}>
      {children}
    </PortfolioThemeContext.Provider>
  );
};

export default PortfolioThemeProvider;

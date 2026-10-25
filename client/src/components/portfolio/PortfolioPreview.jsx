import React from 'react';
import PortfolioRenderer from './PortfolioRenderer';

export const PortfolioPreview = ({ data = {}, theme }) => {
  const mergedData = {
    ...data,
    meta: {
      ...(data.meta || {}),
      theme: theme || data.meta?.theme || data.theme || 'modern-minimal',
    },
  };

  return <PortfolioRenderer portfolioData={mergedData} />;
};

export default PortfolioPreview;

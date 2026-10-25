import React from 'react';
import ProjectsSection from '../components/ProjectsSection';
import MetricsSection from '../components/MetricsSection';

export const PortfolioPage = () => {
  return (
    <div className="py-8 space-y-12">
      <ProjectsSection />
      <MetricsSection />
    </div>
  );
};

export default PortfolioPage;

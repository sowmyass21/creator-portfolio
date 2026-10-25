import { usePortfolio } from '../context/PortfolioContext';

export const useProjects = () => {
  const { projects, selectedCategory, setSelectedCategory, loading, error } = usePortfolio();
  
  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  return { 
    projects: filteredProjects, 
    allProjects: projects,
    selectedCategory, 
    setSelectedCategory, 
    loading, 
    error 
  };
};

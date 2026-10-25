import { usePortfolio } from '../context/PortfolioContext';

export const useMetrics = () => {
  const { metrics, loading, error, refreshData } = usePortfolio();
  return { 
    summary: metrics?.summary || null, 
    platforms: metrics?.platforms || [], 
    loading, 
    error, 
    refetch: refreshData 
  };
};

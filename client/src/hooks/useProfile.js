import { usePortfolio } from '../context/PortfolioContext';

export const useProfile = () => {
  const { profile, loading, error, refreshData } = usePortfolio();
  return { profile, loading, error, refetch: refreshData };
};

import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useAnalytics = (initialRange = '30d', initialPlatform = 'All') => {
  const [range, setRange] = useState(initialRange);
  const [selectedPlatform, setSelectedPlatform] = useState(initialPlatform);
  const [overview, setOverview] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const platParam = (selectedPlatform && selectedPlatform !== 'All') ? selectedPlatform : null;
      const [overviewRes, historyRes] = await Promise.all([
        apiService.getAnalyticsOverview().catch(err => null),
        apiService.getAnalyticsHistory(range, platParam).catch(err => null)
      ]);

      if (overviewRes && overviewRes.data) {
        setOverview(overviewRes.data);
      }
      if (historyRes && historyRes.data) {
        setHistory(historyRes.data);
      }
    } catch (err) {
      console.error('[useAnalytics Error]:', err.message);
      setError(err.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range, selectedPlatform]);

  return {
    overview,
    history,
    range,
    setRange,
    selectedPlatform,
    setSelectedPlatform,
    loading,
    error,
    refetch: fetchAnalytics
  };
};

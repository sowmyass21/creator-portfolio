import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useAnalytics = (initialRange = '30d') => {
  const [range, setRange] = useState(initialRange);
  const [overview, setOverview] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, historyRes] = await Promise.all([
        apiService.getAnalyticsOverview().catch(err => null),
        apiService.getAnalyticsHistory(range).catch(err => null)
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
  }, [range]);

  return {
    overview,
    history,
    range,
    setRange,
    loading,
    error,
    refetch: fetchAnalytics
  };
};

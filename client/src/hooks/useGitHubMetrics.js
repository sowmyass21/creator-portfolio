import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useGitHubMetrics = (username = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  const fetchMetrics = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getGitHubMetrics(username, forceRefresh);
      if (res && res.data) {
        setData(res.data);
        setMeta(res.meta || null);
      }
    } catch (err) {
      console.error('[useGitHubMetrics Error]:', err.message);
      setError(err.message || 'Failed to fetch GitHub metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [username]);

  return {
    metrics: data,
    meta,
    loading,
    error,
    refetch: (force = true) => fetchMetrics(force)
  };
};

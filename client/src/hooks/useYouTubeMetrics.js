import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useYouTubeMetrics = (channelId = null) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  const fetchMetrics = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getYouTubeMetrics(channelId, forceRefresh);
      if (res && res.data) {
        setData(res.data);
        setMeta(res.meta || null);
      }
    } catch (err) {
      console.error('[useYouTubeMetrics Error]:', err.message);
      setError(err.message || 'Failed to fetch YouTube metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [channelId]);

  return {
    metrics: data,
    meta,
    loading,
    error,
    refetch: (force = true) => fetchMetrics(force)
  };
};

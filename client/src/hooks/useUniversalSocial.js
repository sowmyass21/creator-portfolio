import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useUniversalSocial = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSocial = async (refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getUniversalSocial(refresh);
      if (res && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('[useUniversalSocial Error]:', err.message);
      setError(err.message || 'Failed to fetch universal social metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocial();
  }, []);

  return {
    summary: data?.summary || null,
    platforms: data?.platforms || [],
    loading,
    error,
    refetch: (refresh = true) => fetchSocial(refresh)
  };
};

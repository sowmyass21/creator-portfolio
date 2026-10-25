import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const PortfolioContext = createContext(null);

export const PortfolioProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthRes, profileRes, projectsRes, metricsRes] = await Promise.all([
        apiService.getHealth().catch(err => ({ success: false, message: err.message })),
        apiService.getProfile().catch(err => null),
        apiService.getProjects().catch(err => null),
        apiService.getMetrics().catch(err => null),
      ]);

      if (healthRes && healthRes.data) {
        setHealthStatus(healthRes.data);
      }
      if (profileRes && profileRes.data) {
        setProfile(profileRes.data);
      }
      if (projectsRes && projectsRes.data) {
        setProjects(projectsRes.data);
      }
      if (metricsRes && metricsRes.data) {
        setMetrics(metricsRes.data);
      }
    } catch (err) {
      console.error('Error in PortfolioProvider:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    setProfile(null);
    setProjects([]);
    setMetrics(null);
  };

  useEffect(() => {
    fetchAllData();

    const handleLogout = () => {
      clearData();
    };

    const handleLogin = () => {
      clearData();
      fetchAllData();
    };

    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('auth:login', handleLogin);
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('auth:login', handleLogin);
    };
  }, []);

  const value = {
    profile,
    setProfile,
    projects,
    metrics,
    healthStatus,
    selectedCategory,
    setSelectedCategory,
    loading,
    error,
    refreshData: fetchAllData,
    refetchProfile: fetchAllData,
    refreshProfile: fetchAllData,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

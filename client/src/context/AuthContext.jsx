import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Automatic session check on mount via GET /api/auth/me
  const checkAuth = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await apiService.getMe();
      if (res && res.data && res.data.user) {
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const cleanSessionData = () => {
    const savedTheme = localStorage.getItem('theme');
    localStorage.removeItem('token');
    sessionStorage.clear();
    if (savedTheme) {
      localStorage.setItem('theme', savedTheme);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      cleanSessionData();
      const res = await apiService.login({ email, password });
      if (res && res.data && res.data.user) {
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        setUser(res.data.user);
        window.dispatchEvent(new CustomEvent('auth:login', { detail: res.data.user }));
        return res.data.user;
      }
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      cleanSessionData();
      const res = await apiService.register({ name, email, password });
      if (res && res.data && res.data.user) {
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
        }
        setUser(res.data.user);
        window.dispatchEvent(new CustomEvent('auth:login', { detail: res.data.user }));
        return res.data.user;
      }
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiService.logout();
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:logout'));
      setLoading(false);
    }
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    loading,
    authError,
    setAuthError,
    login,
    register,
    logout,
    refetchUser: checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

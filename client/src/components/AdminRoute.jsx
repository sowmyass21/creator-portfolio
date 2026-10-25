import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Activity } from 'lucide-react';

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900 text-slate-300">
        <div className="flex flex-col items-center gap-3">
          <Activity className="w-8 h-8 text-brand-purple animate-spin" />
          <span className="text-xs font-mono">Verifying admin credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // If authenticated user is NOT an admin (e.g. role is USER), deny access
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="glass-card rounded-3xl p-8 max-w-md text-center space-y-4 border border-rose-500/30">
          <div className="w-14 h-14 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Administrative Access Required</h2>
          <p className="text-xs text-slate-300">
            Your current user account does not have <span className="font-mono text-rose-400 font-semibold">ADMIN</span> privileges. Access to this management module is restricted.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;

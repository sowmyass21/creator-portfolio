import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="glass-card rounded-3xl p-10 text-center max-w-md space-y-4 border border-slate-800">
        <div className="w-16 h-16 rounded-full bg-brand-pink/10 text-brand-pink flex items-center justify-center mx-auto border border-brand-pink/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-extrabold text-white">404</h1>
        <h2 className="text-xl font-bold text-slate-200">Page Not Found</h2>
        <p className="text-slate-400 text-sm">
          The route you are trying to access does not exist on this application.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-indigo to-brand-purple"
        >
          <Home className="w-4 h-4" />
          Back to Portfolio
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

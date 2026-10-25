import React from 'react';

export const SkeletonCard = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card rounded-2xl p-6 space-y-4 animate-pulse border border-slate-200 dark:border-slate-800">
          <div className="w-full h-40 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

export const EmptyState = ({ title = "No data found", description = "There are no items to display at this time.", icon: Icon }) => {
  return (
    <div className="text-center py-16 px-4 glass-card rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-bold text-slate-800 dark:text-white">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">{description}</p>
    </div>
  );
};

export const ErrorState = ({ message = "An error occurred while fetching data.", onRetry }) => {
  return (
    <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-3">
      <p className="text-sm font-medium text-rose-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

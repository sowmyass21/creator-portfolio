import React from 'react';
import { useUniversalSocial } from '../hooks/useUniversalSocial';
import UniversalPlatformCard from './UniversalPlatformCard';
import SectionHeader from './SectionHeader';
import { SkeletonCard, ErrorState } from './SkeletonLoader';
import { formatNumber } from '../utils/formatters';
import { RefreshCw, Share2, Users, Eye, Layers } from 'lucide-react';

export const UniversalSocialGrid = () => {
  const { summary, platforms, loading, error, refetch } = useUniversalSocial();

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          badge="UNIVERSAL SOCIAL ARCHITECTURE"
          title="Cross-Platform Social Metrics"
          description="Fetching normalized metrics across all connected platform interfaces..."
        />
        <SkeletonCard count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <SectionHeader
          badge="UNIVERSAL SOCIAL ARCHITECTURE"
          title="Cross-Platform Social Metrics"
        />
        <ErrorState message={error} onRetry={() => refetch(true)} />
      </div>
    );
  }

  return (
    <section id="universal-social" className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <SectionHeader
          badge="UNIVERSAL ARCHITECTURE"
          title="Unified Platform Metrics"
          description="Dynamically rendered social integrations using common platform interfaces."
        />

        <button
          onClick={() => refetch(true)}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 shadow-sm hover:border-brand-purple transition-all self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand-purple" />
          <span>Sync All Platforms</span>
        </button>
      </div>

      {/* Global Summary KPI Bar */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-indigo/10 text-brand-indigo">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Audience Reach</div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                {formatNumber(summary.totalFollowers)}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-purple/10 text-brand-purple">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Combined Views</div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                {formatNumber(summary.totalViews)}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Connected Platforms</div>
              <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white mt-0.5">
                {summary.connectedCount} Active
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Platform Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {platforms.map((platformData, idx) => (
          <UniversalPlatformCard key={idx} data={platformData} />
        ))}
      </div>

    </section>
  );
};

export default UniversalSocialGrid;

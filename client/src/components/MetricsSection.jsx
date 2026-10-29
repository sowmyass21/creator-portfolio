import React from 'react';
import { useMetrics } from '../hooks/useMetrics';
import MetricCard from './MetricCard';
import { formatNumber } from '../utils/formatters';
import { BarChart3, TrendingUp, Users, Eye, Layers } from 'lucide-react';

export const MetricsSection = () => {
  const { summary, platforms, loading } = useMetrics();

  return (
    <section id="metrics" className="py-20 relative bg-slate-950/60 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-pink/10 border border-brand-pink/30 text-xs font-mono font-semibold text-brand-pink">
            <BarChart3 className="w-3.5 h-3.5" />
            LIVE METRICS DASHBOARD
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Cross-Platform Social Analytics
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Aggregated audience numbers, engagement rates, and content views across major platforms.
          </p>
        </div>

        {/* Global Summary KPI Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          
          <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Audience</div>
              <div className="text-2xl font-extrabold text-white font-mono tracking-tight mt-0.5">
                {formatNumber(summary?.totalFollowers ?? 0)}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Content Views</div>
              <div className="text-2xl font-extrabold text-white font-mono tracking-tight mt-0.5">
                {formatNumber(summary?.totalViews ?? 0)}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Avg Engagement</div>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono tracking-tight mt-0.5">
                {summary?.avgEngagementRate ?? 0}%
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-brand-pink/10 text-brand-pink border border-brand-pink/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Tracked Platforms</div>
              <div className="text-2xl font-extrabold text-white font-mono tracking-tight mt-0.5">
                {summary?.platformCount ?? platforms.length ?? 0}
              </div>
            </div>
          </div>

        </div>

        {/* Platform Metric Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-900/40 border border-slate-800 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map((m, idx) => (
              <MetricCard key={m._id || idx} metric={m} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default MetricsSection;

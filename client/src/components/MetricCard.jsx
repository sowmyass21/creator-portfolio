import React from 'react';
import { formatNumber } from '../utils/formatters';
import { TrendingUp, Youtube, Twitter, Github, Mail, Share2, ExternalLink } from 'lucide-react';

export const MetricCard = ({ metric }) => {
  const getIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'youtube': return <Youtube className="w-5 h-5 text-red-500" />;
      case 'twitter/x':
      case 'twitter': return <Twitter className="w-5 h-5 text-sky-400" />;
      case 'github': return <Github className="w-5 h-5 text-purple-400" />;
      case 'substack': return <Mail className="w-5 h-5 text-orange-400" />;
      default: return <Share2 className="w-5 h-5 text-brand-purple" />;
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-slate-700 transition-all duration-300 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            {getIcon(metric.platform)}
          </div>
          <div>
            <h3 className="font-bold text-white text-base">{metric.platform}</h3>
            <p className="text-xs text-slate-400 font-mono">{metric.handle}</p>
          </div>
        </div>

        <a
          href={metric.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
          title={`Visit ${metric.platform}`}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Main Metric Value */}
      <div className="space-y-1">
        <div className="text-xs text-slate-400 font-medium">{metric.followersLabel || 'Followers'}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-white font-mono tracking-tight">
            {formatNumber(metric.followers)}
          </span>
          <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" />
            +{metric.monthlyGrowthRate || metric.weeklyGrowthRate}% mo
          </span>
        </div>
      </div>

      {/* Metric Stats Grid */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <div className="text-[10px] text-slate-400">Total Views</div>
          <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">
            {formatNumber(metric.totalViews)}
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <div className="text-[10px] text-slate-400">Engagement</div>
          <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
            {metric.engagementRate}%
          </div>
        </div>
      </div>

      {/* Top Content Link */}
      {metric.topContentTitle && (
        <div className="pt-1 text-[11px] text-slate-400 border-t border-slate-800/50">
          <span className="text-slate-500 font-mono">Top: </span>
          <a
            href={metric.topContentUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-brand-purple hover:underline transition-colors truncate block"
          >
            {metric.topContentTitle}
          </a>
        </div>
      )}

    </div>
  );
};

export default MetricCard;

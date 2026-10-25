import React from 'react';
import { formatNumber } from '../utils/formatters';
import { Youtube, Eye, Video, Users, TrendingUp, ExternalLink, ShieldCheck } from 'lucide-react';

export const YouTubeStats = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
      
      {/* Header Channel Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          <img
            src={metrics.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"}
            alt={metrics.channelName}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-red-500/50 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{metrics.channelName}</h3>
              <ShieldCheck className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-xs text-red-400 font-mono font-semibold mt-0.5">{metrics.customUrl}</p>
          </div>
        </div>

        <a
          href={`https://youtube.com/${metrics.customUrl || ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-red-600 hover:bg-red-700 border border-red-500 flex items-center gap-2 hover:scale-105 transition-all shadow-md shadow-red-600/20"
        >
          <Youtube className="w-4 h-4 fill-white" /> Subscribe on YouTube
        </a>

      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
        
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Subscribers</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
              {formatNumber(metrics.subscriberCount)}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Channel Views</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
              {formatNumber(metrics.totalViews)}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Published Videos</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
              {metrics.videoCount}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default YouTubeStats;

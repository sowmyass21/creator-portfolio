import React from 'react';
import { formatNumber } from '../utils/formatters';
import { 
  Github, Youtube, Instagram, Linkedin, Mail, Twitter, Play, Globe, ExternalLink, TrendingUp, ShieldCheck
} from 'lucide-react';

export const UniversalPlatformCard = ({ data }) => {
  if (!data) return null;

  const {
    platform,
    username,
    profileUrl,
    followers,
    following,
    views,
    posts,
    engagement,
    profileImage,
    lastUpdated
  } = data;

  const getPlatformIcon = (plat) => {
    switch (plat?.toLowerCase()) {
      case 'github': return <Github className="w-5 h-5 text-purple-400" />;
      case 'youtube': return <Youtube className="w-5 h-5 text-red-500" />;
      case 'instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'linkedin': return <Linkedin className="w-5 h-5 text-blue-500" />;
      case 'substack': return <Mail className="w-5 h-5 text-orange-400" />;
      case 'twitter/x':
      case 'twitter': return <Twitter className="w-5 h-5 text-sky-400" />;
      case 'twitch': return <Play className="w-5 h-5 text-purple-500" />;
      default: return <Globe className="w-5 h-5 text-brand-purple" />;
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-5 hover:border-brand-purple/40 transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {profileImage ? (
            <img
              src={profileImage}
              alt={username}
              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-brand-purple/30"
            />
          ) : (
            <div className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {getPlatformIcon(platform)}
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">{platform}</h3>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{username}</p>
          </div>
        </div>

        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-colors"
          title={`Visit ${platform}`}
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Main Followers Metric */}
      {followers !== null && followers !== undefined && (
        <div className="p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Audience / Followers</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight mt-0.5">
            {formatNumber(followers)}
          </div>
        </div>
      )}

      {/* Flexible Stats Grid (Hides null fields without fake values) */}
      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
        
        {following !== null && following !== undefined && (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60">
            <div className="text-[10px] text-slate-400 font-sans">Following</div>
            <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{formatNumber(following)}</div>
          </div>
        )}

        {views !== null && views !== undefined && (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60">
            <div className="text-[10px] text-slate-400 font-sans">Total Reach / Views</div>
            <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{formatNumber(views)}</div>
          </div>
        )}

        {posts !== null && posts !== undefined && (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60">
            <div className="text-[10px] text-slate-400 font-sans">Content Items</div>
            <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{formatNumber(posts)}</div>
          </div>
        )}

        {engagement !== null && engagement !== undefined && (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60">
            <div className="text-[10px] text-slate-400 font-sans">Engagement Rate</div>
            <div className="font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {engagement}%
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default UniversalPlatformCard;

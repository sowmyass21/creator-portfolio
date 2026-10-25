import React from 'react';
import { Youtube, Twitter, Github, Linkedin, Mail, ExternalLink, ShieldCheck } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

export const SocialCard = ({ platform, handle, followers, followersLabel, profileUrl, verified = true }) => {
  const getIcon = (plat) => {
    switch (plat?.toLowerCase()) {
      case 'youtube': return <Youtube className="w-5 h-5 text-red-500" />;
      case 'twitter/x':
      case 'twitter': return <Twitter className="w-5 h-5 text-sky-400" />;
      case 'github': return <Github className="w-5 h-5 text-purple-400" />;
      case 'linkedin': return <Linkedin className="w-5 h-5 text-blue-500" />;
      default: return <Mail className="w-5 h-5 text-orange-400" />;
    }
  };

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-brand-purple/50 transition-all duration-300 flex items-center justify-between hover:-translate-y-1"
    >
      <div className="flex items-center gap-3.5">
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:scale-110 transition-transform">
          {getIcon(platform)}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-brand-purple transition-colors">
              {platform}
            </h3>
            {verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{handle}</p>
        </div>
      </div>

      <div className="text-right flex items-center gap-3">
        <div>
          <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
            {formatNumber(followers)}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">{followersLabel || 'Followers'}</div>
        </div>
        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-purple group-hover:translate-x-0.5 transition-all" />
      </div>
    </a>
  );
};

export default SocialCard;

import React from 'react';
import { formatNumber, formatDate } from '../utils/formatters';
import { Play, Eye, ThumbsUp, MessageSquare, Calendar, ExternalLink } from 'lucide-react';

export const LatestVideos = ({ videos = [] }) => {
  if (!videos || videos.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
          <Play className="w-5 h-5 text-red-500 fill-red-500" />
          Latest Published Technical Videos
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Synced from YouTube API</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {videos.map((video, idx) => (
          <a
            key={video.videoId || idx}
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-red-500/50 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
          >
            {/* Thumbnail Banner */}
            <div className="relative aspect-video overflow-hidden bg-slate-900">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
              </div>
            </div>

            {/* Video Meta Info */}
            <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
              
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                  {video.title}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(video.publishedAt)}</span>
                </div>
              </div>

              {/* Views, Likes, Comments Stat Bar */}
              <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span>{formatNumber(video.viewCount)}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{formatNumber(video.likeCount)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-slate-400" />
                  <span>{video.commentCount}</span>
                </div>
              </div>

            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default LatestVideos;

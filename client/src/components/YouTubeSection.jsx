import React from 'react';
import { useYouTubeMetrics } from '../hooks/useYouTubeMetrics';
import SectionHeader from './SectionHeader';
import YouTubeStats from './YouTubeStats';
import LatestVideos from './LatestVideos';
import { SkeletonCard, ErrorState } from './SkeletonLoader';
import { RefreshCw } from 'lucide-react';

export const YouTubeSection = ({ channelId = null }) => {
  const { metrics, meta, loading, error, refetch } = useYouTubeMetrics(channelId);

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          badge="YOUTUBE INTEGRATION"
          title="Video Content & Channel Analytics"
          description="Fetching subscriber counts and video statistics from YouTube API..."
        />
        <SkeletonCard count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <SectionHeader
          badge="YOUTUBE INTEGRATION"
          title="Video Content & Channel Analytics"
          description="Live data from the YouTube Data API v3."
        />
        <ErrorState message={error} onRetry={() => refetch(true)} />
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <section id="youtube-analytics" className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <SectionHeader
          badge="YOUTUBE DATA API"
          title="YouTube Video & Subscriber Metrics"
          description={`Automated channel statistics and latest uploads for ${metrics.channelName}.`}
        />

        <button
          onClick={() => refetch(true)}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 shadow-sm self-start sm:self-auto hover:border-red-500 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-red-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh YouTube API</span>
        </button>
      </div>

      {/* Stats Card */}
      <YouTubeStats metrics={metrics} />

      {/* Latest Videos Grid */}
      <LatestVideos videos={metrics.latestVideos} />

    </section>
  );
};

export default YouTubeSection;

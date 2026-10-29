import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../../hooks/useAnalytics';
import { usePortfolio } from '../../context/PortfolioContext';
import apiService from '../../services/api';
import AnalyticsChart from '../../components/AnalyticsChart';
import { SkeletonCard, ErrorState } from '../../components/SkeletonLoader';
import { formatNumber, formatDate } from '../../utils/formatters';
import { 
  BarChart3, TrendingUp, Users, Eye, Star, FolderGit2, Youtube, Github, RefreshCw, Clock, CheckCircle2,
  Globe, ArrowUpRight, Award, Flame, ShieldCheck, Code2, Linkedin, Plus, Sparkles
} from 'lucide-react';

export const DashboardAnalytics = () => {
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const { overview, history, range, setRange, loading, error, refetch } = useAnalytics('30d', selectedPlatform);
  const { metrics, refetchMetrics } = usePortfolio();
  const [platforms, setPlatforms] = useState([]);
  const [metricType, setMetricType] = useState('views'); // 'views' | 'followers' | 'stars'

  const ranges = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: '1 Year', value: '1y' },
  ];

  useEffect(() => {
    const loadPlatformDetails = async () => {
      try {
        const res = await apiService.getSocialPlatforms();
        setPlatforms(res?.data || []);
      } catch (e) {
        console.warn('Could not load platforms in Analytics:', e);
      }
    };
    loadPlatformDetails();
  }, []);

  const handleRefresh = async () => {
    await refetch();
    if (refetchMetrics) await refetchMetrics();
  };

  // Merge and deduplicate platforms strictly for the logged-in user
  const platformList = useMemo(() => {
    const allCandidatePlatforms = [
      ...(overview?.platforms || []),
      ...(metrics?.platforms || []),
      ...(platforms || [])
    ];

    const platformMap = new Map();
    for (const p of allCandidatePlatforms) {
      const name = (p.platform || '').trim();
      if (!name) continue;
      const key = name.toLowerCase();
      const handle = p.handle || p.username || '';
      if (!handle || p.enabled === false) continue;

      const existing = platformMap.get(key);
      const cfg = p.config || {};
      const followers = Number(
        p.followers || 
        cfg.followers || 
        cfg.subscriberCount || 
        cfg.connections || 
        cfg.rating || 
        0
      );
      const totalViews = Number(
        p.totalViews || 
        cfg.totalViews || 
        cfg.views || 
        0
      );
      const contentCount = Number(
        p.contentCount !== undefined ? p.contentCount : (
          cfg.publicRepositories !== undefined ? cfg.publicRepositories : (
            cfg.videoCount || cfg.totalSolved || cfg.problemsSolved || cfg.posts || cfg.mediaCount || 0
          )
        )
      );
      const stars = Number(p.stars || cfg.totalStars || (cfg.stars ? String(cfg.stars).replace(/[^0-9]/g, '') : 0));
      const engagementRate = Number(p.engagementRate || cfg.engagementRate || 0);

      if (!existing) {
        platformMap.set(key, {
          ...p,
          handle,
          username: handle,
          profileUrl: p.profileUrl || '',
          followers,
          totalViews,
          contentCount,
          stars,
          engagementRate,
          config: cfg,
          topContentTitle: p.topContentTitle || (cfg.pinnedRepo?.name || cfg.topVideo?.title || null),
          topContentUrl: p.topContentUrl || (cfg.pinnedRepo?.url || cfg.topVideo?.url || null),
          lastSynced: p.lastSynced || new Date()
        });
      } else {
        platformMap.set(key, {
          ...existing,
          ...p,
          handle: handle || existing.handle,
          username: handle || existing.username,
          profileUrl: p.profileUrl || existing.profileUrl,
          followers: Math.max(existing.followers || 0, followers),
          totalViews: Math.max(existing.totalViews || 0, totalViews),
          contentCount: Math.max(existing.contentCount || 0, contentCount),
          stars: Math.max(existing.stars || 0, stars),
          engagementRate: existing.engagementRate || engagementRate,
          config: { ...(existing.config || {}), ...cfg },
          topContentTitle: p.topContentTitle || existing.topContentTitle,
          topContentUrl: p.topContentUrl || existing.topContentUrl,
          lastSynced: p.lastSynced || existing.lastSynced
        });
      }
    }

    return Array.from(platformMap.values());
  }, [overview?.platforms, metrics?.platforms, platforms]);

  // Derived platform-specific metrics for adaptive KPI cards
  const ytPlat = platformList.find(p => p.platform?.toLowerCase() === 'youtube');
  const ghPlat = platformList.find(p => p.platform?.toLowerCase() === 'github');
  const liPlat = platformList.find(p => p.platform?.toLowerCase() === 'linkedin');
  const codingPlat = platformList.find(p => ['leetcode', 'codechef'].includes(p.platform?.toLowerCase()));

  const totalFollowers = overview?.totalFollowers || platformList.reduce((acc, p) => acc + (p.followers || 0), 0);
  const totalViews = overview?.totalViews || platformList.reduce((acc, p) => acc + (p.totalViews || 0), 0);
  const totalStars = overview?.githubStars || ghPlat?.stars || 0;
  const totalRepositories = overview?.githubRepositories || ghPlat?.contentCount || 0;

  if (loading && !overview && platformList.length === 0) {
    return (
      <div className="space-y-6 max-w-6xl">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dynamic Analytics Dashboard</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading verified metrics snapshots...</p>
        </div>
        <SkeletonCard count={4} />
      </div>
    );
  }

  if (error && !overview && platformList.length === 0) {
    return (
      <div className="space-y-6 max-w-6xl">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dynamic Analytics Dashboard</h2>
        <ErrorState message={error} onRetry={handleRefresh} />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl pb-12">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#6D5EF7]/10 text-[#6D5EF7] dark:text-[#8B7FF9] text-[11px] font-semibold tracking-wide mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            VERIFIED METRICS ONLY • ZERO SIMULATED DATA
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172033] dark:text-white tracking-tight">
            Creator Analytics & Platform Growth
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] dark:text-slate-400 mt-1">
            Real-time aggregate performance, live statistics, and strictly verified channel data for your connected accounts.
          </p>
        </div>

        {/* Range Selector & Refresh */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-[#F8F9FC] dark:bg-slate-900 rounded-xl border border-[#E4E7EC] dark:border-slate-800">
            {ranges.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                  range === r.value
                    ? 'bg-[#6D5EF7] text-white shadow-xs'
                    : 'text-[#667085] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-[#172033] dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Analytics"
          >
            <RefreshCw className={`w-4 h-4 text-[#6D5EF7] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Synchronized Timestamp Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#667085] dark:text-slate-400 font-mono p-3.5 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#6D5EF7]" />
          <span>Last Synchronized: {overview?.lastSynchronizedTimestamp ? formatDate(overview.lastSynchronizedTimestamp) : 'Real-time verified'}</span>
        </div>
        <span className="text-[#16803D] dark:text-emerald-400 font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" /> {platformList.length} Connected Platform{platformList.length === 1 ? '' : 's'} Active
        </span>
      </div>

      {/* Overview KPI Cards Grid - Strictly Actual Values for Logged-In User */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Followers / Audience */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] space-y-2">
          <div className="flex items-center justify-between text-[#667085] dark:text-slate-400 text-xs font-semibold">
            <span>Total Audience / Followers</span>
            <Users className="w-4 h-4 text-[#6D5EF7]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-white font-mono tracking-tight">
            {formatNumber(totalFollowers)}
          </div>
          <div className="text-[11px] text-[#16803D] dark:text-emerald-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {platformList.length > 0 ? `Across ${platformList.length} verified platform${platformList.length === 1 ? '' : 's'}` : 'No platforms connected'}
          </div>
        </div>

        {/* Card 2: Adaptive Platform Metric (YouTube Subs or LinkedIn Connections or Coding Rating) */}
        {ytPlat ? (
          <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] space-y-2">
            <div className="flex items-center justify-between text-[#667085] dark:text-slate-400 text-xs font-semibold">
              <span>YouTube Subscribers</span>
              <Youtube className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-white font-mono tracking-tight">
              {formatNumber(ytPlat.followers)}
            </div>
            <div className="text-[11px] text-[#667085] dark:text-slate-400 font-mono">
              Channel: {ytPlat.handle || 'Connected'}
            </div>
          </div>
        ) : liPlat ? (
          <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] space-y-2">
            <div className="flex items-center justify-between text-[#667085] dark:text-slate-400 text-xs font-semibold">
              <span>LinkedIn Connections</span>
              <Linkedin className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-white font-mono tracking-tight">
              {formatNumber(liPlat.followers)}
            </div>
            <div className="text-[11px] text-[#667085] dark:text-slate-400 font-mono">
              Profile: {liPlat.handle || 'Connected'}
            </div>
          </div>
        ) : codingPlat ? (
          <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] space-y-2">
            <div className="flex items-center justify-between text-[#667085] dark:text-slate-400 text-xs font-semibold">
              <span>{codingPlat.platform} Rating</span>
              <Award className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-white font-mono tracking-tight">
              {codingPlat.followers ? formatNumber(codingPlat.followers) : (codingPlat.contentCount ? `${formatNumber(codingPlat.contentCount)} Solved` : 'Active')}
            </div>
            <div className="text-[11px] text-[#667085] dark:text-slate-400 font-mono">
              Competitive Coding Rating
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] space-y-2">
            <div className="flex items-center justify-between text-[#667085] dark:text-slate-400 text-xs font-semibold">
              <span>Connected Platforms</span>
              <Globe className="w-4 h-4 text-[#6D5EF7]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-white font-mono tracking-tight">
              {platformList.length}
            </div>
            <div className="text-[11px] text-[#667085] dark:text-slate-400 font-mono">
              Active integrations
            </div>
          </div>
        )}

        {/* Card 3: GitHub Stars or Coding Problems Solved or Projects */}
        {ghPlat ? (
          <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] space-y-2">
            <div className="flex items-center justify-between text-[#667085] dark:text-slate-400 text-xs font-semibold">
              <span>GitHub Stars</span>
              <Star className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              {formatNumber(totalStars)}
            </div>
            <div className="text-[11px] text-[#667085] dark:text-slate-400 font-mono">
              Across {formatNumber(totalRepositories)} repositories
            </div>
          </div>
        ) : codingPlat ? (
          <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] space-y-2">
            <div className="flex items-center justify-between text-[#667085] dark:text-slate-400 text-xs font-semibold">
              <span>Problems Solved</span>
              <Code2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-white font-mono tracking-tight">
              {formatNumber(codingPlat.contentCount || 0)}
            </div>
            <div className="text-[11px] text-[#667085] dark:text-slate-400 font-mono">
              On {codingPlat.platform}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] space-y-2">
            <div className="flex items-center justify-between text-[#667085] dark:text-slate-400 text-xs font-semibold">
              <span>Portfolio Projects</span>
              <FolderGit2 className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-white font-mono tracking-tight">
              {formatNumber(overview?.totalProjects || 0)}
            </div>
            <div className="text-[11px] text-[#667085] dark:text-slate-400 font-mono">
              Showcase projects
            </div>
          </div>
        )}

        {/* Card 4: Total Views / Reach */}
        <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] space-y-2">
          <div className="flex items-center justify-between text-[#667085] dark:text-slate-400 text-xs font-semibold">
            <span>Total Views / Reach</span>
            <Eye className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-white font-mono tracking-tight">
            {formatNumber(totalViews)}
          </div>
          <div className="text-[11px] text-[#16803D] dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified live views
          </div>
        </div>

      </div>

      {/* 1. METRIC HISTORY (Chart Section) */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-7 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E4E7EC] dark:border-slate-800 pb-4 gap-3">
          <div>
            <h3 className="text-base font-bold text-[#172033] dark:text-white">Metric History & Trajectory</h3>
            <p className="text-xs text-[#667085] dark:text-slate-400 font-mono mt-0.5">
              Verified time-series snapshots ({range}) {selectedPlatform !== 'All' ? `• Filtered by ${selectedPlatform}` : '• Across All Connected Platforms'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Platform filter selector */}
            {platformList.length > 1 && (
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 text-[#172033] dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#6D5EF7]"
              >
                <option value="All">All Platforms</option>
                {platformList.map((p) => (
                  <option key={p.platform} value={p.platform}>
                    {p.platform}
                  </option>
                ))}
              </select>
            )}

            {/* Metric Type Toggle Buttons */}
            <div className="flex items-center gap-1 p-1 bg-[#F8F9FC] dark:bg-[#131D31] rounded-lg border border-[#E4E7EC] dark:border-slate-800 text-xs">
              <button
                onClick={() => setMetricType('views')}
                className={`px-3 py-1 rounded-md font-mono font-medium transition-colors ${metricType === 'views' ? 'bg-[#6D5EF7] text-white shadow-xs' : 'text-[#667085] dark:text-slate-400 hover:text-[#172033]'}`}
              >
                Views ({formatNumber(totalViews)})
              </button>
              <button
                onClick={() => setMetricType('followers')}
                className={`px-3 py-1 rounded-md font-mono font-medium transition-colors ${metricType === 'followers' ? 'bg-[#6D5EF7] text-white shadow-xs' : 'text-[#667085] dark:text-slate-400 hover:text-[#172033]'}`}
              >
                Followers ({formatNumber(totalFollowers)})
              </button>
              {(totalStars > 0 || ghPlat) && (
                <button
                  onClick={() => setMetricType('stars')}
                  className={`px-3 py-1 rounded-md font-mono font-medium transition-colors ${metricType === 'stars' ? 'bg-amber-500 text-white shadow-xs' : 'text-[#667085] dark:text-slate-400 hover:text-[#172033]'}`}
                >
                  Stars ({formatNumber(totalStars)})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Chart Component */}
        <AnalyticsChart 
          data={history?.series || history?.snapshots || []} 
          range={range} 
          metricType={metricType} 
        />
      </div>

      {/* 2. PLATFORM STATISTICS BREAKDOWN */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#172033] dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#6D5EF7]" />
              Connected Platform Statistics
            </h3>
            <p className="text-xs text-[#667085] dark:text-slate-400 mt-0.5">
              Direct live statistics from your verified connected channels
            </p>
          </div>
          <span className="text-xs font-mono text-[#667085] dark:text-slate-400">
            {platformList.length} Connected
          </span>
        </div>

        {platformList.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E4E7EC] dark:border-slate-800 text-center space-y-4 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)]">
            <div className="w-12 h-12 rounded-2xl bg-[#6D5EF7]/10 text-[#6D5EF7] flex items-center justify-center mx-auto">
              <Globe className="w-6 h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="font-bold text-[#172033] dark:text-white text-base">No Connected Platforms Yet</h4>
              <p className="text-xs text-[#667085] dark:text-slate-400">
                Connect your GitHub, YouTube, LinkedIn, LeetCode, or CodeChef profiles to see live, verified analytics and trajectory charts.
              </p>
            </div>
            <Link
              to="/dashboard/platforms"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6D5EF7] text-white text-xs font-semibold hover:bg-[#5b4ce6] transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Connect Platforms
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {platformList.map((plat, idx) => {
              const platLower = (plat.platform || '').toLowerCase();
              const isYouTube = platLower === 'youtube';
              const isGitHub = platLower === 'github';
              const isLinkedIn = platLower === 'linkedin';
              const isLeetCode = platLower === 'leetcode';
              const isCodeChef = platLower === 'codechef';
              const isInstagram = platLower === 'instagram';

              // Determine platform-specific labels and values
              let label1 = 'Followers';
              let val1 = formatNumber(plat.followers || 0);

              let label2 = 'Views / Reach';
              let val2 = formatNumber(plat.totalViews || 0);

              let label3 = 'Content / Engagement';
              let val3 = plat.engagementRate ? `${plat.engagementRate}%` : formatNumber(plat.contentCount || 0);

              if (isYouTube) {
                label1 = 'Subscribers';
                val1 = formatNumber(plat.followers || plat.config?.subscriberCount || 0);
                label2 = 'Total Views';
                val2 = formatNumber(plat.totalViews || plat.config?.totalViews || 0);
                label3 = 'Videos';
                val3 = formatNumber(plat.contentCount || plat.config?.videoCount || 0);
              } else if (isGitHub) {
                label1 = 'Followers';
                val1 = formatNumber(plat.followers || plat.config?.followers || 0);
                label2 = 'Repositories';
                val2 = formatNumber(plat.contentCount || plat.config?.publicRepositories || 0);
                label3 = 'Total Stars';
                val3 = formatNumber(plat.stars || plat.config?.totalStars || 0);
              } else if (isLinkedIn) {
                label1 = 'Connections';
                val1 = formatNumber(plat.followers || plat.config?.connections || plat.config?.followers || 0);
                label2 = 'Profile Reach';
                val2 = formatNumber(plat.totalViews || plat.config?.views || 0);
                label3 = 'Posts';
                val3 = formatNumber(plat.contentCount || plat.config?.posts || 0);
              } else if (isLeetCode) {
                label1 = 'Contest Rating';
                val1 = plat.followers || plat.config?.rating ? formatNumber(plat.followers || plat.config?.rating) : 'Active';
                label2 = 'Problems Solved';
                val2 = formatNumber(plat.contentCount || plat.config?.totalSolved || 0);
                label3 = 'Global Ranking';
                val3 = plat.config?.ranking ? `#${formatNumber(plat.config.ranking)}` : 'Ranked';
              } else if (isCodeChef) {
                label1 = 'Contest Rating';
                val1 = plat.followers || plat.config?.rating ? formatNumber(plat.followers || plat.config?.rating) : 'Active';
                label2 = 'Problems Solved';
                val2 = formatNumber(plat.contentCount || plat.config?.problemsSolved || 0);
                label3 = 'Star Tier';
                val3 = plat.config?.stars ? `${plat.config.stars}` : (plat.stars ? `${plat.stars}★` : 'Active');
              } else if (isInstagram) {
                label1 = 'Followers';
                val1 = formatNumber(plat.followers || plat.config?.followers || 0);
                label2 = 'Total Reach';
                val2 = formatNumber(plat.totalViews || plat.config?.views || 0);
                label3 = 'Posts';
                val3 = formatNumber(plat.contentCount || plat.config?.mediaCount || 0);
              }

              // Color styles and icons
              let iconNode = <Globe className="w-5 h-5" />;
              let iconBg = 'bg-[#6D5EF7] text-white';

              if (isYouTube) {
                iconNode = <Youtube className="w-5 h-5" />;
                iconBg = 'bg-red-600 text-white';
              } else if (isGitHub) {
                iconNode = <Github className="w-5 h-5" />;
                iconBg = 'bg-[#172033] dark:bg-purple-600 text-white';
              } else if (isLinkedIn) {
                iconNode = <Linkedin className="w-5 h-5" />;
                iconBg = 'bg-[#0A66C2] text-white';
              } else if (isLeetCode) {
                iconNode = <Code2 className="w-5 h-5" />;
                iconBg = 'bg-[#FFA116] text-white';
              } else if (isCodeChef) {
                iconNode = <Award className="w-5 h-5" />;
                iconBg = 'bg-[#5B4638] text-white';
              } else if (isInstagram) {
                iconNode = <Globe className="w-5 h-5" />;
                iconBg = 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white';
              }

              return (
                <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E4E7EC] dark:border-slate-800 space-y-4 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${iconBg}`}>
                        {iconNode}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#172033] dark:text-white text-base flex items-center gap-2">
                          {plat.platform}
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-[#16803D] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            VERIFIED
                          </span>
                        </h4>
                        <span className="text-xs text-[#667085] dark:text-slate-400 font-mono">
                          {plat.handle || plat.username}
                        </span>
                      </div>
                    </div>

                    {plat.profileUrl && (
                      <a
                        href={plat.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-[#F8F9FC] dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#475467] dark:text-slate-300 transition-colors border border-[#E4E7EC] dark:border-slate-700"
                        title={`Open ${plat.platform} Profile`}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-3 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800">
                      <span className="text-[10px] text-[#667085] dark:text-slate-400 block font-medium">
                        {label1}
                      </span>
                      <span className="font-mono font-bold text-[#172033] dark:text-white text-base">
                        {val1}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800">
                      <span className="text-[10px] text-[#667085] dark:text-slate-400 block font-medium">
                        {label2}
                      </span>
                      <span className="font-mono font-bold text-[#172033] dark:text-white text-base">
                        {val2}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800">
                      <span className="text-[10px] text-[#667085] dark:text-slate-400 block font-medium">
                        {label3}
                      </span>
                      <span className={`font-mono font-bold text-base ${isGitHub ? 'text-amber-600 dark:text-amber-400' : 'text-[#172033] dark:text-white'}`}>
                        {val3}
                      </span>
                    </div>
                  </div>

                  {plat.topContentTitle && (
                    <div className="p-3 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 text-xs space-y-1">
                      <span className="text-[10px] text-[#667085] dark:text-slate-400 font-mono flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-500" /> Featured Highlight:
                      </span>
                      <div className="font-semibold text-[#172033] dark:text-white truncate">
                        {plat.topContentUrl ? (
                          <a href={plat.topContentUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-[#6D5EF7] dark:text-[#8B7FF9]">
                            {plat.topContentTitle}
                          </a>
                        ) : (
                          plat.topContentTitle
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default DashboardAnalytics;

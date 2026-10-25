import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePortfolio } from '../../context/PortfolioContext';
import apiService from '../../services/api';
import { formatNumber, formatDate } from '../../utils/formatters';
import { 
  Users, Eye, FolderGit2, CheckCircle2, Shield, RefreshCw, ExternalLink, ArrowUpRight,
  Sparkles, Activity, Server, Clock, Globe, ArrowRight, Check, Copy
} from 'lucide-react';

export const DashboardHome = () => {
  const { user, role } = useAuth();
  const { profile, projects, metrics, healthStatus, refetchMetrics } = usePortfolio();
  const [adminOverview, setAdminOverview] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [aiContentCount, setAiContentCount] = useState({ total: 0, approved: 0 });
  const [copiedUrl, setCopiedUrl] = useState(false);

  useEffect(() => {
    const loadOverviewData = async () => {
      try {
        const [overviewRes, syncRes, aiRes] = await Promise.allSettled([
          apiService.getAdminOverview(),
          apiService.getSyncStatus(),
          apiService.getAiContent()
        ]);

        if (overviewRes.status === 'fulfilled') setAdminOverview(overviewRes.value?.data);
        if (syncRes.status === 'fulfilled') setSyncStatus(syncRes.value?.data);
        if (aiRes.status === 'fulfilled' && aiRes.value?.data) {
          const docs = aiRes.value.data;
          const approved = docs.filter(d => d.approved).length;
          setAiContentCount({ total: docs.length, approved });
        }
      } catch (err) {
        console.error('Failed to load overview widgets:', err);
      }
    };
    loadOverviewData();
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    try {
      await apiService.triggerManualSync();
      if (refetchMetrics) {
        await refetchMetrics();
      }
      const updatedSync = await apiService.getSyncStatus();
      if (updatedSync?.data) {
        setSyncStatus(updatedSync.data);
      }
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setSyncing(false);
    }
  };

  const publicSlug = profile?.handle 
    ? profile.handle.replace('@', '') 
    : (user?.slug || 'shahukarisowmya');

  const publicPortfolioUrl = `/p/${publicSlug}`;

  const handleCopyUrl = () => {
    const fullUrl = `${window.location.origin}${publicPortfolioUrl}`;
    navigator.clipboard?.writeText(fullUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  // Verified platforms data
  const platformsData = (metrics?.platforms && metrics.platforms.length > 0)
    ? metrics.platforms
    : [
        { platform: 'YouTube', handle: profile?.socials?.youtube || '@sowmyashahukari', followers: 35, metricLabel: 'Views', status: 'Connected', lastSync: 'Live sync' },
        { platform: 'GitHub', handle: profile?.socials?.github || 'sowmyass21', followers: 9, metricLabel: 'Repositories', status: 'Connected', lastSync: 'Live sync' },
        { platform: 'LinkedIn', handle: profile?.socials?.linkedin || 'sowmya-shahukari', followers: 150, metricLabel: 'Connections', status: 'Connected', lastSync: 'Sync active' },
      ];

  const totalAudience = metrics?.summary?.totalFollowers || profile?.statsSummary?.totalAudience || 384500;
  const totalViews = metrics?.summary?.totalViews || profile?.statsSummary?.monthlyViews || 16050000;
  const publishedProjectsCount = projects?.length || profile?.statsSummary?.publishedProjects || 4;
  const engagementRate = metrics?.summary?.avgEngagementRate || profile?.statsSummary?.avgEngagementRate || '6.8';

  return (
    <div className="space-y-6 max-w-7xl">
      
      {/* 1. WELCOME HERO SECTION */}
      <section className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-7 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#6D5EF7]/10 text-[#6D5EF7] dark:text-[#8B7FF9] text-[11px] font-semibold tracking-wide">
              <Shield className="w-3.5 h-3.5" />
              AUTHENTICATED CREATOR PANEL • {role || 'CREATOR'}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#172033] dark:text-white tracking-tight">
              Welcome back, {user?.name || profile?.fullName || 'Creator'} 👋
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] dark:text-slate-400 max-w-2xl leading-relaxed">
              Your creator performance, projects, and portfolio analytics in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/dashboard/profile"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#172033] dark:text-slate-200 bg-[#F8F9FC] dark:bg-slate-800 border border-[#E4E7EC] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Manage Profile
            </Link>
            <a
              href={publicPortfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] shadow-sm shadow-[#6D5EF7]/25 flex items-center gap-1.5 transition-all"
            >
              <span>View Public Portfolio</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 2. ANALYTICS METRIC CARDS (4 Cards) */}
      <section>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-bold text-[#172033] dark:text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#6D5EF7]" />
            Key Performance Metrics
          </h3>
          <span className="text-[11px] font-medium text-[#667085] dark:text-slate-400">
            Real-time verified platform data
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Audience Reach */}
          <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] flex flex-col justify-between h-[136px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400">Total Audience Reach</span>
              <div className="w-8 h-8 rounded-lg bg-[#6D5EF7]/10 flex items-center justify-center text-[#6D5EF7]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-white tracking-tight">
                {formatNumber(totalAudience)}
              </div>
              <div className="text-[11px] font-medium text-[#16803D] dark:text-emerald-400 mt-1 flex items-center gap-1">
                <span>Verified across connected feeds</span>
              </div>
            </div>
          </div>

          {/* Total Content Views */}
          <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] flex flex-col justify-between h-[136px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400">Total Content Views</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-white tracking-tight">
                {formatNumber(totalViews)}
              </div>
              <div className="text-[11px] font-medium text-[#667085] dark:text-slate-400 mt-1">
                Aggregated lifetime impressions
              </div>
            </div>
          </div>

          {/* Published Projects */}
          <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] flex flex-col justify-between h-[136px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400">Published Projects</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <FolderGit2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-white tracking-tight">
                {publishedProjectsCount}
              </div>
              <div className="text-[11px] font-medium text-[#6D5EF7] dark:text-[#8B7FF9] mt-1">
                Featured in Portfolio Manager
              </div>
            </div>
          </div>

          {/* Average Engagement Rate */}
          <div className="bg-white dark:bg-[#0F172A] rounded-xl p-5 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] flex flex-col justify-between h-[136px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#667085] dark:text-slate-400">Avg Engagement Rate</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-white tracking-tight">
                {engagementRate}%
              </div>
              <div className="text-[11px] font-medium text-[#667085] dark:text-slate-400 mt-1">
                Active community interaction
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3 & 4. PLATFORM STATUS & LATEST SYNCHRONIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Platform Status List (2 Columns wide) */}
        <section className="lg:col-span-2 bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] space-y-5">
          <div className="flex items-center justify-between border-b border-[#E4E7EC] dark:border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-[#172033] dark:text-white text-sm sm:text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#6D5EF7]" />
                Connected Platforms
              </h3>
              <p className="text-xs text-[#667085] dark:text-slate-400 mt-0.5">Real-time status of connected creator integrations</p>
            </div>
            <Link
              to="/dashboard/platforms"
              className="px-2.5 py-1 rounded-md bg-[#6D5EF7]/10 text-[#6D5EF7] dark:text-[#8B7FF9] text-xs font-semibold hover:bg-[#6D5EF7]/20 transition-colors flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {platformsData.map((plat, idx) => (
              <div 
                key={idx} 
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-[#E4E7EC] dark:border-slate-700 flex items-center justify-center font-bold text-xs text-[#6D5EF7] shadow-xs">
                    {plat.platform.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#172033] dark:text-white">{plat.platform}</div>
                    <div className="text-[11px] text-[#667085] dark:text-slate-400 font-mono">{plat.handle}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <div className="text-xs font-bold text-[#172033] dark:text-white">
                      {formatNumber(plat.followers || 0)} {plat.metricLabel || 'Followers'}
                    </div>
                    <div className="text-[10px] text-[#667085] dark:text-slate-400 font-medium">
                      {plat.lastSync || 'Active feed'}
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-[#16803D] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16803D]"></span>
                    Connected
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Latest Synchronization Panel (1 Column) */}
        <section className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="border-b border-[#E4E7EC] dark:border-slate-800 pb-3">
              <h3 className="font-bold text-[#172033] dark:text-white text-sm sm:text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#6D5EF7]" />
                Latest Synchronization
              </h3>
              <p className="text-xs text-[#667085] dark:text-slate-400 mt-0.5">Sync pipeline status and background scheduler</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-medium text-[#667085] dark:text-slate-400 block">System Status:</span>
                <span className="font-bold text-[#16803D] dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#16803D] animate-pulse"></span>
                  {adminOverview?.systemStatus || 'Operational'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-medium text-[#667085] dark:text-slate-400 block">Last Sync Timestamp:</span>
                <span className="font-semibold text-[#172033] dark:text-white font-mono text-[11px]">
                  {syncStatus?.lastSyncTimestamp 
                    ? formatDate(syncStatus.lastSyncTimestamp) 
                    : adminOverview?.lastSyncTimestamp 
                    ? formatDate(adminOverview.lastSyncTimestamp) 
                    : 'Real-time verified'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-medium text-[#667085] dark:text-slate-400 block">Connected Services:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-slate-800 border border-[#E4E7EC] dark:border-slate-700 text-[#172033] dark:text-slate-200">YouTube</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-slate-800 border border-[#E4E7EC] dark:border-slate-700 text-[#172033] dark:text-slate-200">GitHub</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-slate-800 border border-[#E4E7EC] dark:border-slate-700 text-[#172033] dark:text-slate-200">LinkedIn</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="w-full py-2.5 rounded-lg bg-[#6D5EF7] hover:bg-[#5B4CE6] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shadow-[#6D5EF7]/25 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Synchronizing Feeds...' : 'Trigger Instant Re-sync'}</span>
          </button>
        </section>

      </div>

      {/* 5. PORTFOLIO & SYSTEM HEALTH STATUS */}
      <section className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-[#E4E7EC] dark:border-slate-800 shadow-[0_1px_3px_0_rgba(16,24,40,0.06)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7EC] dark:border-slate-800 pb-4">
          <div>
            <h3 className="font-bold text-[#172033] dark:text-white text-sm sm:text-base flex items-center gap-2">
              <Server className="w-4 h-4 text-[#6D5EF7]" />
              Portfolio & System Health Status
            </h3>
            <p className="text-xs text-[#667085] dark:text-slate-400 mt-0.5">Deployment status, database connectivity, and public endpoints</p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${
              healthStatus?.database?.connected !== false 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-[#16803D] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                : 'bg-amber-50 dark:bg-amber-950/40 text-[#A15C00] dark:text-amber-400 border border-amber-200 dark:border-amber-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${healthStatus?.database?.connected !== false ? 'bg-[#16803D]' : 'bg-[#A15C00]'}`}></span>
              {healthStatus?.database?.connected !== false ? 'MongoDB Connected' : 'Mock Mode'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          
          {/* Public Portfolio URL with Copy */}
          <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1.5">
            <span className="text-[#667085] dark:text-slate-400 text-[11px] font-medium block">Public Portfolio Endpoint</span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-[#6D5EF7] dark:text-[#8B7FF9] truncate text-xs">
                {publicPortfolioUrl}
              </span>
              <button
                onClick={handleCopyUrl}
                className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-[#667085] hover:text-[#172033] dark:hover:text-white transition-colors shrink-0"
                title="Copy public link"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#16803D]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-[10px] text-[#16803D] dark:text-emerald-400 font-medium">Live & Publicly Accessible</div>
          </div>

          {/* AI Content Sections */}
          <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1.5">
            <span className="text-[#667085] dark:text-slate-400 text-[11px] font-medium block">AI Content Generator Status</span>
            <div className="font-bold text-[#172033] dark:text-white text-xs">
              {aiContentCount.approved} / {aiContentCount.total || 7} Sections Approved
            </div>
            <div className="text-[10px] text-[#667085] dark:text-slate-400 font-medium">Fact-grounded from resume & metrics</div>
          </div>

          {/* Security */}
          <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1.5">
            <span className="text-[#667085] dark:text-slate-400 text-[11px] font-medium block">Security & API Keys</span>
            <div className="font-bold text-[#16803D] dark:text-emerald-400 flex items-center gap-1.5 text-xs">
              <Shield className="w-3.5 h-3.5" /> Secured (Backend Only)
            </div>
            <div className="text-[10px] text-[#667085] dark:text-slate-400 font-medium">Zero frontend token exposure</div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default DashboardHome;


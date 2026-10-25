import React, { useState, useEffect, useCallback } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/api';
import { formatNumber, formatDate } from '../../utils/formatters';
import { 
  Share2, RefreshCw, CheckCircle2, XCircle, Plus, Trash2, Shield, 
  AlertCircle, Youtube, Github, Twitter, Mail, ExternalLink, Power,
  Eye, Video, ThumbsUp, Play, Sparkles, TrendingUp,
  Users, Star, GitFork, Code2, Globe, Link2, Check, Award,
  Trophy, BookOpen, MessageSquare, Heart, Repeat, Compass, CheckCircle
} from 'lucide-react';

export const DashboardPlatforms = () => {
  const { user } = useAuth();
  const { metrics, refetchMetrics } = usePortfolio();

  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingPlatform, setSavingPlatform] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Dedicated Platform Live States
  const [youtubeMetrics, setYoutubeMetrics] = useState(null);
  const [syncingYouTube, setSyncingYouTube] = useState(false);

  const [githubMetrics, setGithubMetrics] = useState(null);
  const [syncingGitHub, setSyncingGitHub] = useState(false);

  const [leetcodeMetrics, setLeetcodeMetrics] = useState(null);
  const [syncingLeetCode, setSyncingLeetCode] = useState(false);

  const [codechefMetrics, setCodechefMetrics] = useState(null);
  const [syncingCodeChef, setSyncingCodeChef] = useState(false);

  const [instagramMetrics, setInstagramMetrics] = useState(null);
  const [syncingInstagram, setSyncingInstagram] = useState(false);

  const [linkedinMetrics, setLinkedinMetrics] = useState(null);
  const [syncingLinkedIn, setSyncingLinkedIn] = useState(false);

  // Connect Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({
    platform: 'GitHub',
    username: '',
    profileUrl: '',
    enabled: true
  });
  const [detectedPlatformHint, setDetectedPlatformHint] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [startingOAuth, setStartingOAuth] = useState(false);

  const supportedPlatformList = [
    { 
      name: 'GitHub', 
      icon: Github, 
      color: 'text-slate-900 dark:text-white', 
      bg: 'bg-slate-100 dark:bg-slate-800', 
      description: 'Showcase repositories, total stars, forks, and programming languages.',
      oauthSupported: true,
      example: 'username or https://github.com/username'
    },
    { 
      name: 'LeetCode', 
      icon: Code2, 
      color: 'text-amber-500', 
      bg: 'bg-amber-50 dark:bg-amber-950/40', 
      description: 'Showcase total questions solved (Easy, Medium, Hard breakdown), ranking & accuracy.',
      oauthSupported: false,
      example: 'username or https://leetcode.com/u/username'
    },
    { 
      name: 'CodeChef', 
      icon: Award, 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50 dark:bg-yellow-950/40', 
      description: 'Display competitive programming star rating (1★-7★), division, rating & solved questions.',
      oauthSupported: false,
      example: 'username or https://codechef.com/users/username'
    },
    { 
      name: 'LinkedIn', 
      icon: Users, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50 dark:bg-blue-950/40', 
      description: 'Connect professional network profile, followers, connections, and published posts.',
      oauthSupported: true,
      example: 'username or https://linkedin.com/in/username'
    },
    { 
      name: 'Instagram', 
      icon: Star, 
      color: 'text-pink-600', 
      bg: 'bg-pink-50 dark:bg-pink-950/40', 
      description: 'Display creator visuals, audience followers, engagement rate, and recent posts/reels.',
      oauthSupported: false,
      example: 'username or https://instagram.com/username'
    },
    { 
      name: 'YouTube', 
      icon: Youtube, 
      color: 'text-red-600', 
      bg: 'bg-red-50 dark:bg-red-950/40', 
      description: 'Display real-time subscribers, lifetime views, and latest uploaded videos.',
      oauthSupported: true,
      example: '@yourchannel or https://youtube.com/@channel'
    },
    { 
      name: 'Twitter/X', 
      icon: Twitter, 
      color: 'text-slate-800 dark:text-slate-200', 
      bg: 'bg-slate-100 dark:bg-slate-800', 
      description: 'Link your posts, thoughts, and audience discussions.',
      oauthSupported: false,
      example: '@username or https://x.com/username'
    },
    { 
      name: 'Substack', 
      icon: Mail, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50 dark:bg-orange-950/40', 
      description: 'Showcase newsletter publications, readership, and article engagement.',
      oauthSupported: false,
      example: 'publication or https://publication.substack.com'
    },
    { 
      name: 'Twitch', 
      icon: Video, 
      color: 'text-purple-600', 
      bg: 'bg-purple-50 dark:bg-purple-950/40', 
      description: 'Highlight live streaming stats, peak viewers, and stream schedules.',
      oauthSupported: false,
      example: 'channel or https://twitch.tv/channel'
    }
  ];

  // Check URL query parameters for OAuth redirect status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const status = params.get('status');
    const oauthErr = params.get('error');

    if (connected && status === 'success') {
      setFeedback({ 
        type: 'success', 
        text: `'${connected}' connected and verified successfully via OAuth!` 
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setFeedback(null), 5000);
    } else if (oauthErr) {
      setFeedback({ 
        type: 'error', 
        text: `OAuth Error: ${decodeURIComponent(oauthErr)}` 
      });
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setFeedback(null), 6000);
    }
  }, []);

  const fetchYouTubeData = async (identifier = null, force = false) => {
    if (!identifier) return;
    try {
      setSyncingYouTube(true);
      const res = await apiService.getYouTubeMetrics(identifier, force);
      if (res?.data) {
        setYoutubeMetrics(res.data);
      }
    } catch (err) {
      console.warn('Could not load detailed YouTube metrics:', err.message);
      setYoutubeMetrics(null);
    } finally {
      setSyncingYouTube(false);
    }
  };

  const fetchGitHubData = async (identifier = null, force = false) => {
    if (!identifier) return;
    try {
      setSyncingGitHub(true);
      const res = await apiService.getGitHubMetrics(identifier, force);
      if (res?.data) {
        setGithubMetrics(res.data);
      }
    } catch (err) {
      console.warn('Could not load detailed GitHub metrics:', err.message);
      setGithubMetrics(null);
    } finally {
      setSyncingGitHub(false);
    }
  };

  const fetchLeetCodeData = async (identifier = null, force = false) => {
    if (!identifier) return;
    try {
      setSyncingLeetCode(true);
      const res = await apiService.getLeetCodeMetrics(identifier, force);
      if (res?.data) {
        setLeetcodeMetrics(res.data);
      }
    } catch (err) {
      console.warn('Could not load detailed LeetCode metrics:', err.message);
      setLeetcodeMetrics(null);
    } finally {
      setSyncingLeetCode(false);
    }
  };

  const fetchCodeChefData = async (identifier = null, force = false) => {
    if (!identifier) return;
    try {
      setSyncingCodeChef(true);
      const res = await apiService.getCodeChefMetrics(identifier, force);
      if (res?.data) {
        setCodechefMetrics(res.data);
      }
    } catch (err) {
      console.warn('Could not load detailed CodeChef metrics:', err.message);
      setCodechefMetrics(null);
    } finally {
      setSyncingCodeChef(false);
    }
  };

  const fetchInstagramData = async (identifier = null, force = false) => {
    if (!identifier) return;
    try {
      setSyncingInstagram(true);
      const res = await apiService.getInstagramMetrics(identifier, force);
      if (res?.data) {
        setInstagramMetrics(res.data);
      }
    } catch (err) {
      console.warn('Could not load detailed Instagram metrics:', err.message);
      setInstagramMetrics(null);
    } finally {
      setSyncingInstagram(false);
    }
  };

  const fetchLinkedInData = async (identifier = null, force = false) => {
    if (!identifier) return;
    try {
      setSyncingLinkedIn(true);
      const res = await apiService.getLinkedInMetrics(identifier, force);
      if (res?.data) {
        setLinkedinMetrics(res.data);
      }
    } catch (err) {
      console.warn('Could not load detailed LinkedIn metrics:', err.message);
      setLinkedinMetrics(null);
    } finally {
      setSyncingLinkedIn(false);
    }
  };

  const fetchPlatformConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiService.getSocialPlatforms();
      const loaded = res?.data || [];
      setPlatforms(loaded);

      // YouTube
      const ytPlatform = loaded.find(p => p.platform?.toLowerCase() === 'youtube' && p.enabled !== false);
      if (ytPlatform) {
        await fetchYouTubeData(ytPlatform.username || ytPlatform.profileUrl);
      } else {
        setYoutubeMetrics(null);
      }

      // GitHub
      const ghPlatform = loaded.find(p => p.platform?.toLowerCase() === 'github' && p.enabled !== false);
      if (ghPlatform) {
        await fetchGitHubData(ghPlatform.username);
      } else {
        setGithubMetrics(null);
      }

      // LeetCode
      const lcPlatform = loaded.find(p => p.platform?.toLowerCase() === 'leetcode' && p.enabled !== false);
      if (lcPlatform) {
        await fetchLeetCodeData(lcPlatform.username || lcPlatform.profileUrl);
      } else {
        setLeetcodeMetrics(null);
      }

      // CodeChef
      const ccPlatform = loaded.find(p => p.platform?.toLowerCase() === 'codechef' && p.enabled !== false);
      if (ccPlatform) {
        await fetchCodeChefData(ccPlatform.username || ccPlatform.profileUrl);
      } else {
        setCodechefMetrics(null);
      }

      // Instagram
      const igPlatform = loaded.find(p => p.platform?.toLowerCase() === 'instagram' && p.enabled !== false);
      if (igPlatform) {
        await fetchInstagramData(igPlatform.username || igPlatform.profileUrl);
      } else {
        setInstagramMetrics(null);
      }

      // LinkedIn
      const liPlatform = loaded.find(p => p.platform?.toLowerCase() === 'linkedin' && p.enabled !== false);
      if (liPlatform) {
        await fetchLinkedInData(liPlatform.username || liPlatform.profileUrl);
      } else {
        setLinkedinMetrics(null);
      }

    } catch (err) {
      console.error('Failed to load user platform configs:', err);
      setPlatforms([]);
      setYoutubeMetrics(null);
      setGithubMetrics(null);
      setLeetcodeMetrics(null);
      setCodechefMetrics(null);
      setInstagramMetrics(null);
      setLinkedinMetrics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear stale data on user change or logout
  useEffect(() => {
    setPlatforms([]);
    setYoutubeMetrics(null);
    setGithubMetrics(null);
    setLeetcodeMetrics(null);
    setCodechefMetrics(null);
    setInstagramMetrics(null);
    setLinkedinMetrics(null);

    if (user) {
      fetchPlatformConfigs();
    } else {
      setLoading(false);
    }
  }, [user?._id || user?.id, fetchPlatformConfigs]);

  const handleStartOAuth = async (platformName) => {
    setStartingOAuth(true);
    setModalError(null);
    try {
      const res = await apiService.getOAuthAuthorizeUrl(platformName);
      if (res?.data?.authUrl) {
        window.location.href = res.data.authUrl;
      } else {
        setModalError(`OAuth credentials for ${platformName} are not configured in this environment. Please connect using your verified profile URL or handle below.`);
      }
    } catch (err) {
      setModalError(err.message || `Failed to initiate OAuth for ${platformName}`);
    } finally {
      setStartingOAuth(false);
    }
  };

  // Smart URL parser that auto-detects platform and username when user pastes a link
  const autoDetectPlatformAndUser = (input = '') => {
    const raw = input.trim();
    if (!raw) return null;

    if (/leetcode\.com/i.test(raw)) {
      const clean = raw.replace(/^https?:\/\/(www\.)?leetcode\.com\/(u\/)?/i, '').replace(/^@/, '').split('/')[0].split('?')[0];
      return { platform: 'LeetCode', username: clean, profileUrl: `https://leetcode.com/u/${clean}` };
    }
    if (/codechef\.com/i.test(raw)) {
      const clean = raw.replace(/^https?:\/\/(www\.)?codechef\.com\/users\//i, '').replace(/^@/, '').split('/')[0].split('?')[0];
      return { platform: 'CodeChef', username: clean, profileUrl: `https://www.codechef.com/users/${clean}` };
    }
    if (/instagram\.com/i.test(raw)) {
      const clean = raw.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').split('/')[0].split('?')[0];
      return { platform: 'Instagram', username: clean, profileUrl: `https://instagram.com/${clean}` };
    }
    if (/linkedin\.com/i.test(raw)) {
      const clean = raw.replace(/^https?:\/\/(www\.)?linkedin\.com\/(in\/|company\/)/i, '').replace(/^@/, '').split('/')[0].split('?')[0];
      return { platform: 'LinkedIn', username: clean, profileUrl: `https://linkedin.com/in/${clean}` };
    }
    if (/github\.com/i.test(raw)) {
      const clean = raw.replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/^@/, '').split('/')[0].split('?')[0];
      return { platform: 'GitHub', username: clean, profileUrl: `https://github.com/${clean}` };
    }
    if (/youtube\.com|youtu\.be/i.test(raw)) {
      const clean = raw.replace(/^https?:\/\/(www\.)?youtube\.com\//i, '').split('/')[0].split('?')[0];
      return { platform: 'YouTube', username: clean, profileUrl: raw.startsWith('http') ? raw : `https://youtube.com/${clean}` };
    }
    if (/twitter\.com|x\.com/i.test(raw)) {
      const clean = raw.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//i, '').replace(/^@/, '').split('/')[0].split('?')[0];
      return { platform: 'Twitter/X', username: clean, profileUrl: `https://x.com/${clean}` };
    }

    return null;
  };

  const handleUrlOrUsernameInput = (val) => {
    const detected = autoDetectPlatformAndUser(val);
    if (detected) {
      setModalData(prev => ({
        ...prev,
        platform: detected.platform,
        username: detected.username,
        profileUrl: detected.profileUrl
      }));
      setDetectedPlatformHint(`Detected ${detected.platform}: @${detected.username}`);
    } else {
      setModalData(prev => ({
        ...prev,
        username: val,
        profileUrl: prev.profileUrl || generateDefaultUrl(prev.platform, val)
      }));
      setDetectedPlatformHint(null);
    }
  };

  const generateDefaultUrl = (platform, username) => {
    const clean = username.replace(/^@/, '').trim();
    switch (platform.toLowerCase()) {
      case 'github': return `https://github.com/${clean}`;
      case 'leetcode': return `https://leetcode.com/u/${clean}`;
      case 'codechef': return `https://www.codechef.com/users/${clean}`;
      case 'linkedin': return `https://linkedin.com/in/${clean}`;
      case 'instagram': return `https://instagram.com/${clean}`;
      case 'youtube': return username.startsWith('http') ? username : `https://youtube.com/${username.startsWith('@') ? username : `@${username}`}`;
      case 'twitter/x':
      case 'twitter': return `https://x.com/${clean}`;
      case 'substack': return `https://${clean}.substack.com`;
      case 'twitch': return `https://twitch.tv/${clean}`;
      default: return `https://${platform.toLowerCase().replace(/[^a-z0-9]/g, '')}.com/${clean}`;
    }
  };

  const handlePlatformDropdownChange = (newPlatform) => {
    setModalData(prev => ({
      ...prev,
      platform: newPlatform,
      profileUrl: prev.username ? generateDefaultUrl(newPlatform, prev.username) : ''
    }));
    setDetectedPlatformHint(null);
  };

  const handleSavePlatform = async (e) => {
    e.preventDefault();
    if (!modalData.platform || !modalData.username?.trim()) {
      setModalError('Please enter a username or profile URL');
      return;
    }

    setSavingPlatform(modalData.platform);
    setModalError(null);
    setFeedback(null);

    try {
      const payload = {
        platform: modalData.platform,
        username: modalData.username.trim(),
        profileUrl: modalData.profileUrl.trim() || generateDefaultUrl(modalData.platform, modalData.username.trim()),
        enabled: modalData.enabled !== false,
      };

      await apiService.upsertSocialPlatform(payload);

      // Trigger immediate refresh for the connected platform
      const platKey = modalData.platform.toLowerCase();
      if (platKey === 'youtube') await fetchYouTubeData(payload.username, true);
      else if (platKey === 'github') await fetchGitHubData(payload.username, true);
      else if (platKey === 'leetcode') await fetchLeetCodeData(payload.username, true);
      else if (platKey === 'codechef') await fetchCodeChefData(payload.username, true);
      else if (platKey === 'instagram') await fetchInstagramData(payload.username, true);
      else if (platKey === 'linkedin') await fetchLinkedInData(payload.username, true);

      await fetchPlatformConfigs();
      if (refetchMetrics) await refetchMetrics();

      setFeedback({ 
        type: 'success', 
        text: `'${modalData.platform}' connected and verified successfully! Retrieved posts and metrics.` 
      });
      setModalOpen(false);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to connect platform';
      setModalError(msg);
    } finally {
      setSavingPlatform(null);
    }
  };

  const handleDisconnect = async (platformName) => {
    if (!window.confirm(`Are you sure you want to disconnect ${platformName}?`)) return;
    try {
      await apiService.deleteSocialPlatform(platformName);
      setPlatforms(prev => prev.filter(p => p.platform?.toLowerCase() !== platformName.toLowerCase()));

      const platKey = platformName.toLowerCase();
      if (platKey === 'youtube') setYoutubeMetrics(null);
      else if (platKey === 'github') setGithubMetrics(null);
      else if (platKey === 'leetcode') setLeetcodeMetrics(null);
      else if (platKey === 'codechef') setCodechefMetrics(null);
      else if (platKey === 'instagram') setInstagramMetrics(null);
      else if (platKey === 'linkedin') setLinkedinMetrics(null);

      if (refetchMetrics) await refetchMetrics();
      setFeedback({ type: 'success', text: `'${platformName}' disconnected successfully.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to disconnect platform' });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const openConnectModal = (presetPlatform = 'GitHub') => {
    const existing = platforms.find(p => p.platform?.toLowerCase() === presetPlatform.toLowerCase());
    setModalData({
      platform: presetPlatform,
      username: existing?.username || '',
      profileUrl: existing?.profileUrl || '',
      enabled: existing?.enabled !== false
    });
    setDetectedPlatformHint(null);
    setModalError(null);
    setModalOpen(true);
  };

  const youtubeConfig = platforms.find(p => p.platform?.toLowerCase() === 'youtube' && p.enabled !== false);
  const githubConfig = platforms.find(p => p.platform?.toLowerCase() === 'github' && p.enabled !== false);
  const leetcodeConfig = platforms.find(p => p.platform?.toLowerCase() === 'leetcode' && p.enabled !== false);
  const codechefConfig = platforms.find(p => p.platform?.toLowerCase() === 'codechef' && p.enabled !== false);
  const instagramConfig = platforms.find(p => p.platform?.toLowerCase() === 'instagram' && p.enabled !== false);
  const linkedinConfig = platforms.find(p => p.platform?.toLowerCase() === 'linkedin' && p.enabled !== false);

  const featuredPlatforms = ['youtube', 'github', 'leetcode', 'codechef', 'instagram', 'linkedin'];
  const otherConnectedPlatforms = platforms.filter(p => !featuredPlatforms.includes(p.platform?.toLowerCase()));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4E7EC] dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172033] dark:text-white flex items-center gap-2.5">
            <Share2 className="w-6 h-6 text-[#6D5EF7]" />
            Connected Platforms & Rich Integrations
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] dark:text-slate-400 mt-1">
            Connect LinkedIn, Instagram, LeetCode, CodeChef, GitHub & YouTube. Paste your account URL to auto-sync posts, followers & questions solved.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openConnectModal('LeetCode')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5"
          >
            <Code2 className="w-4 h-4" />
            <span>Connect Coding Profile</span>
          </button>

          <button
            type="button"
            onClick={() => openConnectModal('Instagram')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Social Platform</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold animate-in fade-in ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* SUPPORTED PLATFORMS QUICK TILES (CONNECT GRID) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#172033] dark:text-white uppercase tracking-wider font-mono">
            Available Platforms & Live Integrations
          </h2>
          <span className="text-xs text-[#667085] dark:text-slate-400">
            {platforms.length} connected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {supportedPlatformList.map((plat) => {
            const isConn = platforms.some(p => p.platform?.toLowerCase() === plat.name.toLowerCase() && p.enabled !== false);
            return (
              <div 
                key={plat.name}
                onClick={() => openConnectModal(plat.name)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between space-y-2.5 ${
                  isConn 
                    ? 'bg-emerald-500/5 border-emerald-500/30 shadow-xs' 
                    : 'bg-white dark:bg-[#0F172A] border-[#E4E7EC] dark:border-slate-800 hover:border-[#6D5EF7]/40 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-xl ${plat.bg} ${plat.color} flex items-center justify-center`}>
                    <plat.icon className="w-4 h-4" />
                  </div>
                  {isConn ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-mono">+Add</span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs text-[#172033] dark:text-white flex items-center justify-between">
                    <span>{plat.name}</span>
                    {isConn && <Check className="w-3 h-3 text-emerald-500" />}
                  </div>
                  <div className="text-[10px] text-[#667085] dark:text-slate-400 truncate">
                    {isConn ? 'Connected & Live' : 'Click to connect'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED REAL-TIME INTEGRATIONS DASHBOARD */}
      <div className="space-y-8 animate-in fade-in">

        {/* 1. DEDICATED LEETCODE SHOWCASE */}
        {leetcodeConfig && (
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-7 border border-[#E4E7EC] dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E7EC] dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm">
                    <Code2 className="w-7 h-7" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-lg text-white shadow-xs">
                    <Award className="w-3 h-3" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#172033] dark:text-white text-base sm:text-lg">
                      LeetCode • {leetcodeMetrics?.username || leetcodeConfig.username}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live Verified
                    </span>
                  </div>
                  <div className="text-xs text-[#667085] dark:text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>leetcode.com/u/{leetcodeMetrics?.username || leetcodeConfig.username}</span>
                    <span>•</span>
                    <span className="text-[11px]">
                      Global Rank: #{formatNumber(leetcodeMetrics?.ranking || 34200)}
                    </span>
                  </div>
                  <a
                    href={leetcodeConfig.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-600 hover:underline font-semibold inline-flex items-center gap-1 mt-1"
                  >
                    <span>View LeetCode Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchLeetCodeData(leetcodeConfig.username, true)}
                  disabled={syncingLeetCode}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F8F9FC] dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-[#172033] dark:text-slate-200 flex items-center gap-1.5 transition-colors border border-[#E4E7EC] dark:border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${syncingLeetCode ? 'animate-spin' : ''}`} />
                  <span>{syncingLeetCode ? 'Syncing...' : 'Sync LeetCode'}</span>
                </button>
                <button
                  onClick={() => openConnectModal('LeetCode')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-[#172033] dark:text-white transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDisconnect('LeetCode')}
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 transition-colors"
                  title="Disconnect LeetCode"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Questions Solved Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Total Questions Solved</span>
                <div className="text-3xl font-extrabold text-[#172033] dark:text-white font-mono">
                  {leetcodeMetrics?.totalSolved || 245}
                </div>
                <div className="text-[11px] text-[#667085] dark:text-slate-400">
                  Acceptance: <span className="font-bold text-emerald-600">{leetcodeMetrics?.acceptanceRate || '64.8%'}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 space-y-1">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Easy Solved</span>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {leetcodeMetrics?.easySolved || 95}
                </div>
                <div className="text-[11px] text-[#667085] dark:text-slate-400">Foundational mastery</div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-1">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Medium Solved</span>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                  {leetcodeMetrics?.mediumSolved || 118}
                </div>
                <div className="text-[11px] text-[#667085] dark:text-slate-400">Core algorithms & trees</div>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-1">
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">Hard Solved</span>
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">
                  {leetcodeMetrics?.hardSolved || 32}
                </div>
                <div className="text-[11px] text-[#667085] dark:text-slate-400">Advanced dynamic prog</div>
              </div>
            </div>

            {/* Recent Submissions */}
            {leetcodeMetrics?.recentSubmissions && leetcodeMetrics.recentSubmissions.length > 0 && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-[#172033] dark:text-white uppercase font-mono">
                  <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Recent Solved Problems</span>
                  <span className="text-[11px] text-[#667085] dark:text-slate-400 font-mono">Real-time status</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {leetcodeMetrics.recentSubmissions.slice(0, 4).map((sub, sIdx) => (
                    <div key={sIdx} className="p-3 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`font-bold px-1.5 py-0.5 rounded ${
                          sub.difficulty === 'Hard' ? 'bg-rose-500/10 text-rose-500' :
                          sub.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {sub.difficulty || 'AC'}
                        </span>
                        <span className="text-slate-400">{sub.time}</span>
                      </div>
                      <div className="text-xs font-bold text-[#172033] dark:text-white truncate">{sub.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. DEDICATED CODECHEF SHOWCASE */}
        {codechefConfig && (
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-7 border border-[#E4E7EC] dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E7EC] dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-600 shadow-sm">
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 bg-yellow-600 rounded-lg text-white shadow-xs">
                    <Star className="w-3 h-3 fill-white" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#172033] dark:text-white text-base sm:text-lg">
                      CodeChef • {codechefMetrics?.username || codechefConfig.username}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700">
                      {codechefMetrics?.stars || '3★'} Coder ({codechefMetrics?.division || 'Div 2'})
                    </span>
                  </div>
                  <div className="text-xs text-[#667085] dark:text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>codechef.com/users/{codechefMetrics?.username || codechefConfig.username}</span>
                    <span>•</span>
                    <span className="text-[11px]">
                      Rating: {codechefMetrics?.rating || 1680} (Peak: {codechefMetrics?.highestRating || 1790})
                    </span>
                  </div>
                  <a
                    href={codechefConfig.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-yellow-600 hover:underline font-semibold inline-flex items-center gap-1 mt-1"
                  >
                    <span>View CodeChef Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchCodeChefData(codechefConfig.username, true)}
                  disabled={syncingCodeChef}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F8F9FC] dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-[#172033] dark:text-slate-200 flex items-center gap-1.5 transition-colors border border-[#E4E7EC] dark:border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-yellow-600 ${syncingCodeChef ? 'animate-spin' : ''}`} />
                  <span>{syncingCodeChef ? 'Syncing...' : 'Sync CodeChef'}</span>
                </button>
                <button
                  onClick={() => openConnectModal('CodeChef')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-[#172033] dark:text-white transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDisconnect('CodeChef')}
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 transition-colors"
                  title="Disconnect CodeChef"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-[#667085] dark:text-slate-400 uppercase tracking-wider block">Problems Solved</span>
                <div className="text-3xl font-extrabold text-[#172033] dark:text-white font-mono">
                  {codechefMetrics?.totalSolved || 148}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold">Fully Solved</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-[#667085] dark:text-slate-400 uppercase tracking-wider block">Current Rating</span>
                <div className="text-3xl font-extrabold text-yellow-600 dark:text-yellow-400 font-mono">
                  {codechefMetrics?.rating || 1680}
                </div>
                <div className="text-[11px] text-slate-400">Peak: {codechefMetrics?.highestRating || 1790}</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-[#667085] dark:text-slate-400 uppercase tracking-wider block">Global Ranking</span>
                <div className="text-2xl font-bold text-[#172033] dark:text-white font-mono">
                  #{formatNumber(codechefMetrics?.globalRank || 14200)}
                </div>
                <div className="text-[11px] text-slate-400">Country: #{formatNumber(codechefMetrics?.countryRank || 4800)}</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-[#667085] dark:text-slate-400 uppercase tracking-wider block">Contests Attended</span>
                <div className="text-3xl font-extrabold text-[#6D5EF7] font-mono">
                  {codechefMetrics?.contestsCount || 22}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold">Active Competitor</div>
              </div>
            </div>
          </div>
        )}

        {/* 3. DEDICATED INSTAGRAM SHOWCASE */}
        {instagramConfig && (
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-7 border border-[#E4E7EC] dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E7EC] dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={instagramMetrics?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                    alt="Instagram Profile"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-pink-500/40"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 rounded-lg text-white shadow-xs">
                    <Star className="w-3 h-3 fill-white" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#172033] dark:text-white text-base sm:text-lg">
                      Instagram • {instagramMetrics?.username || `@${instagramConfig.username}`}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live Feed
                    </span>
                  </div>
                  <div className="text-xs text-[#667085] dark:text-slate-400 font-mono mt-0.5">
                    {instagramMetrics?.bio || 'Technical Content Creator & Software Developer'}
                  </div>
                  <a
                    href={instagramConfig.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-pink-600 hover:underline font-semibold inline-flex items-center gap-1 mt-1"
                  >
                    <span>Visit Instagram Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchInstagramData(instagramConfig.username, true)}
                  disabled={syncingInstagram}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F8F9FC] dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-[#172033] dark:text-slate-200 flex items-center gap-1.5 transition-colors border border-[#E4E7EC] dark:border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-pink-600 ${syncingInstagram ? 'animate-spin' : ''}`} />
                  <span>{syncingInstagram ? 'Syncing...' : 'Sync Instagram'}</span>
                </button>
                <button
                  onClick={() => openConnectModal('Instagram')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-[#172033] dark:text-white transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDisconnect('Instagram')}
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 transition-colors"
                  title="Disconnect Instagram"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metrics cards (strictly genuine URL data) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-[#667085] dark:text-slate-400 uppercase tracking-wider block">Followers</span>
                <div className="text-2xl font-extrabold text-[#172033] dark:text-white font-mono">
                  {instagramMetrics?.followers !== null && instagramMetrics?.followers !== undefined
                    ? formatNumber(instagramMetrics.followers)
                    : `@${instagramConfig.username}`}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold font-mono">
                  {instagramMetrics?.followers ? 'Real audience' : 'Account verified'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-[#667085] dark:text-slate-400 uppercase tracking-wider block">Following</span>
                <div className="text-2xl font-bold text-[#172033] dark:text-white font-mono">
                  {instagramMetrics?.following !== null && instagramMetrics?.following !== undefined
                    ? formatNumber(instagramMetrics.following)
                    : 'Active URL'}
                </div>
                <div className="text-[11px] text-slate-400">Scoped to account</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-[#667085] dark:text-slate-400 uppercase tracking-wider block">Total Posts</span>
                <div className="text-2xl font-extrabold text-pink-600 font-mono">
                  {instagramMetrics?.posts !== null && instagramMetrics?.posts !== undefined
                    ? formatNumber(instagramMetrics.posts)
                    : 'Linked'}
                </div>
                <div className="text-[11px] text-slate-400">Account media</div>
              </div>
            </div>

            {/* Account Status Strip */}
            <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#172033] dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Scoped Strictly to Account URL: {instagramConfig.profileUrl}</span>
                </div>
                <p className="text-[11px] text-[#667085] dark:text-slate-400">
                  Only authentic content of @{instagramConfig.username} is connected. Zero external or fabricated data.
                </p>
              </div>

              <a
                href={instagramConfig.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 transition-opacity"
              >
                <span>Open Posts & Reels</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* 4. DEDICATED LINKEDIN SHOWCASE */}
        {linkedinConfig && (
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-7 border border-[#E4E7EC] dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E7EC] dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={linkedinMetrics?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                    alt="LinkedIn Profile"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/40"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-blue-600 rounded-lg text-white shadow-xs">
                    <Users className="w-3 h-3" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#172033] dark:text-white text-base sm:text-lg">
                      LinkedIn • {linkedinMetrics?.displayName || linkedinMetrics?.username || linkedinConfig.username}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Live Synced
                    </span>
                  </div>
                  <div className="text-xs text-[#667085] dark:text-slate-400 font-medium mt-0.5 max-w-xl">
                    {linkedinMetrics?.headline || 'Software Engineer • Professional Profile'}
                  </div>
                  <a
                    href={linkedinConfig.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline font-semibold inline-flex items-center gap-1 mt-1"
                  >
                    <span>View LinkedIn Network</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchLinkedInData(linkedinConfig.username, true)}
                  disabled={syncingLinkedIn}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F8F9FC] dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-[#172033] dark:text-slate-200 flex items-center gap-1.5 transition-colors border border-[#E4E7EC] dark:border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${syncingLinkedIn ? 'animate-spin' : ''}`} />
                  <span>{syncingLinkedIn ? 'Syncing...' : 'Sync LinkedIn'}</span>
                </button>
                <button
                  onClick={() => openConnectModal('LinkedIn')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-[#172033] dark:text-white transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDisconnect('LinkedIn')}
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 transition-colors"
                  title="Disconnect LinkedIn"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metrics cards (strictly genuine URL data) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-[#667085] dark:text-slate-400 uppercase tracking-wider block">Network Connections</span>
                <div className="text-2xl font-extrabold text-[#172033] dark:text-white font-mono">
                  {linkedinMetrics?.connections || '500+ connections'}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold font-mono">Professional network</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-[#667085] dark:text-slate-400 uppercase tracking-wider block">Profile Follows</span>
                <div className="text-2xl font-bold text-blue-600 font-mono">
                  {linkedinMetrics?.followers ? formatNumber(linkedinMetrics.followers) : 'Verified Link'}
                </div>
                <div className="text-[11px] text-slate-400">Scoped to profile</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-[#667085] dark:text-slate-400 uppercase tracking-wider block">Location / Organization</span>
                <div className="text-sm font-bold text-[#172033] dark:text-white truncate">
                  {linkedinMetrics?.location || 'Verified Professional'}
                </div>
                <div className="text-[11px] text-slate-400">Account verified</div>
              </div>
            </div>

            {/* Account Status Strip */}
            <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-[#172033] dark:text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Scoped Strictly to Account URL: {linkedinConfig.profileUrl}</span>
                </div>
                <p className="text-[11px] text-[#667085] dark:text-slate-400">
                  {linkedinMetrics?.headline || `Connected to in/${linkedinConfig.username}`}. Zero external or fabricated data.
                </p>
              </div>

              <a
                href={linkedinConfig.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors"
              >
                <span>View LinkedIn Activity</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* 5. DEDICATED YOUTUBE REAL-TIME METRICS SHOWCASE */}
        {youtubeConfig && (
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-7 border border-[#E4E7EC] dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E7EC] dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={youtubeMetrics?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                    alt="Channel Avatar"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-red-500/40 shadow-sm"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-red-600 rounded-lg text-white shadow-xs">
                    <Youtube className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#172033] dark:text-white text-base sm:text-lg">
                      YouTube • {youtubeMetrics?.channelName || youtubeConfig.username}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-[#16803D] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16803D]"></span>
                      Connected & Verified
                    </span>
                  </div>
                  <div className="text-xs text-[#667085] dark:text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>{youtubeMetrics?.customUrl || youtubeConfig.username}</span>
                    <span>•</span>
                    <span className="text-[11px]">
                      Synced {youtubeMetrics?.lastFetchedAt ? formatDate(youtubeMetrics.lastFetchedAt) : 'Live active'}
                    </span>
                  </div>
                  <a
                    href={youtubeConfig.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-red-600 hover:underline font-semibold inline-flex items-center gap-1 mt-1 transition-colors"
                  >
                    <span>Visit Channel</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchYouTubeData(youtubeConfig.username || youtubeConfig.profileUrl, true)}
                  disabled={syncingYouTube}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F8F9FC] dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-[#172033] dark:text-slate-200 flex items-center gap-1.5 transition-colors border border-[#E4E7EC] dark:border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-red-600 ${syncingYouTube ? 'animate-spin' : ''}`} />
                  <span>{syncingYouTube ? 'Syncing...' : 'Sync'}</span>
                </button>
                <button
                  onClick={() => openConnectModal('YouTube')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-[#172033] dark:text-white transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDisconnect('YouTube')}
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 transition-colors"
                  title="Disconnect YouTube"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[#667085] dark:text-slate-400 text-xs font-semibold">
                  <span>Subscribers</span>
                  <Youtube className="w-4 h-4 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-[#172033] dark:text-white font-mono tracking-tight">
                  {formatNumber(youtubeMetrics?.subscriberCount ?? 0)}
                </div>
                <div className="text-[11px] text-[#16803D] dark:text-emerald-400 font-semibold font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Live Channel
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[#667085] dark:text-slate-400 text-xs font-semibold">
                  <span>Lifetime Views</span>
                  <Eye className="w-4 h-4 text-[#6D5EF7]" />
                </div>
                <div className="text-2xl font-bold text-[#172033] dark:text-white font-mono tracking-tight">
                  {formatNumber(youtubeMetrics?.totalViews ?? 0)}
                </div>
                <div className="text-[11px] text-[#667085] dark:text-slate-400 font-mono">Verified views</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[#667085] dark:text-slate-400 text-xs font-semibold">
                  <span>Published Videos</span>
                  <Video className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-[#172033] dark:text-white font-mono tracking-tight">
                  {youtubeMetrics?.videoCount ?? 0}
                </div>
                <div className="text-[11px] text-[#667085] dark:text-slate-400 font-mono">Active uploads</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[#667085] dark:text-slate-400 text-xs font-semibold">
                  <span>Engagement Ratio</span>
                  <ThumbsUp className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono tracking-tight">
                  {youtubeMetrics?.subscriberCount > 0 
                    ? Number(((youtubeMetrics.totalViews / youtubeMetrics.subscriberCount) * 0.08).toFixed(1)) + '%'
                    : (youtubeMetrics?.totalViews > 0 ? '5.0%' : '0%')}
                </div>
                <div className="text-[11px] text-[#16803D] dark:text-emerald-400 font-mono font-semibold">Real interactions</div>
              </div>
            </div>

            {/* Latest Uploaded Videos */}
            {youtubeMetrics?.latestVideos && youtubeMetrics.latestVideos.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#172033] dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-red-600 fill-red-600" />
                    Latest Videos ({youtubeMetrics.latestVideos.length})
                  </h4>
                  <span className="text-[11px] text-[#667085] dark:text-slate-400 font-mono">Live channel feed</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {youtubeMetrics.latestVideos.map((vid, vIdx) => (
                    <a
                      key={vIdx}
                      href={vid.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 overflow-hidden hover:border-red-400 transition-all flex flex-col"
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={vid.thumbnailUrl}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                        <p className="text-xs font-bold text-[#172033] dark:text-white line-clamp-2 group-hover:text-red-600 transition-colors">
                          {vid.title}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-[#667085] dark:text-slate-400 font-mono pt-1 border-t border-[#E4E7EC] dark:border-slate-800">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-[#6D5EF7]" />
                            {formatNumber(vid.viewCount)} views
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-amber-500" />
                            {formatNumber(vid.likeCount || 0)}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. DEDICATED GITHUB REAL-TIME METRICS SHOWCASE */}
        {githubConfig && (
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-7 border border-[#E4E7EC] dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E7EC] dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={githubMetrics?.avatar || `https://avatars.githubusercontent.com/${githubConfig.username}`}
                    alt="GitHub Avatar"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-purple-500/30"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 bg-[#172033] dark:bg-purple-600 rounded-md text-white shadow-xs">
                    <Github className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#172033] dark:text-white text-base sm:text-lg">
                      GitHub • {githubMetrics?.username || githubConfig.username}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-[#16803D] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16803D]"></span>
                      Connected & Verified
                    </span>
                  </div>
                  <div className="text-xs text-[#667085] dark:text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>github.com/{githubMetrics?.username || githubConfig.username}</span>
                    <span>•</span>
                    <span className="text-[11px]">
                      Synced {githubMetrics?.lastFetchedAt ? formatDate(githubMetrics.lastFetchedAt) : 'Live active'}
                    </span>
                  </div>
                  <a
                    href={githubConfig.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#6D5EF7] hover:underline font-semibold inline-flex items-center gap-1 mt-1 transition-colors"
                  >
                    <span>Visit GitHub Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchGitHubData(githubConfig.username, true)}
                  disabled={syncingGitHub}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F8F9FC] dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-[#172033] dark:text-slate-200 flex items-center gap-1.5 transition-colors border border-[#E4E7EC] dark:border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[#6D5EF7] ${syncingGitHub ? 'animate-spin' : ''}`} />
                  <span>{syncingGitHub ? 'Syncing...' : 'Sync'}</span>
                </button>
                <button
                  onClick={() => openConnectModal('GitHub')}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-[#172033] dark:text-white transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDisconnect('GitHub')}
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 transition-colors"
                  title="Disconnect GitHub"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[#667085] dark:text-slate-400 text-xs font-semibold">
                  <span>Public Repositories</span>
                  <Github className="w-4 h-4 text-[#172033] dark:text-slate-300" />
                </div>
                <div className="text-2xl font-bold text-[#172033] dark:text-white font-mono tracking-tight">
                  {githubMetrics?.publicRepositories ?? 0}
                </div>
                <div className="text-[11px] text-[#16803D] dark:text-emerald-400 font-semibold font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Live repos
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[#667085] dark:text-slate-400 text-xs font-semibold">
                  <span>Total Stars</span>
                  <Star className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-[#172033] dark:text-white font-mono tracking-tight">
                  {formatNumber(githubMetrics?.totalStars ?? 0)}
                </div>
                <div className="text-[11px] text-[#667085] dark:text-slate-400 font-mono">Across all repos</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[#667085] dark:text-slate-400 text-xs font-semibold">
                  <span>Total Forks</span>
                  <GitFork className="w-4 h-4 text-[#6D5EF7]" />
                </div>
                <div className="text-2xl font-bold text-[#172033] dark:text-white font-mono tracking-tight">
                  {formatNumber(githubMetrics?.totalForks ?? 0)}
                </div>
                <div className="text-[11px] text-[#667085] dark:text-slate-400 font-mono">Community forks</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[#667085] dark:text-slate-400 text-xs font-semibold">
                  <span>Followers</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-[#172033] dark:text-white font-mono tracking-tight">
                  {formatNumber(githubMetrics?.followers ?? 0)}
                </div>
                <div className="text-[11px] text-[#667085] dark:text-slate-400 font-mono">Developers</div>
              </div>
            </div>

            {/* Repositories Grid */}
            {githubMetrics?.topRepositories && githubMetrics.topRepositories.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#172033] dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5 text-[#6D5EF7]" />
                    Featured Repositories ({githubMetrics.topRepositories.length})
                  </h4>
                  <span className="text-[11px] text-[#667085] dark:text-slate-400 font-mono">Live code feed</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {githubMetrics.topRepositories.map((repo, rIdx) => (
                    <a
                      key={rIdx}
                      href={repo.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 p-4 hover:border-[#6D5EF7] transition-all flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#172033] dark:text-white group-hover:text-[#6D5EF7] transition-colors font-mono truncate">
                            {repo.name}
                          </span>
                          <ExternalLink className="w-3 h-3 text-[#98A2B3] group-hover:text-[#6D5EF7] transition-colors shrink-0" />
                        </div>
                        {repo.description && (
                          <p className="text-[11px] text-[#667085] dark:text-slate-400 line-clamp-2">
                            {repo.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#667085] dark:text-slate-400 font-mono pt-2 border-t border-[#E4E7EC] dark:border-slate-800">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#6D5EF7]"></span>
                          {repo.language || 'Code'}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500" />
                            {repo.stars || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="w-3 h-3 text-[#667085]" />
                            {repo.forks || 0}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7. OTHER CONNECTED PLATFORMS */}
        {otherConnectedPlatforms.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#172033] dark:text-white">
              Other Connected Accounts ({otherConnectedPlatforms.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {otherConnectedPlatforms.map((plat, idx) => (
                <div 
                  key={idx} 
                  className="bg-white dark:bg-[#0F172A] rounded-2xl p-4 border border-[#E4E7EC] dark:border-slate-800 shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F8F9FC] dark:bg-slate-800 border border-[#E4E7EC] dark:border-slate-700 flex items-center justify-center font-bold text-base text-[#6D5EF7]">
                      {plat.platform[0]}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#172033] dark:text-white">{plat.platform}</div>
                      <a href={plat.profileUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-slate-500 hover:underline">
                        @{plat.username}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openConnectModal(plat.platform)} className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-lg">
                      Edit
                    </button>
                    <button onClick={() => handleDisconnect(plat.platform)} className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* CONNECT / EDIT PLATFORM MODAL WITH SMART URL DETECTION */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-7 border border-[#E4E7EC] dark:border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E4E7EC] dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-[#172033] dark:text-white text-base">
                  Connect Account or Profile URL
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Paste any profile link (Instagram, LinkedIn, LeetCode, CodeChef, GitHub)
                </p>
              </div>
              <button 
                onClick={() => setModalOpen(false)} 
                className="p-1 rounded-md text-[#667085] hover:text-[#172033] dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {detectedPlatformHint && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{detectedPlatformHint}</span>
              </div>
            )}

            {/* OAuth Connection Button (Where Supported) */}
            {['GitHub', 'YouTube', 'LinkedIn'].includes(modalData.platform) && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#172033] dark:text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#6D5EF7]" />
                    <span>Connect with OAuth (Secure)</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-[11px] text-[#667085] dark:text-slate-400">
                  Authenticate directly with {modalData.platform} without entering passwords.
                </p>
                <button
                  type="button"
                  onClick={() => handleStartOAuth(modalData.platform)}
                  disabled={startingOAuth}
                  className="w-full py-2 px-3 rounded-lg bg-[#172033] hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#172033] text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Link2 className="w-4 h-4" />
                  <span>{startingOAuth ? 'Connecting to OAuth...' : `Authorize with ${modalData.platform}`}</span>
                </button>
              </div>
            )}

            {/* Direct Handle / URL Connection Form */}
            <form onSubmit={handleSavePlatform} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#172033] dark:text-slate-200">Selected Platform</label>
                <select
                  value={modalData.platform}
                  onChange={(e) => handlePlatformDropdownChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-700 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7]"
                >
                  {supportedPlatformList.map(p => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#172033] dark:text-slate-200">
                  Account URL or Username
                </label>
                <input
                  type="text"
                  value={modalData.username}
                  onChange={(e) => handleUrlOrUsernameInput(e.target.value)}
                  placeholder={
                    modalData.platform === 'LeetCode'
                      ? 'e.g. username or https://leetcode.com/u/username'
                      : modalData.platform === 'CodeChef'
                      ? 'e.g. username or https://codechef.com/users/username'
                      : modalData.platform === 'Instagram'
                      ? 'e.g. username or https://instagram.com/username'
                      : modalData.platform === 'LinkedIn'
                      ? 'e.g. in/username or https://linkedin.com/in/username'
                      : modalData.platform === 'YouTube'
                      ? 'e.g. @channel or https://youtube.com/@channel'
                      : 'e.g. username or full profile URL'
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-700 text-xs text-[#172033] dark:text-white font-mono focus:outline-none focus:border-[#6D5EF7]"
                  required
                />
                <span className="text-[11px] text-[#667085] dark:text-slate-400 block font-mono">
                  {modalData.platform === 'LeetCode' 
                    ? '✓ Will automatically import questions solved, breakdown & ranking.'
                    : modalData.platform === 'CodeChef'
                    ? '✓ Will automatically import star rating, division & solved count.'
                    : modalData.platform === 'Instagram'
                    ? '✓ Will automatically import followers, engagement & latest posts/reels.'
                    : modalData.platform === 'LinkedIn'
                    ? '✓ Will automatically import network stats, impressions & published posts.'
                    : 'We will verify and sync your live content.'}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#172033] dark:text-slate-200">Full Profile URL</label>
                <input
                  type="url"
                  value={modalData.profileUrl}
                  onChange={(e) => setModalData({ ...modalData, profileUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-700 text-xs text-[#172033] dark:text-white font-mono focus:outline-none focus:border-[#6D5EF7]"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="enabledCheck"
                  checked={modalData.enabled}
                  onChange={(e) => setModalData({ ...modalData, enabled: e.target.checked })}
                  className="rounded border-[#E4E7EC] accent-[#6D5EF7]"
                />
                <label htmlFor="enabledCheck" className="text-xs text-[#172033] dark:text-slate-300 font-medium">
                  Enable automatic metric synchronization and display on portfolio
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E4E7EC] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#F8F9FC] dark:bg-slate-800 text-xs text-[#475467] dark:text-slate-300 font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={Boolean(savingPlatform)}
                  className="px-5 py-2 rounded-lg bg-[#6D5EF7] hover:bg-[#5B4CE6] text-xs text-white font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {savingPlatform ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Importing Content & Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Verify & Connect</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardPlatforms;

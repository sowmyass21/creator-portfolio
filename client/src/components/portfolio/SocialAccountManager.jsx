import React, { useEffect, useState } from 'react';
import { apiService } from '../../services/api';
import {
  Github, Youtube, Linkedin, Twitter, ExternalLink, RefreshCw,
  CheckCircle2, XCircle, Plus, ShieldCheck, AlertCircle, Sparkles, Check, Trash2
} from 'lucide-react';

export const SocialAccountManager = () => {
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [updatingHandle, setUpdatingHandle] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // New account modal / drawer state
  const [newAccountModal, setNewAccountModal] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'GitHub',
    handle: '',
    url: '',
  });

  const loadCreatorProfile = async () => {
    try {
      setLoading(true);
      const res = await apiService.getCreatorProfile();
      if (res?.data) {
        setCreatorProfile(res.data);
      }
    } catch (err) {
      console.error('Failed loading creator profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCreatorProfile();
  }, []);

  const handleConfirmAction = async (socialItem, confirmAction) => {
    setUpdatingHandle(socialItem.handle || socialItem.platform);
    setFeedback(null);
    try {
      const res = await apiService.confirmSocialProfile({
        platform: socialItem.platform,
        handle: socialItem.handle,
        url: socialItem.url,
        confirmAction,
      });

      setCreatorProfile(res.data);
      setFeedback({
        type: 'success',
        text: confirmAction === 'CONFIRM'
          ? `Confirmed ${socialItem.platform} handle (${socialItem.handle}). Live metrics attached!`
          : `Updated ${socialItem.platform} status to ${confirmAction}`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', text: `Failed action: ${err.message}` });
    } finally {
      setUpdatingHandle(null);
    }
  };

  const handleManualAdd = async (e) => {
    e.preventDefault();
    if (!formData.platform || !formData.handle) {
      setFeedback({ type: 'error', text: 'Platform and handle/username are required.' });
      return;
    }

    setUpdatingHandle('NEW_ADD');
    try {
      const res = await apiService.confirmSocialProfile({
        platform: formData.platform,
        handle: formData.handle,
        url: formData.url || (formData.platform === 'GitHub' ? `https://github.com/${formData.handle}` : `https://youtube.com/${formData.handle}`),
        confirmAction: 'CONFIRM',
      });

      setCreatorProfile(res.data);
      setNewAccountModal(false);
      setFormData({ platform: 'GitHub', handle: '', url: '' });
      setFeedback({ type: 'success', text: `Added and confirmed ${formData.platform} account!` });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', text: `Failed adding account: ${err.message}` });
    } finally {
      setUpdatingHandle(null);
    }
  };

  const handleSyncLiveMetrics = async () => {
    setSyncing(true);
    setFeedback(null);
    try {
      const res = await apiService.syncCreatorProfileMetrics();
      setCreatorProfile(res.data);
      setFeedback({ type: 'success', text: 'Live API metrics successfully synchronized! Portfolio updated.' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({ type: 'error', text: `Sync error: ${err.message}` });
    } finally {
      setSyncing(false);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'github': return <Github className="w-5 h-5 text-purple-400" />;
      case 'youtube': return <Youtube className="w-5 h-5 text-red-500" />;
      case 'linkedin': return <Linkedin className="w-5 h-5 text-blue-400" />;
      case 'twitter': return <Twitter className="w-5 h-5 text-sky-400" />;
      default: return <ExternalLink className="w-5 h-5 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-xs font-mono text-slate-400 animate-pulse">
        Checking resume connected accounts & live social metrics...
      </div>
    );
  }

  const socialProfiles = creatorProfile?.socialProfiles || [];
  const liveMetrics = creatorProfile?.liveMetrics || {};
  const pendingAccounts = socialProfiles.filter(s => !s.isConfirmed && s.status !== 'REJECTED');
  const confirmedAccounts = socialProfiles.filter(s => s.isConfirmed || s.status === 'CONFIRMED');
  const rejectedAccounts = socialProfiles.filter(s => s.status === 'REJECTED');

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Resume Social Metrics & Verification Sync
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
              PHASE 19
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Combines stable resume data with dynamic live GitHub & YouTube metrics. Unconfirmed handles require explicit validation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setNewAccountModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4 text-brand-purple" />
            <span>Connect Account</span>
          </button>

          <button
            onClick={handleSyncLiveMetrics}
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-pink text-white text-xs font-bold shadow-md hover:scale-[1.02] disabled:opacity-50 flex items-center gap-2 transition-transform"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing APIs...' : 'Sync Live Metrics'}</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2.5 animate-in fade-in ${
          feedback.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
        }`}>
          {feedback.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Auto-Detected Candidate Accounts Pending Confirmation */}
      {pendingAccounts.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/[0.04] border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                Detected from Resume — Needs Creator Confirmation ({pendingAccounts.length})
              </h3>
            </div>
            <span className="text-[10px] text-amber-400/80 font-mono">Validation Required</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingAccounts.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/20 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                    {getPlatformIcon(item.platform)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{item.platform}</span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded">Unconfirmed</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">{item.handle || item.url}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleConfirmAction(item, 'CONFIRM')}
                    disabled={updatingHandle === item.handle}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-500/30 flex items-center gap-1"
                    title="Confirm Account Belongs to You"
                  >
                    <Check className="w-3.5 h-3.5" /> Confirm
                  </button>
                  <button
                    onClick={() => handleConfirmAction(item, 'REJECT')}
                    disabled={updatingHandle === item.handle}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Reject / Ignore Link"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmed Connected Accounts & Attached Live Metrics */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
          Confirmed Creator Platforms & Live Dynamic Metrics ({confirmedAccounts.length})
        </h3>

        {confirmedAccounts.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
            No confirmed social accounts attached yet. Click "Connect Account" or confirm auto-detected links above to attach live metrics.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {confirmedAccounts.map((item, idx) => {
              const isGH = item.platform.toLowerCase() === 'github';
              const isYT = item.platform.toLowerCase() === 'youtube';
              const ghData = isGH ? liveMetrics.github : null;
              const ytData = isYT ? liveMetrics.youtube : null;

              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-brand-purple/40 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                        {getPlatformIcon(item.platform)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white">{item.platform}</h4>
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-xs font-mono text-slate-400">{item.handle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleConfirmAction(item, 'REMOVE')}
                        className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400"
                        title="Remove Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Attached Live API Metric Stats */}
                  {isGH && ghData && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-mono grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="font-bold text-purple-300">{ghData.followers?.toLocaleString() || 0}</div>
                        <div className="text-[10px] text-slate-400">Followers</div>
                      </div>
                      <div>
                        <div className="font-bold text-purple-300">{ghData.totalStars?.toLocaleString() || 0}</div>
                        <div className="text-[10px] text-slate-400">Total Stars</div>
                      </div>
                      <div>
                        <div className="font-bold text-purple-300">{ghData.publicRepositories || 0}</div>
                        <div className="text-[10px] text-slate-400">Public Repos</div>
                      </div>
                    </div>
                  )}

                  {isYT && ytData && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-mono grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="font-bold text-red-300">{ytData.subscriberCount?.toLocaleString() || 0}</div>
                        <div className="text-[10px] text-slate-400">Subscribers</div>
                      </div>
                      <div>
                        <div className="font-bold text-red-300">{ytData.totalViews?.toLocaleString() || 0}</div>
                        <div className="text-[10px] text-slate-400">Total Views</div>
                      </div>
                      <div>
                        <div className="font-bold text-red-300">{ytData.videoCount || 0}</div>
                        <div className="text-[10px] text-slate-400">Videos</div>
                      </div>
                    </div>
                  )}

                  {(!isGH && !isYT) && (
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Status: Confirmed</span>
                      <span className="text-emerald-400 font-mono text-[10px]">Verified Account</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Manual Connect Account Modal */}
      {newAccountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 border border-slate-800 bg-slate-900 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-purple" /> Add & Confirm Social Account
              </h3>
              <button onClick={() => setNewAccountModal(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Select Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="GitHub">GitHub</option>
                  <option value="YouTube">YouTube</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Twitter">Twitter / X</option>
                  <option value="Portfolio">Portfolio / Website</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Username / Channel Handle</label>
                <input
                  type="text"
                  placeholder="e.g. elenacodes"
                  value={formData.handle}
                  onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Profile URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://github.com/..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewAccountModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingHandle === 'NEW_ADD'}
                  className="px-5 py-2 rounded-xl bg-brand-purple text-white font-bold shadow-md disabled:opacity-50"
                >
                  Confirm & Attach Metrics
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SocialAccountManager;

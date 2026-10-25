import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePortfolio } from '../../context/PortfolioContext';
import apiService from '../../services/api';
import LivePortfolioPreview from '../../components/portfolio/LivePortfolioPreview';
import { 
  Save, User, Sparkles, CheckCircle2, Plus, Trash2, Edit2, Link as LinkIcon, 
  MapPin, Globe, Code2, Sliders, Image as ImageIcon, AlertCircle,
  Eye, Monitor, Tablet, Smartphone, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';

export const DashboardProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, refetchProfile } = usePortfolio();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Live Portfolio Preview state
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [previewViewport, setPreviewViewport] = useState('desktop');
  const [livePortfolio, setLivePortfolio] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    handle: '',
    tagline: '',
    bio: '',
    avatarUrl: '',
    coverImageUrl: '',
    location: '',
    website: '',
    availability: '',
    skills: [],
    socialLinks: [],
  });

  const loadPortfolioData = async () => {
    try {
      setLoadingPreview(true);
      const res = await apiService.getPortfolioBuilder();
      if (res?.data) {
        setLivePortfolio(res.data);
      }
    } catch (err) {
      console.warn('[DashboardProfile] Could not fetch live portfolio:', err.message);
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    setLivePortfolio(null);
    if (user) {
      loadPortfolioData();
    }
  }, [user?._id || user?.id]);

  // Load existing profile into state
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        handle: profile.handle || '',
        tagline: profile.tagline || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
        coverImageUrl: profile.coverImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
        location: profile.location || '',
        website: profile.website || '',
        availability: profile.availability || 'Available for Select Projects & Collaborations',
        skills: profile.skills || [],
        socialLinks: profile.socialLinks || [],
      });
    }
  }, [profile]);

  // Skill state helper
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Frontend', proficiency: 85, featured: true });
  const [showAddSkill, setShowAddSkill] = useState(false);

  // Social link state helper
  const [newSocial, setNewSocial] = useState({ platform: 'GitHub', url: '', handle: '', icon: 'Github' });
  const [showAddSocial, setShowAddSocial] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      await apiService.updateProfile(formData);
      if (refetchProfile) {
        await refetchProfile();
      }
      await loadPortfolioData();
      setFeedback({ 
        type: 'success', 
        text: 'Profile and live portfolio updated successfully!' 
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      setFeedback({ type: 'error', text: `Failed to save profile: ${err.message}` });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.name.trim()) return;
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, { ...newSkill }]
    }));
    setNewSkill({ name: '', category: 'Frontend', proficiency: 85, featured: true });
    setShowAddSkill(false);
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const updateSkillProficiency = (index, val) => {
    const updated = [...formData.skills];
    updated[index].proficiency = Number(val);
    setFormData(prev => ({ ...prev, skills: updated }));
  };

  const addSocialLink = () => {
    if (!newSocial.url.trim()) return;
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { ...newSocial }]
    }));
    setNewSocial({ platform: 'GitHub', url: '', handle: '', icon: 'Github' });
    setShowAddSocial(false);
  };

  const removeSocialLink = (index) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-5xl space-y-8 pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#172033] dark:text-white tracking-tight flex items-center gap-2.5">
            <User className="w-6 h-6 text-[#6D5EF7]" />
            Creator Profile & Live Portfolio
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] dark:text-slate-400 mt-1">
            Customize your public bio, profile image, skills, and social links. Changes automatically sync to your live interactive portfolio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className="px-3.5 py-2.5 rounded-xl font-semibold text-xs text-[#172033] dark:text-slate-200 bg-white dark:bg-slate-800 border border-[#E4E7EC] dark:border-slate-700 hover:border-[#6D5EF7] flex items-center gap-1.5 transition-all shadow-sm"
            title="Toggle Quick Preview"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6D5EF7]" />
            <span>{showLivePreview ? 'Hide Preview' : 'Quick Preview'}</span>
            {showLivePreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => navigate('/portfolio/preview')}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-[#172033] dark:text-white bg-white dark:bg-slate-800 hover:bg-[#F8F9FC] dark:hover:bg-slate-700 border border-[#E4E7EC] dark:border-slate-700 flex items-center gap-2 transition-all shadow-sm"
          >
            <Eye className="w-4 h-4 text-[#6D5EF7]" />
            <span>Live Portfolio Preview</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2.5 animate-in fade-in ${
          feedback.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-[#16803D] dark:text-emerald-400'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedback.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{feedback.text}</span>
          </div>
          {feedback.type === 'success' && (
            <button
              type="button"
              onClick={() => navigate('/portfolio/preview')}
              className="px-3 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-[#16803D] dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Live Portfolio</span>
            </button>
          )}
        </div>
      )}

      {/* EMBEDDED QUICK LIVE PREVIEW DRAWER */}
      {showLivePreview && (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-[#E4E7EC] dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E7EC] dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#6D5EF7]/10 border border-[#6D5EF7]/20 text-[#6D5EF7]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#172033] dark:text-white flex items-center gap-2">
                  Live Portfolio Preview
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-[#16803D] dark:text-emerald-400 border border-emerald-500/20 font-bold">
                    SYNCHRONIZED
                  </span>
                </h3>
                <p className="text-[11px] text-[#667085] dark:text-slate-400">
                  Interactive real-time preview of your portfolio.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPreviewViewport('desktop')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    previewViewport === 'desktop'
                      ? 'bg-[#6D5EF7] text-white shadow-sm'
                      : 'text-[#667085] hover:text-[#172033] dark:hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('tablet')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    previewViewport === 'tablet'
                      ? 'bg-[#6D5EF7] text-white shadow-sm'
                      : 'text-[#667085] hover:text-[#172033] dark:hover:text-white'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" /> Tablet
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport('mobile')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    previewViewport === 'mobile'
                      ? 'bg-[#6D5EF7] text-white shadow-sm'
                      : 'text-[#667085] hover:text-[#172033] dark:hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigate('/portfolio/preview')}
                className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-[#F8F9FC] dark:hover:bg-slate-700 text-[#172033] dark:text-slate-200 text-xs font-bold transition-all border border-[#E4E7EC] dark:border-slate-700 flex items-center gap-1"
                title="Open Dedicated Preview Page"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="w-full">
            <LivePortfolioPreview
              portfolio={livePortfolio}
              viewport={previewViewport}
            />
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        
        {/* 1. BASIC INFORMATION & AVATAR */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-8 border border-[#E4E7EC] dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="font-bold text-[#172033] dark:text-white text-base flex items-center gap-2">
            <User className="w-4 h-4 text-[#6D5EF7]" />
            Core Creator Information
          </h3>

          {/* Avatar Preview & URL */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800">
            <img
              src={formData.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600'}
              alt="Avatar Preview"
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#6D5EF7]/20 shrink-0"
            />
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-semibold text-[#172033] dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#6D5EF7]" />
                Profile Image URL
              </label>
              <input
                type="text"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white placeholder:text-[#667085]/60 focus:outline-none focus:border-[#6D5EF7] focus:ring-2 focus:ring-[#6D5EF7]/10 font-mono transition-all"
              />
              <span className="text-[10px] text-[#667085] dark:text-slate-400 block font-mono">
                Direct HTTPS image URL for public avatar display.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#172033] dark:text-slate-300">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white placeholder:text-[#667085]/60 focus:bg-white focus:outline-none focus:border-[#6D5EF7] focus:ring-2 focus:ring-[#6D5EF7]/10 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#172033] dark:text-slate-300">Creator Handle</label>
              <input
                type="text"
                value={formData.handle}
                onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white placeholder:text-[#667085]/60 focus:bg-white focus:outline-none focus:border-[#6D5EF7] focus:ring-2 focus:ring-[#6D5EF7]/10 font-mono transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#172033] dark:text-slate-300">Professional Tagline / Headline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="Full-Stack Creator, Tech Educator & Open Source Architect"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white placeholder:text-[#667085]/60 focus:bg-white focus:outline-none focus:border-[#6D5EF7] focus:ring-2 focus:ring-[#6D5EF7]/10 transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#172033] dark:text-slate-300">Creator Bio</label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Building high-performance web systems and educating developers worldwide..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white placeholder:text-[#667085]/60 focus:bg-white focus:outline-none focus:border-[#6D5EF7] focus:ring-2 focus:ring-[#6D5EF7]/10 resize-none transition-all"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#172033] dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#6D5EF7]" /> Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="San Francisco, CA & Remote"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white placeholder:text-[#667085]/60 focus:bg-white focus:outline-none focus:border-[#6D5EF7] focus:ring-2 focus:ring-[#6D5EF7]/10 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#172033] dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#6D5EF7]" /> Personal Website URL
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://elenavance.dev"
                className="w-full px-4 py-2.5 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white placeholder:text-[#667085]/60 focus:bg-white focus:outline-none focus:border-[#6D5EF7] focus:ring-2 focus:ring-[#6D5EF7]/10 font-mono transition-all"
              />
            </div>
          </div>
        </div>

        {/* 2. SKILLS MANAGEMENT */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-8 border border-[#E4E7EC] dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#172033] dark:text-white text-base flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#6D5EF7]" />
                Technical Skills & Proficiency
              </h3>
              <p className="text-xs text-[#667085] dark:text-slate-400">Manage categories, skills, and proficiency levels</p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddSkill(!showAddSkill)}
              className="px-3.5 py-1.5 rounded-xl bg-[#6D5EF7]/10 text-[#6D5EF7] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#6D5EF7]/20 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Skill
            </button>
          </div>

          {/* Add Skill Form Drawer */}
          {showAddSkill && (
            <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#6D5EF7]/30 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-[#172033] dark:text-white">New Technical Skill</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Skill Name (e.g. React & Next.js)"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7]"
                />
                <select
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7]"
                >
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Architecture">Architecture</option>
                  <option value="UI/UX">UI/UX</option>
                  <option value="Media">Media</option>
                  <option value="General">General</option>
                </select>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#667085] w-12">{newSkill.proficiency}%</span>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={newSkill.proficiency}
                    onChange={(e) => setNewSkill({ ...newSkill, proficiency: Number(e.target.value) })}
                    className="w-full accent-[#6D5EF7]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSkill(false)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-semibold text-[#667085] dark:text-slate-300 border border-[#E4E7EC] dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-1.5 rounded-xl bg-[#6D5EF7] text-xs font-semibold text-white shadow-sm hover:bg-[#5B4CE6]"
                >
                  Save Skill
                </button>
              </div>
            </div>
          )}

          {/* Skill List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formData.skills.map((sk, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#172033] dark:text-white truncate">{sk.name}</span>
                    <span className="text-[10px] font-mono font-bold text-[#6D5EF7]">{sk.proficiency}%</span>
                  </div>
                  <div className="w-full bg-[#E4E7EC] dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#6D5EF7] h-full rounded-full" style={{ width: `${sk.proficiency}%` }} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeSkill(idx)}
                  className="p-1.5 text-[#667085] hover:text-rose-500 transition-colors"
                  title="Remove Skill"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. SOCIAL LINKS MANAGEMENT */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 sm:p-8 border border-[#E4E7EC] dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#172033] dark:text-white text-base flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-[#6D5EF7]" />
                Social Profiles & Links
              </h3>
              <p className="text-xs text-[#667085] dark:text-slate-400">Configure public social links displayed on your portfolio</p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddSocial(!showAddSocial)}
              className="px-3.5 py-1.5 rounded-xl bg-[#6D5EF7]/10 text-[#6D5EF7] font-semibold text-xs flex items-center gap-1.5 hover:bg-[#6D5EF7]/20 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Link
            </button>
          </div>

          {showAddSocial && (
            <div className="p-4 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#6D5EF7]/30 space-y-3 animate-in fade-in">
              <h4 className="text-xs font-bold text-[#172033] dark:text-white">New Social Profile</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={newSocial.platform}
                  onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7]"
                >
                  <option value="GitHub">GitHub</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Twitter/X">Twitter/X</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Substack">Substack</option>
                  <option value="Twitch">Twitch</option>
                  <option value="Instagram">Instagram</option>
                </select>
                <input
                  type="text"
                  placeholder="Handle (e.g. @elenacodes)"
                  value={newSocial.handle}
                  onChange={(e) => setNewSocial({ ...newSocial, handle: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white font-mono focus:outline-none focus:border-[#6D5EF7]"
                />
                <input
                  type="text"
                  placeholder="URL (https://...)"
                  value={newSocial.url}
                  onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white font-mono focus:outline-none focus:border-[#6D5EF7]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSocial(false)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-semibold text-[#667085] dark:text-slate-300 border border-[#E4E7EC] dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="px-4 py-1.5 rounded-xl bg-[#6D5EF7] text-xs font-semibold text-white shadow-sm hover:bg-[#5B4CE6]"
                >
                  Save Link
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {formData.socialLinks.map((link, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#172033] dark:text-white">{link.platform}</span>
                  <span className="text-xs font-mono text-[#667085] dark:text-slate-400 block">{link.url}</span>
                </div>

                <button
                  type="button"
                  onClick={() => removeSocialLink(idx)}
                  className="p-1.5 text-[#667085] hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl font-bold text-xs text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Profile...' : 'Save & Publish Profile'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default DashboardProfile;

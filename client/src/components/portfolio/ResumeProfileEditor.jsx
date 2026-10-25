import React, { useState, useEffect } from 'react';
import { 
  User, FileText, Code2, Briefcase, GraduationCap, Sparkles, Award, 
  BookOpen, HeartHandshake, Languages, Compass, Share2, Plus, Trash2, 
  ChevronUp, ChevronDown, Save, CheckCircle, ExternalLink, Globe, Github, Linkedin, AlertCircle
} from 'lucide-react';

export const ResumeProfileEditor = ({ data = {}, onSave, isSaving = false, isSaved = false }) => {
  const [profile, setProfile] = useState({
    personal_information: {
      full_name: '',
      professional_title: '',
      email: '',
      phone: '',
      location: '',
      profile_photo: '',
      website: '',
      linkedin: '',
      github: '',
      other_links: [],
    },
    summary: {
      professional_summary: '',
    },
    education: [],
    experience: [],
    projects: [],
    skills: {
      programming_languages: [],
      frontend: [],
      backend: [],
      databases: [],
      frameworks: [],
      cloud: [],
      devops: [],
      tools: [],
      ai_ml: [],
      soft_skills: [],
      other: [],
    },
    certifications: [],
    achievements: [],
    publications: [],
    volunteering: [],
    interests: [],
    languages: [],
    socialLinks: [],
  });

  const [activeTab, setActiveTab] = useState('personal');
  const [newSkillText, setNewSkillText] = useState({});

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      const pInfo = data.personal_information || data.personalInformation || data.personal || {};
      const fullName = pInfo.full_name || pInfo.name || data.fullName || data.name || '';
      const profTitle = pInfo.professional_title || pInfo.professionalTitle || pInfo.title || data.title || '';
      const email = pInfo.email || data.email || '';
      const phone = pInfo.phone || data.phone || '';
      const location = pInfo.location || data.location || '';
      const website = pInfo.website || pInfo.portfolio || data.website || '';
      const linkedin = pInfo.linkedin || pInfo.linkedIn || data.linkedin || '';
      const github = pInfo.github || data.github || '';
      const otherLinks = Array.isArray(pInfo.other_links) ? pInfo.other_links : (Array.isArray(pInfo.otherLinks) ? pInfo.otherLinks : []);
      const pSummary = typeof data.summary === 'string' ? data.summary : (data.summary?.professional_summary || data.summary?.summary || data.about || '');

      setProfile({
        personal_information: {
          full_name: fullName,
          professional_title: profTitle,
          email,
          phone,
          location,
          profile_photo: pInfo.profile_photo || '',
          website,
          linkedin,
          github,
          other_links: otherLinks,
        },
        personal: {
          name: fullName,
          title: profTitle,
          email,
          phone,
          location,
          website,
          linkedin,
          github,
        },
        summary: {
          professional_summary: pSummary,
        },
        about: pSummary,
        education: Array.isArray(data.education) ? data.education : [],
        experience: Array.isArray(data.experience) ? data.experience : [],
        projects: Array.isArray(data.projects) ? data.projects : [],
        skills: {
          programming_languages: Array.isArray(data.skills?.programming_languages) ? data.skills.programming_languages : [],
          frontend: Array.isArray(data.skills?.frontend) ? data.skills.frontend : [],
          backend: Array.isArray(data.skills?.backend) ? data.skills.backend : [],
          databases: Array.isArray(data.skills?.databases) ? data.skills.databases : [],
          frameworks: Array.isArray(data.skills?.frameworks) ? data.skills.frameworks : [],
          cloud: Array.isArray(data.skills?.cloud) ? data.skills.cloud : [],
          devops: Array.isArray(data.skills?.devops) ? data.skills.devops : [],
          tools: Array.isArray(data.skills?.tools) ? data.skills.tools : [],
          ai_ml: Array.isArray(data.skills?.ai_ml) ? data.skills.ai_ml : [],
          soft_skills: Array.isArray(data.skills?.soft_skills) ? data.skills.soft_skills : (Array.isArray(data.skills?.softSkills) ? data.skills.softSkills : []),
          other: Array.isArray(data.skills?.other) ? data.skills.other : [],
        },
        certifications: Array.isArray(data.certifications) ? data.certifications : [],
        achievements: Array.isArray(data.achievements) ? data.achievements : [],
        publications: Array.isArray(data.publications) ? data.publications : [],
        volunteering: Array.isArray(data.volunteering) ? data.volunteering : [],
        interests: Array.isArray(data.interests) ? data.interests : [],
        languages: Array.isArray(data.languages) ? data.languages : [],
        socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : [],
      });
    }
  }, [data]);

  const tabs = [
    { id: 'personal', name: 'Personal & Bio', icon: User },
    { id: 'experience', name: 'Experience & Projects', icon: Briefcase, count: (profile.experience?.length || 0) + (profile.projects?.length || 0) },
    { id: 'education', name: 'Education & Certs', icon: GraduationCap, count: (profile.education?.length || 0) + (profile.certifications?.length || 0) },
    { id: 'skills', name: 'Skills & Languages', icon: Code2, count: Object.values(profile.skills || {}).flat().length + (profile.languages?.length || 0) },
    { id: 'more', name: 'Achievements & Links', icon: Award, count: (profile.achievements?.length || 0) + (profile.publications?.length || 0) + (profile.volunteering?.length || 0) + (profile.socialLinks?.length || 0) },
  ];

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      personal_information: {
        ...prev.personal_information,
        [name]: value,
      },
    }));
  };

  const handleSummaryChange = (e) => {
    const { value } = e.target;
    setProfile((prev) => ({
      ...prev,
      summary: {
        professional_summary: value,
      },
    }));
  };

  // Reorder items
  const moveItem = (sectionKey, index, direction) => {
    const list = [...(profile[sectionKey] || [])];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;
    setProfile((prev) => ({ ...prev, [sectionKey]: list }));
  };

  // Delete item
  const deleteItem = (sectionKey, index) => {
    setProfile((prev) => ({
      ...prev,
      [sectionKey]: (prev[sectionKey] || []).filter((_, i) => i !== index),
    }));
  };

  // Add item
  const addItem = (sectionKey, template) => {
    setProfile((prev) => ({
      ...prev,
      [sectionKey]: [...(prev[sectionKey] || []), template],
    }));
  };

  // Modify item field
  const handleItemChange = (sectionKey, index, field, value) => {
    setProfile((prev) => {
      const list = [...(prev[sectionKey] || [])];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, [sectionKey]: list };
    });
  };

  // Skills handlers
  const handleAddSkill = (category) => {
    const text = (newSkillText[category] || '').trim();
    if (!text) return;
    setProfile((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: [...(prev.skills[category] || []), text],
      },
    }));
    setNewSkillText((prev) => ({ ...prev, [category]: '' }));
  };

  const handleRemoveSkill = (category, index) => {
    setProfile((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: (prev.skills[category] || []).filter((_, i) => i !== index),
      },
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSave(profile);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {/* TABS HEADER */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar gap-2 pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shrink-0 ${
                isActive
                  ? 'bg-brand-indigo/10 text-brand-purple border border-brand-indigo/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
              {tab.count !== undefined && tab.count !== null && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-500">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PERSONAL INFORMATION & SUMMARY */}
      {activeTab === 'personal' && (
        <div className="space-y-6">
          {/* Section 1: Personal Information */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-purple" />
              1. Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={profile.personal_information?.full_name || ''}
                  onChange={handlePersonalChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:border-brand-purple focus:outline-none"
                  placeholder="e.g. Alex Rivers"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Professional Title</label>
                <input
                  type="text"
                  name="professional_title"
                  value={profile.personal_information?.professional_title || ''}
                  onChange={handlePersonalChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:border-brand-purple focus:outline-none"
                  placeholder="e.g. Senior Full Stack Engineer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.personal_information?.email || ''}
                  onChange={handlePersonalChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:border-brand-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={profile.personal_information?.phone || ''}
                  onChange={handlePersonalChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:border-brand-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={profile.personal_information?.location || ''}
                  onChange={handlePersonalChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:border-brand-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub URL</label>
                <input
                  type="text"
                  name="github"
                  value={profile.personal_information?.github || ''}
                  onChange={handlePersonalChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:border-brand-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  name="linkedin"
                  value={profile.personal_information?.linkedin || ''}
                  onChange={handlePersonalChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:border-brand-purple focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Website URL</label>
                <input
                  type="text"
                  name="website"
                  value={profile.personal_information?.website || ''}
                  onChange={handlePersonalChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:border-brand-purple focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Professional Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-purple" />
              2. Professional Summary
            </h3>

            <textarea
              rows="4"
              value={profile.summary?.professional_summary || ''}
              onChange={handleSummaryChange}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:border-brand-purple focus:outline-none"
              placeholder="High-level professional bio and career goals..."
            />
          </div>
        </div>
      )}

      {/* TAB 2: EXPERIENCE & PROJECTS */}
      {activeTab === 'experience' && (
        <div className="space-y-6">
          {/* Section 4: Work Experience */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-purple" />
                4. Experience ({profile.experience?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => addItem('experience', { company: '', job_title: '', location: '', employment_type: 'Full-time', start_date: '', end_date: '', currently_working: false, description: '' })}
                className="px-3 py-1.5 rounded-xl bg-brand-indigo/10 text-brand-purple text-xs font-bold hover:bg-brand-indigo/20 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            </div>

            <div className="space-y-4">
              {profile.experience.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand-indigo/20 text-brand-purple text-[10px] flex items-center justify-center font-mono">{idx + 1}</span>
                      {exp.job_title || 'Job Title'} {exp.company ? `at ${exp.company}` : ''}
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveItem('experience', idx, -1)} disabled={idx === 0} className="p-1 disabled:opacity-30 hover:text-brand-purple"><ChevronUp className="w-4 h-4" /></button>
                      <button type="button" onClick={() => moveItem('experience', idx, 1)} disabled={idx === profile.experience.length - 1} className="p-1 disabled:opacity-30 hover:text-brand-purple"><ChevronDown className="w-4 h-4" /></button>
                      <button type="button" onClick={() => deleteItem('experience', idx)} className="p-1 text-rose-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Company"
                      value={exp.company || ''}
                      onChange={(e) => handleItemChange('experience', idx, 'company', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={exp.job_title || ''}
                      onChange={(e) => handleItemChange('experience', idx, 'job_title', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Location (e.g. San Francisco, CA)"
                      value={exp.location || ''}
                      onChange={(e) => handleItemChange('experience', idx, 'location', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Start Date"
                        value={exp.start_date || ''}
                        onChange={(e) => handleItemChange('experience', idx, 'start_date', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="End Date"
                        value={exp.end_date || ''}
                        onChange={(e) => handleItemChange('experience', idx, 'end_date', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <textarea
                    rows="3"
                    placeholder="Key achievements, technologies used, responsibilities..."
                    value={exp.description || ''}
                    onChange={(e) => handleItemChange('experience', idx, 'description', e.target.value)}
                    className="w-full mt-3 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Projects */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-purple" />
                6. Projects ({profile.projects?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => addItem('projects', { name: '', description: '', technologies: [], live_url: '', github_url: '' })}
                className="px-3 py-1.5 rounded-xl bg-brand-indigo/10 text-brand-purple text-xs font-bold hover:bg-brand-indigo/20 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            <div className="space-y-4">
              {profile.projects.map((proj, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand-indigo/20 text-brand-purple text-[10px] flex items-center justify-center font-mono">{idx + 1}</span>
                      {proj.name || 'Project Name'}
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveItem('projects', idx, -1)} disabled={idx === 0} className="p-1 disabled:opacity-30 hover:text-brand-purple"><ChevronUp className="w-4 h-4" /></button>
                      <button type="button" onClick={() => moveItem('projects', idx, 1)} disabled={idx === profile.projects.length - 1} className="p-1 disabled:opacity-30 hover:text-brand-purple"><ChevronDown className="w-4 h-4" /></button>
                      <button type="button" onClick={() => deleteItem('projects', idx)} className="p-1 text-rose-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Project Name"
                      value={proj.name || ''}
                      onChange={(e) => handleItemChange('projects', idx, 'name', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="GitHub URL"
                      value={proj.github_url || ''}
                      onChange={(e) => handleItemChange('projects', idx, 'github_url', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Live URL"
                      value={proj.live_url || ''}
                      onChange={(e) => handleItemChange('projects', idx, 'live_url', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <textarea
                    rows="2"
                    placeholder="Technologies (comma-separated or text description)..."
                    value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      const arr = val.includes(',') ? val.split(',').map(s => s.trim()) : [val];
                      handleItemChange('projects', idx, 'technologies', arr);
                    }}
                    className="w-full mt-3 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                  />

                  <textarea
                    rows="2"
                    placeholder="Project Description & Key Features..."
                    value={proj.description || ''}
                    onChange={(e) => handleItemChange('projects', idx, 'description', e.target.value)}
                    className="w-full mt-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EDUCATION & CERTIFICATIONS */}
      {activeTab === 'education' && (
        <div className="space-y-6">
          {/* Section 5: Education */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand-purple" />
                5. Education ({profile.education?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => addItem('education', { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', grade: '', location: '' })}
                className="px-3 py-1.5 rounded-xl bg-brand-indigo/10 text-brand-purple text-xs font-bold hover:bg-brand-indigo/20 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Education
              </button>
            </div>

            <div className="space-y-4">
              {profile.education.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold text-xs text-slate-900 dark:text-white">{edu.institution || 'Institution / University'}</div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => moveItem('education', idx, -1)} disabled={idx === 0} className="p-1 disabled:opacity-30 hover:text-brand-purple"><ChevronUp className="w-4 h-4" /></button>
                      <button type="button" onClick={() => moveItem('education', idx, 1)} disabled={idx === profile.education.length - 1} className="p-1 disabled:opacity-30 hover:text-brand-purple"><ChevronDown className="w-4 h-4" /></button>
                      <button type="button" onClick={() => deleteItem('education', idx)} className="p-1 text-rose-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Institution / University"
                      value={edu.institution || ''}
                      onChange={(e) => handleItemChange('education', idx, 'institution', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Degree (e.g. B.S. Computer Science)"
                      value={edu.degree || ''}
                      onChange={(e) => handleItemChange('education', idx, 'degree', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Field of Study"
                      value={edu.field_of_study || ''}
                      onChange={(e) => handleItemChange('education', idx, 'field_of_study', e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Start Date"
                        value={edu.start_date || ''}
                        onChange={(e) => handleItemChange('education', idx, 'start_date', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="End Date"
                        value={edu.end_date || ''}
                        onChange={(e) => handleItemChange('education', idx, 'end_date', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: Certifications */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-purple" />
                7. Certifications ({profile.certifications?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => addItem('certifications', { name: '', issuer: '', date: '', credential_url: '' })}
                className="px-3 py-1.5 rounded-xl bg-brand-indigo/10 text-brand-purple text-xs font-bold hover:bg-brand-indigo/20 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Certification
              </button>
            </div>

            <div className="space-y-3">
              {profile.certifications.map((cert, idx) => {
                const certObj = typeof cert === 'string' ? { name: cert } : cert;
                return (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{certObj.name || 'Certification'}</div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => moveItem('certifications', idx, -1)} disabled={idx === 0} className="p-1 disabled:opacity-30 hover:text-brand-purple"><ChevronUp className="w-4 h-4" /></button>
                        <button type="button" onClick={() => moveItem('certifications', idx, 1)} disabled={idx === profile.certifications.length - 1} className="p-1 disabled:opacity-30 hover:text-brand-purple"><ChevronDown className="w-4 h-4" /></button>
                        <button type="button" onClick={() => deleteItem('certifications', idx)} className="p-1 text-rose-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Certification Name"
                        value={certObj.name || ''}
                        onChange={(e) => handleItemChange('certifications', idx, 'name', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Issuer (e.g. AWS, Coursera)"
                        value={certObj.issuer || ''}
                        onChange={(e) => handleItemChange('certifications', idx, 'issuer', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Credential URL"
                        value={certObj.credential_url || ''}
                        onChange={(e) => handleItemChange('certifications', idx, 'credential_url', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SKILLS & LANGUAGES */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {/* Section 3: Skills */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-brand-purple" />
              3. Categorized Skills
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'programming_languages', label: 'Programming Languages' },
                { key: 'frontend', label: 'Frontend Technologies' },
                { key: 'backend', label: 'Backend & APIs' },
                { key: 'frameworks', label: 'Frameworks & Libraries' },
                { key: 'databases', label: 'Databases & Storage' },
                { key: 'cloud', label: 'Cloud Platforms' },
                { key: 'devops', label: 'DevOps & CI/CD' },
                { key: 'tools', label: 'Developer Tools' },
                { key: 'ai_ml', label: 'AI / Machine Learning' },
                { key: 'soft_skills', label: 'Soft & Interpersonal Skills' },
                { key: 'other', label: 'Other Skills' },
              ].map((cat) => {
                const list = profile.skills?.[cat.key] || [];
                return (
                  <div key={cat.key} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex justify-between items-center">
                      <span>{cat.label}</span>
                      <span className="text-[10px] font-mono text-slate-400">({list.length})</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {list.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-brand-indigo/10 text-brand-purple dark:bg-brand-purple/20 dark:text-purple-300 flex items-center gap-1.5"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(cat.key, sIdx)}
                            className="hover:text-rose-400"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={`Add ${cat.label.toLowerCase()}...`}
                        value={newSkillText[cat.key] || ''}
                        onChange={(e) => setNewSkillText({ ...newSkillText, [cat.key]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill(cat.key);
                          }
                        }}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSkill(cat.key)}
                        className="px-3 py-1.5 rounded-lg bg-brand-indigo text-white text-xs font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 11: Languages */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Languages className="w-4 h-4 text-brand-purple" />
                11. Languages ({profile.languages?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => addItem('languages', { language: '', proficiency: 'Native / Fluent' })}
                className="px-3 py-1.5 rounded-xl bg-brand-indigo/10 text-brand-purple text-xs font-bold hover:bg-brand-indigo/20 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Language
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.languages.map((lang, idx) => {
                const langObj = typeof lang === 'string' ? { language: lang, proficiency: 'Fluent' } : lang;
                return (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-950">
                    <input
                      type="text"
                      placeholder="Language"
                      value={langObj.language || ''}
                      onChange={(e) => handleItemChange('languages', idx, 'language', e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Proficiency"
                      value={langObj.proficiency || ''}
                      onChange={(e) => handleItemChange('languages', idx, 'proficiency', e.target.value)}
                      className="w-32 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                    <button type="button" onClick={() => deleteItem('languages', idx)} className="p-1 text-rose-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ACHIEVEMENTS, PUBLICATIONS, VOLUNTEERING, INTERESTS & SOCIAL LINKS */}
      {activeTab === 'more' && (
        <div className="space-y-6">
          {/* Section 8: Achievements */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-purple" />
                8. Achievements ({profile.achievements?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => addItem('achievements', { title: '', issuer: '', date: '', description: '' })}
                className="px-3 py-1.5 rounded-xl bg-brand-indigo/10 text-brand-purple text-xs font-bold hover:bg-brand-indigo/20 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Achievement
              </button>
            </div>

            <div className="space-y-3">
              {profile.achievements.map((ach, idx) => {
                const achObj = typeof ach === 'string' ? { title: ach } : ach;
                return (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{achObj.title || 'Achievement Title'}</div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => moveItem('achievements', idx, -1)} disabled={idx === 0} className="p-1 disabled:opacity-30 hover:text-brand-purple"><ChevronUp className="w-4 h-4" /></button>
                        <button type="button" onClick={() => moveItem('achievements', idx, 1)} disabled={idx === profile.achievements.length - 1} className="p-1 disabled:opacity-30 hover:text-brand-purple"><ChevronDown className="w-4 h-4" /></button>
                        <button type="button" onClick={() => deleteItem('achievements', idx)} className="p-1 text-rose-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Title / Description"
                      value={achObj.title || ''}
                      onChange={(e) => handleItemChange('achievements', idx, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 9: Publications */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-purple" />
                9. Publications ({profile.publications?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => addItem('publications', { title: '', publisher: '', date: '', url: '' })}
                className="px-3 py-1.5 rounded-xl bg-brand-indigo/10 text-brand-purple text-xs font-bold hover:bg-brand-indigo/20 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Publication
              </button>
            </div>

            <div className="space-y-3">
              {profile.publications.map((pub, idx) => {
                const pubObj = typeof pub === 'string' ? { title: pub } : pub;
                return (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{pubObj.title || 'Publication Title'}</div>
                      <button type="button" onClick={() => deleteItem('publications', idx)} className="p-1 text-rose-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Title"
                        value={pubObj.title || ''}
                        onChange={(e) => handleItemChange('publications', idx, 'title', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="URL / Link"
                        value={pubObj.url || ''}
                        onChange={(e) => handleItemChange('publications', idx, 'url', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 10: Volunteering */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-brand-purple" />
                10. Volunteering ({profile.volunteering?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => addItem('volunteering', { organization: '', role: '', description: '' })}
                className="px-3 py-1.5 rounded-xl bg-brand-indigo/10 text-brand-purple text-xs font-bold hover:bg-brand-indigo/20 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Volunteer Experience
              </button>
            </div>

            <div className="space-y-3">
              {profile.volunteering.map((vol, idx) => {
                const volObj = typeof vol === 'string' ? { organization: vol } : vol;
                return (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-xs text-slate-900 dark:text-white">{volObj.organization || 'Organization'}</div>
                      <button type="button" onClick={() => deleteItem('volunteering', idx)} className="p-1 text-rose-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Organization"
                        value={volObj.organization || ''}
                        onChange={(e) => handleItemChange('volunteering', idx, 'organization', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                      <input
                        type="text"
                        placeholder="Role / Impact"
                        value={volObj.role || ''}
                        onChange={(e) => handleItemChange('volunteering', idx, 'role', e.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 12: Interests */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Compass className="w-4 h-4 text-brand-purple" />
              12. Personal Interests
            </h3>

            <textarea
              rows="2"
              placeholder="Open Source, Distributed Systems, AI Ethics, Photography (comma-separated)..."
              value={Array.isArray(profile.interests) ? profile.interests.join(', ') : (profile.interests || '')}
              onChange={(e) => {
                const val = e.target.value;
                const arr = val.includes(',') ? val.split(',').map(s => s.trim()) : [val];
                setProfile((prev) => ({ ...prev, interests: arr }));
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Section 13: Social Links */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-brand-purple" />
                13. Social Links ({profile.socialLinks?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => addItem('socialLinks', { platform: '', url: '' })}
                className="px-3 py-1.5 rounded-xl bg-brand-indigo/10 text-brand-purple text-xs font-bold hover:bg-brand-indigo/20 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Link
              </button>
            </div>

            <div className="space-y-3">
              {profile.socialLinks.map((link, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-950">
                  <input
                    type="text"
                    placeholder="Platform (e.g. Twitter, Medium, YouTube)"
                    value={link.platform || ''}
                    onChange={(e) => handleItemChange('socialLinks', idx, 'platform', e.target.value)}
                    className="w-44 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="https://..."
                    value={link.url || ''}
                    onChange={(e) => handleItemChange('socialLinks', idx, 'url', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                  <button type="button" onClick={() => deleteItem('socialLinks', idx)} className="p-1 text-rose-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SAVE BUTTON */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          * Your edited profile becomes the authoritative source of truth for portfolio generation.
        </p>
        <button
          type="submit"
          disabled={isSaving}
          className={`px-6 py-2.5 rounded-xl text-white text-xs font-bold hover:opacity-90 flex items-center gap-2 shadow-md transition-all ${
            isSaved
              ? 'bg-emerald-600'
              : 'bg-gradient-to-r from-brand-indigo to-brand-purple'
          }`}
        >
          {isSaved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Saving Changes...' : isSaved ? 'Saved ✓' : 'Save Profile Changes'}</span>
        </button>
      </div>
    </form>
  );
};

export default ResumeProfileEditor;


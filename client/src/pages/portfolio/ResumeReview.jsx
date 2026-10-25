import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { 
  FileText, Save, CheckCircle2, AlertCircle, Plus, Trash2, User, Briefcase, 
  GraduationCap, Code, Award, BookOpen, ExternalLink, ArrowRight, Sparkles, Clock, Globe
} from 'lucide-react';

export const ResumeReview = () => {
  const navigate = useNavigate();

  const [resumeId, setResumeId] = useState('active');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  const fetchResumeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getResumeData('active');
      if (response && response.data) {
        setResumeId(response.data.resumeId || 'active');
        const struct = response.data.structuredData || {};
        setData(normalizeFormData(struct));
      }
    } catch (err) {
      console.error('[ResumeReview] Error fetching structured resume data:', err);
      setError(err.message || 'Failed to load structured resume data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResumeData();
  }, [fetchResumeData]);

  // Ensure initial structure object has all keys initialized
  const normalizeFormData = (raw) => {
    const pInfo = raw.personal || raw.personalInformation || raw.personal_information || {};
    const pSum = typeof raw.summary === 'string' ? { summary: raw.summary } : (raw.professionalSummary || raw.summary || {});
    const sk = raw.skills || {};

    return {
      personalInformation: {
        name: pInfo.name || pInfo.full_name || '',
        email: pInfo.email || '',
        phone: pInfo.phone || '',
        location: pInfo.location || '',
        title: pInfo.title || pInfo.professionalTitle || pInfo.professional_title || '',
        linkedIn: pInfo.linkedin || pInfo.linkedIn || '',
        github: pInfo.github || '',
        portfolio: pInfo.website || pInfo.portfolio || '',
        otherLinks: Array.isArray(pInfo.otherLinks || pInfo.other_links) ? (pInfo.otherLinks || pInfo.other_links) : [],
      },
      professionalSummary: {
        summary: pSum.summary || pSum.professional_summary || '',
        objective: pSum.objective || pSum.career_objective || '',
      },
      education: Array.isArray(raw.education) ? raw.education.map(e => ({
        institution: e.institution || '',
        degree: e.degree || '',
        field: e.field || e.field_of_study || '',
        startYear: e.startYear || e.start_date || '',
        endYear: e.endYear || e.end_date || '',
        gpa: e.gpa || e.grade || '',
      })) : [],
      skills: {
        programmingLanguages: Array.isArray(sk.programmingLanguages) ? sk.programmingLanguages : (Array.isArray(sk.programming_languages) ? sk.programming_languages : []),
        frameworks: Array.isArray(sk.frameworks) ? sk.frameworks : [],
        libraries: Array.isArray(sk.libraries) ? sk.libraries : [],
        databases: Array.isArray(sk.databases) ? sk.databases : [],
        cloud: Array.isArray(sk.cloud) ? sk.cloud : [],
        tools: Array.isArray(sk.tools) ? sk.tools : [],
        platforms: Array.isArray(sk.platforms) ? sk.platforms : [],
        softSkills: Array.isArray(sk.softSkills) ? sk.softSkills : (Array.isArray(sk.soft_skills) ? sk.soft_skills : []),
        otherTechnicalSkills: Array.isArray(sk.otherTechnicalSkills) ? sk.otherTechnicalSkills : (Array.isArray(sk.other) ? sk.other : []),
      },
      experience: Array.isArray(raw.experience) ? raw.experience.map(exp => ({
        company: exp.company || '',
        role: exp.role || exp.job_title || '',
        location: exp.location || '',
        startDate: exp.startDate || exp.start_date || '',
        endDate: exp.endDate || exp.end_date || '',
        responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : (exp.description ? [exp.description] : []),
        achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
        technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
      })) : [],
      internships: Array.isArray(raw.internships) ? raw.internships.map(intern => ({
        company: intern.company || '',
        role: intern.role || 'Intern',
        duration: intern.duration || '',
        responsibilities: Array.isArray(intern.responsibilities) ? intern.responsibilities : [],
        technologies: Array.isArray(intern.technologies) ? intern.technologies : [],
      })) : [],
      projects: Array.isArray(raw.projects) ? raw.projects.map(p => ({
        projectName: p.projectName || p.name || p.title || '',
        description: p.description || '',
        technologies: Array.isArray(p.technologies) ? p.technologies : [],
        features: Array.isArray(p.features) ? p.features : [],
        githubUrl: p.githubUrl || p.github_url || '',
        liveUrl: p.liveUrl || p.live_url || '',
      })) : [],
      certifications: Array.isArray(raw.certifications) ? raw.certifications.map(c => ({
        certificationName: c.certificationName || c.name || '',
        issuingOrganization: c.issuingOrganization || c.issuer || '',
        date: c.date || '',
      })) : [],
      achievements: Array.isArray(raw.achievements) ? raw.achievements.map(a => ({
        achievement: a.achievement || a.title || '',
        organization: a.organization || '',
        date: a.date || '',
      })) : [],
      publications: Array.isArray(raw.publications) ? raw.publications.map(pub => ({
        title: pub.title || '',
        publication: pub.publication || pub.publisher || '',
        date: pub.date || '',
      })) : [],
      extracurricularActivities: Array.isArray(raw.extracurricularActivities) ? raw.extracurricularActivities.map(act => ({
        activity: typeof act === 'string' ? act : (act.activity || act.name || ''),
        role: act.role || '',
        description: act.description || '',
      })) : [],
    };
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      const response = await apiService.updateResumeData(resumeId, data);
      if (response && response.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        throw new Error(response?.message || 'Failed to save changes');
      }
    } catch (err) {
      console.error('[ResumeReview] Save error:', err);
      setError(err.message || 'Failed to save structured data');
    } finally {
      setSaving(false);
    }
  };

  // Field change helpers
  const updatePersonalInfo = (field, val) => {
    setData(prev => ({
      ...prev,
      personalInformation: { ...prev.personalInformation, [field]: val }
    }));
  };

  const updateSummary = (field, val) => {
    setData(prev => ({
      ...prev,
      professionalSummary: { ...prev.professionalSummary, [field]: val }
    }));
  };

  const updateSkillCategory = (category, commaString) => {
    const list = commaString.split(',').map(s => s.trim()).filter(Boolean);
    setData(prev => ({
      ...prev,
      skills: { ...prev.skills, [category]: list }
    }));
  };

  // Generic Array Item Update
  const updateArrayItem = (section, index, field, val) => {
    setData(prev => {
      const list = [...(prev[section] || [])];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, [section]: list };
    });
  };

  const addArrayItem = (section, templateObj) => {
    setData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), templateObj]
    }));
  };

  const removeArrayItem = (section, index) => {
    setData(prev => ({
      ...prev,
      [section]: (prev[section] || []).filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 text-slate-400 font-mono text-xs">
        <div className="w-8 h-8 border-3 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin"></div>
        <span>Extracting & Parsing Structured Resume Data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <FileText className="w-6 h-6 text-brand-purple" />
            Extracted Resume Data Review
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Inspect and edit the extracted information before portfolio generation. No invented data is added by default.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </span>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-brand-purple" />
            <span>{saving ? 'Saving...' : 'Save Data'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/portfolio/profile')}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span>Proceed to Portfolio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E4E7EC] dark:border-slate-800 text-xs font-bold scrollbar-none">
        {[
          { id: 'personal', name: 'Personal Info', icon: User },
          { id: 'summary', name: 'Summary', icon: FileText },
          { id: 'education', name: `Education (${data?.education?.length || 0})`, icon: GraduationCap },
          { id: 'skills', name: 'Skills', icon: Code },
          { id: 'experience', name: `Experience (${data?.experience?.length || 0})`, icon: Briefcase },
          { id: 'internships', name: `Internships (${data?.internships?.length || 0})`, icon: Clock },
          { id: 'projects', name: `Projects (${data?.projects?.length || 0})`, icon: Globe },
          { id: 'certifications', name: `Certifications (${data?.certifications?.length || 0})`, icon: Award },
          { id: 'achievements', name: `Achievements (${data?.achievements?.length || 0})`, icon: Sparkles },
          { id: 'publications', name: `Publications (${data?.publications?.length || 0})`, icon: BookOpen },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#6D5EF7]/10 text-[#6D5EF7] border border-[#6D5EF7]/30'
                : 'text-[#667085] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT CARDS */}
      <div className="bg-white dark:bg-[#0F172A] border border-[#E4E7EC] dark:border-slate-800 rounded-2xl p-6 shadow-sm">

        {/* 1. PERSONAL INFORMATION TAB */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#172033] dark:text-white border-b border-[#E4E7EC] dark:border-slate-800 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-[#6D5EF7]" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  value={data.personalInformation.name || ''}
                  onChange={(e) => updatePersonalInfo('name', e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Email Address</label>
                <input
                  type="email"
                  value={data.personalInformation.email || ''}
                  onChange={(e) => updatePersonalInfo('email', e.target.value)}
                  placeholder="e.g. jane@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={data.personalInformation.phone || ''}
                  onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                  placeholder="e.g. +1 (555) 000-1234"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Location</label>
                <input
                  type="text"
                  value={data.personalInformation.location || ''}
                  onChange={(e) => updatePersonalInfo('location', e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={data.personalInformation.linkedIn || ''}
                  onChange={(e) => updatePersonalInfo('linkedIn', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={data.personalInformation.github || ''}
                  onChange={(e) => updatePersonalInfo('github', e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Portfolio / Website URL</label>
                <input
                  type="url"
                  value={data.personalInformation.portfolio || ''}
                  onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. PROFESSIONAL SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-purple" /> Professional Summary & Objective
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Professional Summary</label>
                <textarea
                  rows={5}
                  value={data.professionalSummary.summary || ''}
                  onChange={(e) => updateSummary('summary', e.target.value)}
                  placeholder="Enter high-level professional summary..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-purple resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Career Objective</label>
                <textarea
                  rows={3}
                  value={data.professionalSummary.objective || ''}
                  onChange={(e) => updateSummary('objective', e.target.value)}
                  placeholder="Enter career objective..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-brand-purple resize-y"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. EDUCATION TAB */}
        {activeTab === 'education' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand-purple" /> Education History
              </h3>
              <button
                type="button"
                onClick={() => addArrayItem('education', { institution: '', degree: '', field: '', startYear: '', endYear: '', gpa: '' })}
                className="px-3 py-1.5 rounded-lg bg-brand-purple/10 text-brand-purple text-xs font-bold hover:bg-brand-purple/20 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Education
              </button>
            </div>

            {data.education.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No education entries found.</p>
            ) : (
              data.education.map((edu, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => removeArrayItem('education', idx)}
                    className="absolute top-3 right-3 text-rose-500 hover:text-rose-600 p-1"
                    title="Delete Entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Institution</label>
                      <input
                        type="text"
                        value={edu.institution || ''}
                        onChange={(e) => updateArrayItem('education', idx, 'institution', e.target.value)}
                        placeholder="e.g. Stanford University"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Degree</label>
                      <input
                        type="text"
                        value={edu.degree || ''}
                        onChange={(e) => updateArrayItem('education', idx, 'degree', e.target.value)}
                        placeholder="e.g. B.S. Computer Science"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Start Year</label>
                      <input
                        type="text"
                        value={edu.startYear || ''}
                        onChange={(e) => updateArrayItem('education', idx, 'startYear', e.target.value)}
                        placeholder="2018"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">End Year</label>
                      <input
                        type="text"
                        value={edu.endYear || ''}
                        onChange={(e) => updateArrayItem('education', idx, 'endYear', e.target.value)}
                        placeholder="2022"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">CGPA / Percentage</label>
                      <input
                        type="text"
                        value={edu.gpa || ''}
                        onChange={(e) => updateArrayItem('education', idx, 'gpa', e.target.value)}
                        placeholder="e.g. 3.8 / 4.0 or 88%"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. SKILLS TAB */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Code className="w-4 h-4 text-brand-purple" /> Technical Skills (Comma Separated)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'programmingLanguages', label: 'Programming Languages' },
                { key: 'frameworks', label: 'Frameworks' },
                { key: 'libraries', label: 'Libraries' },
                { key: 'databases', label: 'Databases' },
                { key: 'cloud', label: 'Cloud & Infrastructure' },
                { key: 'tools', label: 'Developer Tools' },
                { key: 'platforms', label: 'Platforms' },
                { key: 'softSkills', label: 'Soft Skills (e.g. Leadership, Teamwork, Communication)' },
                { key: 'otherTechnicalSkills', label: 'Other Technical Skills' },
              ].map((cat) => (
                <div key={cat.key}>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{cat.label}</label>
                  <input
                    type="text"
                    value={(data.skills[cat.key] || []).join(', ')}
                    onChange={(e) => updateSkillCategory(cat.key, e.target.value)}
                    placeholder="e.g. JavaScript, Python, C++"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. EXPERIENCE TAB */}
        {activeTab === 'experience' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-brand-purple" /> Work Experience
              </h3>
              <button
                type="button"
                onClick={() => addArrayItem('experience', { company: '', role: '', location: '', startDate: '', endDate: '', responsibilities: [], achievements: [], technologies: [] })}
                className="px-3 py-1.5 rounded-lg bg-brand-purple/10 text-brand-purple text-xs font-bold hover:bg-brand-purple/20 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Experience
              </button>
            </div>

            {data.experience.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No work experience entries found.</p>
            ) : (
              data.experience.map((exp, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => removeArrayItem('experience', idx)}
                    className="absolute top-3 right-3 text-rose-500 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Company</label>
                      <input
                        type="text"
                        value={exp.company || ''}
                        onChange={(e) => updateArrayItem('experience', idx, 'company', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Role / Job Title</label>
                      <input
                        type="text"
                        value={exp.role || ''}
                        onChange={(e) => updateArrayItem('experience', idx, 'role', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate || ''}
                        onChange={(e) => updateArrayItem('experience', idx, 'startDate', e.target.value)}
                        placeholder="Jan 2021"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">End Date</label>
                      <input
                        type="text"
                        value={exp.endDate || ''}
                        onChange={(e) => updateArrayItem('experience', idx, 'endDate', e.target.value)}
                        placeholder="Present"
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 6. PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-purple" /> Projects
              </h3>
              <button
                type="button"
                onClick={() => addArrayItem('projects', { projectName: '', description: '', technologies: [], features: [], githubUrl: '', liveUrl: '' })}
                className="px-3 py-1.5 rounded-lg bg-brand-purple/10 text-brand-purple text-xs font-bold hover:bg-brand-purple/20 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {data.projects.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No projects found.</p>
            ) : (
              data.projects.map((proj, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => removeArrayItem('projects', idx)}
                    className="absolute top-3 right-3 text-rose-500 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Project Name</label>
                      <input
                        type="text"
                        value={proj.projectName || ''}
                        onChange={(e) => updateArrayItem('projects', idx, 'projectName', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">GitHub URL</label>
                      <input
                        type="url"
                        value={proj.githubUrl || ''}
                        onChange={(e) => updateArrayItem('projects', idx, 'githubUrl', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={proj.description || ''}
                        onChange={(e) => updateArrayItem('projects', idx, 'description', e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs resize-y"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ResumeReview;

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortfolio } from '../../context/PortfolioContext';
import { apiService } from '../../services/api';
import ResumeUploadZone from '../../components/portfolio/ResumeUploadZone';
import ResumeProcessingStatus from '../../components/portfolio/ResumeProcessingStatus';
import ResumeSyncModal from '../../components/portfolio/ResumeSyncModal';
import PdfPreviewModal from '../../components/portfolio/PdfPreviewModal';
import { 
  FileText, CheckCircle2, History, GitCompare, Clock, Trash2, Eye, 
  RefreshCw, AlertCircle, ArrowRight, Sparkles, Globe, User, Briefcase, 
  GraduationCap, Code, Award, Plus, Save, ExternalLink, Layers
} from 'lucide-react';

export const ResumeUpload = () => {
  const navigate = useNavigate();
  const { refreshData } = usePortfolio();

  const [activeResume, setActiveResume] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState('UPLOADED');
  const [extractionStatus, setExtractionStatus] = useState('PENDING');
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Editable Extracted Resume State
  const [structuredData, setStructuredData] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [isSavingData, setIsSavingData] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Versioning state
  const [versions, setVersions] = useState([]);
  const [activeSyncVersion, setActiveSyncVersion] = useState(null);
  const [activeSyncDiff, setActiveSyncDiff] = useState(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [processingSync, setProcessingSync] = useState(false);

  // Preview Modal state
  const [previewResume, setPreviewResume] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const normalizeStructuredData = useCallback((raw = {}) => {
    const pInfo = raw.personalInformation || raw.personal_information || raw.personal || {};
    const pSum = typeof raw.summary === 'string' ? { summary: raw.summary } : (raw.professionalSummary || raw.summary || {});
    const sk = raw.skills || {};

    return {
      personalInformation: {
        name: pInfo.name || pInfo.full_name || '',
        title: pInfo.title || pInfo.professionalTitle || pInfo.professional_title || '',
        email: pInfo.email || '',
        phone: pInfo.phone || '',
        location: pInfo.location || '',
        linkedIn: pInfo.linkedIn || pInfo.linkedin || '',
        github: pInfo.github || '',
        portfolio: pInfo.portfolio || pInfo.website || '',
        otherLinks: Array.isArray(pInfo.otherLinks || pInfo.other_links) ? (pInfo.otherLinks || pInfo.other_links) : [],
      },
      professionalSummary: {
        summary: pSum.summary || pSum.professional_summary || '',
        objective: pSum.objective || pSum.career_objective || '',
      },
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
      education: Array.isArray(raw.education) ? raw.education.map(e => ({
        institution: e.institution || '',
        degree: e.degree || '',
        field: e.field || e.field_of_study || '',
        startYear: e.startYear || e.start_date || '',
        endYear: e.endYear || e.end_date || '',
        gpa: e.gpa || e.grade || '',
      })) : [],
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
    };
  }, []);

  const fetchActiveResumeAndVersions = useCallback(async () => {
    try {
      const [statusRes, versionsRes, dataRes] = await Promise.all([
        apiService.getResumeStatus().catch(() => null),
        apiService.getResumeVersions().catch(() => null),
        apiService.getResumeData('active').catch(() => null),
      ]);

      if (statusRes?.data && statusRes.data.hasResume !== false) {
        setActiveResume(statusRes.data);
        setCurrentStatus(statusRes.data.processingStatus || statusRes.data.status || 'COMPLETED');
        setExtractionStatus(statusRes.data.extractionStatus || 'COMPLETED');
        if (statusRes.data.errorMessage) {
          setError(statusRes.data.errorMessage);
        }
      }

      if (versionsRes?.data) {
        setVersions(versionsRes.data);
      }

      if (dataRes?.data?.structuredData) {
        setStructuredData(normalizeStructuredData(dataRes.data.structuredData));
      }
    } catch (err) {
      console.error('[ResumeUpload] Fetch data error:', err);
    }
  }, [normalizeStructuredData]);

  useEffect(() => {
    fetchActiveResumeAndVersions();
  }, [fetchActiveResumeAndVersions]);

  const handleUpload = async (file) => {
    setIsUploading(true);
    setError(null);
    setIsSuccess(false);
    setUploadProgress(20);
    setCurrentStatus('UPLOADED');

    try {
      const formData = new FormData();
      formData.append('file', file);

      setUploadProgress(40);
      setCurrentStatus('EXTRACTING');

      const response = await apiService.uploadResume(formData);

      if (response && response.success) {
        setUploadProgress(80);
        setCurrentStatus('PARSING');

        setTimeout(async () => {
          setUploadProgress(100);
          setCurrentStatus('COMPLETED');
          setIsSuccess(true);
          setIsUploading(false);

          if (response.data?.structuredData) {
            setStructuredData(normalizeStructuredData(response.data.structuredData));
          }

          await fetchActiveResumeAndVersions();
          if (refreshData) {
            try { await refreshData(); } catch (e) {}
          }

          const versionData = response.data?.version || response.data;
          const diffData = response.data?.diff;
          const hasPreviousProfile = response.data?.hasPreviousProfile;

          if (hasPreviousProfile && diffData?.hasChanges) {
            setActiveSyncVersion(versionData);
            setActiveSyncDiff(diffData);
            setShowSyncModal(true);
          }
        }, 600);
      } else {
        throw new Error(response?.message || 'Upload failed');
      }
    } catch (err) {
      console.error('[Upload Error]:', err);
      const serverMessage = err.response?.data?.message || err.message || 'Failed to process resume upload';
      setError(serverMessage);
      setCurrentStatus('FAILED');
      setExtractionStatus('FAILED');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume? This will remove the uploaded document.')) {
      return;
    }
    try {
      await apiService.deleteResumeById(resumeId);
      setActiveResume(null);
      setStructuredData(null);
      setError(null);
      setIsSuccess(false);
      setCurrentStatus('UPLOADED');
      await fetchActiveResumeAndVersions();
    } catch (err) {
      setError(`Failed to remove resume: ${err.message}`);
    }
  };

  const handleReplaceResume = () => {
    setActiveResume(null);
    setError(null);
    setIsSuccess(false);
  };

  const handlePreviewPdf = (resumeOrFile) => {
    if (resumeOrFile instanceof File) {
      setPreviewFile(resumeOrFile);
      setPreviewResume(null);
    } else {
      setPreviewResume(resumeOrFile);
      setPreviewFile(null);
    }
  };

  const handleApplySync = async () => {
    if (!activeSyncVersion) return;
    setProcessingSync(true);
    try {
      const versionId = activeSyncVersion.id || activeSyncVersion._id;
      await apiService.applyResumeVersion(versionId);
      setShowSyncModal(false);
      await fetchActiveResumeAndVersions();
    } catch (err) {
      setError(`Failed to apply version changes: ${err.message}`);
    } finally {
      setProcessingSync(false);
    }
  };

  const handleKeepExistingSync = async () => {
    if (!activeSyncVersion) return;
    setProcessingSync(true);
    try {
      const versionId = activeSyncVersion.id || activeSyncVersion._id;
      await apiService.keepExistingResumeVersion(versionId);
      setShowSyncModal(false);
      await fetchActiveResumeAndVersions();
    } catch (err) {
      setError(`Failed to keep existing profile: ${err.message}`);
    } finally {
      setProcessingSync(false);
    }
  };

  const handleReviewVersion = async (ver) => {
    try {
      const versionId = ver.id || ver._id;
      const res = await apiService.getResumeVersionById(versionId);
      if (res?.data) {
        setActiveSyncVersion(res.data.version);
        setActiveSyncDiff(res.data.diff);
        setShowSyncModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsUploading(false);
    setUploadProgress(0);
    setCurrentStatus('UPLOADED');
    setIsSuccess(false);
  };

  // Structured Information Update Handlers
  const updatePersonalInfo = (field, val) => {
    setStructuredData(prev => ({
      ...prev,
      personalInformation: { ...prev.personalInformation, [field]: val }
    }));
  };

  const updateSummary = (field, val) => {
    setStructuredData(prev => ({
      ...prev,
      professionalSummary: { ...prev.professionalSummary, [field]: val }
    }));
  };

  const updateSkillCategory = (catKey, commaString) => {
    const list = commaString.split(',').map(s => s.trim()).filter(Boolean);
    setStructuredData(prev => ({
      ...prev,
      skills: { ...prev.skills, [catKey]: list }
    }));
  };

  const updateArrayItem = (section, index, field, val) => {
    setStructuredData(prev => {
      const list = [...(prev[section] || [])];
      list[index] = { ...list[index], [field]: val };
      return { ...prev, [section]: list };
    });
  };

  const addArrayItem = (section, templateObj) => {
    setStructuredData(prev => ({
      ...prev,
      [section]: [...(prev[section] || []), templateObj]
    }));
  };

  const removeArrayItem = (section, index) => {
    setStructuredData(prev => ({
      ...prev,
      [section]: (prev[section] || []).filter((_, i) => i !== index)
    }));
  };

  const handleSaveStructuredData = async () => {
    if (!structuredData) return;
    setIsSavingData(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const response = await apiService.updateResumeData('active', structuredData);
      if (response && response.success) {
        setSaveSuccess(true);
        if (refreshData) {
          try { await refreshData(); } catch (e) {}
        }
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        throw new Error(response?.message || 'Failed to save resume data');
      }
    } catch (err) {
      console.error('[ResumeUpload] Save error:', err);
      setError(err.message || 'Failed to save structured data');
    } finally {
      setIsSavingData(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E4E7EC] dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#172033] dark:text-white flex items-center gap-2.5 tracking-tight">
            <FileText className="w-6 h-6 text-[#6D5EF7]" />
            Resume Upload & Automated Text Extraction
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] dark:text-slate-400 mt-1">
            Upload your PDF or Word resume (.docx, .pdf) to automatically extract text, structure profile credentials, and populate your portfolio.
          </p>
        </div>

        {isSuccess && !showSyncModal && (
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#16803D] dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4" />
            <span>Resume Extracted & Structured!</span>
          </div>
        )}
      </div>

      {/* QUICK LIVE PORTFOLIO & REVIEW ACTION BANNER */}
      {activeResume && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E4E7EC] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#6D5EF7]/10 text-[#6D5EF7] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172033] dark:text-white">
                Resume Extracted & AI Portfolio Live
              </h3>
              <p className="text-xs text-[#667085] dark:text-slate-400">
                Your portfolio sections and details have been automatically populated from your resume. Review and edit below.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => navigate('/portfolio/preview')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>Live Portfolio Preview</span>
            </button>
            <button
              onClick={() => navigate('/portfolio/review')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#172033] dark:text-slate-200 bg-white dark:bg-slate-800 border border-[#E4E7EC] dark:border-slate-700 hover:border-[#6D5EF7] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <FileText className="w-4 h-4 text-[#6D5EF7]" />
              <span>Full Review Page</span>
            </button>
          </div>
        </div>
      )}

      {/* UPLOADER & PROCESSING PIPELINE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResumeUploadZone
          onUpload={handleUpload}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          error={error}
          onRetry={handleRetry}
          activeResume={activeResume}
          onRemoveResume={handleRemoveResume}
          onReplaceResume={handleReplaceResume}
          onPreviewPdf={handlePreviewPdf}
          onProcessResume={() => navigate('/portfolio/review')}
        />
        <ResumeProcessingStatus
          currentStatus={currentStatus}
          extractionStatus={extractionStatus}
          processingError={error}
        />
      </div>

      {/* EDITABLE EXTRACTED INFORMATION FORM (REQUIREMENTS 4 & 5) */}
      {structuredData && (
        <div className="bg-white dark:bg-[#0F172A] border border-[#E4E7EC] dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E4E7EC] dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-[#172033] dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#6D5EF7]" />
                Extracted Resume Information (Editable Review)
              </h2>
              <p className="text-xs text-[#667085] dark:text-slate-400 mt-0.5">
                Review and edit your extracted credentials before or after generating your portfolio. Changes save directly to your database.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {saveSuccess && (
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" /> Saved & Synced!
                </span>
              )}

              <button
                type="button"
                onClick={handleSaveStructuredData}
                disabled={isSavingData}
                className="px-4 py-2 rounded-xl bg-[#6D5EF7] hover:bg-[#5B4CE6] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSavingData ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSavingData ? 'Saving...' : 'Save & Sync Portfolio'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/portfolio/preview')}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#172033] dark:text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4 text-[#6D5EF7]" />
                <span>View Portfolio</span>
              </button>
            </div>
          </div>

          {/* EDITABLE TABS NAVIGATION */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E4E7EC] dark:border-slate-800 text-xs font-bold scrollbar-none">
            {[
              { id: 'personal', name: 'Personal & Headline', icon: User },
              { id: 'summary', name: 'Summary & Objective', icon: FileText },
              { id: 'skills', name: 'Technical & Soft Skills', icon: Code },
              { id: 'experience', name: `Experience (${structuredData.experience?.length || 0})`, icon: Briefcase },
              { id: 'internships', name: `Internships (${structuredData.internships?.length || 0})`, icon: Clock },
              { id: 'education', name: `Education (${structuredData.education?.length || 0})`, icon: GraduationCap },
              { id: 'projects', name: `Projects (${structuredData.projects?.length || 0})`, icon: Globe },
              { id: 'certifications', name: `Certifications & Awards`, icon: Award },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#6D5EF7]/10 text-[#6D5EF7] border border-[#6D5EF7]/30'
                    : 'text-[#667085] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: PERSONAL INFORMATION */}
          {activeTab === 'personal' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#667085] dark:text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={structuredData.personalInformation.name || ''}
                    onChange={(e) => updatePersonalInfo('name', e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#667085] dark:text-slate-400 mb-1">Professional Headline / Title</label>
                  <input
                    type="text"
                    value={structuredData.personalInformation.title || ''}
                    onChange={(e) => updatePersonalInfo('title', e.target.value)}
                    placeholder="e.g. Full Stack Software Engineer"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#667085] dark:text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={structuredData.personalInformation.email || ''}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    placeholder="e.g. jane@example.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#667085] dark:text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={structuredData.personalInformation.phone || ''}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    placeholder="e.g. +1 (555) 000-1234"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#667085] dark:text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={structuredData.personalInformation.location || ''}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#667085] dark:text-slate-400 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={structuredData.personalInformation.linkedIn || ''}
                    onChange={(e) => updatePersonalInfo('linkedIn', e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#667085] dark:text-slate-400 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={structuredData.personalInformation.github || ''}
                    onChange={(e) => updatePersonalInfo('github', e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#667085] dark:text-slate-400 mb-1">Portfolio / Website URL</label>
                  <input
                    type="url"
                    value={structuredData.personalInformation.portfolio || ''}
                    onChange={(e) => updatePersonalInfo('portfolio', e.target.value)}
                    placeholder="https://mywebsite.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUMMARY & OBJECTIVE */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#667085] dark:text-slate-400 mb-1">Professional Summary</label>
                <textarea
                  rows={4}
                  value={structuredData.professionalSummary.summary || ''}
                  onChange={(e) => updateSummary('summary', e.target.value)}
                  placeholder="Enter high-level professional summary..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7] resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#667085] dark:text-slate-400 mb-1">Career Objective</label>
                <textarea
                  rows={3}
                  value={structuredData.professionalSummary.objective || ''}
                  onChange={(e) => updateSummary('objective', e.target.value)}
                  placeholder="Enter career objective..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7] resize-y"
                />
              </div>
            </div>
          )}

          {/* TAB 3: TECHNICAL & SOFT SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <p className="text-xs text-[#667085] dark:text-slate-400">
                Skills are categorized automatically. Enter comma-separated values to update.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'programmingLanguages', label: 'Programming Languages' },
                  { key: 'frameworks', label: 'Frameworks' },
                  { key: 'libraries', label: 'Libraries' },
                  { key: 'databases', label: 'Databases' },
                  { key: 'cloud', label: 'Cloud & Infrastructure' },
                  { key: 'tools', label: 'Developer Tools' },
                  { key: 'platforms', label: 'Platforms' },
                  { key: 'softSkills', label: 'Soft Skills (Leadership, Communication, etc.)' },
                  { key: 'otherTechnicalSkills', label: 'Other Technical Skills' },
                ].map((cat) => (
                  <div key={cat.key}>
                    <label className="block text-xs font-semibold text-[#667085] dark:text-slate-400 mb-1">{cat.label}</label>
                    <input
                      type="text"
                      value={(structuredData.skills[cat.key] || []).join(', ')}
                      onChange={(e) => updateSkillCategory(cat.key, e.target.value)}
                      placeholder="e.g. JavaScript, Python, Leadership"
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white focus:outline-none focus:border-[#6D5EF7]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#172033] dark:text-white">Work Experience Entries</h4>
                <button
                  type="button"
                  onClick={() => addArrayItem('experience', { company: '', role: '', location: '', startDate: '', endDate: '', responsibilities: [], achievements: [], technologies: [] })}
                  className="px-3 py-1.5 rounded-lg bg-[#6D5EF7]/10 text-[#6D5EF7] text-xs font-bold hover:bg-[#6D5EF7]/20 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Experience
                </button>
              </div>

              {structuredData.experience?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No work experience entries found in resume.</p>
              ) : (
                structuredData.experience.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('experience', idx)}
                      className="absolute top-3 right-3 text-rose-500 hover:text-rose-600 p-1"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#667085] mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company || ''}
                          onChange={(e) => updateArrayItem('experience', idx, 'company', e.target.value)}
                          placeholder="e.g. Google"
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#667085] mb-1">Role</label>
                        <input
                          type="text"
                          value={exp.role || ''}
                          onChange={(e) => updateArrayItem('experience', idx, 'role', e.target.value)}
                          placeholder="e.g. Senior Software Engineer"
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#667085] mb-1">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate || ''}
                          onChange={(e) => updateArrayItem('experience', idx, 'startDate', e.target.value)}
                          placeholder="Jan 2021"
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#667085] mb-1">End Date</label>
                        <input
                          type="text"
                          value={exp.endDate || ''}
                          onChange={(e) => updateArrayItem('experience', idx, 'endDate', e.target.value)}
                          placeholder="Present"
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: INTERNSHIPS */}
          {activeTab === 'internships' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#172033] dark:text-white">Internship Experience</h4>
                <button
                  type="button"
                  onClick={() => addArrayItem('internships', { company: '', role: 'Intern', duration: '', responsibilities: [], technologies: [] })}
                  className="px-3 py-1.5 rounded-lg bg-[#6D5EF7]/10 text-[#6D5EF7] text-xs font-bold hover:bg-[#6D5EF7]/20 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Internship
                </button>
              </div>

              {structuredData.internships?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No internships found in resume.</p>
              ) : (
                structuredData.internships.map((intern, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('internships', idx)}
                      className="absolute top-3 right-3 text-rose-500 hover:text-rose-600 p-1"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#667085] mb-1">Company / Organization</label>
                        <input
                          type="text"
                          value={intern.company || ''}
                          onChange={(e) => updateArrayItem('internships', idx, 'company', e.target.value)}
                          placeholder="e.g. Microsoft"
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#667085] mb-1">Role</label>
                        <input
                          type="text"
                          value={intern.role || ''}
                          onChange={(e) => updateArrayItem('internships', idx, 'role', e.target.value)}
                          placeholder="Software Engineering Intern"
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#667085] mb-1">Duration</label>
                        <input
                          type="text"
                          value={intern.duration || ''}
                          onChange={(e) => updateArrayItem('internships', idx, 'duration', e.target.value)}
                          placeholder="May 2022 - Aug 2022"
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: EDUCATION */}
          {activeTab === 'education' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#172033] dark:text-white">Academic Qualifications</h4>
                <button
                  type="button"
                  onClick={() => addArrayItem('education', { institution: '', degree: '', field: '', startYear: '', endYear: '', gpa: '' })}
                  className="px-3 py-1.5 rounded-lg bg-[#6D5EF7]/10 text-[#6D5EF7] text-xs font-bold hover:bg-[#6D5EF7]/20 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Education
                </button>
              </div>

              {structuredData.education?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No education entries found.</p>
              ) : (
                structuredData.education.map((edu, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('education', idx)}
                      className="absolute top-3 right-3 text-rose-500 hover:text-rose-600 p-1"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#667085] mb-1">Institution</label>
                        <input
                          type="text"
                          value={edu.institution || ''}
                          onChange={(e) => updateArrayItem('education', idx, 'institution', e.target.value)}
                          placeholder="e.g. Stanford University"
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#667085] mb-1">Degree & Field</label>
                        <input
                          type="text"
                          value={edu.degree || ''}
                          onChange={(e) => updateArrayItem('education', idx, 'degree', e.target.value)}
                          placeholder="e.g. B.Tech in Computer Science"
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#667085] mb-1">Graduation Year</label>
                        <input
                          type="text"
                          value={edu.endYear || ''}
                          onChange={(e) => updateArrayItem('education', idx, 'endYear', e.target.value)}
                          placeholder="2024"
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#667085] mb-1">GPA / Score</label>
                        <input
                          type="text"
                          value={edu.gpa || ''}
                          onChange={(e) => updateArrayItem('education', idx, 'gpa', e.target.value)}
                          placeholder="e.g. 3.8 / 4.0 or 85%"
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 7: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#172033] dark:text-white">Technical Projects</h4>
                <button
                  type="button"
                  onClick={() => addArrayItem('projects', { projectName: '', description: '', technologies: [], features: [], githubUrl: '', liveUrl: '' })}
                  className="px-3 py-1.5 rounded-lg bg-[#6D5EF7]/10 text-[#6D5EF7] text-xs font-bold hover:bg-[#6D5EF7]/20 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
              </div>

              {structuredData.projects?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No projects found in resume.</p>
              ) : (
                structuredData.projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 space-y-3 relative">
                    <button
                      type="button"
                      onClick={() => removeArrayItem('projects', idx)}
                      className="absolute top-3 right-3 text-rose-500 hover:text-rose-600 p-1"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-3 pr-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#667085] mb-1">Project Name</label>
                          <input
                            type="text"
                            value={proj.projectName || ''}
                            onChange={(e) => updateArrayItem('projects', idx, 'projectName', e.target.value)}
                            placeholder="e.g. AI Portfolio Generator"
                            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-[#667085] mb-1">GitHub / Code URL</label>
                          <input
                            type="url"
                            value={proj.githubUrl || ''}
                            onChange={(e) => updateArrayItem('projects', idx, 'githubUrl', e.target.value)}
                            placeholder="https://github.com/username/project"
                            className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#667085] mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={proj.description || ''}
                          onChange={(e) => updateArrayItem('projects', idx, 'description', e.target.value)}
                          placeholder="Project overview and impact..."
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#667085] mb-1">Technologies (Comma-separated)</label>
                        <input
                          type="text"
                          value={(proj.technologies || []).join(', ')}
                          onChange={(e) => {
                            const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            updateArrayItem('projects', idx, 'technologies', list);
                          }}
                          placeholder="React, Node.js, MongoDB"
                          className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 8: CERTIFICATIONS & ACHIEVEMENTS */}
          {activeTab === 'certifications' && (
            <div className="space-y-6">
              {/* Certifications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#172033] dark:text-white">Certifications & Licenses</h4>
                  <button
                    type="button"
                    onClick={() => addArrayItem('certifications', { certificationName: '', issuingOrganization: '', date: '' })}
                    className="px-3 py-1.5 rounded-lg bg-[#6D5EF7]/10 text-[#6D5EF7] text-xs font-bold hover:bg-[#6D5EF7]/20 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Certification
                  </button>
                </div>

                {structuredData.certifications?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No certifications listed.</p>
                ) : (
                  structuredData.certifications.map((cert, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 flex items-center gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                        <input
                          type="text"
                          value={cert.certificationName || ''}
                          onChange={(e) => updateArrayItem('certifications', idx, 'certificationName', e.target.value)}
                          placeholder="Certification Name"
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                        />
                        <input
                          type="text"
                          value={cert.issuingOrganization || ''}
                          onChange={(e) => updateArrayItem('certifications', idx, 'issuingOrganization', e.target.value)}
                          placeholder="Issuing Organization"
                          className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('certifications', idx)}
                        className="text-rose-500 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Achievements */}
              <div className="space-y-3 pt-4 border-t border-[#E4E7EC] dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#172033] dark:text-white">Achievements & Awards</h4>
                  <button
                    type="button"
                    onClick={() => addArrayItem('achievements', { achievement: '', organization: '', date: '' })}
                    className="px-3 py-1.5 rounded-lg bg-[#6D5EF7]/10 text-[#6D5EF7] text-xs font-bold hover:bg-[#6D5EF7]/20 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Achievement
                  </button>
                </div>

                {structuredData.achievements?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No achievements listed.</p>
                ) : (
                  structuredData.achievements.map((ach, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 flex items-center gap-3">
                      <input
                        type="text"
                        value={ach.achievement || ach.title || ''}
                        onChange={(e) => updateArrayItem('achievements', idx, 'achievement', e.target.value)}
                        placeholder="e.g. 1st Place National Hackathon Winner"
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('achievements', idx)}
                        className="text-rose-500 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RESUME VERSION HISTORY TABLE */}
      {versions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC] dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-[#172033] dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#6D5EF7]" />
                Uploaded Resume Versions ({versions.length})
              </h2>
              <p className="text-xs text-[#667085] dark:text-slate-400">
                Track previous uploads and compare parsed changes against active portfolio
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {versions.map((v) => (
              <div
                key={v.id || v._id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-[#6D5EF7]/50 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#6D5EF7]/10 border border-[#6D5EF7]/20 text-[#6D5EF7] text-xs font-mono font-bold">
                      Version {v.version_number || v.versionNumber}
                    </span>
                    <span className="text-xs font-bold text-[#172033] dark:text-white">
                      {v.filename}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#667085] flex items-center gap-2">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Uploaded {new Date(v.created_at || v.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleReviewVersion(v)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-[#172033] dark:text-slate-300 hover:text-white hover:bg-[#6D5EF7] text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <GitCompare className="w-3.5 h-3.5" />
                  <span>Compare & Sync</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF PREVIEW MODAL */}
      {(previewResume || previewFile) && (
        <PdfPreviewModal
          resume={previewResume}
          fileObject={previewFile}
          onClose={() => { setPreviewResume(null); setPreviewFile(null); }}
        />
      )}

      {/* SYNCHRONIZATION & VERSION DIFF MODAL */}
      {showSyncModal && (
        <ResumeSyncModal
          versionData={activeSyncVersion}
          diff={activeSyncDiff}
          onApply={handleApplySync}
          onKeepExisting={handleKeepExistingSync}
          onClose={() => setShowSyncModal(false)}
          isProcessing={processingSync}
        />
      )}
    </div>
  );
};

export default ResumeUpload;

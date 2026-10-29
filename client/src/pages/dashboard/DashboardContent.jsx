import React, { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/AuthContext';
import { formatNumber } from '../../utils/formatters';
import PublishSuccessModal from '../../components/portfolio/PublishSuccessModal';
import { 
  Cpu, Sparkles, CheckCircle2, XCircle, Edit3, Save, RotateCw, 
  ChevronDown, ChevronUp, Layers, AlertCircle, Check, Copy, Send,
  Lightbulb, GraduationCap, Briefcase, Award, Code2, ShieldCheck, Terminal, Wand2, Globe, ExternalLink
} from 'lucide-react';

export const DashboardContent = () => {
  const { profile, metrics, refetchProfile } = usePortfolio();
  const { user } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editBuffer, setEditBuffer] = useState('');
  const [expandedSource, setExpandedSource] = useState({});
  const [filter, setFilter] = useState('ALL'); // ALL, APPROVED, DRAFT
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [aiIdea, setAiIdea] = useState('');

  // Live Demo Modal state when Publish button is clicked
  const [publishModal, setPublishModal] = useState({
    isOpen: false,
    liveDemoUrl: '',
    slug: user?.slug || 'creator'
  });

  const quickIdeas = [
    { label: 'MERN & GenAI Assistant', text: 'Full-Stack MERN Engineer specializing in Generative AI Assistant Integrations (Groq API), JWT authentication, and high-throughput RESTful APIs' },
    { label: 'ServiceNow App Developer', text: 'ServiceNow Certified Application Developer (CAD/CSA) building enterprise cloud workflows, business rules, and full-stack solutions' },
    { label: 'Scalable Full-Stack & Java', text: 'Full-Stack Software Engineer with Java, React.js, and Express.js focused on scalable architectures, database optimization, and secure transactions' },
    { label: 'VLSI & Web Architecture', text: 'Hardware-Software Engineer bridging ASIC physical design (Cadence Genus/Innovus) with responsive modern MERN applications' }
  ];

  const sectionOrder = [
    'headline',
    'bio',
    'about',
    'skills_matrix',
    'project_descriptions',
    'featured_summaries',
    'experience_internship',
    'education_background',
    'certifications_credentials',
    'achievements',
    'social_proof'
  ];

  const sectionLabels = {
    headline: '1. Professional Headline',
    bio: '2. Professional Bio',
    about: '3. Comprehensive About Section',
    skills_matrix: '4. Technical Skills Matrix',
    project_descriptions: '5. Project Deep Dives',
    featured_summaries: '6. Featured Project Highlights',
    experience_internship: '7. Experience & Internships',
    education_background: '8. Education & Academic Background',
    certifications_credentials: '9. Certifications & Badges',
    achievements: '10. Key Achievements & Honors',
    social_proof: '11. Verified Social & Code Footprint'
  };

  const fetchContent = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAiContent();
      const docs = res.data || [];
      setSections(docs);
    } catch (err) {
      console.error('Failed to load AI content:', err);
      setFeedbackMsg({ type: 'error', text: `Error loading content: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleGenerateAll = async (ideaOverride) => {
    const activeIdea = typeof ideaOverride === 'string' ? ideaOverride : aiIdea;
    setGenerating(true);
    setFeedbackMsg(null);
    try {
      const res = await apiService.generateAiContent({ aiIdea: activeIdea });
      setSections(res.data || []);
      setFeedbackMsg({ 
        type: 'success', 
        text: `All ${res.data?.length || 11} sections synthesized based on ${profile?.fullName || user?.name || 'your'} resume credentials${activeIdea ? ` and AI Idea: "${activeIdea}"` : ''}!` 
      });
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: `Generation failed: ${err.message}` });
    } finally {
      setGenerating(false);
    }
  };

  // Publish Approved AI Content AND immediately show live demo URL
  const handlePublishAllApproved = async () => {
    setPublishing(true);
    setFeedbackMsg(null);
    try {
      // 1. Publish AI Content
      const aiRes = await apiService.publishAiContent();
      
      // 2. Also ensure Portfolio document is published
      let demoUrl = aiRes.liveDemoUrl || aiRes.publishedUrl;
      let finalSlug = aiRes.slug || user?.slug || user?.username || profile?.handle?.replace('@', '') || 'portfolio';

      try {
        const portRes = await apiService.publishPortfolio(finalSlug);
        if (portRes?.data?.liveDemoUrl || portRes?.data?.publishedUrl) {
          demoUrl = portRes.data.liveDemoUrl || portRes.data.publishedUrl;
          finalSlug = portRes.data.slug || finalSlug;
        }
      } catch (pErr) {
        console.warn('Portfolio direct publish sync note:', pErr.message);
      }

      if (!demoUrl) {
        demoUrl = `${window.location.origin}/p/${finalSlug}`;
      }

      await refetchProfile();

      // Open Live Demo URL Modal
      setPublishModal({
        isOpen: true,
        liveDemoUrl: demoUrl,
        slug: finalSlug
      });

      setFeedbackMsg({ 
        type: 'success', 
        text: `Successfully published approved AI sections to live dynamic portfolio! Demo available at: ${demoUrl}`,
        url: demoUrl
      });
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: `Publish failed: ${err.message}` });
    } finally {
      setPublishing(false);
    }
  };

  const handleRegenerateSection = async (item) => {
    setRegeneratingSection(item._id || item.section);
    try {
      const res = await apiService.regenerateAiSection(item._id, item.section, aiIdea);
      const updatedDoc = res.data;
      setSections(prev => prev.map(s => s.section === item.section ? updatedDoc : s));
      setFeedbackMsg({ 
        type: 'success', 
        text: `Regenerated '${item.title}' based on resume grounding${aiIdea ? ` and idea: "${aiIdea}"` : ''}.` 
      });
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: `Failed to regenerate section: ${err.message}` });
    } finally {
      setRegeneratingSection(null);
    }
  };

  const handleToggleApprove = async (item) => {
    try {
      const newStatus = !item.approved;
      await apiService.toggleApproveAiContent(item._id, newStatus);
      setSections(prev => prev.map(s => (s._id === item._id || s.section === item.section) ? { ...s, approved: newStatus } : s));
      setFeedbackMsg({
        type: 'success',
        text: `'${item.title}' is now ${newStatus ? 'APPROVED for Public Portfolio' : 'marked as DRAFT'}`
      });
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: `Approval toggle failed: ${err.message}` });
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id || item.section);
    const textVal = typeof item.generatedContent === 'string'
      ? item.generatedContent
      : JSON.stringify(item.generatedContent, null, 2);
    setEditBuffer(textVal);
  };

  const saveEdit = async (item) => {
    try {
      let parsedVal = editBuffer;
      if (typeof item.generatedContent !== 'string') {
        try {
          parsedVal = JSON.parse(editBuffer);
        } catch {
          // Keep string if JSON parsing fails
        }
      }

      await apiService.updateAiContent(item._id, { generatedContent: parsedVal });
      setSections(prev => prev.map(s => (s._id === item._id || s.section === item.section) ? { ...s, generatedContent: parsedVal } : s));
      setEditingId(null);
      setFeedbackMsg({ type: 'success', text: `Saved custom edits to '${item.title}'` });
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: `Failed to save edits: ${err.message}` });
    }
  };

  const toggleSourceDrawer = (id) => {
    setExpandedSource(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyText = (id, text) => {
    const val = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSections = sections.filter(s => {
    if (filter === 'APPROVED') return s.approved;
    if (filter === 'DRAFT') return !s.approved;
    return true;
  });

  const sortedSections = [...filteredSections].sort((a, b) => {
    return sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section);
  });

  const approvedCount = sections.filter(s => s.approved).length;

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      
      {/* Live Demo Popup Modal on Publish */}
      <PublishSuccessModal
        isOpen={publishModal.isOpen}
        onClose={() => setPublishModal(prev => ({ ...prev, isOpen: false }))}
        liveDemoUrl={publishModal.liveDemoUrl}
        slug={publishModal.slug}
      />

      {/* Header & Main Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6D5EF7]/10 text-[#6D5EF7] text-[11px] font-mono font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16803D]" />
            RESUME-GROUNDED STUDIO • ZERO FABRICATED FACTS
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] dark:text-white flex items-center gap-2.5 tracking-tight">
            <Cpu className="w-7 h-7 text-[#6D5EF7]" />
            AI Generator & Management Studio
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] dark:text-slate-400 mt-1">
            Synthesize, review, edit, approve, and deploy the complete credentials of <span className="text-[#6D5EF7] font-semibold">{profile?.fullName || user?.name || 'the authenticated creator'}</span> tailored by your strategic AI ideas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleGenerateAll()}
            disabled={generating}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] shadow-sm flex items-center gap-2 disabled:opacity-50 transition-all"
          >
            <Sparkles className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Synthesizing Persona...' : 'AI Generate All (with Idea)'}
          </button>

          <button
            onClick={handlePublishAllApproved}
            disabled={publishing || approvedCount === 0}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#16803D] shadow-sm hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            {publishing ? 'Publishing...' : `Publish Approved (${approvedCount})`}
          </button>
        </div>
      </div>

      {/* Strategic AI Idea Prompt Bar */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-[#E4E7EC] dark:border-slate-800 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#172033] dark:text-white uppercase tracking-wider font-mono">
            <Lightbulb className="w-4 h-4 text-[#A15C00]" />
            AI Idea & Custom Focus Angle
          </div>
          {aiIdea && (
            <button
              onClick={() => setAiIdea('')}
              className="text-[11px] text-[#667085] hover:text-[#172033] dark:hover:text-slate-200 font-mono underline"
            >
              Clear Idea
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              type="text"
              value={aiIdea}
              onChange={(e) => setAiIdea(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateAll()}
              placeholder="Enter an AI idea (e.g., Focus on MERN Stack, AI Assistant integrations, and ServiceNow CAD workflows)"
              className="w-full px-4 py-3 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 text-xs text-[#172033] dark:text-slate-100 placeholder:text-[#667085]/60 focus:bg-white focus:outline-none focus:border-[#6D5EF7] focus:ring-2 focus:ring-[#6D5EF7]/10 transition-all"
            />
          </div>

          <button
            onClick={() => handleGenerateAll()}
            disabled={generating}
            className="px-5 py-3 rounded-xl font-semibold text-xs text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] transition-colors flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 shadow-sm"
          >
            <Wand2 className="w-4 h-4" />
            Apply AI Idea
          </button>
        </div>

        {/* Suggested Quick Idea Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-[#667085] uppercase tracking-wider block">
            Suggested Strategic Angles:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickIdeas.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setAiIdea(q.text);
                  handleGenerateAll(q.text);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all text-left ${
                  aiIdea === q.text
                    ? 'bg-[#6D5EF7] text-white border-[#6D5EF7] shadow-sm'
                    : 'bg-[#F8F9FC] dark:bg-slate-900 text-[#172033] dark:text-slate-300 border-[#E4E7EC] dark:border-slate-800 hover:border-[#6D5EF7]'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Verified Grounding Persona Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] text-[#172033] dark:text-white border border-[#E4E7EC] dark:border-slate-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="font-bold flex items-center gap-2 text-[#16803D] dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            Grounding Verified: {profile?.fullName || user?.name || 'Authenticated Creator'}
          </div>
          <p className="text-[11px] text-[#667085] dark:text-slate-400 font-mono">
            {profile?.tagline || profile?.bio || 'Professional profile grounded on verified credentials and platform data'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
          {(metrics?.platforms && metrics.platforms.length > 0) ? (
            metrics.platforms.map((p, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-xl bg-[#F8F9FC] dark:bg-slate-800 text-[#172033] dark:text-slate-300 border border-[#E4E7EC] dark:border-slate-700">
                {p.platform}: {p.handle || p.username} ({formatNumber(p.followers || 0)} {p.metricLabel || 'Followers'})
              </span>
            ))
          ) : (
            <span className="px-2.5 py-1 rounded-xl bg-[#F8F9FC] dark:bg-slate-800 text-[#172033] dark:text-slate-300 border border-[#E4E7EC] dark:border-slate-700">
              Personalized Creator Studio
            </span>
          )}
        </div>
      </div>

      {/* Progress & Filter Banner */}
      <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-4 sm:p-5 border border-[#E4E7EC] dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#6D5EF7]/10 border border-[#6D5EF7]/20 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5 text-[#6D5EF7]" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#172033] dark:text-white">
              AI Sections: {approvedCount} of {sections.length || 11} Approved
            </div>
            <div className="text-xs text-[#667085] dark:text-slate-400">
              Only approved sections are published to your public portfolio.
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs">
          {['ALL', 'APPROVED', 'DRAFT'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filter === f
                  ? 'bg-white dark:bg-slate-800 text-[#6D5EF7] shadow-sm'
                  : 'text-[#667085] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2.5 animate-in fade-in ${
          feedbackMsg.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-[#16803D] dark:text-emerald-400'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{feedbackMsg.text}</span>
          </div>
          {feedbackMsg.url && (
            <button
              onClick={() => window.open(feedbackMsg.url, '_blank')}
              className="px-3 py-1 rounded-lg bg-[#16803D] text-white text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-700 transition-colors shrink-0 shadow-sm"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Open Live Demo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Content Section List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 rounded-2xl animate-pulse bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800" />
          ))}
        </div>
      ) : sortedSections.length === 0 ? (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-12 text-center border border-[#E4E7EC] dark:border-slate-800 space-y-4 shadow-sm">
          <Cpu className="w-12 h-12 text-[#667085] mx-auto" />
          <h3 className="text-base font-bold text-[#172033] dark:text-white">No AI Generated Content Found</h3>
          <p className="text-xs text-[#667085] dark:text-slate-400 max-w-md mx-auto">
            Click "AI Generate All (with Idea)" above to synthesize all 11 portfolio sections directly grounded in your uploaded resume and verified platform channels.
          </p>
          <button
            onClick={() => handleGenerateAll()}
            className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] shadow-sm transition-all"
          >
            Generate Persona Portfolio Content
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedSections.map((item) => {
            const idKey = item._id || item.section;
            const isEditing = editingId === idKey;
            const isRegenerating = regeneratingSection === idKey;

            return (
              <div
                key={idKey}
                className={`bg-white dark:bg-[#0F172A] rounded-2xl p-6 border transition-all duration-200 space-y-4 shadow-sm ${
                  item.approved
                    ? 'border-emerald-500/30'
                    : 'border-[#E4E7EC] dark:border-slate-800'
                }`}
              >
                {/* Section Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E7EC] dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#172033] dark:text-white">
                      {sectionLabels[item.section] || item.title}
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      item.approved
                        ? 'bg-emerald-500/10 text-[#16803D] dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-[#A15C00] dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.approved ? 'APPROVED' : 'DRAFT'}
                    </span>
                  </div>

                  {/* Actions Header */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyText(idKey, item.generatedContent)}
                      className="p-2 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 text-[#667085] hover:text-[#172033] dark:hover:text-white transition-colors border border-[#E4E7EC] dark:border-slate-800"
                      title="Copy Section Content"
                    >
                      {copiedId === idKey ? <Check className="w-4 h-4 text-[#16803D]" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleRegenerateSection(item)}
                      disabled={isRegenerating}
                      className="p-2 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 text-[#667085] hover:text-[#6D5EF7] transition-colors disabled:opacity-50 border border-[#E4E7EC] dark:border-slate-800"
                      title="Regenerate this section with current AI Idea"
                    >
                      <RotateCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin text-[#6D5EF7]' : ''}`} />
                    </button>

                    {isEditing ? (
                      <button
                        onClick={() => saveEdit(item)}
                        className="px-3 py-1.5 rounded-xl bg-[#16803D] text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Save className="w-3.5 h-3.5" /> Save
                      </button>
                    ) : (
                      <button
                        onClick={() => startEdit(item)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 text-[#172033] dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 border border-[#E4E7EC] dark:border-slate-800 hover:bg-[#F8F9FC] dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleApprove(item)}
                      className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors ${
                        item.approved
                          ? 'bg-amber-500/10 text-[#A15C00] dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                          : 'bg-[#16803D] text-white hover:bg-emerald-700 shadow-sm'
                      }`}
                    >
                      {item.approved ? (
                        <> <XCircle className="w-3.5 h-3.5" /> Unapprove </>
                      ) : (
                        <> <CheckCircle2 className="w-3.5 h-3.5" /> Approve </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Content Body Preview / Editor */}
                <div>
                  {isEditing ? (
                    <textarea
                      rows={8}
                      value={editBuffer}
                      onChange={(e) => setEditBuffer(e.target.value)}
                      className="w-full p-4 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#6D5EF7] text-xs font-mono text-[#172033] dark:text-slate-100 focus:outline-none"
                    />
                  ) : (
                    <div className="p-4 sm:p-5 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800">
                      
                      {/* String format (Headline, Bio, About, Social Proof) */}
                      {typeof item.generatedContent === 'string' && (
                        <p className="text-xs text-[#172033] dark:text-slate-200 leading-relaxed whitespace-pre-line font-mono">
                          {item.generatedContent}
                        </p>
                      )}

                      {/* Education Background */}
                      {item.section === 'education_background' && Array.isArray(item.generatedContent) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {item.generatedContent.map((edu, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 space-y-1.5 shadow-xs">
                              <div className="flex items-center gap-1.5 text-[#6D5EF7] font-bold text-xs">
                                <GraduationCap className="w-4 h-4" />
                                <span>{edu.institution}</span>
                              </div>
                              <div className="text-[11px] font-semibold text-[#172033] dark:text-white">
                                {edu.degree}
                              </div>
                              <div className="flex items-center justify-between text-[10px] font-mono text-[#667085]">
                                <span>{edu.duration || edu.dates}</span>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-[#16803D] dark:text-emerald-400 font-bold">
                                  {edu.gpa}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Experience & Internships */}
                      {item.section === 'experience_internship' && Array.isArray(item.generatedContent) && (
                        <div className="space-y-3">
                          {item.generatedContent.map((exp, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 space-y-2 shadow-xs">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <div className="flex items-center gap-2">
                                  <Briefcase className="w-4 h-4 text-[#6D5EF7]" />
                                  <span className="font-bold text-xs text-[#172033] dark:text-white">{exp.role}</span>
                                  <span className="text-xs text-[#6D5EF7] font-semibold">@ {exp.company}</span>
                                </div>
                                <span className="text-[10px] font-mono text-[#667085]">{exp.duration} • {exp.location}</span>
                              </div>
                              {exp.responsibilities && (
                                <ul className="space-y-1 text-xs text-[#172033] dark:text-slate-300">
                                  {exp.responsibilities.map((r, rIdx) => (
                                    <li key={rIdx} className="flex items-start gap-2">
                                      <span className="text-[#6D5EF7] font-bold">•</span>
                                      <span>{r}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Certifications & Badges */}
                      {item.section === 'certifications_credentials' && Array.isArray(item.generatedContent) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {item.generatedContent.map((cert, idx) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 space-y-1.5 shadow-xs">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-[#172033] dark:text-white">
                                  <Award className="w-4 h-4 text-[#A15C00]" />
                                  <span>{cert.name}</span>
                                </div>
                              </div>
                              <div className="text-[11px] text-[#6D5EF7] font-semibold">{cert.issuer}</div>
                              <p className="text-[10px] text-[#667085] leading-normal">{cert.description}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Skills Matrix */}
                      {item.section === 'skills_matrix' && typeof item.generatedContent === 'object' && !Array.isArray(item.generatedContent) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(item.generatedContent).map(([category, skillList], idx) => (
                            <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 space-y-2 shadow-xs">
                              <div className="text-[11px] font-mono font-bold text-[#6D5EF7] uppercase tracking-wider flex items-center gap-1.5">
                                <Code2 className="w-3.5 h-3.5" />
                                {category.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {Array.isArray(skillList) ? skillList.map((sk, sIdx) => (
                                  <span key={sIdx} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#F8F9FC] dark:bg-slate-800 text-[#172033] dark:text-slate-200 border border-[#E4E7EC] dark:border-slate-700">
                                    {sk}
                                  </span>
                                )) : <span className="text-xs text-[#667085]">{JSON.stringify(skillList)}</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Project Descriptions & Featured Summaries */}
                      {(item.section === 'project_descriptions' || item.section === 'featured_summaries') && Array.isArray(item.generatedContent) && (
                        <div className="space-y-3">
                          {item.generatedContent.map((proj, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 space-y-2 shadow-xs">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-xs text-[#172033] dark:text-white flex items-center gap-2">
                                  <Terminal className="w-3.5 h-3.5 text-[#6D5EF7]" />
                                  {proj.title}
                                </h4>
                                {proj.technologies && (
                                  <div className="flex flex-wrap gap-1">
                                    {proj.technologies.slice(0, 4).map((t, tIdx) => (
                                      <span key={tIdx} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#6D5EF7]/10 text-[#6D5EF7]">
                                        {t}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-[#172033] dark:text-slate-300 leading-relaxed font-mono">
                                {proj.description || proj.summary}
                              </p>
                              {(proj.highlights || proj.keyHighlights) && (
                                <ul className="space-y-1 text-[11px] text-[#667085] dark:text-slate-400 font-mono">
                                  {(proj.highlights || proj.keyHighlights).map((hl, hlIdx) => (
                                    <li key={hlIdx} className="flex items-center gap-1.5">
                                      <span className="text-[#16803D]">✓</span> {hl}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Achievements List */}
                      {item.section === 'achievements' && Array.isArray(item.generatedContent) && (
                        <ul className="space-y-2">
                          {item.generatedContent.map((ach, idx) => (
                            <li key={idx} className="text-xs text-[#172033] dark:text-slate-200 flex items-start gap-2.5 font-mono">
                              <span className="text-[#A15C00] font-bold">★</span>
                              <span>{ach}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                    </div>
                  )}
                </div>

                {/* Grounding Source Data Drawer */}
                <div className="pt-2">
                  <button
                    onClick={() => toggleSourceDrawer(idKey)}
                    className="flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#667085] hover:text-[#6D5EF7] transition-colors"
                  >
                    <span>Inspect Grounding Source Details</span>
                    {expandedSource[idKey] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {expandedSource[idKey] && (
                    <div className="mt-2 p-3 rounded-xl bg-slate-950 text-slate-300 text-[10px] font-mono border border-slate-800 space-y-1 animate-in fade-in">
                      <div className="text-[#6D5EF7] font-bold mb-1">FACT GROUNDING SNAPSHOT (Zero Simulated Data):</div>
                      <pre className="overflow-x-auto text-emerald-400">
                        {JSON.stringify(item.sourceData || {}, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardContent;

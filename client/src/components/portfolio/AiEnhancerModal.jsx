import React, { useState } from 'react';
import { Sparkles, Check, X, RefreshCw, Edit2, ShieldCheck, Save, ArrowRight } from 'lucide-react';
import { apiService } from '../../services/api';

export const AiEnhancerModal = ({
  enhancedData = null,
  originalData = null,
  onClose,
  onEnhanceUpdated,
}) => {
  const [data, setData] = useState(enhancedData || {});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState({});
  const [statuses, setStatuses] = useState({});
  const [message, setMessage] = useState(null);

  const handleAccept = async (sectionKey, content) => {
    try {
      await apiService.acceptEnhancedContent(sectionKey, content);
      setStatuses((prev) => ({ ...prev, [sectionKey]: 'accepted' }));
      setMessage(`Accepted AI content for section: ${sectionKey}`);
      setTimeout(() => setMessage(null), 3000);
      if (onEnhanceUpdated) onEnhanceUpdated();
    } catch (err) {
      setMessage(`Error accepting content: ${err.message}`);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleReject = (sectionKey) => {
    setStatuses((prev) => ({ ...prev, [sectionKey]: 'rejected' }));
    setMessage(`Rejected AI content for section: ${sectionKey}`);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRegenerate = async (sectionKey) => {
    setLoading(true);
    try {
      const res = await apiService.enhancePortfolioContent(originalData);
      const updated = res.data || res;
      if (sectionKey) {
        setData((prev) => ({ ...prev, [sectionKey]: updated[sectionKey] }));
      } else {
        setData(updated);
      }
      setMessage(`Regenerated AI content for ${sectionKey || 'portfolio'}`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage(`Regeneration failed: ${err.message}`);
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (sectionKey, value) => {
    setData((prev) => ({ ...prev, [sectionKey]: value }));
  };

  const toggleEditMode = (sectionKey) => {
    setIsEditing((prev) => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-4xl w-full my-8 shadow-2xl space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-purple/10 text-brand-purple">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI Portfolio Content Generation
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Generated
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grounded strictly in your resume. Generate, Edit, Accept, or Reject each section.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {message && (
          <div className="px-4 py-2 rounded-xl bg-brand-indigo/10 border border-brand-indigo/30 text-brand-purple text-xs font-mono">
            {message}
          </div>
        )}

        {/* 8 GENERATED AI SECTIONS GRID */}
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">

          {/* 1. PROFESSIONAL HEADLINE */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-purple/20 text-brand-purple font-bold">AI Generated</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">1. Professional Headline</h4>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => toggleEditMode('headline')} className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-300 flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> {isEditing.headline ? 'Done' : 'Edit'}
                </button>
                <button type="button" onClick={() => handleAccept('headline', data.headline)} className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${statuses.headline === 'accepted' ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  <Check className="w-3.5 h-3.5" /> Accept
                </button>
                <button type="button" onClick={() => handleReject('headline')} className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400"><X className="w-3.5 h-3.5" /> Reject</button>
                <button type="button" onClick={() => handleRegenerate('headline')} disabled={loading} className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300"><RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /></button>
              </div>
            </div>
            {isEditing.headline ? (
              <textarea value={data.headline || ''} onChange={(e) => handleFieldChange('headline', e.target.value)} rows="2" className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white" />
            ) : (
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{data.headline}</p>
            )}
          </div>

          {/* 2. HERO SUBTITLE */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-purple/20 text-brand-purple font-bold">AI Generated</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">2. Hero Subtitle</h4>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => toggleEditMode('hero_subtitle')} className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-300 flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> {isEditing.hero_subtitle ? 'Done' : 'Edit'}
                </button>
                <button type="button" onClick={() => handleAccept('hero_subtitle', data.hero_subtitle)} className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${statuses.hero_subtitle === 'accepted' ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  <Check className="w-3.5 h-3.5" /> Accept
                </button>
                <button type="button" onClick={() => handleReject('hero_subtitle')} className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400"><X className="w-3.5 h-3.5" /> Reject</button>
                <button type="button" onClick={() => handleRegenerate('hero_subtitle')} disabled={loading} className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300"><RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /></button>
              </div>
            </div>
            {isEditing.hero_subtitle ? (
              <textarea value={data.hero_subtitle || ''} onChange={(e) => handleFieldChange('hero_subtitle', e.target.value)} rows="2" className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white" />
            ) : (
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{data.hero_subtitle}</p>
            )}
          </div>

          {/* 3. ABOUT SECTION */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-purple/20 text-brand-purple font-bold">AI Generated</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">3. About Section</h4>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => toggleEditMode('about_section')} className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-300 flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> {isEditing.about_section ? 'Done' : 'Edit'}
                </button>
                <button type="button" onClick={() => handleAccept('about_section', data.about_section)} className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 ${statuses.about_section === 'accepted' ? 'bg-emerald-500 text-white' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  <Check className="w-3.5 h-3.5" /> Accept
                </button>
                <button type="button" onClick={() => handleReject('about_section')} className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400"><X className="w-3.5 h-3.5" /> Reject</button>
                <button type="button" onClick={() => handleRegenerate('about_section')} disabled={loading} className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800 text-slate-300"><RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /></button>
              </div>
            </div>
            {isEditing.about_section ? (
              <textarea value={data.about_section || ''} onChange={(e) => handleFieldChange('about_section', e.target.value)} rows="4" className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white" />
            ) : (
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{data.about_section}</p>
            )}
          </div>

          {/* 4. PROJECT DESCRIPTIONS */}
          {Array.isArray(data.project_descriptions) && data.project_descriptions.length > 0 && (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-purple/20 text-brand-purple font-bold">AI Generated</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">4. Project Descriptions ({data.project_descriptions.length})</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleAccept('projects', data.project_descriptions)} className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400"><Check className="w-3.5 h-3.5" /> Accept All</button>
                  <button type="button" onClick={() => handleReject('projects')} className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400"><X className="w-3.5 h-3.5" /> Reject</button>
                </div>
              </div>
              <div className="space-y-3">
                {data.project_descriptions.map((proj, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="font-bold text-slate-900 dark:text-white">{proj.name}</div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{proj.enhanced_description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. EXPERIENCE SUMMARIES */}
          {Array.isArray(data.experience_summaries) && data.experience_summaries.length > 0 && (
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-purple/20 text-brand-purple font-bold">AI Generated</span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">5. Experience Summaries ({data.experience_summaries.length})</h4>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleAccept('experience', data.experience_summaries)} className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400"><Check className="w-3.5 h-3.5" /> Accept All</button>
                  <button type="button" onClick={() => handleReject('experience')} className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400"><X className="w-3.5 h-3.5" /> Reject</button>
                </div>
              </div>
              <div className="space-y-3">
                {data.experience_summaries.map((exp, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                    <div className="font-bold text-slate-900 dark:text-white">{exp.job_title} at {exp.company}</div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{exp.enhanced_description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. CAREER FOCUS */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-purple/20 text-brand-purple font-bold">AI Generated</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">7. Career Focus Statement</h4>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => toggleEditMode('career_focus')} className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-300 flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> {isEditing.career_focus ? 'Done' : 'Edit'}
                </button>
                <button type="button" onClick={() => handleAccept('career_focus', data.career_focus)} className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400"><Check className="w-3.5 h-3.5" /> Accept</button>
                <button type="button" onClick={() => handleReject('career_focus')} className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400"><X className="w-3.5 h-3.5" /> Reject</button>
              </div>
            </div>
            {isEditing.career_focus ? (
              <textarea value={data.career_focus || ''} onChange={(e) => handleFieldChange('career_focus', e.target.value)} rows="2" className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white" />
            ) : (
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{data.career_focus}</p>
            )}
          </div>

          {/* 7. CALL TO ACTION */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-purple/20 text-brand-purple font-bold">AI Generated</span>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">8. Call-To-Action Text</h4>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => toggleEditMode('call_to_action')} className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-300 flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> {isEditing.call_to_action ? 'Done' : 'Edit'}
                </button>
                <button type="button" onClick={() => handleAccept('call_to_action', data.call_to_action)} className="px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400"><Check className="w-3.5 h-3.5" /> Accept</button>
                <button type="button" onClick={() => handleReject('call_to_action')} className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400"><X className="w-3.5 h-3.5" /> Reject</button>
              </div>
            </div>
            {isEditing.call_to_action ? (
              <textarea value={data.call_to_action || ''} onChange={(e) => handleFieldChange('call_to_action', e.target.value)} rows="2" className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white" />
            ) : (
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">{data.call_to_action}</p>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleRegenerate()}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Regenerate All AI Content</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold flex items-center gap-2"
          >
            <span>Done Customizing AI Content</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default AiEnhancerModal;

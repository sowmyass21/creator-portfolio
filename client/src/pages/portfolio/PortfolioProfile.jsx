import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import ResumeProfileEditor from '../../components/portfolio/ResumeProfileEditor';
import AiEnhancerModal from '../../components/portfolio/AiEnhancerModal';
import SocialAccountManager from '../../components/portfolio/SocialAccountManager';
import { User, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export const PortfolioProfile = () => {
  const navigate = useNavigate();
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [enhancedData, setEnhancedData] = useState(null);
  const [showEnhancerModal, setShowEnhancerModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadParsedResume = async () => {
      try {
        const res = await apiService.getResumeProfile();
        if (res?.data?.profileData) {
          setParsedData(res.data.profileData);
        } else if (res?.data?.parsedData) {
          setParsedData(res.data.parsedData);
        } else {
          const fallback = await apiService.getParsedResume();
          if (fallback?.data?.parsedData) {
            setParsedData(fallback.data.parsedData);
          }
        }
      } catch (err) {
        console.error('Failed to load resume profile:', err);
        try {
          const fallback = await apiService.getParsedResume();
          if (fallback?.data?.parsedData) {
            setParsedData(fallback.data.parsedData);
          }
        } catch (fallbackErr) {
          console.error('Fallback getParsedResume failed:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };
    loadParsedResume();
  }, []);

  const handleSave = async (updatedFields) => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await apiService.updateResumeProfile(null, updatedFields);
      setParsedData(updatedFields);
      setSaveSuccess(true);
      setToastMessage('Saved ✓ Resume profile updated successfully!');
      setTimeout(() => {
        setSaveSuccess(false);
        setToastMessage(null);
      }, 3500);
    } catch (err) {
      setToastMessage(`Unable to save changes: ${err.message}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerEnhancement = async () => {
    setEnhancing(true);
    try {
      const res = await apiService.enhancePortfolioContent(parsedData);
      setEnhancedData(res.data || res);
      setShowEnhancerModal(true);
    } catch (err) {
      setToastMessage(`Enhancement Error: ${err.message}`);
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setEnhancing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-mono text-slate-400">
        Loading parsed resume data...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-brand-purple" />
            Resume Profile Editor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Step 2 of 5: Review and refine extracted contact details, experience, and skills
          </p>
        </div>

        <div className="flex items-center gap-3">
          {toastMessage && (
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {toastMessage}
            </span>
          )}

          <button
            onClick={handleTriggerEnhancement}
            disabled={enhancing}
            className="px-4 py-2 rounded-xl bg-brand-purple/10 border border-brand-purple/30 text-brand-purple text-xs font-bold hover:bg-brand-purple/20 flex items-center gap-2"
          >
            <Sparkles className={`w-4 h-4 ${enhancing ? 'animate-spin' : ''}`} />
            <span>{enhancing ? 'Enhancing with AI...' : 'AI Enhance Content'}</span>
          </button>

          <button
            onClick={() => navigate('/portfolio/customize')}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold flex items-center gap-2"
          >
            <span>Continue to Customize Layout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ResumeProfileEditor data={parsedData || {}} onSave={handleSave} isSaving={saving} isSaved={saveSuccess} />

      <SocialAccountManager />

      {showEnhancerModal && (
        <AiEnhancerModal
          enhancedData={enhancedData}
          originalData={parsedData}
          onClose={() => setShowEnhancerModal(false)}
        />
      )}
    </div>
  );
};

export default PortfolioProfile;

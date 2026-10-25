import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../../services/api';
import PortfolioPublishCard from '../../components/portfolio/PortfolioPublishCard';
import PublishSuccessModal from '../../components/portfolio/PublishSuccessModal';
import { Globe, CheckCircle2, AlertCircle } from 'lucide-react';

export const PortfolioPublish = () => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: string }

  // Live Demo Popup Modal on Publish
  const [publishModal, setPublishModal] = useState({
    isOpen: false,
    liveDemoUrl: '',
    slug: 'shahukarisowmya'
  });

  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await apiService.getPortfolioBuilder();
      if (res?.data) {
        setPortfolioData(res.data);
      }
    } catch (err) {
      console.error('[PortfolioPublish] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveDraft = async () => {
    setProcessing(true);
    try {
      const portfolioId = portfolioData?._id || portfolioData?.id;
      if (portfolioId) {
        await apiService.updatePortfolioCustomize({ status: 'DRAFT' });
      }
      showToast('success', 'Portfolio draft saved successfully!');
      await fetchPortfolio();
    } catch (err) {
      showToast('error', `Save draft failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handlePublish = async (customSlug) => {
    setProcessing(true);
    try {
      const portfolioId = portfolioData?._id || portfolioData?.id;
      let res = null;

      if (portfolioId) {
        res = await apiService.publishPortfolioById(portfolioId, customSlug);
      } else {
        res = await apiService.publishPortfolio(customSlug);
      }

      // Also ensure approved AI content is synced
      try {
        await apiService.publishAiContent();
      } catch (aiErr) {
        console.warn('AI Content publish sync note:', aiErr.message);
      }

      if (res?.data) {
        const finalUrl = res.data.liveDemoUrl || res.data.publishedUrl || `${window.location.origin}/p/${res.data.slug}`;
        setPublishModal({
          isOpen: true,
          liveDemoUrl: finalUrl,
          slug: res.data.slug || 'shahukarisowmya'
        });
        showToast('success', `Portfolio published live! Access at ${finalUrl}`);
        await fetchPortfolio();
      }
    } catch (err) {
      showToast('error', `Publishing failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleUnpublish = async () => {
    setProcessing(true);
    try {
      const portfolioId = portfolioData?._id || portfolioData?.id;
      if (portfolioId) {
        await apiService.unpublishPortfolioById(portfolioId);
      } else {
        await apiService.unpublishPortfolio();
      }

      showToast('success', 'Portfolio unpublished and set back to DRAFT.');
      await fetchPortfolio();
    } catch (err) {
      showToast('error', `Unpublish failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-purple/20 border-t-brand-purple rounded-full animate-spin"></div>
        <div className="text-xs font-mono text-slate-400">Loading deployment & publishing status...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Live Demo Popup Modal on Publish */}
      <PublishSuccessModal
        isOpen={publishModal.isOpen}
        onClose={() => setPublishModal(prev => ({ ...prev, isOpen: false }))}
        liveDemoUrl={publishModal.liveDemoUrl}
        slug={publishModal.slug}
      />

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
            <Globe className="w-6 h-6 text-brand-purple" />
            Publish & Deployment Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Step 5 of 5: Verify readiness, customize public URL slug, and issue live portfolio
          </p>
        </div>

        {toast && (
          <div className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-md animate-fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{toast.message}</span>
          </div>
        )}
      </div>

      {/* PUBLICATION CARD & READINESS CHECKLIST */}
      <PortfolioPublishCard
        portfolioData={portfolioData || {}}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        isProcessing={processing}
      />
    </div>
  );
};

export default PortfolioPublish;

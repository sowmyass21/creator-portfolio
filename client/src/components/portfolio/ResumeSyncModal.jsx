import React, { useState } from 'react';
import { 
  GitCompare, PlusCircle, RefreshCw, MinusCircle, 
  CheckCircle2, ShieldAlert, ArrowRight, X, ChevronDown, ChevronUp 
} from 'lucide-react';

export const ResumeSyncModal = ({
  versionData = {},
  diff = null,
  onApply,
  onKeepExisting,
  onClose,
  isProcessing = false,
}) => {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'review'

  const changes = diff?.changes || { added: [], updated: [], removed: [] };
  const summary = diff?.summary || { addedCount: 0, updatedCount: 0, removedCount: 0 };
  const filename = versionData?.filename || versionData?.original_filename || 'New Resume';
  const versionNum = versionData?.version_number || versionData?.versionNumber || 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] flex flex-col justify-between overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-purple/10 border border-brand-purple/20 text-brand-purple flex items-center justify-center">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  Resume Version Synchronization
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-brand-purple/20 border border-brand-purple/30 text-brand-purple text-[10px] font-mono font-bold">
                  v{versionNum} ({filename})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                New resume parsed. Your existing portfolio content will never be silently overwritten.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB TOGGLES */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              activeTab === 'summary' ? 'bg-brand-purple text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sync Summary & Options
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'review' ? 'bg-brand-purple text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Review Detected Changes</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono">
              +{summary.addedCount} / ~{summary.updatedCount} / -{summary.removedCount}
            </span>
          </button>
        </div>

        {/* TAB 1: SUMMARY & OPTIONS */}
        {activeTab === 'summary' && (
          <div className="space-y-4 overflow-y-auto pr-1">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <ShieldAlert className="w-4 h-4 text-brand-purple" />
                <span>Choose how to apply version changes:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* CHOICE 1: APPLY CHANGES */}
                <button
                  onClick={onApply}
                  disabled={isProcessing}
                  className="p-4 rounded-xl bg-gradient-to-b from-brand-purple/20 to-brand-indigo/10 border border-brand-purple/40 hover:border-brand-purple text-left space-y-2 group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-white group-hover:text-brand-purple">Apply Changes</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Merge parsed resume details into active portfolio profile.
                  </p>
                </button>

                {/* CHOICE 2: KEEP EXISTING */}
                <button
                  onClick={onKeepExisting}
                  disabled={isProcessing}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left space-y-2 group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-200 group-hover:text-white">Keep Existing</span>
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Preserve your manually edited portfolio content untouched.
                  </p>
                </button>

                {/* CHOICE 3: REVIEW CHANGES */}
                <button
                  onClick={() => setActiveTab('review')}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-brand-purple text-left space-y-2 group transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-200 group-hover:text-white">Review Changes</span>
                    <GitCompare className="w-4 h-4 text-brand-pink" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Inspect itemized list of added, updated, and removed content.
                  </p>
                </button>
              </div>
            </div>

            {/* DIFF METRICS BADGES */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-lg font-extrabold text-emerald-400 font-mono">+{summary.addedCount}</div>
                <div className="text-[10px] font-mono font-bold text-emerald-300 uppercase">Added</div>
              </div>
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-center">
                <div className="text-lg font-extrabold text-sky-400 font-mono">~{summary.updatedCount}</div>
                <div className="text-[10px] font-mono font-bold text-sky-300 uppercase">Updated</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                <div className="text-lg font-extrabold text-rose-400 font-mono">-{summary.removedCount}</div>
                <div className="text-[10px] font-mono font-bold text-rose-300 uppercase">Removed</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED ITEMIZED REVIEW */}
        {activeTab === 'review' && (
          <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-1">
            
            {/* ADDED ITEMS */}
            {changes.added.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5" /> ADDED ({changes.added.length})
                </h4>
                <div className="space-y-1.5">
                  {changes.added.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200 font-mono">
                      + {item.title || item.value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* UPDATED ITEMS */}
            {changes.updated.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> UPDATED ({changes.updated.length})
                </h4>
                <div className="space-y-1.5">
                  {changes.updated.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-sky-950/30 border border-sky-800/40 space-y-1 text-xs font-mono">
                      <div className="text-sky-300 font-bold">⚡ {item.title}</div>
                      <div className="text-slate-400 line-through text-[11px]">From: {item.from}</div>
                      <div className="text-sky-200 text-[11px]">To: {item.to}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REMOVED ITEMS */}
            {changes.removed.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MinusCircle className="w-3.5 h-3.5" /> REMOVED ({changes.removed.length})
                </h4>
                <div className="space-y-1.5">
                  {changes.removed.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 font-mono">
                      - {item.title || item.value}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!diff?.hasChanges && (
              <div className="p-8 text-center text-xs font-mono text-slate-400">
                No significant differences detected between current profile and newly uploaded resume.
              </div>
            )}
          </div>
        )}

        {/* MODAL FOOTER ACTIONS */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={onKeepExisting}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-colors"
          >
            Keep Existing Profile
          </button>

          <button
            onClick={onApply}
            disabled={isProcessing}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-all flex items-center gap-1.5"
          >
            <span>Apply Version Changes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResumeSyncModal;

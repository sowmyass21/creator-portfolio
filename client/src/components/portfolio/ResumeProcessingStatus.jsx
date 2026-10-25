import React from 'react';
import { CheckCircle2, Loader2, FileText, Sparkles, AlertCircle, ArrowDown } from 'lucide-react';

export const ResumeProcessingStatus = ({ currentStatus = 'UPLOADED', extractionStatus = 'PENDING', processingError = null }) => {
  const workflowSteps = [
    { key: 'UPLOADED', name: 'Uploading Resume', description: 'File uploaded & validated' },
    { key: 'READING_PDF', name: 'Reading Document', description: 'Parsing PDF/DOCX structure & text streams' },
    { key: 'EXTRACTING_CONTENT', name: 'Extracting Content', description: 'Extracting clean text & headings' },
    { key: 'STRUCTURING_RESUME', name: 'Structuring Resume', description: 'Parsing experience, education & skills' },
    { key: 'GENERATING_PORTFOLIO', name: 'Generating Portfolio', description: 'Building dynamic portfolio sections' },
    { key: 'READY_FOR_REVIEW', name: 'Ready for Review', description: 'Portfolio ready to customize & publish' },
  ];

  // Map backend status to current step index
  const getStepIndex = (status) => {
    switch (status) {
      case 'UPLOADED': return 0;
      case 'EXTRACTING': return 1;
      case 'EXTRACTED': return 2;
      case 'PARSING': return 3;
      case 'PARSED': return 4;
      case 'COMPLETED': return 5;
      case 'SCANNED_PDF': return 2;
      case 'NO_TEXT_FOUND': return 2;
      case 'FAILED': return 2;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(currentStatus);
  const isFailed = currentStatus === 'FAILED' || currentStatus === 'NO_TEXT_FOUND' || currentStatus === 'SCANNED_PDF';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Processing Workflow</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time status tracking from backend</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border uppercase ${
            currentStatus === 'COMPLETED' || currentStatus === 'PARSED'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : isFailed
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-brand-purple/10 text-brand-purple border-brand-purple/20'
          }`}>
            {currentStatus}
          </span>
        </div>

        {/* Workflow Steps Display */}
        <div className="space-y-2">
          {workflowSteps.map((step, idx) => {
            const isDone = currentIndex > idx || (currentIndex === 5 && currentStatus === 'COMPLETED');
            const isCurrent = currentIndex === idx && !isDone && !isFailed;
            const isStepFailed = isFailed && currentIndex === idx;

            return (
              <React.Fragment key={step.key}>
                <div
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isDone
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : isCurrent
                      ? 'bg-brand-indigo/10 border-brand-purple/40 shadow-sm'
                      : isStepFailed
                      ? 'bg-rose-500/5 border-rose-500/30'
                      : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/60 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-brand-purple text-white'
                          : isStepFailed
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isStepFailed ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{step.name}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{step.description}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-semibold text-slate-400">
                    {isDone ? 'Complete' : isCurrent ? 'In Progress' : isStepFailed ? 'Failed' : 'Pending'}
                  </span>
                </div>

                {idx < workflowSteps.length - 1 && (
                  <div className="flex justify-center my-0.5">
                    <ArrowDown className={`w-3 h-3 ${isDone ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {isFailed && processingError && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{processingError}</span>
        </div>
      )}
    </div>
  );
};

export default ResumeProcessingStatus;

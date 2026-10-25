import React from 'react';
import { X, FileText, Download, ExternalLink } from 'lucide-react';

export const PdfPreviewModal = ({ resume, fileObject, onClose }) => {
  if (!resume && !fileObject) return null;

  const pdfUrl = fileObject
    ? URL.createObjectURL(fileObject)
    : resume?.fileUrl || `/api/resume/${resume?.id || resume?._id}/file`;

  const fileName = fileObject
    ? fileObject.name
    : resume?.originalFileName || resume?.original_filename || 'Resume.pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-purple/10 text-brand-purple flex items-center justify-center font-mono font-bold text-xs">
              PDF
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[300px]">
                {fileName}
              </h3>
              <p className="text-[11px] font-mono text-slate-400">PDF Preview Document</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              download={fileName}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-purple text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / PDF Frame */}
        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2 sm:p-4 min-h-[500px]">
          <iframe
            src={pdfUrl}
            title="PDF Preview"
            className="w-full h-full min-h-[500px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white"
          />
        </div>
      </div>
    </div>
  );
};

export default PdfPreviewModal;

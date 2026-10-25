import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, RotateCcw, Eye, Trash2, ArrowRight } from 'lucide-react';

export const ResumeUploadZone = ({ 
  onUpload, 
  isUploading = false, 
  uploadProgress = 0, 
  error = null, 
  onRetry,
  activeResume = null,
  onRemoveResume,
  onReplaceResume,
  onPreviewPdf,
  onProcessResume
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const validateFile = (file) => {
    setValidationError(null);
    if (!file) return false;

    // Check empty files (0 bytes)
    if (file.size === 0) {
      setValidationError('The selected file is empty (0 bytes). Please choose a valid document.');
      return false;
    }

    // Check extension and mime type for PDF and DOCX/DOC
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const validExtensions = ['.pdf', '.docx', '.doc'];
    const validMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    const isValidExt = validExtensions.includes(ext);
    const isValidMime = validMimes.includes(file.type) || file.type.includes('pdf') || file.type.includes('word') || file.type.includes('document');

    if (!isValidExt && !isValidMime) {
      setValidationError('Unsupported format. Please upload a PDF (.pdf) or Word document (.docx, .doc).');
      return false;
    }

    // Check 10 MB size limit
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      setValidationError('File size exceeds the 10 MB maximum limit.');
      return false;
    }

    return true;
  };

  const getDocType = (filename) => {
    const ext = (filename || '').toLowerCase();
    if (ext.endsWith('.docx') || ext.endsWith('.doc')) return 'DOCX';
    return 'PDF';
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    if (!validateFile(selectedFile)) return;
    onUpload(selectedFile);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setValidationError(null);
    if (onRetry) onRetry();
  };

  const displayError = validationError || error || activeResume?.errorMessage;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-purple" />
          Resume Upload & File Management
        </h3>
        {activeResume && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
            ACTIVE RESUME
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
        Upload your PDF or Word (.docx, .doc) resume (max 10 MB). Our AI system will extract clean text and structure your portfolio.
      </p>

      {/* Existing Active Resume Display */}
      {activeResume && !selectedFile && (
        <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-purple/10 text-brand-purple flex items-center justify-center font-mono font-bold text-xs">
                {getDocType(activeResume.originalFileName || activeResume.original_filename)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                  {activeResume.originalFileName || activeResume.original_filename || 'Uploaded Resume'}
                </p>
                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                  <span>
                    {activeResume.fileSize ? (activeResume.fileSize / (1024 * 1024)).toFixed(2) : '1.2'} MB
                  </span>
                  <span>•</span>
                  <span>Uploaded {new Date(activeResume.uploadedAt || activeResume.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getDocType(activeResume.originalFileName || activeResume.original_filename) === 'PDF' && (
                <button
                  type="button"
                  onClick={() => onPreviewPdf(activeResume)}
                  className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-purple hover:bg-brand-purple/10 text-xs font-bold transition-colors flex items-center gap-1"
                  title="Preview PDF"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Preview</span>
                </button>
              )}

              <button
                type="button"
                onClick={onReplaceResume}
                className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-purple hover:bg-brand-purple/10 text-xs font-bold transition-colors flex items-center gap-1"
                title="Replace Resume"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Replace</span>
              </button>

              <button
                type="button"
                onClick={() => onRemoveResume(activeResume.id || activeResume._id)}
                className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold transition-colors flex items-center gap-1"
                title="Remove Resume"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Remove</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drag and Drop Zone */}
      {(!activeResume || selectedFile) && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all ${
            dragActive
              ? 'border-brand-purple bg-brand-purple/5'
              : selectedFile
              ? 'border-emerald-500/50 bg-emerald-500/5'
              : displayError
              ? 'border-rose-500/50 bg-rose-500/5'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 hover:border-slate-400 dark:hover:border-slate-600'
          }`}
        >
          {selectedFile ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedFile.name}</p>
                <p className="text-xs font-mono text-slate-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {getDocType(selectedFile.name)} Document
                </p>
              </div>
              {!isUploading && (
                <div className="flex items-center gap-3 mt-1">
                  {getDocType(selectedFile.name) === 'PDF' && (
                    <button
                      type="button"
                      onClick={() => onPreviewPdf(selectedFile)}
                      className="text-xs text-brand-purple hover:underline font-semibold flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview PDF
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs text-rose-500 hover:underline font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Choose different file
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-brand-indigo/10 text-brand-purple flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Drag & drop your PDF or DOCX resume here, or <span className="text-brand-purple font-semibold underline cursor-pointer">browse files</span>
                </p>
                <p className="text-xs font-mono text-slate-400 mt-1">Supported formats: PDF, DOCX, DOC (Max file size: 10 MB)</p>
              </div>
            </div>
          )}

          {!selectedFile && (
            <input
              type="file"
              accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          )}
        </div>
      )}

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs font-mono font-semibold text-slate-400">
            <span>Uploading & Extracting Resume...</span>
            <span>{uploadProgress || 50}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-indigo to-brand-purple transition-all duration-300"
              style={{ width: `${uploadProgress || 50}%` }}
            />
          </div>
        </div>
      )}

      {/* Error state display */}
      {displayError && (
        <div className="mt-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{displayError}</span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[11px] font-bold shrink-0 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Clear Error
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end gap-3">
        {selectedFile && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Uploading & Processing...</span>
              </>
            ) : (
              <>
                <span>Process Resume</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        )}

        {activeResume && !selectedFile && (
          <button
            type="button"
            onClick={onProcessResume}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span>Process Resume</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ResumeUploadZone;

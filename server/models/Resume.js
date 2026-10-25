import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema({
  title: { type: String },
  company: { type: String },
  location: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  current: { type: Boolean, default: false },
  description: { type: String },
  highlights: [{ type: String }],
}, { _id: false });

const educationSchema = new mongoose.Schema({
  degree: { type: String },
  institution: { type: String },
  fieldOfStudy: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  gpa: { type: String },
}, { _id: false });

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  originalFileName: { type: String },
  originalFilename: { type: String },
  fileUrl: { type: String },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, default: 'application/pdf' },
  fileType: { type: String, default: 'application/pdf' },
  storagePath: { type: String, required: true, select: false },
  uploadedAt: { type: Date, default: Date.now },

  processingStatus: {
    type: String,
    enum: ['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'UPLOADED',
  },
  extractionStatus: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'NO_TEXT_FOUND', 'SCANNED_PDF', 'EXTRACTION_FAILED', 'FAILED'],
    default: 'PENDING',
  },
  // Legacy status mapping for existing services
  status: {
    type: String,
    enum: ['UPLOADED', 'EXTRACTING', 'EXTRACTED', 'PARSING', 'PARSED', 'COMPLETED', 'NO_TEXT_FOUND', 'SCANNED_PDF', 'EXTRACTION_FAILED', 'FAILED'],
    default: 'UPLOADED',
  },

  extractedText: { type: String, default: '' },
  extractedTextLength: { type: Number, default: 0 },
  extracted_text_length: { type: Number, default: 0 },
  extraction_status: { type: String, default: 'PENDING' },
  extraction_error: { type: String, default: null },
  structuredData: { type: mongoose.Schema.Types.Mixed, default: {} },
  parsedData: { type: mongoose.Schema.Types.Mixed, default: {} },
  errorMessage: { type: String, default: null },
  processingError: {
    code: { type: String, default: null },
    message: { type: String, default: null },
    timestamp: { type: Date, default: null },
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      const fileNameVal = ret.originalFileName || ret.originalFilename || 'resume.pdf';
      const fileTypeVal = ret.mimeType || ret.fileType || 'application/pdf';
      
      ret.id = ret._id;
      ret.userId = ret.userId;
      ret.originalFileName = fileNameVal;
      ret.originalFilename = fileNameVal;
      ret.original_filename = fileNameVal;
      ret.fileUrl = ret.fileUrl || `/api/resume/${ret._id}/file`;
      ret.fileSize = ret.fileSize;
      ret.file_size = ret.fileSize;
      ret.mimeType = fileTypeVal;
      ret.fileType = fileTypeVal;
      ret.file_type = fileTypeVal;
      ret.uploadedAt = ret.uploadedAt || ret.createdAt;
      
      ret.processingStatus = ret.processingStatus || (ret.status === 'PARSED' || ret.status === 'COMPLETED' ? 'COMPLETED' : ret.status === 'FAILED' ? 'FAILED' : 'PROCESSING');
      ret.extractionStatus = ret.extractionStatus || (ret.extractedText ? 'COMPLETED' : ret.status === 'NO_TEXT_FOUND' ? 'NO_TEXT_FOUND' : ret.status === 'FAILED' ? 'FAILED' : 'PENDING');
      
      ret.extractedText = ret.extractedText;
      ret.extracted_text = ret.extractedText;
      ret.structuredData = ret.structuredData || ret.parsedData || {};
      ret.errorMessage = ret.errorMessage || (ret.processingError ? ret.processingError.message : null);
      
      ret.created_at = ret.createdAt;
      ret.updated_at = ret.updatedAt;

      delete ret.storagePath;
      delete ret.storage_path;
      return ret;
    }
  }
});

const Resume = mongoose.models.Resume || mongoose.model('Resume', resumeSchema);
export default Resume;

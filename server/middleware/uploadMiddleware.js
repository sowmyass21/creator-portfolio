import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Ensure secure uploads directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration with sanitized file identifier
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = crypto.randomUUID();
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    // Sanitize base name to prevent directory traversal or script injection in filename
    const safeBaseName = file.originalname.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 30);
    cb(null, `resume_${safeBaseName}_${uniqueId}${ext}`);
  },
});

// PDF and DOCX file filter validation
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.pdf', '.docx', '.doc'];
  const allowedMimeTypes = [
    'application/pdf',
    'application/x-pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/octet-stream', // Some browsers send octet-stream for docx
  ];

  const hasAllowedExt = allowedExtensions.includes(ext);
  const hasAllowedMime = allowedMimeTypes.includes(file.mimetype) || file.mimetype.includes('pdf') || file.mimetype.includes('word');

  if (hasAllowedExt && (hasAllowedMime || ext === '.docx' || ext === '.pdf')) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Please upload a PDF or DOCX resume document.');
    error.statusCode = 400;
    cb(error, false);
  }
};

export const resumeUploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
}).any();

export default resumeUploadMiddleware;

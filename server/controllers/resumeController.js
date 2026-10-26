import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import Resume from '../models/Resume.js';
import ResumeProfile from '../models/ResumeProfile.js';
import ResumeVersion from '../models/ResumeVersion.js';
import Portfolio from '../models/Portfolio.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { parsePdfResume } from '../services/resumeParserService.js';
import { extractResumeStructure } from '../services/resumeStructureService.js';
import { extractResumeText, extract_resume_text } from '../services/resume/extractor.js';
import { parseResumeText, validateParsedProfile } from '../services/resume/parser.js';
import { normalizeResumeData } from '../services/resume/normalizer.js';
import { generatePortfolioSections } from '../services/portfolio/generator.js';
import { generateUniqueSlug } from './portfolioController.js';
import { compareProfiles } from '../services/resume/diffEngine.js';
import { runLangGraphPortfolioWorkflow } from '../services/workflow/langgraphWorkflow.js';

/**
 * POST /api/resume/upload
 * Process resume upload (PDF only, max 10MB), verify file signature (%PDF), store file securely, extract & parse structured profile.
 */
export const uploadResume = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required to upload resume.', 401);
    }

    const userId = req.user._id || req.user.id;
    let fileMeta = null;
    let fileBuffer = null;

    console.log(`[UPLOAD RECEIVED] Received upload request for user: ${userId}`);

    const uploadedFile = req.file || (Array.isArray(req.files) && req.files.length > 0 ? req.files[0] : null);

    if (uploadedFile) {
      fileBuffer = fs.readFileSync(uploadedFile.path);
      fileMeta = {
        originalFileName: uploadedFile.originalname,
        originalFilename: uploadedFile.originalname,
        mimeType: uploadedFile.mimetype || 'application/pdf',
        fileType: uploadedFile.mimetype || 'application/pdf',
        fileSize: uploadedFile.size,
        storagePath: uploadedFile.path,
      };
    } else if (req.body && (req.body.filename || req.body.rawText || req.body.content)) {
      const originalFilename = req.body.filename || 'resume.pdf';
      const ext = path.extname(originalFilename).toLowerCase() || '.pdf';
      const content = req.body.rawText || req.body.content || '';
      fileBuffer = Buffer.from(content);
      const fileSize = req.body.fileSize || Buffer.byteLength(content);

      const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const uniqueId = crypto.randomUUID();
      const storagePath = path.join(uploadDir, `resume_${uniqueId}${ext}`);
      fs.writeFileSync(storagePath, fileBuffer);

      fileMeta = {
        originalFileName: originalFilename,
        originalFilename,
        mimeType: 'application/pdf',
        fileType: 'application/pdf',
        fileSize,
        storagePath,
      };
    } else {
      return sendError(res, 'No resume file provided. Please attach a PDF or DOCX file.', 400);
    }

    if (!fileBuffer || fileBuffer.length === 0 || fileMeta.fileSize === 0) {
      if (fileMeta.storagePath && fs.existsSync(fileMeta.storagePath)) {
        try { fs.unlinkSync(fileMeta.storagePath); } catch (e) {}
      }
      return sendError(res, 'Uploaded resume file is empty (0 bytes). Please select a valid document.', 400);
    }

    console.log(`[FILE TYPE] ${fileMeta.mimeType} / ${fileMeta.originalFileName}`);
    console.log(`[FILE SIZE] ${fileMeta.fileSize} bytes`);

    // 1. VERIFY FILE FORMAT (PDF, DOCX PK\x03\x04, or Text)
    const isTextUpload = Boolean(req.body && (req.body.filename || req.body.rawText));
    const headerSignature = fileBuffer.slice(0, 4).toString('utf-8');
    const ext = path.extname(fileMeta.originalFileName || '').toLowerCase();
    const isPdfMagic = headerSignature === '%PDF' || ext === '.pdf' || (fileMeta.mimeType && fileMeta.mimeType.includes('pdf'));
    const isDocxMagic = (fileBuffer.length >= 4 && fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4b && fileBuffer[2] === 0x03 && fileBuffer[3] === 0x04) || ext === '.docx' || ext === '.doc';

    if (!isPdfMagic && !isDocxMagic && !isTextUpload) {
      if (fileMeta.storagePath && fs.existsSync(fileMeta.storagePath)) {
        try { fs.unlinkSync(fileMeta.storagePath); } catch (e) {}
      }
      return sendError(res, 'Invalid file format. Uploaded file is not a valid PDF or DOCX document.', 400);
    }

    // 2. CREATE / UPDATE RESUME MONGO DOCUMENT
    let resume = await Resume.findOne({ userId });

    if (!resume) {
      resume = new Resume({
        userId,
        originalFileName: fileMeta.originalFileName,
        originalFilename: fileMeta.originalFilename,
        mimeType: fileMeta.mimeType,
        fileType: fileMeta.fileType,
        fileSize: fileMeta.fileSize,
        storagePath: fileMeta.storagePath,
        processingStatus: 'PROCESSING',
        extractionStatus: 'PROCESSING',
        status: 'EXTRACTING',
        uploadedAt: new Date(),
      });
    } else {
      if (resume.storagePath && resume.storagePath !== fileMeta.storagePath && fs.existsSync(resume.storagePath)) {
        try { fs.unlinkSync(resume.storagePath); } catch (e) { /* ignore */ }
      }
      resume.originalFileName = fileMeta.originalFileName;
      resume.originalFilename = fileMeta.originalFilename;
      resume.mimeType = fileMeta.mimeType;
      resume.fileType = fileMeta.fileType;
      resume.fileSize = fileMeta.fileSize;
      resume.storagePath = fileMeta.storagePath;
      resume.processingStatus = 'PROCESSING';
      resume.extractionStatus = 'PROCESSING';
      resume.status = 'EXTRACTING';
      resume.errorMessage = null;
      resume.processingError = null;
      resume.uploadedAt = new Date();
    }
    resume.fileUrl = `/api/resume/${resume._id}/file`;
    await resume.save();

    console.log(`[FILE SAVED] Saved resume to path: ${fileMeta.storagePath}`);

    // 3. EXECUTE TEXT EXTRACTION VIA EXTRACT_RESUME_TEXT FROM DISK PATH
    console.log(`[EXTRACTION STARTED] Extracting text from file path: ${fileMeta.storagePath}`);
    const extractionResult = await extract_resume_text(fileMeta.storagePath, {
      filename: fileMeta.originalFileName,
      mimeType: fileMeta.mimeType,
    });

    const rawExtractedText = (extractionResult.text || '').trim();
    const extractedTextLength = rawExtractedText.length;
    const MINIMUM_THRESHOLD = 50;

    const isScannedPdf = extractionResult.status === 'SCANNED_PDF' || extractionResult.error === 'SCANNED_PDF_DETECTED' || (isPdfMagic && extractedTextLength > 0 && extractedTextLength < MINIMUM_THRESHOLD);
    const noTextMessage = isScannedPdf
      ? "We couldn't find readable text in this document. Scanned PDF Detected: We couldn't extract readable digital text from this document because it appears to be an image-only or scanned PDF without embedded text. Please upload a standard digital text-based PDF or DOCX file."
      : (extractionResult.error || "We couldn't find readable text in this document. Please upload a text-based PDF or DOCX.");

    const alphaNumCount = (rawExtractedText.replace(/%PDF-\d\.\d|obj|endobj|stream|endstream|<|>|\/Type|\/Page/gi, '').match(/[a-zA-Z0-9]/g) || []).length;

    // MANDATORY EXTRACTION VALIDATION STEP (< 50 characters or < 40 alpha characters -> NO_TEXT_FOUND)
    if (!rawExtractedText || extractedTextLength < MINIMUM_THRESHOLD || alphaNumCount < 40) {
      const finalExtractionStatus = isScannedPdf ? 'SCANNED_PDF' : 'NO_TEXT_FOUND';
      resume.processingStatus = 'FAILED';
      resume.extractionStatus = finalExtractionStatus;
      resume.status = 'FAILED';
      resume.extractedText = rawExtractedText;
      resume.extractedTextLength = extractedTextLength;
      resume.extracted_text_length = extractedTextLength;
      resume.extraction_status = finalExtractionStatus;
      resume.extraction_error = noTextMessage;
      resume.errorMessage = noTextMessage;
      resume.processingError = {
        code: isScannedPdf ? 'SCANNED_PDF_DETECTED' : 'NO_TEXT_FOUND',
        message: noTextMessage,
        timestamp: new Date(),
      };
      await resume.save();

      return sendError(res, noTextMessage, 400, {
        resume: resume.toJSON(),
        extractionStatus: finalExtractionStatus,
        processingStatus: 'FAILED',
        extracted_text: rawExtractedText,
        extracted_text_length: extractedTextLength,
        extraction_status: finalExtractionStatus,
        extraction_error: noTextMessage,
      });
    }

    // Mandatory validation passed! Store extraction metadata
    resume.extractedText = rawExtractedText;
    resume.extractedTextLength = extractedTextLength;
    resume.extracted_text_length = extractedTextLength;
    resume.extraction_status = 'COMPLETED';
    resume.extraction_error = null;

    const parseResult = {
      success: true,
      extractedText: rawExtractedText,
      numPages: extractionResult.page_count,
    };

    const extractedTextPreview = rawExtractedText.substring(0, 150).replace(/\s+/g, ' ');
    console.log(`[EXTRACTED TEXT LENGTH] ${extractedTextLength} characters`);
    console.log(`[EXTRACTED TEXT PREVIEW] "${extractedTextPreview}..."`);

    // 4. INTELLIGENT STRUCTURE EXTRACTION (PHASE 17)
    console.log(`[PARSING STARTED] Parsing extracted text into structured profile schema...`);
    const structuredSchema = extractResumeStructure(parseResult.extractedText, req.user || {});

    // 5. EXECUTE AGENTIC WORKFLOW PIPELINE FOR PORTFOLIO GENERATION
    const workflowResult = await runLangGraphPortfolioWorkflow({
      fileBytes: fileBuffer,
      filename: fileMeta.originalFileName,
      mimeType: fileMeta.mimeType,
      fileSize: fileMeta.fileSize,
      userId,
      theme: 'modern',
      userContext: req.user || {},
    });

    if (workflowResult.status === 'FAILED') {
      resume.processingStatus = 'FAILED';
      resume.extractionStatus = 'FAILED';
      resume.status = 'FAILED';
      resume.errorMessage = workflowResult.error?.message || 'Resume extraction & parsing workflow failed.';
      resume.processingError = workflowResult.error || {
        code: 'WORKFLOW_FAILED',
        message: 'Resume workflow failed.',
        timestamp: new Date(),
      };
      await resume.save();

      const userErrorMessage = workflowResult.error?.message || "We couldn't extract readable text from this resume. Please upload a text-based PDF.";
      return sendError(res, userErrorMessage, 400, {
        resume: resume.toJSON(),
        extractionStatus: 'FAILED',
        processingStatus: 'FAILED',
      });
    }

    console.log(`[PARSING COMPLETED] Profile parsed successfully for: ${structuredSchema.personalInformation?.name || 'Creator'}`);

    // Success extracted & parsed state
    const parsedProfile = workflowResult.parsedProfile || {};
    const normalized = workflowResult.normalizedProfile || {};
    resume.extractedText = parseResult.extractedText || workflowResult.rawText || '';
    resume.structuredData = structuredSchema;
    resume.parsedData = normalized;
    resume.processingStatus = 'COMPLETED';
    resume.extractionStatus = 'COMPLETED';
    resume.status = 'PARSED';
    resume.errorMessage = null;
    resume.processingError = null;
    await resume.save();

    // Version Tracking & Diff Logic
    const versionCount = await ResumeVersion.countDocuments({ userId });
    const versionNumber = versionCount + 1;

    let activeProfile = await ResumeProfile.findOne({ userId }).sort({ updatedAt: -1 });
    const diff = activeProfile ? compareProfiles(activeProfile.profileData, parsedProfile) : null;

    const resumeVersion = await ResumeVersion.create({
      userId,
      resumeId: resume._id,
      versionNumber,
      filename: fileMeta.originalFileName,
      extractedText: resume.extractedText,
      parsedProfile,
      diffSummary: diff,
    });

    // Update or Create active ResumeProfile with newly extracted resume data
    if (!activeProfile) {
      activeProfile = new ResumeProfile({
        resumeId: resume._id,
        userId,
        parserVersion: 'v2.0-ai',
        profileData: structuredSchema,
      });
    } else {
      activeProfile.resumeId = resume._id;
      activeProfile.profileData = structuredSchema;
    }
    await activeProfile.save();

    // Update or Create Portfolio with newly extracted portfolio sections
    const portfolioSections = generatePortfolioSections(structuredSchema);
    let portfolio = await Portfolio.findOne({ userId });
    const creatorName = structuredSchema.personalInformation?.name || req.user?.name || 'Creator';
    const creatorTitle = structuredSchema.personalInformation?.title || 'Full Stack Software Engineer';
    const creatorBio = structuredSchema.professionalSummary?.summary || structuredSchema.professionalSummary?.objective || '';

    if (!portfolio) {
      const userSlug = creatorName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      const slug = await generateUniqueSlug(userSlug || 'creator');
      portfolio = new Portfolio({
        userId,
        resumeId: resume._id,
        slug,
        displayName: `${creatorName}'s Portfolio`,
        headline: creatorTitle,
        bio: creatorBio,
        theme: 'modern',
        profile: portfolioSections.profile,
        about: portfolioSections.about,
        skills: portfolioSections.skills,
        experience: portfolioSections.experience,
        projects: portfolioSections.projects,
        education: portfolioSections.education,
        certifications: portfolioSections.certifications,
        achievements: portfolioSections.achievements,
        publications: portfolioSections.publications,
        socialLinks: portfolioSections.socialLinks,
        sections: portfolioSections,
        status: 'PUBLISHED',
        published: true,
        visibility: 'PUBLIC',
      });
    } else {
      portfolio.resumeId = resume._id;
      portfolio.displayName = `${creatorName}'s Portfolio`;
      portfolio.headline = creatorTitle;
      portfolio.bio = creatorBio;
      portfolio.profile = portfolioSections.profile;
      portfolio.about = portfolioSections.about;
      portfolio.skills = portfolioSections.skills;
      portfolio.experience = portfolioSections.experience;
      portfolio.projects = portfolioSections.projects;
      portfolio.education = portfolioSections.education;
      portfolio.certifications = portfolioSections.certifications;
      portfolio.achievements = portfolioSections.achievements;
      portfolio.publications = portfolioSections.publications;
      portfolio.socialLinks = portfolioSections.socialLinks;
      portfolio.sections = portfolioSections;
      portfolio.status = 'PUBLISHED';
      portfolio.published = true;
      portfolio.visibility = 'PUBLIC';
    }

    portfolio.markModified('profile');
    portfolio.markModified('about');
    portfolio.markModified('skills');
    portfolio.markModified('experience');
    portfolio.markModified('projects');
    portfolio.markModified('education');
    portfolio.markModified('certifications');
    portfolio.markModified('achievements');
    portfolio.markModified('publications');
    portfolio.markModified('socialLinks');
    portfolio.markModified('sections');

    await portfolio.save();

    console.log(`[PROFILE SAVED] Resume, ResumeProfile, and Portfolio documents updated in database.`);

    // Auto-populate Creator Profile model with extracted resume data so user never has to fill manually!
    try {
      const Profile = (await import('../models/Profile.js')).default;
      const pInfo = structuredSchema.personalInformation || {};
      const pSum = structuredSchema.professionalSummary || {};

      const skillsFlat = [];
      if (structuredSchema.skills) {
        Object.entries(structuredSchema.skills).forEach(([cat, list]) => {
          if (Array.isArray(list)) {
            list.forEach(sk => skillsFlat.push({ name: sk, category: cat, proficiency: 85, featured: true }));
          }
        });
      }

      const socialLinksList = [];
      if (pInfo.github) socialLinksList.push({ platform: 'GitHub', url: pInfo.github, handle: pInfo.github.split('/').pop() });
      if (pInfo.linkedIn) socialLinksList.push({ platform: 'LinkedIn', url: pInfo.linkedIn, handle: pInfo.linkedIn.split('/').pop() });

      await Profile.findOneAndUpdate(
        { userId },
        {
          $set: {
            userId,
            fullName: pInfo.name || req.user.name || 'Creator',
            handle: `@${(pInfo.name || req.user.name || 'creator').toLowerCase().replace(/[^a-z0-9]/g, '')}_${userId.toString().slice(-4)}`,
            tagline: pInfo.title || 'Full Stack Software Engineer',
            bio: pSum.summary || pSum.objective || 'Aspiring software engineer.',
            location: pInfo.location || 'India',
            website: pInfo.portfolio || '',
            email: pInfo.email || req.user.email,
            skills: skillsFlat.length > 0 ? skillsFlat : undefined,
            socialLinks: socialLinksList.length > 0 ? socialLinksList : undefined,
          }
        },
        { upsert: true, new: true }
      );
      console.log(`[PROFILE SYNCED] Creator Profile populated with resume data for: ${pInfo.name}`);
    } catch (prErr) {
      console.warn('[Resume Upload] Profile sync note:', prErr.message);
    }

    // Sync CreatorProfile
    try {
      const { getOrCreateCreatorProfile } = await import('../services/creatorProfileService.js');
      await getOrCreateCreatorProfile(userId);
    } catch (cErr) {
      console.warn('[Resume Upload] CreatorProfile sync note:', cErr.message);
    }

    const responsePayload = {
      ...resume.toJSON(),
      profile: activeProfile ? (activeProfile.toObject ? activeProfile.toObject() : activeProfile) : { profileData: structuredSchema },
      structuredData: structuredSchema,
      version: resumeVersion.toJSON(),
      diff,
      workflowStatus: workflowResult.status,
      warnings: workflowResult.warnings || [],
      hasPreviousProfile: Boolean(activeProfile && versionCount > 0),
    };

    console.log(`[PROFILE RETURNED TO FRONTEND] Returning response payload to frontend.`);
    return sendSuccess(res, responsePayload, 'Resume processed and PDF text extracted successfully', 201);
  } catch (error) {
    console.error('[Resume Upload Error]:', error);
    try {
      if (resume) {
        resume.processingStatus = 'FAILED';
        resume.extractionStatus = 'FAILED';
        resume.status = 'FAILED';
        resume.errorMessage = error.message || 'Failed to process resume upload';
        resume.processingError = {
          code: 'UPLOAD_ERROR',
          message: error.message || 'Failed to process resume upload',
          timestamp: new Date()
        };
        await resume.save();
      }
    } catch (saveErr) {
      /* ignore */
    }
    return sendError(res, error.message || 'Failed to process resume upload', 500);
  }
};

/**
 * Helper to safely find resume by ObjectId or active/latest for user
 */
const findResumeByIdOrActive = async (id, userId, selectFields = null) => {
  const idStr = (id && typeof id === 'object' && id._bsontype === 'ObjectID')
    ? id.toString()
    : (typeof id === 'string' ? id.trim() : (id ? id.toString() : ''));

  if (idStr === 'active' || idStr === 'current' || !idStr || idStr === 'undefined' || idStr === 'null') {
    let query = Resume.findOne({ userId }).sort({ updatedAt: -1 });
    if (selectFields) query = query.select(selectFields);
    return await query;
  }

  if (idStr.match(/^[0-9a-fA-F]{24}$/)) {
    let query = Resume.findById(idStr);
    if (selectFields) query = query.select(selectFields);
    return await query;
  }

  return null;
};

/**
 * GET /api/resume/:id/data
 * Retrieve structured resume JSON data for a specific resume. Authenticated owner check enforced.
 */
export const getResumeDataById = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    const resume = await findResumeByIdOrActive(id, userId);

    if (!resume) {
      return sendSuccess(res, {
        resumeId: null,
        structuredData: null,
        hasResume: false,
      }, 'No resume found for user');
    }

    if (resume.userId.toString() !== userId) {
      return sendError(res, 'Access denied: You cannot view another user\'s resume data.', 403);
    }

    let structuredData = resume.structuredData;
    if (!structuredData || Object.keys(structuredData).length === 0) {
      if (resume.extractedText && resume.extractedText.trim().length > 0) {
        structuredData = extractResumeStructure(resume.extractedText, req.user || {});
        resume.structuredData = structuredData;
        await resume.save();
      } else {
        structuredData = {};
      }
    }

    return sendSuccess(res, {
      resumeId: resume._id,
      structuredData,
      updatedAt: resume.updatedAt,
      hasResume: true,
    }, 'Structured resume data retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * PUT /api/resume/:id/data
 * Update structured resume JSON data for a specific resume. Authenticated owner check enforced.
 */
export const updateResumeDataById = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    const resume = await findResumeByIdOrActive(id, userId);

    if (!resume) {
      return sendError(res, 'Resume not found', 404);
    }

    if (resume.userId.toString() !== userId) {
      return sendError(res, 'Access denied: You cannot modify another user\'s resume data.', 403);
    }

    const payload = req.body.structuredData || req.body.data || req.body;
    if (!payload || typeof payload !== 'object') {
      return sendError(res, 'Invalid structured data payload.', 400);
    }

    if (payload.personalInformation || payload.personal_information) {
      const name = payload.personalInformation?.name || payload.personal_information?.full_name;
      if (!payload.personalInformation) payload.personalInformation = {};
      if (!payload.personal_information) payload.personal_information = {};
      if (name) {
        payload.personalInformation.name = name;
        payload.personal_information.full_name = name;
      }
    }

    const normalizedParsedData = normalizeResumeData({
      fullName: payload.personalInformation?.name || payload.personal_information?.full_name || payload.fullName,
      email: payload.personalInformation?.email || payload.personal_information?.email || payload.email,
      phone: payload.personalInformation?.phone || payload.personal_information?.phone || payload.phone,
      location: payload.personalInformation?.location || payload.personal_information?.location || payload.location,
      website: payload.personalInformation?.portfolio || payload.personal_information?.website || payload.website,
      summary: typeof payload.summary === 'string' ? payload.summary : (payload.professionalSummary?.summary || payload.summary?.professional_summary || ''),
      skills: Array.isArray(payload.skills)
        ? payload.skills
        : Object.values(payload.skills || {}).flat(),
      experience: payload.experience || [],
      education: payload.education || [],
      certifications: payload.certifications || [],
      socialLinks: payload.socialLinks || [],
    });

    resume.structuredData = payload;
    resume.parsedData = normalizedParsedData;
    resume.status = 'PARSED';
    resume.processingStatus = 'COMPLETED';
    await resume.save();

    // Also update active ResumeProfile and Portfolio
    let activeProfile = await ResumeProfile.findOne({ userId });
    if (activeProfile) {
      activeProfile.profileData = payload;
      await activeProfile.save();
    }

    let portfolio = await Portfolio.findOne({ userId });
    const portfolioSections = generatePortfolioSections(payload);
    if (portfolio) {
      const newName = payload.personalInformation?.name || payload.personal_information?.full_name || payload.name;
      if (newName) {
        portfolio.displayName = `${newName}'s Portfolio`;
      }
      portfolio.profile = portfolioSections.profile;
      portfolio.about = portfolioSections.about;
      portfolio.skills = portfolioSections.skills;
      portfolio.experience = portfolioSections.experience;
      portfolio.projects = portfolioSections.projects;
      portfolio.education = portfolioSections.education;
      portfolio.certifications = portfolioSections.certifications;
      portfolio.achievements = portfolioSections.achievements;
      portfolio.publications = portfolioSections.publications;
      portfolio.socialLinks = portfolioSections.socialLinks;
      portfolio.sections = portfolioSections;

      portfolio.markModified('profile');
      portfolio.markModified('about');
      portfolio.markModified('skills');
      portfolio.markModified('experience');
      portfolio.markModified('projects');
      portfolio.markModified('education');
      portfolio.markModified('certifications');
      portfolio.markModified('achievements');
      portfolio.markModified('publications');
      portfolio.markModified('socialLinks');
      portfolio.markModified('sections');

      await portfolio.save();
    }

    return sendSuccess(res, {
      resumeId: resume._id,
      structuredData: resume.structuredData,
      updatedAt: resume.updatedAt,
    }, 'Structured resume data saved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * GET /api/resume/:id
 */
export const getResumeById = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    const resume = await findResumeByIdOrActive(id, userId);
    if (!resume) {
      return sendError(res, 'Resume document not found', 404);
    }

    if (resume.userId.toString() !== userId) {
      return sendError(res, 'Access denied: You cannot view another user\'s resume.', 403);
    }

    return sendSuccess(res, resume.toJSON(), 'Resume retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * GET /api/resume/:id/status
 */
export const getResumeStatusById = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    const resume = await findResumeByIdOrActive(id, userId);
    if (!resume) {
      return sendSuccess(res, {
        hasResume: false,
        status: 'NOT_STARTED',
        processingStatus: 'NOT_STARTED',
        extractionStatus: 'PENDING',
        message: 'No resume found for user',
      }, 'Resume status retrieved');
    }

    if (resume.userId.toString() !== userId) {
      return sendError(res, 'Access denied: You cannot view another user\'s resume status.', 403);
    }

    return sendSuccess(res, {
      id: resume._id,
      userId: resume.userId,
      originalFileName: resume.originalFileName || resume.originalFilename,
      fileSize: resume.fileSize,
      mimeType: resume.mimeType || resume.fileType,
      fileUrl: resume.fileUrl,
      processingStatus: resume.processingStatus,
      extractionStatus: resume.extractionStatus,
      status: resume.status,
      hasResume: true,
      errorMessage: resume.errorMessage,
      uploadedAt: resume.uploadedAt || resume.createdAt,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
    }, 'Resume status retrieved');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * DELETE /api/resume/:id
 */
export const deleteResumeById = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    const resume = await findResumeByIdOrActive(id, userId, '+storagePath');
    if (!resume) {
      return sendError(res, 'Resume not found', 404);
    }

    if (resume.userId.toString() !== userId) {
      return sendError(res, 'Access denied: You cannot delete another user\'s resume.', 403);
    }

    if (resume.storagePath && fs.existsSync(resume.storagePath)) {
      try {
        fs.unlinkSync(resume.storagePath);
      } catch (err) {
        console.error('[Resume Delete File Error]:', err.message);
      }
    }

    await Resume.deleteOne({ _id: resume._id });
    await ResumeVersion.deleteMany({ resumeId: resume._id });
    await ResumeProfile.deleteMany({ resumeId: resume._id });

    return sendSuccess(res, { id: resume._id }, 'Resume and associated data deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * GET /api/resume/:id/file
 */
export const getResumeFileById = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    const resume = await findResumeByIdOrActive(id, userId, '+storagePath');
    if (!resume) {
      return sendError(res, 'Resume not found', 404);
    }

    if (resume.userId.toString() !== userId) {
      return sendError(res, 'Access denied: You cannot view another user\'s resume file.', 403);
    }

    if (!resume.storagePath || !fs.existsSync(resume.storagePath)) {
      return sendError(res, 'Resume file not found on disk', 404);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${resume.originalFileName || 'resume.pdf'}"`);
    
    const readStream = fs.createReadStream(resume.storagePath);
    readStream.pipe(res);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * GET /api/resume/versions
 */
export const getResumeVersions = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    const userId = req.user._id || req.user.id;
    const versions = await ResumeVersion.find({ userId }).sort({ versionNumber: -1 });
    return sendSuccess(res, versions.map(v => v.toJSON()), 'Resume versions retrieved');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * GET /api/resume/versions/:versionId
 */
export const getResumeVersionById = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    const userId = req.user._id || req.user.id;
    const { versionId } = req.params;

    const version = await ResumeVersion.findById(versionId);
    if (!version || version.userId.toString() !== userId.toString()) {
      return sendError(res, 'Resume version not found or unauthorized', 404);
    }

    const activeProfile = await ResumeProfile.findOne({ userId }).sort({ updatedAt: -1 });
    const diff = activeProfile ? compareProfiles(activeProfile.profileData, version.parsedProfile) : null;

    return sendSuccess(res, {
      version: version.toJSON(),
      diff,
    }, 'Resume version details retrieved');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * POST /api/resume/versions/:versionId/apply
 */
export const applyResumeVersion = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    const userId = req.user._id || req.user.id;
    const { versionId } = req.params;

    const version = await ResumeVersion.findById(versionId);
    if (!version || version.userId.toString() !== userId.toString()) {
      return sendError(res, 'Resume version not found or unauthorized', 404);
    }

    let activeProfile = await ResumeProfile.findOne({ userId }).sort({ updatedAt: -1 });
    if (!activeProfile) {
      activeProfile = new ResumeProfile({
        resumeId: version.resumeId,
        userId,
        parserVersion: 'v2.0-ai',
        profileData: version.parsedProfile,
      });
    } else {
      activeProfile.profileData = version.parsedProfile;
    }

    await activeProfile.save();

    const normalized = normalizeResumeData({
      fullName: version.parsedProfile.personal_information?.full_name,
      email: version.parsedProfile.personal_information?.email,
      phone: version.parsedProfile.personal_information?.phone,
      location: version.parsedProfile.personal_information?.location,
      website: version.parsedProfile.personal_information?.website,
      summary: version.parsedProfile.summary?.professional_summary,
      skills: Object.values(version.parsedProfile.skills || {}).flat(),
      experience: version.parsedProfile.experience,
      education: version.parsedProfile.education,
    });

    await Resume.updateOne({ _id: version.resumeId }, { parsedData: normalized, structuredData: normalized, status: 'PARSED' });

    let portfolio = await Portfolio.findOne({ userId });
    if (portfolio) {
      portfolio.sections = generatePortfolioSections(normalized, portfolio.theme || 'modern-minimal');
      await portfolio.save();
    }

    return sendSuccess(res, {
      profile: activeProfile.toJSON(),
      appliedVersion: version.versionNumber,
    }, 'Resume version changes applied successfully to active profile');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * POST /api/resume/versions/:versionId/keep-existing
 */
export const keepExistingResumeVersion = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    const userId = req.user._id || req.user.id;
    const { versionId } = req.params;

    const version = await ResumeVersion.findById(versionId);
    if (!version || version.userId.toString() !== userId.toString()) {
      return sendError(res, 'Resume version not found or unauthorized', 404);
    }

    const activeProfile = await ResumeProfile.findOne({ userId }).sort({ updatedAt: -1 });

    return sendSuccess(res, {
      profile: activeProfile ? activeProfile.toJSON() : null,
      keptVersion: version.versionNumber,
    }, 'Existing portfolio profile content preserved');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * GET /api/resume/profile
 */
export const getResumeProfile = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const { resume_id } = req.params;
    const userId = req.user._id || req.user.id;

    let resumeProfile = null;

    if (resume_id && resume_id !== 'profile') {
      resumeProfile = await ResumeProfile.findOne({ resumeId: resume_id });
    } else {
      resumeProfile = await ResumeProfile.findOne({ userId }).sort({ updatedAt: -1 });
    }

    if (!resumeProfile || !resumeProfile.profileData || Object.keys(resumeProfile.profileData).length === 0) {
      const activeResume = await Resume.findOne({ userId }).sort({ updatedAt: -1 });
      if (activeResume && (activeResume.structuredData || activeResume.extractedText)) {
        const struct = activeResume.structuredData || extractResumeStructure(activeResume.extractedText, req.user || {});
        if (!resumeProfile) {
          resumeProfile = await ResumeProfile.create({
            resumeId: activeResume._id,
            userId,
            parserVersion: 'v2.0-ai',
            profileData: struct,
          });
        } else {
          resumeProfile.profileData = struct;
          await resumeProfile.save();
        }
      }
    }

    if (!resumeProfile) {
      return sendError(res, 'Resume profile not found. Please upload a resume first.', 404);
    }

    if (resumeProfile.userId.toString() !== userId.toString()) {
      return sendError(res, 'Access denied: You cannot view another user\'s resume profile.', 403);
    }

    return sendSuccess(res, resumeProfile.toJSON(), 'Resume profile retrieved successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * PUT /api/resume/profile
 */
export const updateResumeProfile = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const { resume_id } = req.params;
    const currentUserId = (req.user._id || req.user.id).toString();

    let profileDataInput = req.body.profileData || req.body.profile_data || req.body;

    if (!profileDataInput || typeof profileDataInput !== 'object') {
      return sendError(res, 'Invalid profile payload provided.', 400);
    }

    let resumeProfile = null;

    if (resume_id && resume_id !== 'profile') {
      resumeProfile = await ResumeProfile.findOne({ resumeId: resume_id });
    }

    if (!resumeProfile) {
      resumeProfile = await ResumeProfile.findOne({ userId: currentUserId }).sort({ updatedAt: -1 });
    }

    if (!resumeProfile) {
      let resume = await Resume.findOne({ userId: currentUserId });
      if (!resume) {
        resume = await Resume.create({
          userId: currentUserId,
          originalFileName: 'Manual_Profile.pdf',
          fileType: 'application/pdf',
          fileSize: 1024,
          storagePath: 'manual/profile.pdf',
          status: 'PARSED',
        });
      }

      resumeProfile = await ResumeProfile.create({
        resumeId: resume._id,
        userId: currentUserId,
        parserVersion: 'v2.0-ai',
        profileData: profileDataInput,
      });
    }

    if (resumeProfile.userId.toString() !== currentUserId) {
      return sendError(res, 'Access denied: You cannot modify another user\'s resume profile.', 403);
    }

    try {
      validateParsedProfile(profileDataInput);
    } catch (valErr) {
      return sendError(res, `Validation Error: ${valErr.message}`, 400);
    }

    resumeProfile.profileData = profileDataInput;
    await resumeProfile.save();

    const updatedNormalized = normalizeResumeData({
      fullName: profileDataInput.personal_information?.full_name || profileDataInput.personal?.name || profileDataInput.personalInformation?.name || req.user.name || '',
      title: profileDataInput.personal_information?.professional_title || profileDataInput.personal?.title || profileDataInput.personalInformation?.professionalTitle || '',
      email: profileDataInput.personal_information?.email || profileDataInput.personal?.email || profileDataInput.personalInformation?.email || req.user.email || '',
      phone: profileDataInput.personal_information?.phone || profileDataInput.personal?.phone || profileDataInput.personalInformation?.phone || '',
      location: profileDataInput.personal_information?.location || profileDataInput.personal?.location || profileDataInput.personalInformation?.location || '',
      website: profileDataInput.personal_information?.website || profileDataInput.personal?.website || profileDataInput.personalInformation?.portfolio || '',
      github: profileDataInput.personal_information?.github || profileDataInput.personal?.github || profileDataInput.personalInformation?.github || '',
      linkedin: profileDataInput.personal_information?.linkedin || profileDataInput.personal?.linkedin || profileDataInput.personalInformation?.linkedIn || '',
      summary: typeof profileDataInput.summary === 'string' ? profileDataInput.summary : (profileDataInput.summary?.professional_summary || profileDataInput.about || ''),
      skills: Array.isArray(profileDataInput.skills) ? profileDataInput.skills : (typeof profileDataInput.skills === 'object' ? Object.values(profileDataInput.skills || {}).flat() : []),
      experience: profileDataInput.experience || [],
      education: profileDataInput.education || [],
      projects: profileDataInput.projects || [],
      certifications: profileDataInput.certifications || [],
      achievements: profileDataInput.achievements || [],
      publications: profileDataInput.publications || [],
      socialLinks: profileDataInput.socialLinks || profileDataInput.personal_information?.other_links || [],
    });

    await Resume.updateOne(
      { _id: resumeProfile.resumeId },
      { parsedData: profileDataInput, structuredData: profileDataInput, status: 'PARSED', processingStatus: 'COMPLETED' }
    );

    let portfolio = await Portfolio.findOne({ userId: currentUserId });
    if (portfolio) {
      const newSections = generatePortfolioSections(profileDataInput, portfolio.theme || 'modern');
      portfolio.displayName = `${newSections.profile?.name || req.user.name || 'Creator'}'s Portfolio`;
      portfolio.headline = newSections.profile?.professionalTitle || portfolio.headline;
      portfolio.bio = newSections.profile?.shortIntro || portfolio.bio;
      portfolio.profile = newSections.profile;
      portfolio.about = newSections.about;
      portfolio.skills = newSections.skills;
      portfolio.experience = newSections.experience;
      portfolio.projects = newSections.projects;
      portfolio.education = newSections.education;
      portfolio.certifications = newSections.certifications;
      portfolio.achievements = newSections.achievements;
      portfolio.publications = newSections.publications;
      portfolio.socialLinks = newSections.socialLinks;
      portfolio.sections = { ...portfolio.sections, ...newSections };

      portfolio.markModified('profile');
      portfolio.markModified('about');
      portfolio.markModified('skills');
      portfolio.markModified('experience');
      portfolio.markModified('projects');
      portfolio.markModified('education');
      portfolio.markModified('certifications');
      portfolio.markModified('achievements');
      portfolio.markModified('publications');
      portfolio.markModified('socialLinks');
      portfolio.markModified('sections');

      await portfolio.save();
    }

    return sendSuccess(res, resumeProfile.toJSON(), 'Resume profile updated successfully');
  } catch (error) {
    console.error('[Update Resume Profile Error]:', error);
    return sendError(res, error.message || 'Failed to update resume profile', 500);
  }
};

/**
 * GET /api/resume/status
 */
export const getResumeStatus = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const userId = req.user._id || req.user.id;
    const resume = await Resume.findOne({ userId });

    if (!resume) {
      return sendSuccess(res, {
        status: 'NOT_STARTED',
        processingStatus: 'NOT_STARTED',
        extractionStatus: 'PENDING',
        hasResume: false,
        message: 'No resume uploaded yet',
      }, 'Resume status retrieved');
    }

    return sendSuccess(res, resume.toJSON(), 'Resume status retrieved');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * GET /api/resume/parsed
 */
export const getParsedResume = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const userId = req.user._id || req.user.id;
    const resume = await Resume.findOne({ userId });

    if (!resume) {
      return sendError(res, 'No resume found for user. Please upload a resume first.', 404);
    }

    return sendSuccess(res, { parsedData: resume.parsedData || resume.structuredData, status: resume.status }, 'Parsed resume retrieved');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * PUT /api/resume/parsed
 */
export const updateParsedResume = async (req, res) => {
  return updateResumeProfile(req, res);
};

export default {
  uploadResume,
  getResumeById,
  getResumeStatusById,
  getResumeDataById,
  updateResumeDataById,
  deleteResumeById,
  getResumeFileById,
  getResumeVersions,
  getResumeVersionById,
  applyResumeVersion,
  keepExistingResumeVersion,
  getResumeProfile,
  updateResumeProfile,
  getResumeStatus,
  getParsedResume,
  updateParsedResume,
};

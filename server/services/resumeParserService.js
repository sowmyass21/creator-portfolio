import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const PDFParse = pdfParseModule.PDFParse || pdfParseModule;

/**
 * Normalizes raw text from PDF document extractions.
 * - Cleans up spacing, leading/trailing whitespace
 * - Preserves line breaks, bullet points, and section headings
 * - Filters out repeated multi-page header/footer lines
 */
export function normalizeExtractedPdfText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  const lines = rawText.split(/\r?\n/);
  const lineCountMap = new Map();

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.length > 5 && trimmed.length < 80) {
      lineCountMap.set(trimmed, (lineCountMap.get(trimmed) || 0) + 1);
    }
  });

  const cleanedLines = [];
  let blankCount = 0;

  for (let line of lines) {
    let trimmed = line.replace(/[ \t]+/g, ' ').trim();

    // Filter out obvious repeating headers/footers (> 3 occurrences)
    if (trimmed.length > 5 && (lineCountMap.get(trimmed) || 0) >= 4) {
      continue;
    }

    if (trimmed === '') {
      blankCount++;
      if (blankCount <= 2) {
        cleanedLines.push('');
      }
    } else {
      blankCount = 0;
      cleanedLines.push(trimmed);
    }
  }

  return cleanedLines.join('\n').trim();
}

/**
 * Parses basic sections, headings, and bullet points from extracted PDF text.
 * Strictly preserves original text without inventing or hallucinating content.
 */
export function extractBasicStructureFromText(text) {
  if (!text) return {};

  const lines = text.split('\n');
  const sections = {};
  let currentSection = 'General';
  sections[currentSection] = [];

  const sectionHeadingRegex = /^(SUMMARY|EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|LICENSES|HONORS|PUBLICATIONS|LANGUAGES|HEADER|PROFILE|OBJECTIVE)$/i;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (sectionHeadingRegex.test(trimmed) || (trimmed.toUpperCase() === trimmed && trimmed.length < 30 && !trimmed.includes('.'))) {
      currentSection = trimmed;
      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
    } else {
      sections[currentSection].push(trimmed);
    }
  });

  return sections;
}

/**
 * Main Resume Parser Service Entrypoint for Phase 16 PDF Extraction.
 * Accepts buffer, filename, mimeType.
 * Returns extraction status, preserved text, and basic structure.
 */
export async function parsePdfResume(fileBuffer, filename = 'resume.pdf', mimeType = 'application/pdf') {
  console.log(`[resumeParserService] Parsing PDF: "${filename}" (${mimeType})`);

  if (!fileBuffer || fileBuffer.length === 0) {
    return {
      success: false,
      extractedText: '',
      numPages: 0,
      isScanned: true,
      status: 'NO_TEXT_FOUND',
      errorMessage: 'Uploaded file is empty.',
      structuredData: {},
    };
  }

  // Verify PDF Header Magic Bytes (%PDF) or delegate to extractResumeText
  const headerSignature = fileBuffer.slice(0, 4).toString('utf-8');
  if (headerSignature !== '%PDF') {
    const { extractResumeText } = await import('./resume/extractor.js');
    const res = await extractResumeText(fileBuffer, mimeType, filename);
    if (res.success) {
      return {
        success: true,
        extractedText: res.rawText,
        numPages: res.numPages || 1,
        isScanned: false,
        status: 'COMPLETED',
        errorMessage: null,
        structuredData: {
          rawSections: extractBasicStructureFromText(res.rawText),
          totalCharacterCount: res.rawText.length,
        },
      };
    }
    return {
      success: false,
      extractedText: '',
      numPages: 0,
      isScanned: false,
      status: 'FAILED',
      errorMessage: res.message || 'Invalid file format. File is not a valid PDF or DOCX document.',
      structuredData: {},
    };
  }

  let rawText = '';
  let totalPages = 1;

  try {
    const parser = new PDFParse({ data: fileBuffer });
    const data = await parser.getText();
    rawText = data?.text || '';
    totalPages = data?.total || 1;
  } catch (err) {
    console.error('[resumeParserService Error]:', err.message);
    return {
      success: false,
      extractedText: '',
      numPages: 0,
      isScanned: false,
      status: 'FAILED',
      errorMessage: `Failed to extract text from PDF: ${err.message}`,
      structuredData: {},
    };
  }

  const normalizedText = normalizeExtractedPdfText(rawText);
  const alphanumericCount = (normalizedText.match(/[a-zA-Z0-9]/g) || []).length;

  // Scanned or image-based PDF detection
  if (alphanumericCount < 20) {
    console.warn(`[resumeParserService] Image/Scanned PDF detected for "${filename}" (character count: ${alphanumericCount})`);
    return {
      success: false,
      extractedText: '',
      numPages: totalPages,
      isScanned: true,
      status: 'NO_TEXT_FOUND',
      errorMessage: 'PDF contains no extractable text (image/scanned PDF). OCR required.',
      structuredData: {},
    };
  }

  const basicStructure = extractBasicStructureFromText(normalizedText);

  return {
    success: true,
    extractedText: normalizedText,
    numPages: totalPages,
    isScanned: false,
    status: 'COMPLETED',
    errorMessage: null,
    structuredData: {
      rawSections: basicStructure,
      totalCharacterCount: normalizedText.length,
      alphanumericCount,
    },
  };
}

export default {
  parsePdfResume,
  normalizeExtractedPdfText,
  extractBasicStructureFromText,
};

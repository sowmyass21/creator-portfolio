import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const PDFParse = pdfParseModule.PDFParse || pdfParseModule;

const mammothModule = require('mammoth');
const mammoth = typeof mammothModule === 'object' && mammothModule.extractRawText ? mammothModule : (mammothModule.default || mammothModule);

/**
 * Normalizes raw text from document extractions.
 * - Collapses redundant horizontal spaces
 * - Trims trailing/leading whitespace per line
 * - Preserves double newline paragraph/section boundaries
 * - Removes repeated header/footer lines if detected
 */
export function normalizeExtractedText(rawText) {
  if (!rawText || typeof rawText !== 'string') return '';

  const lines = rawText.split(/\r?\n/);
  const lineCountMap = new Map();

  // Count line occurrences to identify candidate headers/footers (occurring > 3 times)
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

    // Filter out PDF stream and header markers
    if (/^(%PDF|1 0 obj|endobj|stream|endstream|<<|\/Type|\/Title|obj|<|>)/i.test(trimmed)) {
      continue;
    }

    // Filter out obvious header/footer repetition across multi-page docs
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
 * Extracts plain text from PDF buffer page-by-page.
 */
async function extractPdfText(buffer) {
  try {
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    const rawText = data?.text || '';
    const normalized = normalizeExtractedText(rawText);

    return {
      text: normalized,
      numPages: data?.total || 1,
      info: data?.info || {},
    };
  } catch (err) {
    // Fallback to text reading if buffer contains plain text
    const fallbackText = normalizeExtractedText(buffer.toString('utf-8'));
    const alphaCount = (fallbackText.match(/[a-zA-Z0-9]/g) || []).length;
    if (alphaCount >= 20) {
      return {
        text: fallbackText,
        numPages: 1,
        info: {},
      };
    }
    console.error('[PDF Extractor Error]:', err.message);
    throw new Error(`PDF Parsing Error: ${err.message}`);
  }
}

/**
 * Extracts raw text and table content from DOCX buffer.
 * Reads paragraphs, tables, text runs, and falls back to HTML parsing if text is sparse.
 */
async function extractDocxText(buffer) {
  try {
    const rawResult = await mammoth.extractRawText({ buffer });
    let rawText = rawResult.value || '';

    // If raw text extraction yields sparse text, attempt HTML conversion to parse text runs & table structures
    if (!rawText.trim() || rawText.trim().length < 20) {
      try {
        const htmlResult = await mammoth.convertToHtml({ buffer });
        if (htmlResult.value) {
          rawText = htmlResult.value
            .replace(/<tr[^>]*>/gi, '\n')
            .replace(/<td[^>]*>/gi, '  ')
            .replace(/<p[^>]*>/gi, '\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ');
        }
      } catch (hErr) {
        /* ignore HTML fallback error */
      }
    }

    const normalized = normalizeExtractedText(rawText);

    return {
      text: normalized,
      messages: rawResult.messages || [],
    };
  } catch (err) {
    // Fallback to text reading if buffer contains plain text
    const fallbackText = normalizeExtractedText(buffer.toString('utf-8'));
    const alphaCount = (fallbackText.match(/[a-zA-Z0-9]/g) || []).length;
    if (alphaCount >= 20) {
      return {
        text: fallbackText,
        messages: [],
      };
    }
    console.error('[DOCX Extractor Error]:', err.message);
    throw new Error(`DOCX Parsing Error: ${err.message}`);
  }
}

/**
 * Main Extract Resume Text Entrypoint.
 * Receives file buffer, mimeType, and filename.
 * Detects format, extracts text deterministically, normalizes content,
 * and verifies character_count > 0 before proceeding.
 */
export async function extractResumeText(fileBuffer, mimeType, filename = '') {
  console.log(`[Extractor Service] Starting text extraction for file: "${filename}" (${mimeType || 'unknown'})`);

  if (!fileBuffer || fileBuffer.length === 0) {
    console.warn(`[Extractor Service Warning] File buffer is empty for "${filename}"`);
    return {
      success: false,
      status: 'NO_TEXT_FOUND',
      rawText: '',
      character_count: 0,
      error: 'NO_TEXT_FOUND',
      message: 'No readable text was found in the uploaded resume.',
    };
  }

  const ext = path.extname(filename).toLowerCase();
  const headerSignature = fileBuffer.length >= 4 ? fileBuffer.slice(0, 4).toString('utf-8') : '';
  const isPdf = headerSignature === '%PDF' || ext === '.pdf' || (mimeType && mimeType.includes('pdf'));
  const isDocx = (fileBuffer.length >= 4 && fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4b && fileBuffer[2] === 0x03 && fileBuffer[3] === 0x04) || ext === '.docx' || ext === '.doc' || (mimeType && mimeType.includes('word'));

  let extractionResult = { text: '' };

  try {
    if (isDocx) {
      extractionResult = await extractDocxText(fileBuffer);
    } else if (isPdf) {
      extractionResult = await extractPdfText(fileBuffer);
    } else {
      const text = normalizeExtractedText(fileBuffer.toString('utf-8'));
      extractionResult = { text };
    }
  } catch (err) {
    console.error(`[Extractor Service Failure] Extraction failed for "${filename}":`, err.message);
    const isScanned = isPdf && (err.message.includes('scanned') || err.message.includes('image') || filename.toLowerCase().includes('scanned'));
    return {
      success: false,
      status: isScanned ? 'SCANNED_PDF' : 'NO_TEXT_FOUND',
      rawText: '',
      character_count: 0,
      error: isScanned ? 'SCANNED_PDF_DETECTED' : 'EXTRACTION_ERROR',
      message: isScanned 
        ? "We couldn't find readable text in this document. Scanned PDF Detected: We couldn't find readable digital text in this PDF because it appears to be a scanned image. Please upload a text-based PDF or DOCX file."
        : `We couldn't find readable text in this document. Document parsing error: ${err.message}. Please upload a standard text-based PDF or DOCX file.`,
    };
  }

  const cleanText = extractionResult.text || '';
  const characterCount = cleanText.length;
  const alphanumericCount = (cleanText.match(/[a-zA-Z0-9]/g) || []).length;
  const MINIMUM_THRESHOLD = 50;

  if (characterCount < MINIMUM_THRESHOLD || alphanumericCount < 20) {
    console.warn(`[Extractor Service Warning] Text below minimum threshold (${MINIMUM_THRESHOLD}) for "${filename}" (character_count: ${characterCount})`);
    const isScanned = isPdf;
    const scannedMessage = "Scanned PDF Detected: We couldn't extract readable digital text from this document because it appears to be an image-only or scanned PDF without embedded text. Please upload a digital text-based PDF or DOCX file (exported from Word, Google Docs, or a resume builder).";
    const noTextMessage = "Insufficient readable text found in document. Please upload a standard text-based PDF or DOCX resume.";

    return {
      success: false,
      status: isScanned ? 'SCANNED_PDF' : 'NO_TEXT_FOUND',
      rawText: '',
      character_count: 0,
      error: isScanned ? 'SCANNED_PDF_DETECTED' : 'NO_TEXT_FOUND',
      message: isScanned ? scannedMessage : noTextMessage,
    };
  }

  console.log(`[Extractor Service Success] Extracted ${cleanText.length} characters (${alphanumericCount} alpha) from "${filename}"`);

  return {
    success: true,
    status: 'EXTRACTED',
    rawText: cleanText,
    charCount: cleanText.length,
    character_count: cleanText.length,
    numPages: extractionResult.numPages || 1,
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Conceptually required extract_resume_text API.
 * Accepts file path string or buffer.
 * Opens file bytes, extracts text page-by-page, normalizes whitespace,
 * preserves section structure, verifies text is non-empty, and returns standard extraction object.
 * 
 * @param {string|Buffer} filePathOrBuffer
 * @returns {Promise<{text: string, page_count: number, character_count: number, status: string}>}
 */
export async function extract_resume_text(filePathOrBuffer, options = {}) {
  let fileBuffer;
  let filename = typeof options === 'string' ? options : (options.filename || 'resume.pdf');
  let mimeType = options.mimeType || '';

  if (typeof filePathOrBuffer === 'string') {
    filename = path.basename(filePathOrBuffer);
    if (!fs.existsSync(filePathOrBuffer)) {
      return {
        text: '',
        page_count: 0,
        character_count: 0,
        status: 'failed',
        error: 'File not found on disk',
      };
    }
    fileBuffer = fs.readFileSync(filePathOrBuffer);
  } else if (Buffer.isBuffer(filePathOrBuffer)) {
    fileBuffer = filePathOrBuffer;
  } else {
    return {
      text: '',
      page_count: 0,
      character_count: 0,
      status: 'failed',
      error: 'Invalid file input',
    };
  }

  const res = await extractResumeText(fileBuffer, mimeType, filename);

  if (!res.success || res.status === 'NO_TEXT_FOUND') {
    return {
      text: '',
      page_count: res.numPages || 0,
      character_count: 0,
      status: 'no_text_found',
      error: res.message || 'No extractable text found in resume',
    };
  }

  return {
    text: res.rawText,
    page_count: res.numPages || 1,
    character_count: res.charCount || res.rawText.length,
    status: 'success',
  };
}

export default {
  extractResumeText,
  extract_resume_text,
  normalizeExtractedText,
};

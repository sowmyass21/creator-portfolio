# app/services/resume/extractor.py
"""
Resume Text Extractor Service (Python implementation)
Extracts plain text deterministically from PDF and DOCX resume files.
Supports:
- PDF page-by-page text extraction
- DOCX paragraphs and table text extraction
- Whitespace normalization and boundary preservation
- Detection of scanned/image-only PDFs ("NO_TEXT_FOUND")
"""

import re
import os
import logging
import zipfile
import xml.etree.ElementTree as ET

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ResumeExtractor")

def normalize_text(raw_text: str) -> str:
    """Normalize whitespace and preserve section boundaries."""
    if not raw_text:
        return ""
    
    lines = raw_text.splitlines()
    line_counts = {}
    
    # Identify repeated headers/footers
    for line in lines:
        cleaned = line.strip()
        if 5 < len(cleaned) < 80:
            line_counts[cleaned] = line_counts.get(cleaned, 0) + 1

    cleaned_lines = []
    blank_count = 0

    for line in lines:
        trimmed = re.sub(r'[ \t]+', ' ', line).strip()
        
        # Omit repeated header/footer lines appearing >= 4 times
        if len(trimmed) > 5 and line_counts.get(trimmed, 0) >= 4:
            continue

        if not trimmed:
            blank_count += 1
            if blank_count <= 2:
                cleaned_lines.append("")
        else:
            blank_count = 0
            cleaned_lines.append(trimmed)

    return "\n".join(cleaned_lines).strip()

def extract_docx_text_from_bytes(file_bytes: bytes) -> str:
    """Extract paragraphs and table text from DOCX zip XML structure."""
    try:
        import io
        docx_zip = zipfile.ZipFile(io.BytesIO(file_bytes))
        xml_content = docx_zip.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        
        # Word processing namespace
        namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        texts = []
        for p in tree.iterfind('.//w:p', namespaces):
            p_text = ''.join(node.text for node in p.iterfind('.//w:t', namespaces) if node.text)
            if p_text.strip():
                texts.append(p_text.strip())
                
        return "\n".join(texts)
    except Exception as e:
        logger.error(f"DOCX extraction error: {e}")
        raise ValueError(f"Corrupted or invalid DOCX file: {e}")

def extract_pdf_text_from_bytes(file_bytes: bytes) -> str:
    """Extract text page by page from PDF buffer."""
    try:
        import io
        # Try PyPDF or basic PDF text stream parsing if available
        try:
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(file_bytes))
            pages_text = []
            for page in reader.pages:
                t = page.extract_text() or ""
                pages_text.append(t)
            return "\n\n".join(pages_text)
        except ImportError:
            # Simple PDF stream parser fallback
            text_content = file_bytes.decode('utf-8', errors='ignore')
            clean = re.sub(r'[^\w\s.,@\-]', ' ', text_content)
            return clean
    except Exception as e:
        logger.error(f"PDF extraction error: {e}")
        raise ValueError(f"Malformed PDF file: {e}")

def extract_resume_text(file_bytes: bytes, filename: str, mime_type: str = "") -> dict:
    """
    Main deterministic extraction entrypoint.
    Returns dict with status, rawText, and error message if NO_TEXT_FOUND.
    """
    logger.info(f"Extracting resume text from '{filename}'")

    if not file_bytes or len(file_bytes) == 0:
        return {
            "success": False,
            "status": "NO_TEXT_FOUND",
            "rawText": "",
            "error": "NO_TEXT_FOUND",
            "message": "We couldn't extract readable text from this resume. Please upload a text-based PDF or DOCX."
        }

    ext = os.path.splitext(filename)[1].lower()
    is_pdf = ext == ".pdf" or "pdf" in mime_type.lower()
    is_docx = ext == ".docx" or "word" in mime_type.lower() or "docx" in mime_type.lower()

    try:
        if is_pdf:
            raw_text = extract_pdf_text_from_bytes(file_bytes)
        elif is_docx:
            raw_text = extract_docx_text_from_bytes(file_bytes)
        else:
            raw_text = file_bytes.decode('utf-8', errors='ignore')
    except Exception as e:
        logger.error(f"Extraction failed for {filename}: {e}")
        return {
            "success": False,
            "status": "FAILED",
            "rawText": "",
            "error": "EXTRACTION_FAILED",
            "message": "Extraction failed due to corrupted file formatting."
        }

    normalized = normalize_text(raw_text)
    alnum_count = len(re.findall(r'[a-zA-Z0-9]', normalized))

    if alnum_count < 20:
        logger.warning(f"No usable text found in {filename} (character count: {alnum_count})")
        return {
            "success": False,
            "status": "NO_TEXT_FOUND",
            "rawText": "",
            "error": "NO_TEXT_FOUND",
            "message": "We couldn't extract readable text from this resume. Please upload a text-based PDF or DOCX."
        }

    logger.info(f"Successfully extracted {len(normalized)} chars from {filename}")
    return {
        "success": True,
        "status": "EXTRACTED",
        "rawText": normalized,
        "charCount": len(normalized)
    }

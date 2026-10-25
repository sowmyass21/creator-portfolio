import path from 'path';
import { extractResumeText } from '../resume/extractor.js';
import { parseResumeText, validateParsedProfile } from '../resume/parser.js';
import { normalizeResumeData } from '../resume/normalizer.js';
import { enhancePortfolioContent } from '../portfolio/enhancer.js';
import { generatePortfolioSections } from '../portfolio/generator.js';
import { validatePortfolioGrounding } from '../portfolio/groundingValidator.js';
import { buildWorkflowError } from './workflowTypes.js';

/**
 * Processing Statuses:
 * - UPLOADED
 * - EXTRACTING
 * - PARSING
 * - ENHANCING
 * - GROUNDING  ← validates AI content against resume; strips hallucinations
 * - GENERATING
 * - VALIDATING
 * - COMPLETED
 * - FAILED
 */

/**
 * NODE 1: resume_ingestion
 * Validates file format, size, and metadata.
 */
export async function resume_ingestion(state) {
  console.log(`[LangGraph NODE 1: resume_ingestion] Validating file '${state.filename}'`);

  const { filename, fileBytes, fileSize, mimeType } = state;

  if (!filename) {
    return {
      ...state,
      status: 'FAILED',
      error: {
        code: 'MISSING_FILENAME',
        message: 'File upload failed: filename parameter is required.',
      },
    };
  }

  const ext = path.extname(filename).toLowerCase();
  const isAllowedExt = ext === '.pdf' || ext === '.docx';
  const isAllowedMime = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ].includes(mimeType || '');

  if (!isAllowedExt && !isAllowedMime) {
    return {
      ...state,
      status: 'FAILED',
      error: {
        code: 'INVALID_FORMAT',
        message: 'Invalid file format. Only PDF and DOCX documents are supported.',
      },
    };
  }

  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
  if (fileSize > MAX_SIZE) {
    return {
      ...state,
      status: 'FAILED',
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds maximum limit of 10 MB.',
      },
    };
  }

  console.log(`[LangGraph NODE 1: resume_ingestion] Success: ${filename} registered.`);
  return {
    ...state,
    status: 'UPLOADED',
  };
}

/**
 * NODE 2: text_extraction
 * Page-by-page PDF / paragraph DOCX text extraction.
 */
export async function text_extraction(state) {
  if (state.status === 'FAILED') return state;

  console.log(`[LangGraph NODE 2: text_extraction] Extracting text from '${state.filename}'`);
  const currentState = { ...state, status: 'EXTRACTING' };

  try {
    const res = await extractResumeText(state.fileBytes, state.mimeType, state.filename);

    if (!res.success || res.status === 'NO_TEXT_FOUND') {
      return {
        ...currentState,
        status: 'FAILED',
        error: {
          code: 'NO_TEXT_FOUND',
          message: res.message || "We couldn't extract readable text from this resume. Please upload a text-based PDF or DOCX.",
        },
      };
    }

    console.log(`[LangGraph NODE 2: text_extraction] Success: ${res.rawText?.length || 0} chars extracted.`);
    return {
      ...currentState,
      status: 'EXTRACTED',
      rawText: res.rawText || '',
      charCount: res.rawText?.length || 0,
    };
  } catch (err) {
    console.error(`[LangGraph NODE 2: text_extraction] Error: ${err.message}`);
    return {
      ...currentState,
      status: 'FAILED',
      error: {
        code: 'EXTRACTION_FAILED',
        message: 'Failed to extract text from resume file due to corrupted formatting.',
      },
    };
  }
}

/**
 * NODE 3: resume_parser
 * Parse raw text into structured ResumeProfile JSON schema.
 */
export async function resume_parser(state) {
  if (state.status === 'FAILED') return state;

  console.log(`[LangGraph NODE 3: resume_parser] Parsing text into ResumeProfile schema`);
  const currentState = { ...state, status: 'PARSING' };

  try {
    const parsed = parseResumeText(state.rawText, state.userContext || {});
    validateParsedProfile(parsed);

    console.log(`[LangGraph NODE 3: resume_parser] Success: Profile parsed.`);
    return {
      ...currentState,
      status: 'PARSED',
      parsedProfile: parsed,
    };
  } catch (err) {
    console.error(`[LangGraph NODE 3: resume_parser] Parsing error: ${err.message}`);
    return {
      ...currentState,
      status: 'FAILED',
      error: {
        code: 'PARSING_FAILED',
        message: 'Failed to parse structured sections from resume text.',
      },
    };
  }
}

/**
 * NODE 4: profile_normalizer
 * Normalize dates, skills, categories, and clean whitespace.
 */
export async function profile_normalizer(state) {
  if (state.status === 'FAILED') return state;

  console.log(`[LangGraph NODE 4: profile_normalizer] Normalizing parsed profile data`);

  try {
    const parsed = state.parsedProfile || {};
    const pInfo = parsed.personalInformation || parsed.personal_information || parsed.personal || {};
    const pSum = parsed.professionalSummary || parsed.summary || {};
    const normalized = normalizeResumeData({
      fullName: pInfo.name || pInfo.full_name || parsed.fullName || parsed.name,
      title: pInfo.title || pInfo.professionalTitle || pInfo.professional_title || parsed.title,
      email: pInfo.email || parsed.email,
      phone: pInfo.phone || parsed.phone,
      location: pInfo.location || parsed.location,
      website: pInfo.portfolio || pInfo.website || parsed.website,
      linkedin: pInfo.linkedIn || pInfo.linkedin || parsed.linkedin,
      github: pInfo.github || parsed.github,
      summary: typeof pSum === 'string' ? pSum : (pSum.summary || pSum.professional_summary || parsed.summary),
      skills: Array.isArray(parsed.skills) ? parsed.skills : Object.values(parsed.skills || {}).flat(),
      experience: parsed.experience || [],
      education: parsed.education || [],
      projects: parsed.projects || [],
      certifications: parsed.certifications || [],
      achievements: parsed.achievements || [],
      internships: parsed.internships || [],
      socialLinks: parsed.socialLinks || [],
    });

    console.log(`[LangGraph NODE 4: profile_normalizer] Success: Data normalized.`);
    return {
      ...state,
      normalizedProfile: normalized,
    };
  } catch (err) {
    console.warn(`[LangGraph NODE 4: profile_normalizer] Normalization warning: ${err.message}`);
    return {
      ...state,
      normalizedProfile: state.parsedProfile,
    };
  }
}

/**
 * NODE 5: content_enhancer
 * Generates grounded, non-hallucinatory AI portfolio copy enhancements.
 * FAULT-TOLERANT: Failures here NEVER corrupt or block portfolio generation!
 */
export async function content_enhancer(state) {
  if (state.status === 'FAILED') return state;

  console.log(`[LangGraph NODE 5: content_enhancer] Enhancing portfolio content`);
  const currentState = { ...state, status: 'ENHANCING' };

  try {
    const enhanced = enhancePortfolioContent(state.parsedProfile || state.normalizedProfile);

    console.log(`[LangGraph NODE 5: content_enhancer] Success: AI content enhanced.`);
    return {
      ...currentState,
      status: 'ENHANCED',
      enhancedContent: enhanced,
    };
  } catch (err) {
    console.warn(`[LangGraph NODE 5: content_enhancer] Non-fatal enhancement error: ${err.message}. Falling back gracefully.`);
    return {
      ...currentState,
      status: 'ENHANCED',
      enhancedContent: {
        summary: state.normalizedProfile?.summary || '',
        headline: state.normalizedProfile?.fullName || 'Software Engineer',
      },
    };
  }
}

/**
 * NODE 5.5: grounding_validator
 * Validates all AI-enhanced content against the parsed resume.
 * Strips hallucinated metrics, unsupported companies/projects/skills,
 * fabricated URLs, and attaches source maps to every accepted section.
 * FAULT-TOLERANT: Failures here NEVER block portfolio generation.
 */
export async function grounding_validator(state) {
  if (state.status === 'FAILED') return state;

  console.log(`[LangGraph NODE 5.5: grounding_validator] Running resume grounding validation`);
  const currentState = { ...state, status: 'GROUNDING' };

  try {
    const enhancedContent = state.enhancedContent || {};
    const parsedProfile = state.parsedProfile || {};

    if (!parsedProfile || Object.keys(parsedProfile).length === 0) {
      console.warn(`[LangGraph NODE 5.5: grounding_validator] No parsedProfile available — skipping grounding.`);
      return {
        ...currentState,
        status: 'GROUNDED',
        groundedContent: enhancedContent,
        groundingReport: { skipped: true, reason: 'No parsed profile available for grounding.' },
      };
    }

    const { groundedContent, validationReport } = validatePortfolioGrounding(enhancedContent, parsedProfile);

    const totalRejected   = validationReport.rejected.length;
    const totalSoftFixed  = validationReport.softFixed.length;
    const totalRegenerated = (validationReport.regenerated || []).length;

    if (totalRejected > 0) {
      console.warn(
        `[LangGraph NODE 5.5: grounding_validator] ${totalRejected} section(s) rejected → regenerated from resume:`,
        validationReport.rejected.map((r) => `${r.section}: ${r.reason}`)
      );
    }
    if (totalSoftFixed > 0) {
      console.info(
        `[LangGraph NODE 5.5: grounding_validator] ${totalSoftFixed} soft fix(es) applied:`,
        validationReport.softFixed.map((s) => s.warning)
      );
    }

    console.log(
      `[LangGraph NODE 5.5: grounding_validator] Grounding complete — ` +
      `passed: ${validationReport.passed.length}, ` +
      `rejected: ${totalRejected}, ` +
      `regenerated: ${totalRegenerated}, ` +
      `soft-fixed: ${totalSoftFixed}`
    );

    return {
      ...currentState,
      status: 'GROUNDED',
      groundedContent,
      groundingReport: {
        passed:      validationReport.passed.length,
        rejected:    totalRejected,
        regenerated: totalRegenerated,
        softFixed:   totalSoftFixed,
        rejections:  validationReport.rejected,
        regenerations: validationReport.regenerated || [],
        softFixes:   validationReport.softFixed,
        sourceMaps:  validationReport.sourceMaps,
      },
    };
  } catch (err) {
    console.warn(`[LangGraph NODE 5.5: grounding_validator] Non-fatal grounding error: ${err.message}. Using un-validated enhanced content.`);
    return {
      ...currentState,
      status: 'GROUNDED',
      groundedContent: state.enhancedContent || {},
      groundingReport: { error: err.message, skipped: true },
    };
  }
}

/**
 * NODE 6: portfolio_generator
 * Generates layout sections and theme configuration.
 */
export async function portfolio_generator(state) {
  if (state.status === 'FAILED') return state;

  console.log(`[LangGraph NODE 6: portfolio_generator] Generating portfolio configuration`);
  const currentState = { ...state, status: 'GENERATING' };

  try {
    const theme = state.theme || 'modern';
    const profile = state.normalizedProfile || {};
    const sections = generatePortfolioSections(profile, theme);

    // Merge grounded AI-enhanced content into sections
    const groundedContent = state.groundedContent || state.enhancedContent || {};
    if (groundedContent.headline) {
      sections.hero = {
        ...sections.hero,
        headline: groundedContent.headline,
        subheadline: groundedContent.hero_subtitle || sections.hero?.subheadline,
      };
    }
    if (groundedContent.about_section) {
      sections.about = {
        ...sections.about,
        bio: groundedContent.about_section,
      };
    }
    if (Array.isArray(groundedContent.project_descriptions) && groundedContent.project_descriptions.length > 0) {
      sections.projects = groundedContent.project_descriptions.map((proj) => ({
        title: proj.name || proj.title || '',
        description: proj.enhanced_description || proj.original_description || proj.description || '',
        technologies: proj.technologies || [],
        link: proj.live_url || proj.github_url || '',
        source: proj.source || null,
      }));
    }
    if (Array.isArray(groundedContent.experience_summaries) && groundedContent.experience_summaries.length > 0) {
      sections.experience = groundedContent.experience_summaries.map((exp) => ({
        title: exp.job_title || '',
        company: exp.company || '',
        startDate: exp.start_date || '',
        endDate: exp.end_date || '',
        description: exp.enhanced_description || exp.original_description || exp.description || '',
        highlights: exp.technologies || [],
        source: exp.source || null,
      }));
    }
    if (Array.isArray(groundedContent.skills_grouping) && groundedContent.skills_grouping.length > 0) {
      sections.skills = groundedContent.skills_grouping;
    }

    // Merge source-mapped education (dates enforced from resume)
    if (Array.isArray(groundedContent.education) && groundedContent.education.length > 0) {
      sections.education = groundedContent.education;
    }

    // Merge source-mapped certifications
    if (Array.isArray(groundedContent.certifications) && groundedContent.certifications.length > 0) {
      sections.certifications = groundedContent.certifications;
    }

    // Merge source-mapped achievements
    if (Array.isArray(groundedContent.achievements) && groundedContent.achievements.length > 0) {
      sections.achievements = groundedContent.achievements;
    }

    const portfolioConfig = {
      theme,
      displayName: profile.fullName || 'Creator',
      sections,
      groundingReport: state.groundingReport || null,
    };

    console.log(`[LangGraph NODE 6: portfolio_generator] Success: Config generated.`);
    return {
      ...currentState,
      status: 'GENERATED',
      portfolioConfig,
    };
  } catch (err) {
    console.error(`[LangGraph NODE 6: portfolio_generator] Error: ${err.message}`);
    return {
      ...currentState,
      status: 'FAILED',
      error: {
        code: 'GENERATION_FAILED',
        message: 'Failed to generate portfolio sections.',
      },
    };
  }
}

/**
 * NODE 7: portfolio_validator
 * Quality validation & completeness check.
 * Produces a scored quality report (0-100) and a letter grade.
 * Non-fatal: warnings are appended but the pipeline always reaches COMPLETED.
 */
export async function portfolio_validator(state) {
  if (state.status === 'FAILED') return state;

  console.log(`[LangGraph NODE 7: portfolio_validator] Validating portfolio quality`);
  const currentState = { ...state, status: 'VALIDATING' };

  const warnings = [];
  const sections = state.portfolioConfig?.sections || {};
  const parsedProfile = state.parsedProfile || {};

  // ── Section presence map ─────────────────────────────────────────────────
  const sectionPresence = {
    hero:           Boolean(sections.hero?.headline),
    about:          Boolean(sections.about?.bio?.trim()),
    skills:         Array.isArray(sections.skills) && sections.skills.some(g => g.items?.length > 0),
    experience:     Array.isArray(sections.experience) && sections.experience.length > 0,
    education:      Array.isArray(sections.education) && sections.education.length > 0,
    projects:       Array.isArray(sections.projects) && sections.projects.length > 0,
    certifications: Array.isArray(sections.certifications) && sections.certifications.length > 0,
    achievements:   Array.isArray(sections.achievements) && sections.achievements.length > 0,
    contact:        Boolean(sections.contact?.email || sections.contact?.phone),
  };

  // ── Completeness scoring ─────────────────────────────────────────────────
  // Required sections (failure to include drops score significantly)
  const REQUIRED = [
    { key: 'hero',       weight: 20, label: 'Hero / headline' },
    { key: 'skills',     weight: 20, label: 'Skills' },
    { key: 'contact',    weight: 15, label: 'Contact information' },
  ];

  // Recommended sections
  const RECOMMENDED = [
    { key: 'about',      weight: 12, label: 'About / summary' },
    { key: 'experience', weight: 12, label: 'Work experience' },
    { key: 'projects',   weight: 12, label: 'Projects' },
    { key: 'education',  weight: 9,  label: 'Education' },
  ];

  // Optional / bonus sections
  const OPTIONAL = [
    { key: 'certifications', label: 'Certifications' },
    { key: 'achievements',   label: 'Achievements' },
  ];

  let score = 0;
  const missingRequired = [];
  const missingRecommended = [];
  const missingOptional = [];

  for (const { key, weight, label } of REQUIRED) {
    if (sectionPresence[key]) {
      score += weight;
    } else {
      missingRequired.push(label);
      warnings.push(`Required section missing: ${label}.`);
    }
  }

  for (const { key, weight, label } of RECOMMENDED) {
    if (sectionPresence[key]) {
      score += weight;
    } else {
      missingRecommended.push(label);
      warnings.push(`Recommended section missing: ${label}.`);
    }
  }

  for (const { key, label } of OPTIONAL) {
    if (!sectionPresence[key]) {
      missingOptional.push(label);
    }
  }

  // ── Letter grade ─────────────────────────────────────────────────────────
  let grade;
  if (score >= 90)      grade = 'A';
  else if (score >= 75) grade = 'B';
  else if (score >= 55) grade = 'C';
  else                  grade = 'D';

  // ── Content quality warnings ──────────────────────────────────────────────
  if (sections.hero?.headline && sections.hero.headline.length < 5) {
    warnings.push('Hero headline is very short — consider adding a professional title.');
  }
  if (sectionPresence.about && (sections.about?.bio || '').length < 40) {
    warnings.push('About section is very brief — consider expanding your professional summary.');
  }
  if (sectionPresence.projects) {
    const projectsMissingDesc = (sections.projects || []).filter(p => !p.description?.trim());
    if (projectsMissingDesc.length > 0) {
      warnings.push(`${projectsMissingDesc.length} project(s) are missing descriptions.`);
    }
  }

  // ── Grounding validation summary ─────────────────────────────────────────
  const groundingReport = state.groundingReport || null;
  if (groundingReport && groundingReport.rejected > 0) {
    warnings.push(
      `${groundingReport.rejected} AI-generated section(s) were rejected and replaced with raw resume content (grounding validation).`
    );
  }

  /** @type {import('./workflowTypes.js').QualityReport} */
  const qualityReport = {
    completenessScore: score,
    grade,
    sectionPresence,
    missingRequired,
    missingRecommended,
    missingOptional,
    totalWarnings: warnings.length,
  };

  console.log(
    `[LangGraph NODE 7: portfolio_validator] Complete — score: ${score}/100 (${grade}), ` +
    `${warnings.length} warning(s), grounding: ${groundingReport ? `${groundingReport.rejected} rejected` : 'n/a'}`
  );

  return {
    ...currentState,
    status: 'COMPLETED',
    warnings,
    qualityReport,
  };
}

/**
 * MAIN LANGGRAPH WORKFLOW EXECUTOR
 */
export async function runLangGraphPortfolioWorkflow({
  fileBytes,
  filename,
  mimeType = '',
  fileSize = 0,
  userId = 'guest',
  theme = 'modern',
  userContext = {},
}) {
  let state = {
    userId,
    filename,
    mimeType,
    fileBytes,
    fileSize: fileSize || (fileBytes ? fileBytes.length : 0),
    theme,
    userContext,
    status: 'UPLOADED',
    rawText: '',
    charCount: 0,
    parsedProfile: null,
    normalizedProfile: null,
    enhancedContent: null,
    portfolioConfig: null,
    warnings: [],
    error: null,
  };

  const nodes = [
    resume_ingestion,
    text_extraction,
    resume_parser,
    profile_normalizer,
    content_enhancer,
    grounding_validator,   // NODE 5.5: validates AI content against resume
    portfolio_generator,
    portfolio_validator,
  ];

  for (const node of nodes) {
    state = await node(state);
    if (state.status === 'FAILED') {
      console.error(`[LangGraph Workflow] Terminated at state '${state.status}'. Error:`, state.error);
      break;
    }
  }

  return state;
}

/**
 * Return a safe, client-facing summary of the final workflow state.
 * NEVER exposes stack traces, internal paths, or raw error objects.
 * @param {import('./workflowTypes.js').WorkflowState} state
 */
export function summarizeWorkflowResult(state) {
  return {
    status: state.status,
    warnings: state.warnings || [],
    qualityReport: state.qualityReport || null,
    groundingReport: state.groundingReport
      ? {
          passed:     state.groundingReport.passed,
          rejected:   state.groundingReport.rejected,
          softFixed:  state.groundingReport.softFixed,
          rejections: state.groundingReport.rejections || [],
          softFixes:  state.groundingReport.softFixes  || [],
        }
      : null,
    error: state.error
      ? { code: state.error.code, message: state.error.message }
      : null,
  };
}

export default {
  resume_ingestion,
  text_extraction,
  resume_parser,
  profile_normalizer,
  content_enhancer,
  grounding_validator,
  portfolio_generator,
  portfolio_validator,
  runLangGraphPortfolioWorkflow,
};

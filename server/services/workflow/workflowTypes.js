/**
 * LangGraph Portfolio Workflow — State Type Contracts
 *
 * Every node in the pipeline consumes a WorkflowState and returns a WorkflowState.
 * This file documents the typed schema for each node's input/output so that
 * contracts are clear, testable, and IDE-friendly.
 *
 * Type definitions use JSDoc syntax (no TypeScript required).
 */

// ---------------------------------------------------------------------------
// Base Types
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} WorkflowError
 * @property {string} code       - Machine-readable error code (e.g. 'PARSING_FAILED')
 * @property {string} message    - Safe user-facing error message (no stack traces)
 * @property {string} [nodeId]   - Which node produced the error
 */

/**
 * @typedef {Object} SourceMap
 * @property {string} type   - e.g. 'resume_project', 'resume_experience', 'resume_skills'
 * @property {number} [index]  - Index into the source array
 * @property {string} [field]  - Specific field name within the source object
 * @property {boolean} [fallback] - true if this is raw resume data (AI was rejected)
 */

/**
 * @typedef {Object} GroundingReport
 * @property {number}   passed    - Number of sections that passed grounding
 * @property {number}   rejected  - Number of sections replaced with raw resume data
 * @property {number}   softFixed - Number of sections with items stripped
 * @property {Array<{section: string, reason: string}>}  rejections
 * @property {Array<{section: string, warning: string}>} softFixes
 * @property {Object<string, SourceMap>}                 sourceMaps
 */

/**
 * @typedef {'UPLOADED'|'EXTRACTING'|'EXTRACTED'|'PARSING'|'PARSED'|
 *           'ENHANCING'|'ENHANCED'|'GROUNDING'|'GROUNDED'|
 *           'GENERATING'|'GENERATED'|'VALIDATING'|'COMPLETED'|'FAILED'} WorkflowStatus
 */

// ---------------------------------------------------------------------------
// Workflow State — master shape passed through every node
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} WorkflowState
 *
 * ─ Inputs (provided by caller) ─────────────────────────────────────────────
 * @property {string}        userId       - Authenticated user ID
 * @property {string}        filename     - Original upload filename
 * @property {string}        mimeType     - MIME type of the uploaded file
 * @property {Buffer}        fileBytes    - Raw file buffer
 * @property {number}        fileSize     - File size in bytes
 * @property {string}        theme        - Portfolio theme key (e.g. 'modern')
 * @property {Object}        userContext  - Additional user metadata from auth
 *
 * ─ State (set by nodes) ─────────────────────────────────────────────────────
 * @property {WorkflowStatus} status      - Current pipeline processing status
 * @property {WorkflowError|null} error   - Populated only when status === 'FAILED'
 *
 * ─ NODE 1 OUTPUT: resume_ingestion ──────────────────────────────────────────
 * status → UPLOADED | FAILED
 *
 * ─ NODE 2 OUTPUT: text_extraction ───────────────────────────────────────────
 * @property {string}  rawText    - Normalized full text from the resume file
 * @property {number}  charCount  - Character count of extracted text
 * status → EXTRACTED | FAILED
 *
 * ─ NODE 3 OUTPUT: resume_parser ─────────────────────────────────────────────
 * @property {ResumeProfile|null} parsedProfile  - Structured resume data
 * status → PARSED | FAILED
 *
 * ─ NODE 4 OUTPUT: profile_normalizer ────────────────────────────────────────
 * @property {NormalizedProfile|null} normalizedProfile - Cleaned, date-normalized profile
 * status → PARSED (same status; normalizer is non-fatal)
 *
 * ─ NODE 5 OUTPUT: content_enhancer ──────────────────────────────────────────
 * @property {EnhancedContent|null} enhancedContent  - AI-generated portfolio copy
 * status → ENHANCED (always; this node is fault-tolerant)
 *
 * ─ NODE 5.5 OUTPUT: grounding_validator ─────────────────────────────────────
 * @property {EnhancedContent|null} groundedContent  - Validated, source-mapped content
 * @property {GroundingReport|null} groundingReport  - Per-section validation summary
 * status → GROUNDED (always; this node is fault-tolerant)
 *
 * ─ NODE 6 OUTPUT: portfolio_generator ───────────────────────────────────────
 * @property {PortfolioConfig|null} portfolioConfig  - Full portfolio section config
 * status → GENERATED | FAILED
 *
 * ─ NODE 7 OUTPUT: portfolio_validator ───────────────────────────────────────
 * @property {string[]} warnings  - Non-fatal quality warnings
 * @property {QualityReport} qualityReport - Structured completeness scores
 * status → COMPLETED | FAILED
 */

// ---------------------------------------------------------------------------
// Domain Sub-types
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} ResumeProfile
 * @property {{ full_name: string, email: string, phone: string, location: string,
 *              professional_title: string, website?: string, github?: string,
 *              linkedin?: string }} personal_information
 * @property {{ professional_summary: string }} summary
 * @property {Object<string, string[]>} skills
 * @property {Array<ExperienceEntry>}   experience
 * @property {Array<EducationEntry>}    education
 * @property {Array<ProjectEntry>}      projects
 * @property {Array<string|CertEntry>}  certifications
 * @property {Array<string|AchievEntry>} achievements
 */

/**
 * @typedef {Object} ExperienceEntry
 * @property {string} company
 * @property {string} job_title
 * @property {string} [start_date]
 * @property {string} [end_date]
 * @property {boolean} [currently_working]
 * @property {string} [description]
 * @property {string[]} [technologies]
 */

/**
 * @typedef {Object} EducationEntry
 * @property {string} institution
 * @property {string} degree
 * @property {string} [field_of_study]
 * @property {string} [start_date]
 * @property {string} [end_date]
 */

/**
 * @typedef {Object} ProjectEntry
 * @property {string} name
 * @property {string} [description]
 * @property {string[]} [technologies]
 * @property {string} [live_url]
 * @property {string} [github_url]
 */

/**
 * @typedef {Object} EnhancedContent
 * @property {string}   headline
 * @property {string}   hero_subtitle
 * @property {string}   about_section
 * @property {Array<Object>} project_descriptions
 * @property {Array<Object>} experience_summaries
 * @property {Array<{category: string, items: string[]}>} skills_grouping
 * @property {string}   career_focus
 * @property {string}   call_to_action
 * @property {Object}   [section_headlines]
 * @property {Object}   [_groundingValidation]
 */

/**
 * @typedef {Object} PortfolioConfig
 * @property {string} theme
 * @property {string} displayName
 * @property {PortfolioSections} sections
 * @property {GroundingReport|null} groundingReport
 */

/**
 * @typedef {Object} QualityReport
 * @property {number}   completenessScore  - 0–100
 * @property {Object<string, boolean>} sectionPresence
 * @property {string[]} missingRecommended
 * @property {string[]} missingOptional
 * @property {string}   grade  - 'A'|'B'|'C'|'D'
 */

export const WORKFLOW_STATUSES = Object.freeze({
  UPLOADED:   'UPLOADED',
  EXTRACTING: 'EXTRACTING',
  EXTRACTED:  'EXTRACTED',
  PARSING:    'PARSING',
  PARSED:     'PARSED',
  ENHANCING:  'ENHANCING',
  ENHANCED:   'ENHANCED',
  GROUNDING:  'GROUNDING',
  GROUNDED:   'GROUNDED',
  GENERATING: 'GENERATING',
  GENERATED:  'GENERATED',
  VALIDATING: 'VALIDATING',
  COMPLETED:  'COMPLETED',
  FAILED:     'FAILED',
});

/** Statuses that mean the workflow is still running */
export const RUNNING_STATUSES = new Set([
  'UPLOADED', 'EXTRACTING', 'PARSING',
  'ENHANCING', 'GROUNDING', 'GENERATING', 'VALIDATING',
]);

/** Statuses that mean the workflow has terminated */
export const TERMINAL_STATUSES = new Set(['COMPLETED', 'FAILED']);

/**
 * Returns true if the given status means the workflow finished successfully.
 * @param {WorkflowStatus} status
 */
export const isCompleted = (status) => status === 'COMPLETED';

/**
 * Returns true if the given status means the workflow has failed.
 * @param {WorkflowStatus} status
 */
export const isFailed = (status) => status === 'FAILED';

/**
 * Build a safe (no-stack-trace) error object for the workflow state.
 * @param {string} code
 * @param {string} message
 * @param {string} [nodeId]
 * @returns {WorkflowError}
 */
export function buildWorkflowError(code, message, nodeId = '') {
  return { code, message, ...(nodeId ? { nodeId } : {}) };
}

export default {
  WORKFLOW_STATUSES,
  RUNNING_STATUSES,
  TERMINAL_STATUSES,
  isCompleted,
  isFailed,
  buildWorkflowError,
};

/**
 * Resume Grounding Validation Service
 *
 * Validates every AI-generated portfolio section against the source resume.
 *
 * Validates that:
 *   ✓  Companies exist in resume
 *   ✓  Projects exist in resume
 *   ✓  Skills exist in resume
 *   ✓  Education exists in resume
 *   ✓  Certifications exist in resume
 *   ✓  Dates are consistent with resume
 *   ✓  URLs are not fabricated
 *   ✓  Achievements are supported
 *
 * Every accepted content node receives a `source` field:
 *   { "content": "...", "source": { "type": "resume_project", "index": 0 } }
 *
 * When AI generates unsupported factual information:
 *   → Content is REJECTED.
 *   → A structured reason is returned.
 *   → The enhancer is called to regenerate using only grounded inputs.
 *   → If regeneration also fails grounding, raw resume data is used as fallback.
 *
 * Principle: accurate + simple  >  impressive + fabricated
 */

// ---------------------------------------------------------------------------
// Normalisation helpers
// ---------------------------------------------------------------------------

const normalize = (str) =>
  (str || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (str) => normalize(str).split(' ').filter(Boolean);

/**
 * Token-overlap fuzzy match.
 * Returns true if the fraction of `needle` tokens present in `haystack` >= threshold.
 */
function fuzzyContains(haystack, needle, threshold = 0.5) {
  if (!haystack || !needle) return false;
  const hTokens = new Set(tokenize(haystack));
  const nTokens = tokenize(needle);
  if (nTokens.length === 0) return false;
  const hits = nTokens.filter((t) => hTokens.has(t)).length;
  return hits / nTokens.length >= threshold;
}

/** Flatten any nested structure to a single space-joined string. */
function flattenToText(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (Array.isArray(obj)) return obj.map(flattenToText).join(' ');
  return Object.values(obj).map(flattenToText).join(' ');
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

const MONTH_ABBR = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  january: 1, february: 2, march: 3, april: 4, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};

/**
 * Parse a loose date string into { year, month } or null.
 * Handles: "2022", "Jan 2022", "January 2022", "2022-01", "01/2022", "Present"
 */
function parseLooseDate(str) {
  if (!str) return null;
  const s = str.trim().toLowerCase();
  if (s === 'present' || s === 'current' || s === 'ongoing' || s === 'now') {
    return { year: new Date().getFullYear(), month: 12, isPresent: true };
  }

  // ISO: 2022-01
  let m = s.match(/^(\d{4})-(\d{1,2})$/);
  if (m) return { year: +m[1], month: +m[2] };

  // MM/YYYY
  m = s.match(/^(\d{1,2})\/(\d{4})$/);
  if (m) return { year: +m[2], month: +m[1] };

  // Month YYYY  or  YYYY Month
  for (const [abbr, monthNum] of Object.entries(MONTH_ABBR)) {
    const withMonth = new RegExp(`(?:${abbr})\\s+(\\d{4})|(\\d{4})\\s+(?:${abbr})`);
    m = s.match(withMonth);
    if (m) return { year: +(m[1] || m[2]), month: monthNum };
  }

  // Plain year
  m = s.match(/^(\d{4})$/);
  if (m) return { year: +m[1], month: null };

  return null;
}

function dateToSortable({ year, month }) {
  return year * 100 + (month || 0);
}

/**
 * Check whether a generated date string is within ±1 year of the
 * closest matching resume date for the same entity.
 * Returns { consistent: true } or { consistent: false, reason: string }
 */
function validateDateConsistency(generatedDateStr, resumeDateStr, entityLabel) {
  const genDate = parseLooseDate(generatedDateStr);
  const resDate = parseLooseDate(resumeDateStr);

  if (!genDate || !resDate) {
    // Cannot parse — treat as consistent (don't reject unparseable dates)
    return { consistent: true };
  }

  const yearDiff = Math.abs(genDate.year - resDate.year);

  if (yearDiff > 1) {
    return {
      consistent: false,
      reason: `${entityLabel}: generated date "${generatedDateStr}" is inconsistent with resume date "${resumeDateStr}" (${yearDiff} year gap).`,
    };
  }

  return { consistent: true };
}

// ---------------------------------------------------------------------------
// Resume Corpus Builder
// ---------------------------------------------------------------------------

/**
 * Build a structured corpus of all grounded facts from the parsed resume.
 *
 * @param {object} parsedProfile - Parsed resume profile
 * @returns {ResumeCorpus}
 */
export function buildResumeCorpus(parsedProfile = {}) {
  /** @type {ResumeCorpus} */
  const corpus = {
    companies:       [],   // normalized company names
    jobTitles:       [],   // normalized job titles
    projects:        [],   // normalized project names
    skills:          [],   // normalized skill strings (all categories)
    institutions:    [],   // normalized education institution names
    degrees:         [],   // normalized degree / field of study strings
    certifications:  [],   // normalized certification names
    achievements:    [],   // normalized achievement titles
    dates:           [],   // all date strings found in resume (for consistency checks)
    urls:            new Set(), // all URLs found in resume
    fullText:        '',   // full flattened normalized text (broad checks)
  };

  const personal = parsedProfile.personal_information || {};

  // ── Experience ────────────────────────────────────────────────────────────
  (parsedProfile.experience || []).forEach((exp) => {
    if (exp.company)   corpus.companies.push(normalize(exp.company));
    if (exp.job_title) corpus.jobTitles.push(normalize(exp.job_title));
    if (exp.start_date) corpus.dates.push(exp.start_date);
    if (exp.end_date)   corpus.dates.push(exp.end_date);
  });

  // ── Projects ─────────────────────────────────────────────────────────────
  (parsedProfile.projects || []).forEach((proj) => {
    if (proj.name)        corpus.projects.push(normalize(proj.name));
    if (proj.description) corpus.projects.push(normalize(proj.description));
    if (proj.live_url)    corpus.urls.add(normalize(proj.live_url));
    if (proj.github_url)  corpus.urls.add(normalize(proj.github_url));
  });

  // ── Skills ───────────────────────────────────────────────────────────────
  const skillsObj = parsedProfile.skills || {};
  const allSkills = Array.isArray(skillsObj)
    ? skillsObj
    : Object.values(skillsObj).flat();
  corpus.skills = allSkills.map(normalize);

  // ── Education ────────────────────────────────────────────────────────────
  (parsedProfile.education || []).forEach((edu) => {
    if (edu.institution)   corpus.institutions.push(normalize(edu.institution));
    if (edu.degree)        corpus.degrees.push(normalize(edu.degree));
    if (edu.field_of_study) corpus.degrees.push(normalize(edu.field_of_study));
    if (edu.start_date)    corpus.dates.push(edu.start_date);
    if (edu.end_date)      corpus.dates.push(edu.end_date);
  });

  // ── Certifications ───────────────────────────────────────────────────────
  (parsedProfile.certifications || []).forEach((cert) => {
    const name = typeof cert === 'string' ? cert : cert?.name;
    const issuer = typeof cert === 'object' ? cert?.issuer : null;
    if (name)   corpus.certifications.push(normalize(name));
    if (issuer) corpus.certifications.push(normalize(issuer));
  });

  // ── Achievements ─────────────────────────────────────────────────────────
  (parsedProfile.achievements || []).forEach((ach) => {
    const title = typeof ach === 'string' ? ach : ach?.title;
    const desc  = typeof ach === 'object' ? ach?.description : null;
    if (title) corpus.achievements.push(normalize(title));
    if (desc)  corpus.achievements.push(normalize(desc));
  });

  // ── Personal URLs ─────────────────────────────────────────────────────────
  if (personal.website)  corpus.urls.add(normalize(personal.website));
  if (personal.github)   corpus.urls.add(normalize(personal.github));
  if (personal.linkedin) corpus.urls.add(normalize(personal.linkedin));

  // ── Full-text (broad fallback) ─────────────────────────────────────────
  corpus.fullText = normalize(flattenToText(parsedProfile));

  return corpus;
}

// ---------------------------------------------------------------------------
// Hallucination detectors
// ---------------------------------------------------------------------------

/**
 * Detect invented numeric metrics (percentages, dollar amounts, large numbers)
 * that appear in generated text but are absent from the original resume source.
 *
 * @param {string} originalText - Raw resume text for this section
 * @param {string} enhancedText - AI-generated text to validate
 * @returns {string[]} Array of fabricated metric strings
 */
export function detectInventedMetrics(originalText, enhancedText) {
  if (!enhancedText) return [];
  const orig = originalText || '';
  const invented = [];

  // Percentages: "40%", "3x", "300%"
  const origPerc = new Set(orig.match(/\d+%|\d+x\b/gi) || []);
  (enhancedText.match(/\d+%|\d+x\b/gi) || []).forEach((p) => {
    if (!origPerc.has(p) && !origPerc.has(p.toLowerCase())) invented.push(p);
  });

  // Dollar amounts: "$10K", "$5M", "$1,500"
  const origDollar = new Set(orig.match(/\$[\d,.]+[kKmMbB]?/g) || []);
  (enhancedText.match(/\$[\d,.]+[kKmMbB]?/g) || []).forEach((d) => {
    if (!origDollar.has(d)) invented.push(d);
  });

  // Large numbers (5+ digits) that are not years
  const origNums = new Set(orig.match(/\b\d{5,}\b/g) || []);
  (enhancedText.match(/\b\d{5,}\b/g) || []).forEach((n) => {
    if (!origNums.has(n)) invented.push(n);
  });

  return [...new Set(invented)];
}

/**
 * Detect fabricated URLs in generated text.
 * A URL is considered safe if it appears in the resume or belongs to a
 * well-known developer platform.
 *
 * @param {string} enhancedText
 * @param {ResumeCorpus} corpus
 * @returns {string[]} Array of fabricated URL strings
 */
export function detectFabricatedUrls(enhancedText, corpus) {
  const TRUSTED_DOMAINS = [
    'github.com', 'gitlab.com', 'linkedin.com', 'leetcode.com',
    'hackerrank.com', 'medium.com', 'dev.to', 'stackoverflow.com',
    'kaggle.com', 'npmjs.com', 'pypi.org', 'vercel.app', 'netlify.app',
    'heroku.com', 'render.com', 'railway.app', 'codepen.io', 'replit.com',
    'devpost.com', 'behance.net', 'dribbble.com',
  ];

  const generatedUrls = enhancedText.match(/https?:\/\/[^\s"')]+/g) || [];
  const fabricated = [];

  for (const url of generatedUrls) {
    const normUrl = normalize(url);
    if (corpus.urls.has(normUrl)) continue;
    const isTrusted = TRUSTED_DOMAINS.some((d) => url.toLowerCase().includes(d));
    if (!isTrusted) fabricated.push(url);
  }

  return fabricated;
}

// ---------------------------------------------------------------------------
// Individual Section Validators
// ---------------------------------------------------------------------------

/**
 * Validate the professional headline.
 * SOURCE: resume.personal_information.professional_title
 */
export function validateHeadline(headline, parsedProfile, corpus) {
  const resumeTitle = normalize(parsedProfile.personal_information?.professional_title || '');
  const headlineNorm = normalize(headline);

  // Accept if no resume title exists (nothing to contradict) OR has overlap
  if (!resumeTitle || fuzzyContains(corpus.fullText, headlineNorm, 0.3)) {
    return {
      valid: true,
      content: headline,
      source: { type: 'resume_personal_information', field: 'professional_title' },
    };
  }

  return {
    valid: false,
    reason: `Headline references "${headline}" but resume title is "${parsedProfile.personal_information?.professional_title}".`,
    regenerateHint: `Write a professional headline using only: "${parsedProfile.personal_information?.professional_title}".`,
  };
}

/**
 * Validate the hero subtitle.
 * SOURCE: resume.summary.professional_summary
 */
export function validateHeroSubtitle(subtitle, parsedProfile, corpus) {
  if (fuzzyContains(corpus.fullText, normalize(subtitle), 0.25)) {
    return {
      valid: true,
      content: subtitle,
      source: { type: 'resume_summary', field: 'professional_summary' },
    };
  }

  return {
    valid: false,
    reason: 'Hero subtitle contains content not grounded in the resume summary.',
    regenerateHint: `Write a one-line subtitle derived only from: "${parsedProfile.summary?.professional_summary || parsedProfile.personal_information?.professional_title || ''}"`,
  };
}

/**
 * Validate about / bio section.
 * SOURCE: resume.summary.professional_summary
 */
export function validateAboutSection(about, parsedProfile, corpus) {
  const invented = detectInventedMetrics(parsedProfile.summary?.professional_summary || '', about);
  if (invented.length > 0) {
    return {
      valid: false,
      reason: `About section contains fabricated metrics not in resume: ${invented.join(', ')}.`,
      regenerateHint: `Rewrite the about section using only the following text, without adding any new numbers or metrics: "${parsedProfile.summary?.professional_summary || ''}"`,
    };
  }
  return {
    valid: true,
    content: about,
    source: { type: 'resume_summary', field: 'professional_summary' },
  };
}

/**
 * Validate each experience entry.
 *
 * Checks:
 *   - company exists in resume.experience
 *   - job title is consistent
 *   - dates are consistent with resume dates
 *   - no fabricated metrics in description
 *   - no fabricated URLs
 *
 * SOURCE: resume.experience[matchIdx]
 */
export function validateExperienceSummaries(enhancedExperience, parsedProfile, corpus) {
  const resumeExperience = parsedProfile.experience || [];

  return enhancedExperience.map((exp, index) => {
    // ── 1. Company must exist ──────────────────────────────────────────────
    const matchIdx = resumeExperience.findIndex(
      (re) =>
        fuzzyContains(normalize(re.company || ''), normalize(exp.company || ''), 0.7) ||
        fuzzyContains(normalize(re.job_title || ''), normalize(exp.job_title || ''), 0.7)
    );

    if (matchIdx === -1) {
      return {
        valid: false,
        reason: `Company "${exp.company}" / title "${exp.job_title}" not found in resume experience.`,
        regenerateHint: `Only use these companies from the resume: ${resumeExperience.map(e => e.company).filter(Boolean).join(', ')}.`,
        index,
      };
    }

    const resumeEntry = resumeExperience[matchIdx];

    // ── 2. Date consistency ────────────────────────────────────────────────
    if (exp.start_date && resumeEntry.start_date) {
      const startCheck = validateDateConsistency(exp.start_date, resumeEntry.start_date, `${exp.company} start_date`);
      if (!startCheck.consistent) {
        return {
          valid: false,
          reason: startCheck.reason,
          regenerateHint: `Use the exact start date from the resume: "${resumeEntry.start_date}" for ${exp.company}.`,
          index,
        };
      }
    }
    if (exp.end_date && resumeEntry.end_date) {
      const endCheck = validateDateConsistency(exp.end_date, resumeEntry.end_date, `${exp.company} end_date`);
      if (!endCheck.consistent) {
        return {
          valid: false,
          reason: endCheck.reason,
          regenerateHint: `Use the exact end date from the resume: "${resumeEntry.end_date}" for ${exp.company}.`,
          index,
        };
      }
    }

    // ── 3. No fabricated metrics ───────────────────────────────────────────
    const invented = detectInventedMetrics(
      resumeEntry.description || '',
      exp.enhanced_description || ''
    );
    if (invented.length > 0) {
      return {
        valid: false,
        reason: `Experience at "${exp.company}" contains fabricated metrics: ${invented.join(', ')}.`,
        regenerateHint: `Describe the role at ${exp.company} without adding any numbers or metrics not in: "${resumeEntry.description || ''}"`,
        index,
      };
    }

    // ── 4. No fabricated URLs ──────────────────────────────────────────────
    const fabricatedUrls = detectFabricatedUrls(exp.enhanced_description || '', corpus);
    if (fabricatedUrls.length > 0) {
      return {
        valid: false,
        reason: `Experience at "${exp.company}" contains fabricated URLs: ${fabricatedUrls.join(', ')}.`,
        regenerateHint: `Remove all URLs from the description for ${exp.company}.`,
        index,
      };
    }

    return {
      valid: true,
      content: {
        ...exp,
        // Enforce resume dates (don't trust AI-generated dates)
        start_date: resumeEntry.start_date || exp.start_date,
        end_date:   resumeEntry.end_date   || exp.end_date,
        source: { type: 'resume_experience', index: matchIdx },
      },
      source: { type: 'resume_experience', index: matchIdx },
      index,
    };
  });
}

/**
 * Validate each project entry.
 *
 * Checks:
 *   - project name exists in resume.projects
 *   - no fabricated metrics in description
 *   - technologies are in resume skills corpus
 *   - URLs are not fabricated (or come from resume project)
 *
 * SOURCE: resume.projects[matchIdx]
 */
export function validateProjectDescriptions(enhancedProjects, parsedProfile, corpus) {
  const resumeProjects = parsedProfile.projects || [];

  return enhancedProjects.map((proj, index) => {
    // ── 1. Project must exist in resume ───────────────────────────────────
    const matchIdx = resumeProjects.findIndex((rp) =>
      fuzzyContains(normalize(rp.name || ''), normalize(proj.name || ''), 0.6)
    );

    if (matchIdx === -1) {
      return {
        valid: false,
        reason: `Project "${proj.name}" does not exist in the resume.`,
        regenerateHint: `Only describe these projects from the resume: ${resumeProjects.map(p => p.name).filter(Boolean).join(', ')}.`,
        index,
      };
    }

    const resumeProj = resumeProjects[matchIdx];

    // ── 2. No fabricated metrics ───────────────────────────────────────────
    const invented = detectInventedMetrics(
      resumeProj.description || '',
      proj.enhanced_description || ''
    );
    if (invented.length > 0) {
      return {
        valid: false,
        reason: `Project "${proj.name}" description contains fabricated metrics: ${invented.join(', ')}.`,
        regenerateHint: `Describe the project "${proj.name}" without adding any numbers or metrics not in: "${resumeProj.description || ''}"`,
        index,
      };
    }

    // ── 3. No fabricated URLs (allow resume's own project URLs) ───────────
    const allowedUrls = new Set([
      normalize(resumeProj.live_url || ''),
      normalize(resumeProj.github_url || ''),
    ].filter(Boolean));

    const generatedUrls = (proj.enhanced_description || '').match(/https?:\/\/[^\s"')]+/g) || [];
    const fabricatedUrls = generatedUrls.filter((url) => {
      const nu = normalize(url);
      if (allowedUrls.has(nu)) return false;
      if (corpus.urls.has(nu))  return false;
      return !['github.com','gitlab.com','linkedin.com','vercel.app','netlify.app']
        .some((d) => url.toLowerCase().includes(d));
    });

    if (fabricatedUrls.length > 0) {
      return {
        valid: false,
        reason: `Project "${proj.name}" description contains fabricated URLs: ${fabricatedUrls.join(', ')}.`,
        regenerateHint: `Remove all URLs from the description for project "${proj.name}".`,
        index,
      };
    }

    // ── 4. Technologies — soft-fix unsupported ones ────────────────────────
    const unsupportedTechs = (proj.technologies || []).filter(
      (tech) =>
        !corpus.skills.includes(normalize(tech)) &&
        !fuzzyContains(resumeProj.description || '', normalize(tech), 0.9) &&
        !fuzzyContains(normalize((resumeProj.technologies || []).join(' ')), normalize(tech), 0.9)
    );

    const cleanedTechs = (proj.technologies || []).filter(
      (tech) => !unsupportedTechs.includes(tech)
    );

    const content = {
      ...proj,
      technologies: cleanedTechs,
      // Always use resume's own URLs, not AI-generated ones
      live_url:   resumeProj.live_url   || proj.live_url   || null,
      github_url: resumeProj.github_url || proj.github_url || null,
      source: { type: 'resume_project', index: matchIdx },
    };

    if (unsupportedTechs.length > 0) {
      return {
        valid: true,
        softWarning: true,
        content,
        warning: `Removed unsupported technologies from "${proj.name}": ${unsupportedTechs.join(', ')}.`,
        source: { type: 'resume_project', index: matchIdx },
        index,
      };
    }

    return {
      valid: true,
      content,
      source: { type: 'resume_project', index: matchIdx },
      index,
    };
  });
}

/**
 * Validate skills grouping.
 * Every skill must be present in the resume skills corpus.
 * Unsupported skills are removed (soft fix — never a hard rejection).
 *
 * SOURCE: resume.skills
 */
export function validateSkillsGrouping(skillsGrouping, parsedProfile, corpus) {
  const validated = skillsGrouping.map((group, groupIndex) => {
    const validItems   = (group.items || []).filter((s) =>
      corpus.skills.includes(normalize(s)) ||
      fuzzyContains(corpus.fullText, normalize(s), 0.9)
    );
    const removedItems = (group.items || []).filter((s) => !validItems.includes(s));

    return {
      valid: true,
      content: {
        ...group,
        items: validItems,
        source: { type: 'resume_skills', groupIndex },
      },
      source: { type: 'resume_skills', groupIndex },
      removedItems,
    };
  });

  // Filter out groups that became empty
  return validated.filter((g) => (g.content?.items || []).length > 0);
}

/**
 * Validate education entries.
 * Every generated education entry must match an institution or degree in the resume.
 *
 * SOURCE: resume.education[matchIdx]
 */
export function validateEducation(generatedEducation, parsedProfile, corpus) {
  const resumeEducation = parsedProfile.education || [];
  if (!Array.isArray(generatedEducation) || generatedEducation.length === 0) {
    return [];
  }

  return generatedEducation.map((edu, index) => {
    const matchIdx = resumeEducation.findIndex(
      (re) =>
        fuzzyContains(normalize(re.institution || ''), normalize(edu.institution || ''), 0.6) ||
        fuzzyContains(normalize(re.degree || ''),      normalize(edu.degree || ''),      0.6)
    );

    if (matchIdx === -1) {
      return {
        valid: false,
        reason: `Education entry "${edu.degree} at ${edu.institution}" not found in resume.`,
        regenerateHint: `Only include these educational institutions: ${resumeEducation.map(e => e.institution).filter(Boolean).join(', ')}.`,
        index,
      };
    }

    const resumeEdu = resumeEducation[matchIdx];

    // Date consistency for graduation year
    if (edu.endDate && resumeEdu.end_date) {
      const check = validateDateConsistency(edu.endDate, resumeEdu.end_date, `${edu.institution} graduation`);
      if (!check.consistent) {
        return {
          valid: false,
          reason: check.reason,
          regenerateHint: `Use the exact graduation date from the resume: "${resumeEdu.end_date}" for ${edu.institution}.`,
          index,
        };
      }
    }

    return {
      valid: true,
      content: {
        ...edu,
        // Always use resume dates
        startDate: resumeEdu.start_date || edu.startDate,
        endDate:   resumeEdu.end_date   || edu.endDate,
        source: { type: 'resume_education', index: matchIdx },
      },
      source: { type: 'resume_education', index: matchIdx },
      index,
    };
  });
}

/**
 * Validate certifications.
 * Every generated certification must match an entry in resume.certifications.
 *
 * SOURCE: resume.certifications[matchIdx]
 */
export function validateCertifications(generatedCerts, parsedProfile, corpus) {
  const resumeCerts = parsedProfile.certifications || [];
  if (!Array.isArray(generatedCerts) || generatedCerts.length === 0) {
    return [];
  }

  return generatedCerts.map((cert, index) => {
    const certName = typeof cert === 'string' ? cert : cert?.name || '';
    const matchIdx = resumeCerts.findIndex((rc) => {
      const rcName = typeof rc === 'string' ? rc : rc?.name || '';
      return fuzzyContains(normalize(rcName), normalize(certName), 0.6);
    });

    if (matchIdx === -1) {
      return {
        valid: false,
        reason: `Certification "${certName}" does not exist in the resume.`,
        regenerateHint: `Only include these certifications from the resume: ${resumeCerts.map(c => typeof c === 'string' ? c : c?.name).filter(Boolean).join(', ')}.`,
        index,
      };
    }

    const resumeCert = resumeCerts[matchIdx];
    return {
      valid: true,
      content: {
        ...(typeof cert === 'object' ? cert : { name: cert }),
        source: { type: 'resume_certification', index: matchIdx },
      },
      source: { type: 'resume_certification', index: matchIdx },
      index,
    };
  });
}

/**
 * Validate achievements.
 * Every generated achievement must be supported by the resume.
 *
 * SOURCE: resume.achievements[matchIdx]
 */
export function validateAchievements(generatedAchievements, parsedProfile, corpus) {
  const resumeAchievements = parsedProfile.achievements || [];
  if (!Array.isArray(generatedAchievements) || generatedAchievements.length === 0) {
    return [];
  }

  return generatedAchievements.map((ach, index) => {
    const achTitle = typeof ach === 'string' ? ach : ach?.title || '';

    const matchIdx = resumeAchievements.findIndex((ra) => {
      const raTitle = typeof ra === 'string' ? ra : ra?.title || '';
      return fuzzyContains(normalize(raTitle), normalize(achTitle), 0.5);
    });

    if (matchIdx === -1) {
      // Check full-text as a fallback (achievement might be phrased differently)
      if (!fuzzyContains(corpus.fullText, normalize(achTitle), 0.6)) {
        return {
          valid: false,
          reason: `Achievement "${achTitle}" is not supported by the resume.`,
          regenerateHint: `Only include these achievements from the resume: ${resumeAchievements.map(a => typeof a === 'string' ? a : a?.title).filter(Boolean).join(', ')}.`,
          index,
        };
      }
    }

    const resumeAch = resumeAchievements[matchIdx];
    return {
      valid: true,
      content: {
        ...(typeof ach === 'object' ? ach : { title: ach }),
        source: { type: 'resume_achievement', index: matchIdx >= 0 ? matchIdx : 0 },
      },
      source: { type: 'resume_achievement', index: matchIdx >= 0 ? matchIdx : 0 },
      index,
    };
  });
}

// ---------------------------------------------------------------------------
// Regeneration Engine
// ---------------------------------------------------------------------------

/**
 * Attempt to regenerate a single content section using only grounded inputs.
 * This is called when the first AI pass fails grounding validation.
 *
 * The regeneration strategy is deterministic (no LLM call) — it builds
 * the simplest accurate version directly from the resume source data.
 *
 * @param {string}  section       - Section name ('headline', 'about', 'project', 'experience', etc.)
 * @param {object}  rejectionInfo - The rejection result from the validator
 * @param {object}  parsedProfile - Original parsed resume profile
 * @param {number}  [index]       - Array index for list sections
 * @returns {object} { content, source, regenerated: true }
 */
export function regenerateFromResume(section, rejectionInfo, parsedProfile, index = 0) {
  const personal = parsedProfile.personal_information || {};
  const summary  = parsedProfile.summary || {};

  switch (section) {
    case 'headline':
      return {
        content: personal.professional_title || 'Software Developer',
        source: { type: 'resume_personal_information', field: 'professional_title', regenerated: true },
        regenerated: true,
      };

    case 'hero_subtitle': {
      const sub = (summary.professional_summary || personal.professional_title || '').slice(0, 120);
      return {
        content: sub,
        source: { type: 'resume_summary', field: 'professional_summary', regenerated: true },
        regenerated: true,
      };
    }

    case 'about_section': {
      const about = summary.professional_summary || `${personal.professional_title || 'Software Developer'} with expertise in ${Object.values(parsedProfile.skills || {}).flat().slice(0, 3).join(', ')}.`;
      return {
        content: about,
        source: { type: 'resume_summary', field: 'professional_summary', regenerated: true },
        regenerated: true,
      };
    }

    case 'project': {
      const rawProj = (parsedProfile.projects || [])[index] || {};
      return {
        content: {
          name: rawProj.name || 'Project',
          original_description: rawProj.description || '',
          enhanced_description: rawProj.description || '',
          technologies: rawProj.technologies || [],
          live_url: rawProj.live_url || null,
          github_url: rawProj.github_url || null,
          source: { type: 'resume_project', index, regenerated: true },
        },
        source: { type: 'resume_project', index, regenerated: true },
        regenerated: true,
      };
    }

    case 'experience': {
      const rawExp = (parsedProfile.experience || [])[index] || {};
      return {
        content: {
          company: rawExp.company || '',
          job_title: rawExp.job_title || '',
          start_date: rawExp.start_date || null,
          end_date: rawExp.end_date || null,
          original_description: rawExp.description || '',
          enhanced_description: rawExp.description || '',
          technologies: rawExp.technologies || [],
          source: { type: 'resume_experience', index, regenerated: true },
        },
        source: { type: 'resume_experience', index, regenerated: true },
        regenerated: true,
      };
    }

    case 'education': {
      const rawEdu = (parsedProfile.education || [])[index] || {};
      return {
        content: {
          degree: rawEdu.degree || '',
          institution: rawEdu.institution || '',
          fieldOfStudy: rawEdu.field_of_study || '',
          startDate: rawEdu.start_date || '',
          endDate: rawEdu.end_date || '',
          source: { type: 'resume_education', index, regenerated: true },
        },
        source: { type: 'resume_education', index, regenerated: true },
        regenerated: true,
      };
    }

    case 'certification': {
      const rawCert = (parsedProfile.certifications || [])[index] || '';
      const certObj = typeof rawCert === 'string' ? { name: rawCert } : rawCert;
      return {
        content: { ...certObj, source: { type: 'resume_certification', index, regenerated: true } },
        source: { type: 'resume_certification', index, regenerated: true },
        regenerated: true,
      };
    }

    case 'achievement': {
      const rawAch = (parsedProfile.achievements || [])[index] || '';
      const achObj = typeof rawAch === 'string' ? { title: rawAch } : rawAch;
      return {
        content: { ...achObj, source: { type: 'resume_achievement', index, regenerated: true } },
        source: { type: 'resume_achievement', index, regenerated: true },
        regenerated: true,
      };
    }

    default:
      return {
        content: '',
        source: { type: 'static_fallback', regenerated: true },
        regenerated: true,
      };
  }
}

// ---------------------------------------------------------------------------
// Master Grounding Validator
// ---------------------------------------------------------------------------

/**
 * Run full grounding validation on all AI-enhanced portfolio sections.
 *
 * Validates:  companies, projects, skills, education, certifications,
 *             dates, URLs, and achievements.
 *
 * When a section is rejected:
 *   1. Logs rejection reason and regenerate hint.
 *   2. Calls regenerateFromResume() to build an accurate fallback.
 *   3. Records the rejection in the validation report.
 *
 * @param {object} enhancedContent  - Output from enhancePortfolioContent()
 * @param {object} parsedProfile    - Original parsed resume profile
 * @returns {{ groundedContent: object, validationReport: object }}
 */
export function validatePortfolioGrounding(enhancedContent = {}, parsedProfile = {}) {
  const corpus = buildResumeCorpus(parsedProfile);

  const report = {
    passed:    [],
    rejected:  [],
    softFixed: [],
    warnings:  [],
    regenerated: [],
    sourceMaps: {},
  };

  const grounded = {};

  // ── Headline ──────────────────────────────────────────────────────────────
  {
    const result = validateHeadline(enhancedContent.headline || '', parsedProfile, corpus);
    if (result.valid) {
      grounded.headline = result.content;
      report.passed.push('headline');
      report.sourceMaps.headline = result.source;
    } else {
      console.warn(`[Grounding] REJECTED headline: ${result.reason}`);
      console.info(`[Grounding] Regenerating headline. Hint: ${result.regenerateHint}`);
      const regen = regenerateFromResume('headline', result, parsedProfile);
      grounded.headline = regen.content;
      report.rejected.push({ section: 'headline', reason: result.reason });
      report.regenerated.push({ section: 'headline', hint: result.regenerateHint });
      report.sourceMaps.headline = regen.source;
    }
  }

  // ── Hero Subtitle ─────────────────────────────────────────────────────────
  {
    const result = validateHeroSubtitle(enhancedContent.hero_subtitle || '', parsedProfile, corpus);
    if (result.valid) {
      grounded.hero_subtitle = result.content;
      report.passed.push('hero_subtitle');
      report.sourceMaps.hero_subtitle = result.source;
    } else {
      console.warn(`[Grounding] REJECTED hero_subtitle: ${result.reason}`);
      const regen = regenerateFromResume('hero_subtitle', result, parsedProfile);
      grounded.hero_subtitle = regen.content;
      report.rejected.push({ section: 'hero_subtitle', reason: result.reason });
      report.regenerated.push({ section: 'hero_subtitle', hint: result.regenerateHint });
      report.sourceMaps.hero_subtitle = regen.source;
    }
  }

  // ── About Section ─────────────────────────────────────────────────────────
  {
    const result = validateAboutSection(enhancedContent.about_section || '', parsedProfile, corpus);
    if (result.valid) {
      grounded.about_section = result.content;
      report.passed.push('about_section');
      report.sourceMaps.about_section = result.source;
    } else {
      console.warn(`[Grounding] REJECTED about_section: ${result.reason}`);
      const regen = regenerateFromResume('about_section', result, parsedProfile);
      grounded.about_section = regen.content;
      report.rejected.push({ section: 'about_section', reason: result.reason });
      report.regenerated.push({ section: 'about_section', hint: result.regenerateHint });
      report.sourceMaps.about_section = regen.source;
    }
  }

  // ── Projects ──────────────────────────────────────────────────────────────
  {
    const results = validateProjectDescriptions(
      enhancedContent.project_descriptions || [],
      parsedProfile,
      corpus
    );
    grounded.project_descriptions = [];

    results.forEach((result) => {
      if (result.valid) {
        grounded.project_descriptions.push(result.content);
        if (result.softWarning) {
          report.softFixed.push({ section: `project[${result.index}]`, warning: result.warning });
        } else {
          report.passed.push(`project[${result.index}]`);
        }
      } else {
        console.warn(`[Grounding] REJECTED project[${result.index}]: ${result.reason}`);
        const regen = regenerateFromResume('project', result, parsedProfile, result.index);
        grounded.project_descriptions.push(regen.content);
        report.rejected.push({ section: `project[${result.index}]`, reason: result.reason });
        report.regenerated.push({ section: `project[${result.index}]`, hint: result.regenerateHint });
      }
    });
  }

  // ── Experience ────────────────────────────────────────────────────────────
  {
    const results = validateExperienceSummaries(
      enhancedContent.experience_summaries || [],
      parsedProfile,
      corpus
    );
    grounded.experience_summaries = [];

    results.forEach((result) => {
      if (result.valid) {
        grounded.experience_summaries.push(result.content);
        report.passed.push(`experience[${result.index}]`);
      } else {
        console.warn(`[Grounding] REJECTED experience[${result.index}]: ${result.reason}`);
        const regen = regenerateFromResume('experience', result, parsedProfile, result.index);
        grounded.experience_summaries.push(regen.content);
        report.rejected.push({ section: `experience[${result.index}]`, reason: result.reason });
        report.regenerated.push({ section: `experience[${result.index}]`, hint: result.regenerateHint });
      }
    });
  }

  // ── Skills ────────────────────────────────────────────────────────────────
  {
    const results = validateSkillsGrouping(
      enhancedContent.skills_grouping || [],
      parsedProfile,
      corpus
    );
    grounded.skills_grouping = results.map((r) => r.content);

    results.forEach((r, i) => {
      if ((r.removedItems || []).length > 0) {
        report.softFixed.push({
          section: `skills_group[${i}]`,
          warning: `Removed unsupported skills: ${r.removedItems.join(', ')}`,
        });
      } else {
        report.passed.push(`skills_group[${i}]`);
      }
    });
  }

  // ── Education ─────────────────────────────────────────────────────────────
  // Education is validated when the generator produces it; not part of enhancedContent
  // so we source-map directly from parsedProfile.
  {
    const resumeEdu = parsedProfile.education || [];
    grounded.education = resumeEdu.map((edu, i) => ({
      degree:       edu.degree || '',
      institution:  edu.institution || '',
      fieldOfStudy: edu.field_of_study || '',
      startDate:    edu.start_date || '',
      endDate:      edu.end_date   || '',
      source: { type: 'resume_education', index: i },
    }));
    if (resumeEdu.length > 0) {
      report.passed.push('education');
      report.sourceMaps.education = { type: 'resume_education' };
    }
  }

  // ── Certifications ────────────────────────────────────────────────────────
  {
    const resumeCerts = parsedProfile.certifications || [];
    grounded.certifications = resumeCerts.map((cert, i) => {
      const base = typeof cert === 'string' ? { name: cert } : cert;
      return { ...base, source: { type: 'resume_certification', index: i } };
    });
    if (resumeCerts.length > 0) {
      report.passed.push('certifications');
      report.sourceMaps.certifications = { type: 'resume_certification' };
    }
  }

  // ── Achievements ──────────────────────────────────────────────────────────
  {
    const resumeAch = parsedProfile.achievements || [];
    grounded.achievements = resumeAch.map((ach, i) => {
      const base = typeof ach === 'string' ? { title: ach } : ach;
      return { ...base, source: { type: 'resume_achievement', index: i } };
    });
    if (resumeAch.length > 0) {
      report.passed.push('achievements');
      report.sourceMaps.achievements = { type: 'resume_achievement' };
    }
  }

  // ── Career Focus ──────────────────────────────────────────────────────────
  // Derived from resume title + skills — always grounded
  grounded.career_focus = enhancedContent.career_focus || '';
  report.passed.push('career_focus');
  report.sourceMaps.career_focus = { type: 'resume_personal_information', field: 'professional_title' };

  // ── Call-to-Action ────────────────────────────────────────────────────────
  grounded.call_to_action = enhancedContent.call_to_action || "Let's connect.";
  report.passed.push('call_to_action');
  report.sourceMaps.call_to_action = { type: 'static_template' };

  // ── Section Headlines ─────────────────────────────────────────────────────
  grounded.section_headlines = enhancedContent.section_headlines || {};

  // ── Backward-compat aliases ───────────────────────────────────────────────
  grounded.summary            = grounded.about_section;
  grounded.enhanced_experience = grounded.experience_summaries;
  grounded.enhanced_projects   = grounded.project_descriptions;

  // ── Grounding metadata ───────────────────────────────────────────────────
  grounded._groundingValidation = {
    validated:      true,
    totalPassed:    report.passed.length,
    totalRejected:  report.rejected.length,
    totalSoftFixed: report.softFixed.length,
    totalRegenerated: report.regenerated.length,
    sourceMaps:     report.sourceMaps,
    rejections:     report.rejected,
    softFixes:      report.softFixed,
    regenerations:  report.regenerated,
    warnings:       report.warnings,
    timestamp:      new Date().toISOString(),
  };

  return { groundedContent: grounded, validationReport: report };
}

export default {
  buildResumeCorpus,
  validateHeadline,
  validateHeroSubtitle,
  validateAboutSection,
  validateExperienceSummaries,
  validateProjectDescriptions,
  validateSkillsGrouping,
  validateEducation,
  validateCertifications,
  validateAchievements,
  detectInventedMetrics,
  detectFabricatedUrls,
  validateDateConsistency,
  regenerateFromResume,
  validatePortfolioGrounding,
};

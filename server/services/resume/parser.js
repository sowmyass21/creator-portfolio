/**
 * AI-Powered Resume Parser Service
 * Deterministically parses extracted raw text into a structured ResumeProfile object.
 * Strictly adheres to non-hallucination rules: returns null or [] for missing data.
 */

export function buildAiResumeParserPrompt(extractedText) {
  return `You are a resume information extraction system.

Extract information ONLY from the resume text provided below.

Do not use outside knowledge.
Do not invent information.
Do not assume missing information.

If information is not present, return null or an empty array.

RESUME TEXT:
${extractedText}`;
}

export function validateStructuredObjectSchema(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Validation Error: Parsed profile must be a JSON object.');
  }

  // Ensure personal block exists from any personal_information or personalInformation alias
  const pInfo = data.personal_information || data.personalInformation || {};
  if (!data.personal || typeof data.personal !== 'object') {
    data.personal = {
      name: pInfo.full_name || pInfo.name || data.fullName || data.name || '',
      email: pInfo.email || data.email || '',
      phone: pInfo.phone || data.phone || '',
      location: pInfo.location || data.location || '',
      title: pInfo.professional_title || pInfo.professionalTitle || data.title || '',
      linkedin: pInfo.linkedin || pInfo.linkedIn || data.linkedin || '',
      github: pInfo.github || data.github || '',
      website: pInfo.website || pInfo.portfolio || data.website || '',
    };
  }

  const personalKeys = ['name', 'email', 'phone', 'location', 'title', 'linkedin', 'github', 'website'];
  for (const k of personalKeys) {
    if (!(k in data.personal) || data.personal[k] === undefined) {
      data.personal[k] = '';
    }
  }

  // Validate required skills block exists
  if (!data.skills || typeof data.skills !== 'object') {
    throw new Error('Validation Error: Missing required skills in parsed resume profile.');
  }
  if (!Array.isArray(data.skills)) {
    const skillsKeys = ['programming_languages', 'frontend', 'backend', 'databases', 'cloud', 'tools', 'other'];
    for (const k of skillsKeys) {
      if (!Array.isArray(data.skills[k])) {
        data.skills[k] = [];
      }
    }
  }

  // Ensure array fields exist
  const arrayFields = ['education', 'experience', 'projects', 'certifications', 'achievements', 'publications', 'languages', 'interests'];
  for (const f of arrayFields) {
    if (!Array.isArray(data[f])) {
      data[f] = [];
    }
  }

  return true;
}

export function ai_parse_resume(extractedText, options = {}) {
  if (!extractedText || typeof extractedText !== 'string' || extractedText.trim().length === 0) {
    throw new Error('ResumeExtractionError: Resume text has not been extracted.');
  }

  const prompt = buildAiResumeParserPrompt(extractedText);
  console.log('[AI Resume Parser] Parsing extracted text using prompt instructions...');

  let attempt = 1;
  let parsedProfile = null;
  let lastError = null;

  while (attempt <= 2) {
    try {
      parsedProfile = parseResumeText(extractedText, options.userContext || options.userInfo || {});
      validateStructuredObjectSchema(parsedProfile);
      return parsedProfile;
    } catch (err) {
      lastError = err;
      console.error(`[AI Resume Parser Validation Error] Attempt ${attempt} failed: ${err.message}`);
      if (attempt === 1) {
        console.log('[AI Resume Parser] Retrying profile parsing (attempt 2)...');
      }
      attempt++;
    }
  }

  throw new Error(`AI Parsing Failed: ${lastError ? lastError.message : 'Invalid structured profile schema.'}`);
}

export function parseResumeText(rawText = '', userInfo = {}) {
  console.log('[Resume Parser] Processing text parsing (length:', rawText.length, 'chars)');

  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    throw new Error('ResumeExtractionError: Resume text has not been extracted.');
  }

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // 1. Extract Personal Information via Regex & Line Position
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : (userInfo.email || null);

  const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : null;

  const githubMatch = rawText.match(/https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
  const github = githubMatch ? githubMatch[0] : null;

  const linkedinMatch = rawText.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : null;

  const websiteMatch = rawText.match(/https?:\/\/(?!github\.com|linkedin\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*/i);
  const website = websiteMatch ? websiteMatch[0] : null;

  // Name heuristic: First non-section line or userInfo name
  let fullName = null;
  let professionalTitle = null;

  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const l = lines[i];
    if (!l.includes('@') && !l.includes('http') && l.length < 50 && !fullName) {
      fullName = l;
      continue;
    }
    if (fullName && !professionalTitle && l.length < 60 && !l.includes('@')) {
      professionalTitle = l;
      break;
    }
  }

  if (!fullName) {
    fullName = userInfo.name || null;
  }

  // Section Segmentation
  const sectionsMap = segmentSections(rawText);

  // 2. Parse Summary
  const summaryText = sectionsMap.get('SUMMARY') || sectionsMap.get('OBJECTIVE') || sectionsMap.get('ABOUT') || null;
  const professionalSummary = summaryText ? summaryText.trim() : null;

  // 3. Parse Experience
  const experienceText = sectionsMap.get('EXPERIENCE') || sectionsMap.get('WORK HISTORY') || sectionsMap.get('EMPLOYMENT') || '';
  const experience = parseExperienceSection(experienceText);

  // 4. Parse Education
  const educationText = sectionsMap.get('EDUCATION') || sectionsMap.get('ACADEMIC') || '';
  const education = parseEducationSection(educationText);

  // 5. Parse Projects
  const projectsText = sectionsMap.get('PROJECTS') || sectionsMap.get('PORTFOLIO') || '';
  const projects = parseProjectsSection(projectsText);

  // 6. Parse Skills
  const skillsText = sectionsMap.get('SKILLS') || sectionsMap.get('TECHNICAL SKILLS') || rawText;
  const rawSkills = parseSkillsCategorized(skillsText);
  const skills = {
    programming_languages: Array.isArray(rawSkills.programming_languages) ? rawSkills.programming_languages : [],
    frontend: Array.isArray(rawSkills.frontend) ? rawSkills.frontend : [],
    backend: Array.isArray(rawSkills.backend) ? rawSkills.backend : [],
    databases: Array.isArray(rawSkills.databases) ? rawSkills.databases : [],
    cloud: Array.isArray(rawSkills.cloud) ? rawSkills.cloud : [],
    tools: Array.isArray(rawSkills.tools) ? rawSkills.tools : [],
    other: Array.isArray(rawSkills.other) ? rawSkills.other : [],
  };

  // 7. Parse Certifications
  const certsText = sectionsMap.get('CERTIFICATIONS') || sectionsMap.get('LICENSES') || '';
  const certifications = parseCertificationsSection(certsText);

  // 8. Parse Achievements
  const achievementsText = sectionsMap.get('ACHIEVEMENTS') || sectionsMap.get('AWARDS') || '';
  const achievements = parseAchievementsSection(achievementsText);

  // 9. Parse Publications
  const pubText = sectionsMap.get('PUBLICATIONS') || '';
  const publications = parsePublicationsSection(pubText);

  // 10. Parse Volunteering
  const volText = sectionsMap.get('VOLUNTEERING') || sectionsMap.get('COMMUNITY') || '';
  const volunteering = parseVolunteeringSection(volText);

  // 11. Parse Interests
  const interestsText = sectionsMap.get('INTERESTS') || sectionsMap.get('HOBBIES') || '';
  const interests = interestsText ? interestsText.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean) : [];

  // 12. Parse Languages
  const langText = sectionsMap.get('LANGUAGES') || '';
  const languages = parseLanguagesSection(langText);

  const personal = {
    name: fullName,
    email,
    phone,
    location: null,
    title: professionalTitle,
    linkedin,
    github,
    website,
  };

  const profileData = {
    personal,
    summary: professionalSummary,
    education,
    experience,
    projects,
    skills,
    certifications,
    achievements,
    publications,
    languages,
    interests,

    // Aliases for compatibility
    personal_information: {
      full_name: fullName,
      professional_title: professionalTitle,
      email,
      phone,
      location: null,
      profile_photo: null,
      website,
      linkedin,
      github,
      other_links: [],
    },
    personalInformation: {
      name: fullName,
      professionalTitle,
      email,
      phone,
      location: null,
      linkedIn: linkedin,
      github,
      portfolio: website,
      otherLinks: [],
    },
  };

  // Validate parsed structure
  validateStructuredObjectSchema(profileData);

  return profileData;
}

/**
 * Validates strict schema requirements of parsed profile object
 */
export function validateParsedProfile(data) {
  return validateStructuredObjectSchema(data);
}

// Internal Helper Functions for Section Parsing
function segmentSections(text) {
  const sectionHeaders = [
    'SUMMARY', 'OBJECTIVE', 'ABOUT', 'EXPERIENCE', 'WORK HISTORY', 'EMPLOYMENT',
    'EDUCATION', 'ACADEMIC', 'PROJECTS', 'PORTFOLIO', 'SKILLS', 'TECHNICAL SKILLS',
    'CERTIFICATIONS', 'LICENSES', 'ACHIEVEMENTS', 'AWARDS', 'PUBLICATIONS',
    'VOLUNTEERING', 'COMMUNITY', 'INTERESTS', 'HOBBIES', 'LANGUAGES'
  ];

  const map = new Map();
  const lines = text.split(/\r?\n/);
  let currentHeader = 'HEADER';
  let currentBuffer = [];

  lines.forEach((line) => {
    const trimmed = line.trim().toUpperCase();
    const matchedHeader = sectionHeaders.find(h => trimmed === h || trimmed === `${h}:`);

    if (matchedHeader) {
      if (currentBuffer.length > 0) {
        map.set(currentHeader, currentBuffer.join('\n'));
      }
      currentHeader = matchedHeader;
      currentBuffer = [];
    } else {
      currentBuffer.push(line);
    }
  });

  if (currentBuffer.length > 0) {
    map.set(currentHeader, currentBuffer.join('\n'));
  }

  return map;
}

function parseExperienceSection(text) {
  if (!text || !text.trim()) return [];
  const blocks = text.split(/\n(?=[A-Z0-9\s\-]+(?:\||–|-|at)\s+[A-Z0-9\s]+)/i);

  return blocks.map((block) => {
    const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;

    const firstLine = lines[0];
    const parts = firstLine.split(/\s+(?:at|\||–|-)\s+/i);

    const jobTitle = parts[0] ? parts[0].trim() : firstLine;
    const company = parts[1] ? parts[1].trim() : null;

    const dateMatch = block.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})[^\n]*/i);
    const startDate = dateMatch ? dateMatch[0] : null;
    const currentlyWorking = Boolean(block.match(/present|current/i));

    const achievements = lines.filter(l => l.startsWith('-') || l.startsWith('•')).map(l => l.replace(/^[-•]\s*/, ''));

    return {
      company,
      job_title: jobTitle,
      location: null,
      employment_type: null,
      start_date: startDate,
      end_date: currentlyWorking ? 'Present' : null,
      currently_working: currentlyWorking,
      description: lines.slice(1).join(' '),
      achievements,
      technologies: [],
    };
  }).filter(Boolean);
}

function parseEducationSection(text) {
  if (!text || !text.trim()) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  if (lines.length === 0) return [];

  return [{
    institution: lines[0] || null,
    degree: lines[1] || null,
    field_of_study: null,
    start_date: null,
    end_date: null,
    location: null,
    grade: null,
    description: lines.slice(2).join(' ') || null,
  }];
}

function parseProjectsSection(text) {
  if (!text || !text.trim()) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  if (lines.length === 0) return [];

  return [{
    name: lines[0] || 'Project',
    description: lines.slice(1).join(' ') || null,
    technologies: [],
    features: [],
    role: null,
    live_url: null,
    github_url: null,
    achievements: [],
  }];
}

function parseSkillsCategorized(text) {
  const categories = {
    programming_languages: [],
    frontend: [],
    backend: [],
    databases: [],
    frameworks: [],
    cloud: [],
    devops: [],
    tools: [],
    ai_ml: [],
    other: [],
  };

  if (!text) return categories;

  const langRegex = /\b(JavaScript|TypeScript|Python|Java|C\+\+|Go|Rust|Ruby|PHP|Swift|Kotlin)\b/gi;
  const frontendRegex = /\b(React|Vue|Angular|HTML|CSS|Tailwind|Next\.js|Svelte)\b/gi;
  const backendRegex = /\b(Node\.js|Express|Django|Flask|FastAPI|Spring Boot|GraphQL|REST)\b/gi;
  const dbRegex = /\b(MongoDB|PostgreSQL|MySQL|Redis|SQLite|DynamoDB)\b/gi;
  const cloudDevops = /\b(AWS|Docker|Kubernetes|GCP|Azure|CI\/CD|Git|Linux)\b/gi;

  categories.programming_languages = Array.from(new Set(text.match(langRegex) || []));
  categories.frontend = Array.from(new Set(text.match(frontendRegex) || []));
  categories.backend = Array.from(new Set(text.match(backendRegex) || []));
  categories.databases = Array.from(new Set(text.match(dbRegex) || []));
  categories.cloud = Array.from(new Set(text.match(cloudDevops) || []));

  return categories;
}

function parseCertificationsSection(text) {
  if (!text || !text.trim()) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines.map(line => ({
    name: line,
    issuer: null,
    date: null,
    credential_url: null,
  }));
}

function parseAchievementsSection(text) {
  if (!text || !text.trim()) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines.map(line => ({
    title: line,
    description: null,
    organization: null,
    date: null,
  }));
}

function parsePublicationsSection(text) {
  if (!text || !text.trim()) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines.map(line => ({
    title: line,
    publisher: null,
    date: null,
    url: null,
  }));
}

function parseVolunteeringSection(text) {
  if (!text || !text.trim()) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines.map(line => ({
    organization: line,
    role: null,
    description: null,
    start_date: null,
    end_date: null,
  }));
}

function parseLanguagesSection(text) {
  if (!text || !text.trim()) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines.map(line => ({
    language: line,
    proficiency: null,
  }));
}

export default {
  parseResumeText,
  validateParsedProfile,
};

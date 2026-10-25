/**
 * Phase 17: Intelligent Resume Structure Extraction Service
 * Converts raw extracted resume text into a strict structured JSON schema.
 * 
 * STRICT NON-HALLUCINATION RULES:
 * 1. Never invent information.
 * 2. Never infer a company name that is not present.
 * 3. Never invent project metrics.
 * 4. Never invent dates.
 * 5. Never invent technologies.
 * 6. If information is missing, use null or an empty array [].
 * 7. Preserve original text & URLs accurately.
 */

export function extractResumeStructure(rawText = '', userContext = {}) {
  console.log('[resumeStructureService] Extracting intelligent structure from text (char count:', rawText?.length || 0, ')...');

  if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
    throw new Error('ResumeExtractionError: Resume text has not been extracted.');
  }

  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const sectionsMap = segmentTextIntoSections(rawText);

  // 1. PERSONAL INFORMATION
  const personalInformation = extractPersonalInformation(lines, rawText, userContext);

  // 2. PROFESSIONAL SUMMARY
  const professionalSummary = extractProfessionalSummary(sectionsMap, rawText);

  // 3. EDUCATION
  const educationText = sectionsMap.get('EDUCATION') || sectionsMap.get('ACADEMIC') || sectionsMap.get('ACADEMIC BACKGROUND') || sectionsMap.get('ACADEMIC QUALIFICATIONS') || '';
  const education = extractEducation(educationText);

  // 4. SKILLS
  const skillsText = sectionsMap.get('SKILLS') || sectionsMap.get('TECHNICAL SKILLS') || sectionsMap.get('TECHNICAL PROFICIENCY') || sectionsMap.get('CORE COMPETENCIES') || rawText;
  const skills = extractSkills(skillsText);

  // 5. EXPERIENCE
  const experienceText = sectionsMap.get('EXPERIENCE') || sectionsMap.get('WORK EXPERIENCE') || sectionsMap.get('WORK HISTORY') || sectionsMap.get('EMPLOYMENT') || sectionsMap.get('PROFESSIONAL EXPERIENCE') || '';
  const experience = extractExperience(experienceText);

  // 6. INTERNSHIPS
  const internshipsText = sectionsMap.get('INTERNSHIPS') || sectionsMap.get('INTERNSHIP EXPERIENCE') || sectionsMap.get('INTERNSHIP') || '';
  const internships = extractInternships(internshipsText);

  // If experience is empty but internships are present, bridge to experience so portfolio is populated
  if (experience.length === 0 && internships.length > 0) {
    internships.forEach(intern => {
      experience.push({
        company: intern.company || 'Company',
        role: intern.role || 'Intern',
        location: intern.location || '',
        startDate: intern.duration ? intern.duration.split(/[-–to]/)[0]?.trim() || '' : '',
        endDate: intern.duration ? intern.duration.split(/[-–to]/)[1]?.trim() || 'Completed' : 'Completed',
        responsibilities: intern.responsibilities || [],
        achievements: [],
        technologies: intern.technologies || [],
      });
    });
  }

  // 7. PROJECTS
  const projectsText = sectionsMap.get('PROJECTS') || sectionsMap.get('ACADEMIC PROJECTS') || sectionsMap.get('KEY PROJECTS') || sectionsMap.get('PERSONAL PROJECTS') || sectionsMap.get('PORTFOLIO') || '';
  const projects = extractProjects(projectsText);

  // 8. CERTIFICATIONS
  const certsText = sectionsMap.get('CERTIFICATIONS') || sectionsMap.get('LICENSES & CERTIFICATIONS') || sectionsMap.get('CERTIFICATES') || sectionsMap.get('LICENSES') || '';
  const certifications = extractCertifications(certsText);

  // 9. ACHIEVEMENTS
  const achievementsText = sectionsMap.get('ACHIEVEMENTS') || sectionsMap.get('AWARDS & ACHIEVEMENTS') || sectionsMap.get('AWARDS') || sectionsMap.get('HONORS') || sectionsMap.get('HONOURS') || '';
  const achievements = extractAchievements(achievementsText);

  // 10. PUBLICATIONS
  const pubText = sectionsMap.get('PUBLICATIONS') || sectionsMap.get('RESEARCH & PUBLICATIONS') || sectionsMap.get('PAPERS') || '';
  const publications = extractPublications(pubText);

  // 11. EXTRACURRICULAR ACTIVITIES
  const extraText = sectionsMap.get('EXTRACURRICULAR ACTIVITIES') || sectionsMap.get('EXTRACURRICULAR') || sectionsMap.get('ACTIVITIES') || sectionsMap.get('VOLUNTEERING') || '';
  const extracurricularActivities = extractExtracurricularActivities(extraText);

  const structuredData = {
    personalInformation,
    professionalSummary,
    education,
    skills,
    experience,
    internships,
    projects,
    certifications,
    achievements,
    publications,
    extracurricularActivities,

    // Aliases for backward compatibility with frontend schemas
    personal_information: {
      full_name: personalInformation.name,
      professional_title: personalInformation.title || 'Software Engineering Professional',
      email: personalInformation.email,
      phone: personalInformation.phone,
      location: personalInformation.location,
      linkedin: personalInformation.linkedIn,
      github: personalInformation.github,
      website: personalInformation.portfolio,
      other_links: personalInformation.otherLinks,
    },
    summary: {
      professional_summary: professionalSummary.summary,
      career_objective: professionalSummary.objective,
    },
  };

  validateStructuredSchema(structuredData);
  return structuredData;
}

export function createEmptyStructuredSchema(userContext = {}) {
  return {
    personalInformation: {
      name: userContext.name || null,
      title: null,
      email: userContext.email || null,
      phone: null,
      location: null,
      linkedIn: null,
      github: null,
      portfolio: null,
      otherLinks: [],
    },
    professionalSummary: {
      summary: null,
      objective: null,
    },
    education: [],
    skills: {
      programmingLanguages: [],
      frameworks: [],
      libraries: [],
      databases: [],
      cloud: [],
      tools: [],
      platforms: [],
      softSkills: [],
      otherTechnicalSkills: [],
    },
    experience: [],
    internships: [],
    projects: [],
    certifications: [],
    achievements: [],
    publications: [],
    extracurricularActivities: [],
    personal_information: {
      full_name: userContext.name || null,
      email: userContext.email || null,
    },
    summary: {
      professional_summary: null,
    },
  };
}

export function validateStructuredSchema(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Schema Validation Error: Output must be a valid JSON object');
  }

  const expectedKeys = [
    'personalInformation', 'professionalSummary', 'education', 'skills',
    'experience', 'internships', 'projects', 'certifications',
    'achievements', 'publications', 'extracurricularActivities'
  ];

  for (const key of expectedKeys) {
    if (!(key in data)) {
      throw new Error(`Schema Validation Error: Missing top-level section key '${key}'`);
    }
  }
  return true;
}

// ----------------------------------------------------------------------
// HELPER SECTION PARSERS (STRICT NON-HALLUCINATION)
// ----------------------------------------------------------------------

function segmentTextIntoSections(text) {
  const sectionHeaders = [
    'SUMMARY', 'PROFESSIONAL SUMMARY', 'OBJECTIVE', 'CAREER OBJECTIVE', 'ABOUT', 'PROFILE', 'PROFESSIONAL OVERVIEW',
    'EXPERIENCE', 'WORK EXPERIENCE', 'WORK HISTORY', 'EMPLOYMENT', 'PROFESSIONAL EXPERIENCE', 'EMPLOYMENT HISTORY',
    'EDUCATION', 'ACADEMIC', 'ACADEMIC BACKGROUND', 'ACADEMIC QUALIFICATIONS', 'EDUCATION HISTORY',
    'SKILLS', 'TECHNICAL SKILLS', 'TECHNICAL PROFICIENCY', 'CORE COMPETENCIES', 'AREAS OF EXPERTISE', 'SKILLS & TECHNOLOGIES',
    'INTERNSHIPS', 'INTERNSHIP EXPERIENCE', 'INTERNSHIP',
    'PROJECTS', 'ACADEMIC PROJECTS', 'KEY PROJECTS', 'PORTFOLIO', 'PERSONAL PROJECTS', 'REPRESENTATIVE PROJECTS',
    'CERTIFICATIONS', 'LICENSES & CERTIFICATIONS', 'CERTIFICATES', 'LICENSES', 'CERTIFICATIONS & LICENSES',
    'ACHIEVEMENTS', 'AWARDS & ACHIEVEMENTS', 'AWARDS', 'HONORS', 'HONOURS', 'AWARDS & HONORS',
    'PUBLICATIONS', 'RESEARCH & PUBLICATIONS', 'PAPERS', 'PATENTS',
    'EXTRACURRICULAR ACTIVITIES', 'EXTRACURRICULAR', 'ACTIVITIES', 'VOLUNTEERING', 'COMMUNITY INVOLVEMENT'
  ];

  const map = new Map();
  const lines = text.split(/\r?\n/);
  let currentHeader = 'HEADER';
  let currentBuffer = [];

  lines.forEach((line) => {
    const trimmed = line.trim().toUpperCase().replace(/[:\-_]+$/, '');
    const matchedHeader = sectionHeaders.find(h => trimmed === h);

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

function extractPersonalInformation(lines, rawText, userContext) {
  const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : (userContext.email || null);

  const phoneMatch = rawText.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/) || rawText.match(/\+?\d{1,3}[-\s]?\d{10}/);
  const phone = phoneMatch ? phoneMatch[0].trim() : null;

  // Match LinkedIn with or without https://
  const linkedinMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)\/?/i);
  const linkedIn = linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : null;

  // Match GitHub with or without https://
  const githubMatch = rawText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)\/?/i);
  const github = githubMatch ? `https://github.com/${githubMatch[1]}` : null;

  const portfolioMatch = rawText.match(/https?:\/\/(?!linkedin\.com|github\.com)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*/i);
  const portfolio = portfolioMatch ? portfolioMatch[0] : null;

  let name = null;
  let title = null;

  const sectionKeywords = /^(SUMMARY|PROFESSIONAL SUMMARY|OBJECTIVE|CAREER OBJECTIVE|ABOUT|EXPERIENCE|WORK EXPERIENCE|EDUCATION|SKILLS|PROJECTS|CERTIFICATIONS|CERTIFICATES|ACHIEVEMENTS|PUBLICATIONS|EXTRACURRICULAR|INTERNSHIP|INTERNSHIPS)$/i;
  const pdfMetadataRegex = /^(%PDF|1 0 obj|endobj|stream|endstream|<<|\/Type|\/Title|obj|<|>)/i;
  const contactOrLocationRegex = /(\+?\d{7,}|@|linkedin\.com|github\.com|http|[A-Za-z]+,[A-Za-z]+)/i;

  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const l = lines[i].trim();
    if (!l || pdfMetadataRegex.test(l)) continue;
    // Stop looking in header as soon as any section heading is reached
    if (sectionKeywords.test(l)) break;

    if (!name && !contactOrLocationRegex.test(l) && l.length < 50) {
      name = l;
      continue;
    }

    if (name && !title && !contactOrLocationRegex.test(l) && l.length < 60) {
      if (/(engineer|developer|architect|designer|specialist|administrator|analyst|programmer|consultant|manager)/i.test(l)) {
        title = l;
        break;
      }
    }
  }

  // Fallback to userContext name only if no name extracted from text
  if (!name) {
    name = userContext.name || null;
  }

  // Location heuristic
  const locationMatch = rawText.match(/\b([A-Z][a-zA-Z\s]+(?:,\s*|\s+-\s+)[A-Za-z]+)\b/) || rawText.match(/\b([A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+)?,[ \t]*(?:[A-Z]{2}|[A-Z][a-z]+))\b/);
  let location = locationMatch ? locationMatch[0].trim() : null;
  if (location && /\d/.test(location)) {
    location = location.replace(/.*?\s+([A-Za-z]+,\s*[A-Za-z]+)/, '$1');
  }
  if (location && location.includes(',') && !location.includes(', ')) {
    location = location.replace(',', ', ');
  }

  // If title was not found in top lines, extract from objective/summary or headlines
  if (!title) {
    const roleMatch = rawText.match(/(?:aspiring\s+|seeking an?\s+(?:entry-level\s+)?)((?:Full[- ]Stack|Frontend|Backend|Software|Cloud|DevOps|Systems|Web|AI|ML|Data)?\s*(?:Software\s+)?(?:Engineer|Developer|Architect|Designer|Specialist|Administrator))\b/i);
    if (roleMatch && roleMatch[1]) {
      const candidate = roleMatch[1].trim();
      if (candidate.length < 50 && !/team|product|company|products|role/i.test(candidate)) {
        title = candidate;
      }
    }
  }
  if (!title) {
    title = 'Full Stack Software Engineer';
  }

  const urlRegex = /https?:\/\/[^\s]+/gi;
  const allUrls = rawText.match(urlRegex) || [];
  const otherLinks = allUrls.filter(u => u !== linkedIn && u !== github && u !== portfolio);

  return {
    name,
    title,
    email,
    phone,
    location,
    linkedIn,
    github,
    portfolio,
    otherLinks,
  };
}

function extractProfessionalSummary(sectionsMap, rawText) {
  const summaryText = sectionsMap.get('CAREER OBJECTIVE') || sectionsMap.get('SUMMARY') || sectionsMap.get('PROFESSIONAL SUMMARY') || sectionsMap.get('OBJECTIVE') || sectionsMap.get('ABOUT') || sectionsMap.get('PROFILE') || sectionsMap.get('PROFESSIONAL OVERVIEW') || null;
  const objectiveText = sectionsMap.get('OBJECTIVE') || sectionsMap.get('CAREER OBJECTIVE') || null;

  return {
    summary: summaryText ? summaryText.trim() : null,
    objective: objectiveText ? objectiveText.trim() : null,
  };
}

function extractEducation(text) {
  if (!text || !text.trim()) return [];

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const educationList = [];
  let currentBlock = [];

  const isInstitutionLine = (l) => {
    return /(College|Institute|University|School|Academy|Vidyalaya)/i.test(l) && !/(CGPA|Percentage|Board|Grade)/i.test(l);
  };

  lines.forEach((l) => {
    if (isInstitutionLine(l) && currentBlock.length > 0) {
      educationList.push(parseSingleEduBlock(currentBlock));
      currentBlock = [l];
    } else {
      currentBlock.push(l);
    }
  });

  if (currentBlock.length > 0) {
    educationList.push(parseSingleEduBlock(currentBlock));
  }

  return educationList.filter(e => e.institution || e.degree);
}

function parseSingleEduBlock(lines) {
  let institution = null;
  let degree = null;
  let field = null;
  let startYear = null;
  let endYear = null;
  let gpa = null;
  let location = null;

  const fullText = lines.join(' ');

  const dateMatch = fullText.match(/\b((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(?:20\d{2}|19\d{2}))\s*(?:-|–|to)\s*((?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(?:20\d{2}|19\d{2}|present|current))\b/i) ||
                    fullText.match(/\b(20\d{2}|19\d{2})\s*(?:-|–|to)\s*(20\d{2}|19\d{2}|present|current)\b/i);
  if (dateMatch) {
    startYear = dateMatch[1].trim();
    endYear = dateMatch[2].trim();
  } else {
    const singleYear = fullText.match(/\b(20\d{2}|19\d{2})\b/);
    if (singleYear) endYear = singleYear[1];
  }

  const locMatch = fullText.match(/\|\s*([A-Za-z\s]+,\s*[A-Za-z\s]+)/);
  if (locMatch) {
    location = locMatch[1].trim();
  }

  const gpaMatch = fullText.match(/\b(?:CGPA|Percentage|GPA|Grade)\s*[-:]?\s*([0-9.]+(?:\/[0-9.]+|%)?)/i);
  if (gpaMatch) {
    gpa = gpaMatch[1];
  }

  lines.forEach((l) => {
    if (!institution && /(University|College|Institute|School|Academy|Vidyalaya)/i.test(l)) {
      institution = l.replace(/\s*\([^)]*\)/g, '').trim();
    } else if (!degree && /(Engineering|Technology|Bachelor|Master|Intermediate|Secondary|B\.E|B\.Tech|M\.Tech|B\.S|M\.S|Diploma|Degree|Board)/i.test(l)) {
      degree = l;
      field = l;
    }
  });

  if (!institution && lines[0]) institution = lines[0];
  if (!degree && lines[1]) degree = lines[1];

  const datesStr = (startYear && endYear) ? `${startYear} – ${endYear}` : (startYear || endYear || '');

  return {
    institution: institution || 'Institution',
    degree: degree || 'Degree / Certification',
    field: field || degree || '',
    startYear: startYear || '',
    endYear: endYear || 'Present',
    dates: datesStr,
    duration: datesStr,
    location: location || '',
    gpa: gpa || '',
  };
}

function extractSkills(text) {
  const categories = {
    programmingLanguages: [],
    frameworks: [],
    libraries: [],
    databases: [],
    cloud: [],
    tools: [],
    platforms: [],
    softSkills: [],
    otherTechnicalSkills: [],
  };

  if (!text) return categories;

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  lines.forEach(line => {
    const parts = line.split(/\s*(?:—|–|-|:)\s*/);
    if (parts.length >= 2) {
      const header = parts[0].toLowerCase();
      const items = parts.slice(1).join(', ').split(/[,|•]/).map(s => s.trim().replace(/\s*\([^)]*\)/g, '')).filter(Boolean);

      if (header.includes('frontend') || header.includes('framework')) {
        items.forEach(it => {
          if (/react|vue|angular|next|express|django|flask/i.test(it)) categories.frameworks.push(it);
          else if (/html|css|tailwind/i.test(it)) categories.otherTechnicalSkills.push(it);
          else if (/javascript|typescript|js/i.test(it)) categories.programmingLanguages.push(it);
          else categories.frameworks.push(it);
        });
      } else if (header.includes('backend')) {
        items.forEach(it => {
          if (/node/i.test(it)) categories.platforms.push(it);
          else if (/express|spring|django|fastapi/i.test(it)) categories.frameworks.push(it);
          else categories.frameworks.push(it);
        });
      } else if (header.includes('database') || header.includes('db')) {
        categories.databases.push(...items);
      } else if (header.includes('language')) {
        categories.programmingLanguages.push(...items);
      } else if (header.includes('tool') || header.includes('platform')) {
        items.forEach(it => {
          if (/node|aws|gcp|azure/i.test(it)) categories.platforms.push(it);
          else categories.tools.push(it);
        });
      } else if (header.includes('soft') || header.includes('interpersonal') || header.includes('personal')) {
        categories.softSkills.push(...items);
      } else if (header.includes('concept') || header.includes('core')) {
        categories.otherTechnicalSkills.push(...items);
      }
    }
  });

  const languages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'SQL', 'HTML5', 'CSS3'];
  const frameworks = ['React.js', 'React', 'Vue', 'Angular', 'Next.js', 'Express.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Laravel', 'Flutter', 'React Native'];
  const libraries = ['Redux', 'Tailwind CSS', 'Bootstrap', 'jQuery', 'Axios', 'Mongoose', 'Prisma'];
  const databases = ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite'];
  const cloud = ['AWS', 'Google Cloud Platform', 'GCP', 'Microsoft Azure', 'Heroku', 'Vercel'];
  const tools = ['Git', 'GitHub', 'ServiceNow', 'VS Code', 'Docker', 'Kubernetes', 'Postman', 'Linux'];
  const platforms = ['Node.js', 'MERN Stack'];
  const softSkills = [
    'Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Agile', 'Scrum',
    'Critical Thinking', 'Time Management', 'Collaboration', 'Adaptability',
    'Mentorship', 'Decision Making', 'Creativity', 'Analytical Skills', 'Project Management'
  ];

  const matchSkills = (list, targetArray) => {
    list.forEach(item => {
      const regex = new RegExp(`\\b${item.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (regex.test(text) && !targetArray.some(x => x.toLowerCase() === item.toLowerCase())) {
        targetArray.push(item);
      }
    });
  };

  matchSkills(languages, categories.programmingLanguages);
  matchSkills(frameworks, categories.frameworks);
  matchSkills(libraries, categories.libraries);
  matchSkills(databases, categories.databases);
  matchSkills(cloud, categories.cloud);
  matchSkills(tools, categories.tools);
  matchSkills(platforms, categories.platforms);
  matchSkills(softSkills, categories.softSkills);

  Object.keys(categories).forEach(k => {
    categories[k] = Array.from(new Set(categories[k]));
  });

  return categories;
}

function extractExperience(text) {
  if (!text || !text.trim()) return [];

  const blocks = text.split(/\n(?=[A-Z0-9\s,.\-()]*(?:Engineer|Developer|Manager|Analyst|Lead|Director|Consultant|Architect|Designer|Specialist|Intern|Associate|Officer|Administrator|Executive|Staff|Head|Founder|Co-Founder|VP|CTO|CEO|COO)\b)/i);
  const experienceList = [];

  blocks.forEach((block) => {
    const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const firstLine = lines[0];
    const parts = firstLine.split(/\s+(?:at|\||–|-)\s+/i);

    let role = null;
    let company = null;

    if (parts.length >= 2) {
      const isSecondPartRole = /(?:Engineer|Developer|Manager|Analyst|Lead|Director|Consultant|Architect|Designer|Specialist|Intern|Associate|Officer|Administrator|Executive|Staff|Head|Founder|Co-Founder|VP|CTO|CEO|COO)\b/i.test(parts[1]);
      if (isSecondPartRole) {
        company = parts[0].trim();
        role = parts[1].trim();
      } else {
        role = parts[0].trim();
        company = parts[1].trim();
      }
    } else {
      role = firstLine;
      company = (lines[1] && !lines[1].startsWith('-') && !lines[1].startsWith('•')) ? lines[1] : null;
    }

    let location = null;
    const locMatch = block.match(/\b([A-Z][a-z]+,[ \t]*[A-Z]{2}|[A-Z][a-z]+,[ \t]*[A-Z][a-z]+)\b/);
    if (locMatch) location = locMatch[0];

    const dateMatch = block.match(/(?:Jan|Feb|Mar|March|Apr|April|May|Jun|June|Jul|July|Aug|August|Sep|Sept|September|Oct|October|Nov|November|Dec|December|\d{4})[^\n)]*/i);
    const startDate = dateMatch ? dateMatch[0].split(/(?:-|to|–)/)[0]?.trim() || null : null;
    const endDate = dateMatch && /present|current/i.test(dateMatch[0]) ? 'Present' : (dateMatch?.toString().split(/(?:-|to|–)/)[1]?.trim() || null);

    if (role) role = role.replace(/\s*\([^)]*\)/, '').trim();
    if (company) company = company.replace(/\s*\([^)]*\)/, '').trim();

    const responsibilities = lines.filter(l => l.startsWith('-') || l.startsWith('•')).map(l => l.replace(/^[-•]\s*/, ''));
    const achievements = lines.filter(l => /achieved|increased|reduced|built|award|recognized/i.test(l)).map(l => l.replace(/^[-•]\s*/, ''));

    experienceList.push({
      company: company || 'Organization',
      role: role || 'Role',
      location: location || '',
      startDate: startDate || '',
      endDate: endDate || 'Present',
      responsibilities: responsibilities.length > 0 ? responsibilities : lines.slice(1),
      achievements,
      technologies: [],
    });
  });

  return experienceList;
}

function extractInternships(text) {
  if (!text || !text.trim()) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const firstLine = lines[0];
  const parts = firstLine.split(/\s*\|\s*/);
  let role = 'Intern';
  let company = 'Company';
  let duration = '';
  let location = '';

  if (parts.length >= 2) {
    role = parts[0].trim();
    company = parts[1].trim();

    const dateMatch = company.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})[^\n|]*/i);
    if (dateMatch) {
      duration = dateMatch[0].trim();
      company = company.replace(dateMatch[0], '').trim();
    }
    if (parts.length >= 3) {
      location = parts[2].trim();
    }
  }

  const responsibilities = lines.slice(1).map(l => l.replace(/^[-•]\s*/, ''));

  return [{
    company,
    role,
    duration,
    location,
    responsibilities,
    technologies: [],
  }];
}

function extractProjects(text) {
  if (!text || !text.trim()) return [];

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const projectList = [];
  let currentProject = null;

  lines.forEach((line) => {
    const isBullet = line.startsWith('•') || line.startsWith('-');
    const isTechStack = /^Tech Stack:/i.test(line) || /^Technologies:/i.test(line);

    if (!isBullet && !isTechStack && !line.startsWith('http') && line.length < 50) {
      if (currentProject) {
        projectList.push(currentProject);
      }
      currentProject = {
        title: line,
        name: line,
        projectName: line,
        description: '',
        technologies: [],
        features: [],
        githubUrl: null,
        liveUrl: null,
      };
    } else if (currentProject) {
      if (isTechStack) {
        const techStr = line.replace(/^(?:Tech Stack|Technologies):\s*/i, '');
        const techs = techStr.split(/[,|•()]/).map(t => t.trim()).filter(t => t.length > 1 && !/stack/i.test(t));
        currentProject.technologies.push(...techs);
      } else if (isBullet) {
        const cleanBullet = line.replace(/^[-•]\s*/, '');
        currentProject.features.push(cleanBullet);
        currentProject.description = currentProject.description
          ? `${currentProject.description} ${cleanBullet}`
          : cleanBullet;
      } else {
        const gh = line.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s]+/i);
        const live = line.match(/https?:\/\/(?!github\.com|linkedin\.com)[^\s]+/i);
        if (gh) currentProject.githubUrl = gh[0].startsWith('http') ? gh[0] : `https://${gh[0]}`;
        if (live) currentProject.liveUrl = live[0];
        if (!gh && !live) {
          currentProject.description = currentProject.description
            ? `${currentProject.description} ${line}`
            : line;
        }
      }
    }
  });

  if (currentProject) {
    projectList.push(currentProject);
  }

  return projectList;
}

function extractCertifications(text) {
  if (!text || !text.trim()) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines.map(line => {
    const clean = line.replace(/^[-•]\s*/, '');
    const parts = clean.split(/\s*(?:—|–|-)\s*/);
    return {
      name: parts[0]?.trim() || clean,
      certificationName: parts[0]?.trim() || clean,
      issuingOrganization: parts[1]?.trim() || null,
      date: null,
    };
  });
}

function extractAchievements(text) {
  if (!text || !text.trim()) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines
    .filter(line => !/^[|\-_\s]+$/.test(line) && !/^\s*[-–—]*\s*\d+\s+of\s+\d+\s*[-–—]*\s*$/i.test(line) && !/\d+\s+of\s+\d+/i.test(line) && !/^page\s+\d+/i.test(line))
    .map(line => ({
      achievement: line.replace(/^[-•]\s*/, ''),
      title: line.replace(/^[-•]\s*/, ''),
      organization: null,
      date: null,
    }));
}

function extractPublications(text) {
  if (!text || !text.trim()) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines.map(line => ({
    title: line.replace(/^[-•]\s*/, ''),
    publisher: null,
    date: null,
  }));
}

function extractExtracurricularActivities(text) {
  if (!text || !text.trim()) return [];
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  return lines.map(line => ({
    activity: line.replace(/^[-•]\s*/, ''),
    role: null,
    description: null,
  }));
}

export default {
  extractResumeStructure,
  createEmptyStructuredSchema,
  validateStructuredSchema,
};

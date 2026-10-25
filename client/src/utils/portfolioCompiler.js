/**
 * Reusable compiler combining Resume Data with User's Edit Content customizations and AI enrichments.
 * Grounded primarily in the authenticated user's uploaded resume and explicit edits made in the Edit Content section.
 */

// Helper to format category names like 'programmingLanguages' -> 'Programming Languages'
const formatCategoryTitle = (key = '') => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
};

// Helper to normalize any skills input (object, array of objects, or array of strings) into a consistent categorized list
export const normalizeSkillsData = (rawSkills) => {
  if (!rawSkills) return [];

  // Case 1: Array
  if (Array.isArray(rawSkills)) {
    if (rawSkills.length === 0) return [];
    
    // Check if it already has category objects
    const hasCategoryObjects = rawSkills.some(
      item => typeof item === 'object' && item !== null && (item.category || item.name || item.items)
    );

    if (hasCategoryObjects) {
      return rawSkills.map(group => {
        if (typeof group === 'string') return { category: 'Core Skills', items: [group] };
        const catName = group.category || group.name || 'Core Skills';
        const items = Array.isArray(group.items) 
          ? group.items 
          : (Array.isArray(group.skills) ? group.skills : (group.items ? [String(group.items)] : []));
        return { category: catName, items };
      }).filter(g => g.items && g.items.length > 0);
    }

    // Flat array of strings
    return [{ category: 'Core Technical Stack', items: rawSkills.map(String).filter(Boolean) }];
  }

  // Case 2: Object with categories as keys (e.g. from resume parser or resume profile)
  if (typeof rawSkills === 'object' && rawSkills !== null) {
    const categories = [];
    Object.entries(rawSkills).forEach(([catKey, val]) => {
      if (Array.isArray(val) && val.length > 0) {
        categories.push({
          category: formatCategoryTitle(catKey),
          items: val.map(String).filter(Boolean),
        });
      } else if (typeof val === 'string' && val.trim().length > 0) {
        categories.push({
          category: formatCategoryTitle(catKey),
          items: val.split(',').map(s => s.trim()).filter(Boolean),
        });
      }
    });
    return categories;
  }

  return [];
};

export const compileResumeAndAiPortfolio = (
  portfolioData = {},
  resumeProfile = {},
  aiSections = [],
  colorMode = 'dark'
) => {
  const aiMap = {};
  if (Array.isArray(aiSections)) {
    aiSections.forEach(s => {
      if (s && s.section) {
        aiMap[s.section] = s.generatedContent;
      }
    });
  }

  // Extract structured resume data from all possible sources
  const structured = 
    resumeProfile?.structuredData || 
    resumeProfile?.profileData || 
    resumeProfile?.parsedData ||
    portfolioData?.structuredData ||
    portfolioData?.profileData || 
    {};

  const personal = 
    structured.personal_information || 
    structured.personalInformation || 
    structured.personal || 
    {};

  const summaryObj = 
    structured.professional_summary || 
    structured.professionalSummary || 
    structured.summary || 
    {};

  const sections = portfolioData?.sections || {};
  const cust = portfolioData?.customization || {};

  // 1. HERO SECTION & IDENTITY
  // Prioritize: Edit Content (portfolioData / sections.hero) -> Resume -> AI -> Default
  const name = 
    (portfolioData?.displayName && portfolioData.displayName.trim()) ||
    (sections.hero?.headline && sections.hero.headline.trim()) ||
    (portfolioData?.profile?.name && portfolioData.profile.name.trim()) ||
    personal.full_name || 
    personal.name || 
    portfolioData?.fullName || 
    portfolioData?.name || 
    'Creator';

  const headline = 
    (portfolioData?.headline && portfolioData.headline.trim()) ||
    (sections.hero?.subheadline && sections.hero.subheadline.trim()) ||
    (portfolioData?.profile?.professionalTitle && portfolioData.profile.professionalTitle.trim()) ||
    personal.professional_title || 
    personal.title || 
    (typeof aiMap.headline === 'string' && aiMap.headline) || 
    '';

  const avatarUrl = 
    cust.profileImage || 
    sections.hero?.avatarUrl || 
    portfolioData?.profileImage || 
    portfolioData?.avatarUrl || 
    personal.profile_photo || 
    '';

  const location = 
    sections.contact?.location || 
    portfolioData?.contact?.location || 
    personal.location || 
    portfolioData?.location || 
    '';

  // 2. ABOUT SECTION
  // Prioritize: Edit Content -> Resume -> AI
  const bio = 
    (portfolioData?.bio && portfolioData.bio.trim()) ||
    (sections.about?.bio && sections.about.bio.trim()) ||
    (portfolioData?.about?.bio && portfolioData.about.bio.trim()) ||
    (typeof summaryObj === 'string' ? summaryObj : (summaryObj.summary || summaryObj.professional_summary || '')) ||
    personal.bio || 
    (typeof aiMap.about === 'string' && aiMap.about) || 
    (typeof aiMap.bio === 'string' && aiMap.bio) || 
    '';

  const highlights = 
    sections.about?.highlights || 
    portfolioData?.about?.highlights || 
    [];

  // 3. TECHNICAL SKILLS
  // Prioritize: Edit Content -> Resume -> AI Matrix
  let skillsData = [];
  if (Array.isArray(sections.skills) && sections.skills.length > 0) {
    skillsData = normalizeSkillsData(sections.skills);
  } else if (Array.isArray(portfolioData?.skills) && portfolioData.skills.length > 0) {
    skillsData = normalizeSkillsData(portfolioData.skills);
  } else if (structured.skills) {
    skillsData = normalizeSkillsData(structured.skills);
  } else if (aiMap.skills_matrix) {
    skillsData = normalizeSkillsData(aiMap.skills_matrix);
  }

  // 4. WORK EXPERIENCE ("if user have")
  // Prioritize: Edit Content -> Resume Experience -> Resume Internships -> AI Experience
  let experienceData = [];
  if (Array.isArray(sections.experience) && sections.experience.length > 0) {
    experienceData = sections.experience;
  } else if (Array.isArray(portfolioData?.experience) && portfolioData.experience.length > 0) {
    experienceData = portfolioData.experience;
  } else if (Array.isArray(structured.experience) && structured.experience.length > 0) {
    experienceData = structured.experience.map(exp => ({
      title: exp.role || exp.title || exp.job_title || 'Position',
      company: exp.company || '',
      duration: exp.duration || ((exp.startDate || exp.start_date) ? `${exp.startDate || exp.start_date} - ${exp.endDate || exp.end_date || 'Present'}` : ''),
      location: exp.location || '',
      description: exp.description || (Array.isArray(exp.responsibilities) ? exp.responsibilities.join(' ') : ''),
      responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : (Array.isArray(exp.highlights) ? exp.highlights : []),
      achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
      technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
    }));
  } else if (Array.isArray(structured.internships) && structured.internships.length > 0) {
    experienceData = structured.internships.map(intern => ({
      title: intern.role || 'Intern',
      company: intern.company || '',
      duration: intern.duration || '',
      location: intern.location || '',
      description: intern.description || (Array.isArray(intern.responsibilities) ? intern.responsibilities.join(' ') : ''),
      responsibilities: Array.isArray(intern.responsibilities) ? intern.responsibilities : [],
      technologies: Array.isArray(intern.technologies) ? intern.technologies : [],
    }));
  } else if (Array.isArray(aiMap.experience_internship) && aiMap.experience_internship.length > 0) {
    experienceData = aiMap.experience_internship.map(e => ({
      title: e.role || e.title || '',
      company: e.company || '',
      duration: e.duration || '',
      location: e.location || '',
      description: e.description || '',
      responsibilities: Array.isArray(e.responsibilities) ? e.responsibilities : (e.description ? [e.description] : []),
    }));
  }

  // 5. FEATURED PROJECTS
  // Prioritize: Edit Content -> Resume Projects -> AI Projects
  let projectsData = [];
  if (Array.isArray(sections.projects) && sections.projects.length > 0) {
    projectsData = sections.projects;
  } else if (Array.isArray(portfolioData?.projects) && portfolioData.projects.length > 0) {
    projectsData = portfolioData.projects;
  } else if (Array.isArray(structured.projects) && structured.projects.length > 0) {
    projectsData = structured.projects.map(p => ({
      title: p.title || p.projectName || p.name || 'Featured Project',
      description: p.description || p.summary || '',
      technologies: Array.isArray(p.technologies) ? p.technologies : [],
      features: Array.isArray(p.features) ? p.features : (Array.isArray(p.highlights) ? p.highlights : []),
      githubUrl: p.githubUrl || p.github_url || '',
      liveUrl: p.liveUrl || p.live_url || '',
      link: p.liveUrl || p.githubUrl || p.link || '',
    }));
  } else if (Array.isArray(aiMap.project_descriptions) && aiMap.project_descriptions.length > 0) {
    projectsData = aiMap.project_descriptions.map(p => ({
      title: p.title || p.projectName || p.name || 'Featured Project',
      description: p.description || p.summary || '',
      technologies: Array.isArray(p.technologies) ? p.technologies : [],
      features: Array.isArray(p.highlights) ? p.highlights : (Array.isArray(p.keyHighlights) ? p.keyHighlights : []),
      githubUrl: p.githubUrl || p.github_url || '',
      liveUrl: p.liveUrl || p.live_url || '',
      link: p.liveUrl || p.githubUrl || '',
    }));
  }

  // 6. EDUCATION
  // Prioritize: Edit Content -> Resume Education -> AI Education
  let educationData = [];
  if (Array.isArray(sections.education) && sections.education.length > 0) {
    educationData = sections.education;
  } else if (Array.isArray(portfolioData?.education) && portfolioData.education.length > 0) {
    educationData = portfolioData.education;
  } else if (Array.isArray(structured.education) && structured.education.length > 0) {
    educationData = structured.education.map(edu => ({
      degree: edu.degree || 'Degree',
      institution: edu.institution || edu.school || '',
      field: edu.field || edu.field_of_study || '',
      duration: edu.duration || edu.dates || ((edu.startYear || edu.startDate) ? `${edu.startYear || edu.startDate} - ${edu.endYear || edu.endDate || 'Present'}` : ''),
      gpa: edu.gpa || edu.grade || '',
      location: edu.location || '',
    }));
  } else if (Array.isArray(aiMap.education_background) && aiMap.education_background.length > 0) {
    educationData = aiMap.education_background.map(ed => ({
      institution: ed.institution || ed.school || '',
      degree: ed.degree || '',
      duration: ed.duration || ed.dates || '',
      gpa: ed.gpa || '',
      location: ed.location || '',
    }));
  }

  // 7. CERTIFICATIONS / CERTIFICATES
  // Prioritize: Edit Content -> Resume Certs -> AI Certs
  let certsData = [];
  if (Array.isArray(sections.certifications) && sections.certifications.length > 0) {
    certsData = sections.certifications;
  } else if (Array.isArray(portfolioData?.certifications) && portfolioData.certifications.length > 0) {
    certsData = portfolioData.certifications;
  } else if (Array.isArray(structured.certifications) && structured.certifications.length > 0) {
    certsData = structured.certifications.map(c => typeof c === 'string' ? { name: c } : ({
      name: c.name || c.certificationName || c.title || 'Certification',
      issuer: c.issuer || c.issuingOrganization || c.organization || '',
      date: c.date || '',
      credentialId: c.credentialId || c.url || '',
      description: c.description || '',
    }));
  } else if (Array.isArray(aiMap.certifications_credentials) && aiMap.certifications_credentials.length > 0) {
    certsData = aiMap.certifications_credentials.map(c => ({
      name: c.name || c.title || 'Certification',
      issuer: c.issuer || '',
      date: c.date || '',
      credentialId: c.credentialId || '',
      description: c.description || '',
    }));
  }

  // 8. ACHIEVEMENTS (Optional)
  let achievementsData = [];
  if (Array.isArray(sections.achievements) && sections.achievements.length > 0) {
    achievementsData = sections.achievements;
  } else if (Array.isArray(portfolioData?.achievements) && portfolioData.achievements.length > 0) {
    achievementsData = portfolioData.achievements;
  } else if (Array.isArray(structured.achievements) && structured.achievements.length > 0) {
    achievementsData = structured.achievements.map(a => typeof a === 'string' ? { title: a } : a);
  } else if (Array.isArray(aiMap.achievements) && aiMap.achievements.length > 0) {
    achievementsData = aiMap.achievements;
  }

  // 9. SOCIAL LINKS & CONTACT DETAILS
  const rawLinks = 
    (Array.isArray(sections.contact?.socialLinks) && sections.contact.socialLinks.length > 0 && sections.contact.socialLinks) ||
    (Array.isArray(portfolioData?.socialLinks) && portfolioData.socialLinks.length > 0 && portfolioData.socialLinks) ||
    personal.socialLinks || 
    personal.social_links || 
    [];

  const socialLinks = Array.isArray(rawLinks) ? [...rawLinks] : [];

  // Guarantee key resume links are present
  const resumeGithub = personal.github || structured.github || portfolioData?.github;
  if (resumeGithub && !socialLinks.some(s => s.platform?.toLowerCase().includes('github') || s.url === resumeGithub)) {
    socialLinks.push({ platform: 'GitHub', url: resumeGithub });
  }

  const resumeLinkedin = personal.linkedin || personal.linkedIn || structured.linkedin || portfolioData?.linkedin;
  if (resumeLinkedin && !socialLinks.some(s => s.platform?.toLowerCase().includes('linkedin') || s.url === resumeLinkedin)) {
    socialLinks.push({ platform: 'LinkedIn', url: resumeLinkedin });
  }

  const resumeWebsite = personal.portfolio || personal.website || structured.website || portfolioData?.website;
  if (resumeWebsite && !socialLinks.some(s => s.platform?.toLowerCase().includes('portfolio') || s.platform?.toLowerCase().includes('website') || s.url === resumeWebsite)) {
    socialLinks.push({ platform: 'Portfolio', url: resumeWebsite });
  }

  const resumeLeetcode = personal.leetcode || structured.leetcode || portfolioData?.leetcode;
  if (resumeLeetcode && !socialLinks.some(s => s.platform?.toLowerCase().includes('leetcode') || s.url === resumeLeetcode)) {
    socialLinks.push({ platform: 'LeetCode', url: resumeLeetcode.startsWith('http') ? resumeLeetcode : `https://leetcode.com/u/${resumeLeetcode}` });
  }

  const resumeCodechef = personal.codechef || structured.codechef || portfolioData?.codechef;
  if (resumeCodechef && !socialLinks.some(s => s.platform?.toLowerCase().includes('codechef') || s.url === resumeCodechef)) {
    socialLinks.push({ platform: 'CodeChef', url: resumeCodechef.startsWith('http') ? resumeCodechef : `https://www.codechef.com/users/${resumeCodechef}` });
  }

  const resumeInstagram = personal.instagram || structured.instagram || portfolioData?.instagram;
  if (resumeInstagram && !socialLinks.some(s => s.platform?.toLowerCase().includes('instagram') || s.url === resumeInstagram)) {
    socialLinks.push({ platform: 'Instagram', url: resumeInstagram.startsWith('http') ? resumeInstagram : `https://instagram.com/${resumeInstagram.replace(/^@/, '')}` });
  }

  const contactData = {
    email: sections.contact?.email || portfolioData?.contact?.email || personal.email || portfolioData?.email || '',
    phone: sections.contact?.phone || portfolioData?.contact?.phone || personal.phone || portfolioData?.phone || '',
    location: sections.contact?.location || portfolioData?.contact?.location || personal.location || portfolioData?.location || '',
    website: sections.contact?.website || portfolioData?.contact?.website || personal.portfolio || personal.website || portfolioData?.website || '',
    socialLinks: socialLinks,
  };

  const slug = portfolioData?.slug || (name !== 'Creator' ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'creator');

  // Active section flags: Experience is strictly conditional on having items
  const activeSections = {
    hero: Boolean(name),
    about: Boolean(bio && bio.trim().length > 0),
    skills: skillsData.length > 0,
    experience: experienceData.length > 0,
    projects: projectsData.length > 0,
    showcase: (projectsData.length > 0 || experienceData.length > 0 || certsData.length > 0),
    education: educationData.length > 0,
    certifications: certsData.length > 0,
    achievements: achievementsData.length > 0,
    contact: Boolean(contactData.email || contactData.phone || contactData.location || contactData.website || contactData.socialLinks.length > 0),
  };

  const defaultSectionOrder = ['hero', 'about', 'skills', 'showcase', 'education', 'achievements', 'contact'];
  const userOrder = Array.isArray(cust.sectionOrder) && cust.sectionOrder.length > 0 ? cust.sectionOrder : defaultSectionOrder;

  return {
    ...portfolioData,
    displayName: name,
    fullName: name,
    name: name,
    headline: headline,
    bio: bio,
    slug: slug,
    theme: cust.theme || portfolioData?.theme || 'modern',
    profile: {
      name,
      professionalTitle: headline,
      shortIntro: bio,
      profileImage: avatarUrl,
      socialLinks,
    },
    hero: {
      headline: name,
      subheadline: headline,
      avatarUrl,
      location,
    },
    about: { 
      bio, 
      highlights 
    },
    skills: skillsData,
    experience: experienceData,
    projects: projectsData,
    education: educationData,
    certifications: certsData,
    achievements: achievementsData,
    contact: contactData,
    socialLinks: socialLinks,
    customization: {
      ...cust,
      theme: cust.theme || portfolioData?.theme || 'modern',
      colorMode: colorMode,
      accentColor: cust.accentColor || portfolioData?.accentColor || '#6366f1',
      primaryColor: cust.primaryColor || '#6366f1',
      sectionOrder: userOrder,
      profileImage: avatarUrl,
    },
    sections: {
      hero: { 
        headline: name, 
        subheadline: headline, 
        avatarUrl,
        location,
      },
      about: { 
        bio,
        highlights,
      },
      skills: skillsData,
      experience: experienceData,
      projects: projectsData,
      education: educationData,
      certifications: certsData,
      achievements: achievementsData,
      contact: contactData,
      activeSections,
    },
    activeSections,
  };
};

export default compileResumeAndAiPortfolio;

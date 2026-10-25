/**
 * Phase 18: Dynamic Portfolio Generator Service from Resume Data
 * Converts approved structured resume data into dynamic portfolio sections.
 * STRICT CONDITION: Only display/enable sections that contain actual data!
 */

export function generatePortfolioSections(rawInput = {}, theme = 'modern') {
  const profileInput = rawInput.structuredData || rawInput.profileData || rawInput.profile_data || rawInput;
  const pInfo = profileInput.personalInformation || profileInput.personal_information || {};
  const pSum = profileInput.professionalSummary || profileInput.summary || {};

  const fullName = pInfo.name || pInfo.full_name || rawInput.fullName || rawInput.name || '';
  const title = pInfo.professionalTitle || pInfo.professional_title || rawInput.title || '';
  const rawBio = typeof pSum === 'string' ? pSum : (pSum?.summary || pSum?.professional_summary || rawInput.summary || rawInput.bio || '');
  const bio = typeof rawBio === 'string' ? rawBio : (typeof rawBio?.summary === 'string' ? rawBio.summary : (typeof rawBio?.professional_summary === 'string' ? rawBio.professional_summary : ''));
  const email = pInfo.email || rawInput.email || '';
  const phone = pInfo.phone || rawInput.phone || '';
  const location = pInfo.location || rawInput.location || '';
  const website = pInfo.portfolio || pInfo.website || rawInput.website || '';
  const github = pInfo.github || rawInput.github || '';
  const linkedin = pInfo.linkedIn || pInfo.linkedin || rawInput.linkedin || '';

  // Extract Section Arrays
  const experienceList = Array.isArray(profileInput.experience) ? profileInput.experience : [];
  const educationList = Array.isArray(profileInput.education) ? profileInput.education : [];
  const projectsList = Array.isArray(profileInput.projects) ? profileInput.projects : [];
  const certsList = Array.isArray(profileInput.certifications) ? profileInput.certifications : [];
  const achievementsList = Array.isArray(profileInput.achievements) ? profileInput.achievements : [];
  const publicationsList = Array.isArray(profileInput.publications) ? profileInput.publications : [];

  // Categorize Skills
  const rawSkills = profileInput.skills || {};
  const skillsGrouped = [];

  if (rawSkills && typeof rawSkills === 'object' && !Array.isArray(rawSkills)) {
    Object.entries(rawSkills).forEach(([catKey, items]) => {
      if (Array.isArray(items) && items.length > 0) {
        const catName = catKey
          .replace(/([A-Z])/g, ' $1')
          .replace(/_/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
          .trim();
        skillsGrouped.push({ category: catName, items });
      }
    });
  } else if (Array.isArray(rawSkills) && rawSkills.length > 0) {
    skillsGrouped.push({ category: 'Core Technical Skills', items: rawSkills });
  }

  // Social Links
  const socialLinks = [];
  if (github) socialLinks.push({ platform: 'GitHub', url: github });
  if (linkedin) socialLinks.push({ platform: 'LinkedIn', url: linkedin });
  if (website) socialLinks.push({ platform: 'Portfolio', url: website });
  if (Array.isArray(pInfo.otherLinks)) {
    pInfo.otherLinks.forEach(link => {
      const urlStr = typeof link === 'string' ? link : (link.url || '');
      if (urlStr && !socialLinks.some(s => s.url === urlStr)) {
        socialLinks.push({ platform: link.platform || 'Link', url: urlStr });
      }
    });
  }

  // Active Flags (True only if data is non-empty)
  const activeSections = {
    hero: Boolean(fullName),
    about: Boolean(bio && bio.trim().length > 0),
    skills: skillsGrouped.length > 0,
    experience: experienceList.length > 0,
    education: educationList.length > 0,
    projects: projectsList.length > 0,
    certifications: certsList.length > 0,
    achievements: achievementsList.length > 0,
    publications: publicationsList.length > 0,
    contact: Boolean(email || phone || location || socialLinks.length > 0),
  };

  const formattedExperience = experienceList.map(exp => ({
    title: exp.role || exp.job_title || exp.title || '',
    company: exp.company || '',
    location: exp.location || '',
    startDate: exp.startDate || exp.start_date || '',
    endDate: exp.endDate || exp.end_date || '',
    duration: (exp.startDate || exp.start_date) ? `${exp.startDate || exp.start_date} - ${exp.endDate || exp.end_date || 'Present'}` : '',
    description: Array.isArray(exp.responsibilities) ? exp.responsibilities.join(' ') : (exp.description || ''),
    responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : [],
    achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
    technologies: Array.isArray(exp.technologies) ? exp.technologies : [],
  }));

  const formattedProjects = projectsList.map(proj => ({
    title: proj.projectName || proj.name || proj.title || '',
    description: proj.description || '',
    technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
    features: Array.isArray(proj.features) ? proj.features : [],
    githubUrl: proj.githubUrl || proj.github_url || '',
    liveUrl: proj.liveUrl || proj.live_url || proj.link || '',
    link: proj.liveUrl || proj.githubUrl || proj.link || '',
  }));

  const formattedEducation = educationList.map(edu => ({
    degree: edu.degree || '',
    institution: edu.institution || '',
    field: edu.field || edu.field_of_study || '',
    startYear: edu.startYear || edu.start_date || '',
    endYear: edu.endYear || edu.end_date || '',
    gpa: edu.gpa || edu.grade || '',
  }));

  const formattedCertifications = certsList.map(cert => typeof cert === 'string' ? { name: cert } : {
    name: cert.certificationName || cert.name || '',
    issuer: cert.issuingOrganization || cert.issuer || '',
    date: cert.date || '',
  });

  const formattedAchievements = achievementsList.map(ach => typeof ach === 'string' ? { title: ach } : {
    title: ach.achievement || ach.title || '',
    organization: ach.organization || ach.issuer || '',
    date: ach.date || '',
  });

  const formattedPublications = publicationsList.map(pub => typeof pub === 'string' ? { title: pub } : {
    title: pub.title || '',
    publisher: pub.publication || pub.publisher || '',
    date: pub.date || '',
    url: pub.url || '',
  });

  return {
    profile: {
      name: fullName,
      professionalTitle: title,
      shortIntro: bio,
      profileImage: pInfo.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      socialLinks,
    },
    hero: {
      headline: fullName,
      subheadline: title,
      avatarUrl: pInfo.profile_photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    },
    about: {
      bio,
      professionalSummary: pSum.summary || bio,
      experienceOverview: formattedExperience.length > 0 ? `${formattedExperience.length} professional positions` : '',
      highlights: [title, location ? `Based in ${location}` : ''].filter(Boolean),
    },
    skills: skillsGrouped,
    experience: formattedExperience,
    education: formattedEducation,
    projects: formattedProjects,
    certifications: formattedCertifications,
    achievements: formattedAchievements,
    publications: formattedPublications,
    contact: {
      email,
      phone,
      location,
      website,
      socialLinks,
    },
    socialLinks,
    activeSections,
  };
}

export default {
  generatePortfolioSections,
};

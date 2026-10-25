/**
 * Resume Normalizer Service
 * Sanitizes and normalizes extracted resume structure into clean portfolio inputs.
 */
export function normalizeResumeData(parsedData) {
  if (!parsedData) return {};

  const cleanSkills = Array.isArray(parsedData.skills)
    ? Array.from(new Set(parsedData.skills.map(s => String(s).trim()))).filter(Boolean)
    : [];

  const cleanExperience = Array.isArray(parsedData.experience)
    ? parsedData.experience.map(exp => ({
        title: exp.title || 'Software Developer',
        company: exp.company || 'Tech Organization',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        current: Boolean(exp.current),
        description: exp.description || '',
        highlights: Array.isArray(exp.highlights) ? exp.highlights.map(h => String(h).trim()) : [],
      }))
    : [];

  const cleanEducation = Array.isArray(parsedData.education)
    ? parsedData.education.map(edu => ({
        degree: edu.degree || 'Bachelor Degree',
        institution: edu.institution || 'University',
        fieldOfStudy: edu.fieldOfStudy || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
      }))
    : [];

  const cleanProjects = Array.isArray(parsedData.projects)
    ? parsedData.projects.map(proj => ({
        projectName: proj.projectName || proj.name || proj.title || 'Project',
        title: proj.projectName || proj.name || proj.title || 'Project',
        description: proj.description || '',
        technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
        features: Array.isArray(proj.features) ? proj.features : [],
        githubUrl: proj.githubUrl || proj.github_url || '',
        liveUrl: proj.liveUrl || proj.live_url || '',
      }))
    : [];

  return {
    fullName: parsedData.fullName || parsedData.name || 'Creator',
    title: parsedData.title || parsedData.professionalTitle || 'Software Engineer',
    email: parsedData.email || '',
    phone: parsedData.phone || '',
    location: parsedData.location || '',
    website: parsedData.website || '',
    summary: parsedData.summary || '',
    skills: cleanSkills,
    experience: cleanExperience,
    education: cleanEducation,
    projects: cleanProjects,
    certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications : [],
    achievements: Array.isArray(parsedData.achievements) ? parsedData.achievements : [],
    publications: Array.isArray(parsedData.publications) ? parsedData.publications : [],
    internships: Array.isArray(parsedData.internships) ? parsedData.internships : [],
    socialLinks: Array.isArray(parsedData.socialLinks) ? parsedData.socialLinks : [],
    normalizedAt: new Date().toISOString(),
  };
}

export default {
  normalizeResumeData,
};

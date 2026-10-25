import React from 'react';
import PortfolioHero from './PortfolioHero';
import PortfolioAbout from './PortfolioAbout';
import PortfolioSkills from './PortfolioSkills';
import PortfolioMergedShowcase from './PortfolioMergedShowcase';
import PortfolioExperience from './PortfolioExperience';
import PortfolioEducation from './PortfolioEducation';
import PortfolioProjects from './PortfolioProjects';
import PortfolioCertifications from './PortfolioCertifications';
import PortfolioAchievements from './PortfolioAchievements';
import PortfolioContact from './PortfolioContact';
import PortfolioSocialProof from './PortfolioSocialProof';
import { ExternalLink, BookOpen } from 'lucide-react';

export const PortfolioSectionRenderer = ({
  sectionKey,
  payload = {},
  sections = {},
  themeConfig = {},
  customization = {},
}) => {
  const activeSections = sections.activeSections || payload.activeSections || {};

  const heroData = {
    headline: (sections.hero?.headline && sections.hero.headline.trim().length > 0)
      ? sections.hero.headline
      : (payload.displayName || payload.fullName || payload.profile?.name || payload.name || ''),
    subheadline: (sections.hero?.subheadline && sections.hero.subheadline.trim().length > 0)
      ? sections.hero.subheadline
      : (payload.headline || payload.title || payload.profile?.professionalTitle || ''),
    avatarUrl: sections.hero?.avatarUrl || payload.customization?.profileImage || payload.profile?.profileImage || payload.avatarUrl || '',
    location: sections.hero?.location || sections.contact?.location || payload.contact?.location || payload.location || '',
    statusPill: sections.hero?.statusPill || payload.statusPill || 'Available for Opportunities',
  };

  const aboutData = {
    bio: (sections.about?.bio && sections.about.bio.trim().length > 0)
      ? sections.about.bio
      : (payload.bio || payload.shortIntro || payload.summary || ''),
    highlights: (Array.isArray(sections.about?.highlights) && sections.about.highlights.length > 0)
      ? sections.about.highlights
      : (Array.isArray(payload.about?.highlights) ? payload.about.highlights : []),
  };

  const skillsData = Array.isArray(sections.skills) && sections.skills.length > 0
    ? sections.skills
    : (Array.isArray(payload.skills) ? payload.skills : (typeof sections.skills === 'object' || typeof payload.skills === 'object' ? (sections.skills || payload.skills) : []));

  const experienceData = Array.isArray(sections.experience) && sections.experience.length > 0
    ? sections.experience
    : (Array.isArray(payload.experience) ? payload.experience : []);

  const educationData = Array.isArray(sections.education) && sections.education.length > 0
    ? sections.education
    : (Array.isArray(payload.education) ? payload.education : []);

  const projectsData = Array.isArray(sections.projects) && sections.projects.length > 0
    ? sections.projects
    : (Array.isArray(payload.projects) ? payload.projects : []);

  const certsData = Array.isArray(sections.certifications) && sections.certifications.length > 0
    ? sections.certifications
    : (Array.isArray(payload.certifications) ? payload.certifications : []);

  const achievementsData = Array.isArray(sections.achievements) && sections.achievements.length > 0
    ? sections.achievements
    : (Array.isArray(payload.achievements) ? payload.achievements : []);

  const pubData = Array.isArray(sections.publications) && sections.publications.length > 0
    ? sections.publications
    : (Array.isArray(payload.publications) ? payload.publications : []);

  const contactData = {
    email: sections.contact?.email || payload.contact?.email || payload.email || payload.profile?.email || '',
    phone: sections.contact?.phone || payload.contact?.phone || payload.phone || payload.profile?.phone || '',
    location: sections.contact?.location || payload.contact?.location || payload.location || payload.profile?.location || '',
    website: sections.contact?.website || payload.contact?.website || payload.website || payload.profile?.website || '',
    socialLinks: (Array.isArray(sections.contact?.socialLinks) && sections.contact.socialLinks.length > 0)
      ? sections.contact.socialLinks
      : (Array.isArray(payload.contact?.socialLinks) && payload.contact.socialLinks.length > 0
          ? payload.contact.socialLinks
          : (Array.isArray(payload.socialLinks) ? payload.socialLinks : [])),
  };

  // Helper check if section has valid non-empty data and is not hidden
  const hasData = (key) => {
    // Hidden by user customization overrides
    if (Array.isArray(customization.hiddenSections) && customization.hiddenSections.includes(key)) {
      return false;
    }

    if (activeSections[key] !== undefined && !activeSections[key]) {
      return false;
    }

    switch (key) {
      case 'hero':
        return Boolean(heroData.headline && heroData.headline.trim().length > 0);
      case 'about':
        return Boolean(aboutData.bio && aboutData.bio.trim().length > 0);
      case 'skills':
      case 'skills_matrix':
        return (Array.isArray(skillsData) && skillsData.length > 0) || (typeof skillsData === 'object' && Object.keys(skillsData || {}).length > 0) || Boolean(sections.skills_matrix);
      
      // Unified showcase merging projects, internships, and certifications
      case 'showcase':
      case 'works':
      case 'projects_experience_certs':
      case 'projects':
      case 'experience':
      case 'certifications':
        return (
          (Array.isArray(projectsData) && projectsData.length > 0) ||
          (Array.isArray(experienceData) && experienceData.length > 0) ||
          (Array.isArray(certsData) && certsData.length > 0)
        );

      case 'education':
      case 'education_background':
        return (Array.isArray(educationData) && educationData.length > 0) || (Array.isArray(sections.education_background) && sections.education_background.length > 0);
      case 'achievements':
        return Array.isArray(achievementsData) && achievementsData.length > 0;
      case 'social_proof':
      case 'socialProof': {
        const sp = sections.socialProof || sections.social_proof || payload.socialProof || payload.sections?.socialProof;
        return Boolean(sp && typeof sp === 'object' && Object.keys(sp).length > 0);
      }
      case 'publications':
        return Array.isArray(pubData) && pubData.length > 0;
      case 'contact':
        return Boolean(
          contactData.email || 
          contactData.phone || 
          contactData.location || 
          contactData.website || 
          (Array.isArray(contactData.socialLinks) && contactData.socialLinks.length > 0)
        );
      default:
        return false;
    }
  };

  if (!hasData(sectionKey)) return null;

  switch (sectionKey) {
    case 'hero':
      return (
        <PortfolioHero
          heroData={heroData}
          aboutData={aboutData}
          contactData={contactData}
          resumeDownloadEnabled={Boolean(payload.resumeDownloadEnabled)}
          resumeDownloadUrl={payload.resumeDownloadUrl}
          themeConfig={themeConfig}
          customization={customization}
          hasAboutData={hasData('about')}
          hasContactData={hasData('contact')}
        />
      );

    case 'about':
      return (
        <PortfolioAbout
          aboutData={aboutData}
          themeConfig={themeConfig}
          customization={customization}
        />
      );

    case 'skills':
    case 'skills_matrix':
      return (
        <PortfolioSkills
          skillsData={skillsData}
          themeConfig={themeConfig}
          customization={customization}
        />
      );

    // Unified Merged Showcase merging projects, internships, and certifications
    case 'showcase':
    case 'works':
    case 'projects_experience_certs':
    case 'projects':
    case 'experience':
    case 'certifications':
      return (
        <PortfolioMergedShowcase
          projectsData={projectsData}
          experienceData={experienceData}
          certsData={certsData}
          customization={customization}
        />
      );

    case 'education':
    case 'education_background':
      return (
        <PortfolioEducation
          educationData={educationData}
          themeConfig={themeConfig}
          customization={customization}
        />
      );

    case 'achievements':
      return (
        <PortfolioAchievements
          achievementsData={achievementsData}
          themeConfig={themeConfig}
          customization={customization}
        />
      );

    case 'social_proof':
    case 'socialProof':
      return (
        <PortfolioSocialProof
          socialProofData={sections.socialProof || sections.social_proof || payload.socialProof || payload.sections?.socialProof}
          themeConfig={themeConfig}
          customization={customization}
        />
      );

    case 'publications':
      return (
        <section id="publications" key="publications" className={`${themeConfig.cardStyle || ''} space-y-6 relative overflow-hidden`}>
          <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
            <h2 className={`text-xl font-bold flex items-center gap-2.5 ${themeConfig.colors?.textPrimary || 'text-slate-900 dark:text-white'}`}>
              <div className="w-8 h-8 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/20 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" style={{ color: customization.accentColor || undefined }} />
              </div>
              <span>Publications & Research</span>
            </h2>
            <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
              SCHOLARLY WORKS
            </span>
          </div>

          <div className="space-y-3">
            {pubData.map((pub, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-2xl border flex items-center justify-between transition-all bg-white dark:bg-slate-950/80 border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]"
              >
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{pub.title}</div>
                  {pub.publisher && <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{pub.publisher}</div>}
                </div>
                {pub.url && (
                  <a 
                    href={pub.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-brand-purple border border-slate-200/80 dark:border-slate-800" 
                    style={{ color: customization.accentColor || undefined }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      );

    case 'contact':
      return (
        <PortfolioContact
          contactData={contactData}
          themeConfig={themeConfig}
          customization={customization}
        />
      );

    default:
      return null;
  }
};

export default PortfolioSectionRenderer;

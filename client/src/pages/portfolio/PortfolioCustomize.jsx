import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import LivePortfolioPreview from '../../components/portfolio/LivePortfolioPreview';
import { normalizeSkillsData } from '../../utils/portfolioCompiler';
import { 
  Palette, ArrowRight, Save, RotateCcw, CheckCircle2, Eye, Layout, 
  FileText, ShieldCheck, ChevronUp, ChevronDown, Plus, Trash2, Image,
  User, Briefcase, GraduationCap, Code2, Award, Sparkles, Share2, Mail, Globe,
  MapPin, ExternalLink, Terminal, Zap, Shield, Feather, Info, Layers
} from 'lucide-react';

const DEFAULT_SETTINGS = {
  theme: 'modern',
  primaryColor: '#6366f1',
  accentColor: '#ec4899',
  fontStyle: 'Inter',
  layout: 'single-page',
  heroStyle: 'split',
  projectCardStyle: 'grid',
  navigationStyle: 'top-pill',
  backgroundStyle: 'dark-slate',
  sectionOrder: ['hero', 'about', 'skills', 'showcase', 'education', 'achievements', 'contact'],
  hiddenSections: [],
  socialLinks: [],
};

const THEMES = [
  { 
    id: 'simple', 
    name: '1. Classic Simple', 
    desc: 'Clean resume-paper layout, subtle borders & balanced typography', 
    category: 'simple', 
    badge: 'RESUME CLEAN',
    icon: Feather 
  },
  { 
    id: 'minimal', 
    name: '2. Minimalist', 
    desc: 'Crisp monochrome typography, fine lines & compact spacing', 
    category: 'simple', 
    badge: 'MONOCHROME',
    icon: Layout 
  },
  { 
    id: 'modern', 
    name: '3. Modern Studio', 
    desc: 'Vibrant indigo accents, balanced cards, pill buttons & split hero', 
    category: 'modern', 
    badge: 'POPULAR',
    icon: Sparkles 
  },
  { 
    id: 'developer', 
    name: '4. Developer Terminal', 
    desc: 'Monospace terminal vibes, emerald & cyan prompt badges, code aesthetic', 
    category: 'developer', 
    badge: 'CODE FIRST',
    icon: Terminal 
  },
  { 
    id: 'creative', 
    name: '5. Creative Showcase', 
    desc: 'Generous padding, rounded cards, purple highlights & banner hero', 
    category: 'modern', 
    badge: 'SHOWCASE',
    icon: Zap 
  },
  { 
    id: 'executive', 
    name: '6. Executive Leadership', 
    desc: 'Midnight navy canvas, gold accents & top-border highlight cards', 
    category: 'executive', 
    badge: 'LEADERSHIP',
    icon: Shield 
  },
  { 
    id: 'cyberpunk', 
    name: '7. Cyberpunk Neon', 
    desc: 'Electric cyan & magenta glows, pitch-black canvas, high-tech grid', 
    category: 'modern', 
    badge: 'HIGH TECH',
    icon: Zap 
  },
  { 
    id: 'elegance', 
    name: '8. Luxury Elegance', 
    desc: 'Deep charcoal canvas, rose gold accents & refined editorial magazine feel', 
    category: 'executive', 
    badge: 'PREMIUM',
    icon: Award 
  },
];

const FONTS = ['Inter', 'Roboto', 'Outfit', 'JetBrains Mono', 'Playfair Display'];
const HERO_STYLES = ['split', 'centered', 'banner', 'executive'];
const PROJECT_CARD_STYLES = ['grid', 'compact-list', 'feature-cards'];
const BG_STYLES = ['dark-slate', 'midnight-navy', 'deep-purple', 'pitch-black'];
const PRIMARY_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#3b82f6'];
const ACCENT_COLORS = ['#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#3b82f6', '#ef4444'];

export const PortfolioCustomize = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [portfolioData, setPortfolioData] = useState({
    displayName: '',
    headline: '',
    bio: '',
    aboutHighlights: [],
    statusPill: 'Available for Opportunities',
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: [],
    socialLinks: [],
    contact: { email: '', phone: '', location: '', website: '' },
  });

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'style' | 'layout'
  const [contentSection, setContentSection] = useState('hero'); // sub-section inside content tab
  const [themeFilter, setThemeFilter] = useState('ALL');

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        const [portRes, profRes, resumeDataRes, parsedRes] = await Promise.all([
          apiService.getPortfolioBuilder().catch(() => null),
          apiService.getResumeProfile().catch(() => null),
          apiService.getResumeData('active').catch(() => null),
          apiService.getParsedResume().catch(() => null),
        ]);

        const d = portRes?.data || {};
        setPortfolio(d);

        // Extract structured resume data from all fallback candidates
        const resumeStruct = 
          profRes?.data?.profileData || 
          resumeDataRes?.data?.structuredData || 
          resumeDataRes?.data || 
          profRes?.data?.parsedData || 
          parsedRes?.data?.parsedData || 
          {};

        const personal = 
          resumeStruct.personal_information || 
          resumeStruct.personalInformation || 
          resumeStruct.personal || 
          {};

        const summary = 
          resumeStruct.professional_summary?.summary || 
          resumeStruct.summary || 
          resumeStruct.bio || 
          '';

        const pHero = d.sections?.hero || {};
        const pAbout = d.sections?.about || {};
        const pContact = d.sections?.contact || {};
        const pProf = d.profile || {};

        // 1. Display Name
        const resolvedName = d.displayName || pProf.name || pHero.headline || personal.full_name || personal.name || '';

        // 2. Headline
        const resolvedHeadline = d.headline || pProf.professionalTitle || pHero.subheadline || personal.job_title || personal.title || '';

        // 3. Bio
        const resolvedBio = d.bio || pProf.shortIntro || pAbout.bio || summary || '';

        // 4. About Highlights
        const resolvedHighlights = (Array.isArray(pAbout.highlights) && pAbout.highlights.length > 0)
          ? pAbout.highlights
          : (Array.isArray(d.about?.highlights) && d.about.highlights.length > 0)
          ? d.about.highlights
          : (Array.isArray(resumeStruct.highlights) && resumeStruct.highlights.length > 0)
          ? resumeStruct.highlights
          : [
              'Full Stack & Modern Web Architectures',
              'Production Solutions & RESTful APIs',
              'Continuous Integration & High-Quality Code',
            ];

        // 5. Hero Location & Status
        const resolvedLocation = pHero.location || pContact.location || d.location || personal.location || '';
        const resolvedStatusPill = pHero.statusPill || d.statusPill || 'Available for Opportunities';

        // 6. Skills
        let rawSkills = [];
        if (Array.isArray(d.sections?.skills) && d.sections.skills.length > 0) {
          rawSkills = d.sections.skills;
        } else if (Array.isArray(d.skills) && d.skills.length > 0) {
          rawSkills = d.skills;
        } else if (resumeStruct.skills) {
          rawSkills = normalizeSkillsData(resumeStruct.skills);
        }
        const resolvedSkills = normalizeSkillsData(rawSkills);

        // 7. Work Experience (Strictly conditional: if user has no work experience, remain empty array)
        let resolvedExp = [];
        if (Array.isArray(d.sections?.experience) && d.sections.experience.length > 0) {
          resolvedExp = d.sections.experience;
        } else if (Array.isArray(d.experience) && d.experience.length > 0) {
          resolvedExp = d.experience;
        } else {
          const rawResumeExp = resumeStruct.experience || resumeStruct.workExperience || resumeStruct.internships || [];
          if (Array.isArray(rawResumeExp) && rawResumeExp.length > 0) {
            resolvedExp = rawResumeExp.map(exp => ({
              title: exp.title || exp.role || exp.job_title || '',
              company: exp.company || exp.employer || '',
              duration: exp.duration || (exp.start_date ? `${exp.start_date} - ${exp.end_date || (exp.is_current ? 'Present' : '')}` : ''),
              location: exp.location || '',
              description: exp.description || (Array.isArray(exp.responsibilities) ? exp.responsibilities.join('\n') : (exp.responsibilities || '')),
            }));
          }
        }

        // 8. Projects
        let resolvedProjects = [];
        if (Array.isArray(d.sections?.projects) && d.sections.projects.length > 0) {
          resolvedProjects = d.sections.projects;
        } else if (Array.isArray(d.projects) && d.projects.length > 0) {
          resolvedProjects = d.projects;
        } else {
          const rawResumeProj = resumeStruct.projects || resumeStruct.project_descriptions || [];
          if (Array.isArray(rawResumeProj) && rawResumeProj.length > 0) {
            resolvedProjects = rawResumeProj.map(p => ({
              title: p.title || p.name || p.projectName || '',
              description: p.description || '',
              technologies: Array.isArray(p.technologies) 
                ? p.technologies 
                : (Array.isArray(p.tech_stack) ? p.tech_stack : (typeof p.technologies === 'string' ? p.technologies.split(',').map(s=>s.trim()).filter(Boolean) : [])),
              highlights: Array.isArray(p.highlights) ? p.highlights : (Array.isArray(p.features) ? p.features : []),
              githubUrl: p.githubUrl || p.github_url || p.link || '',
              liveUrl: p.liveUrl || p.live_url || '',
            }));
          }
        }

        // 9. Education
        let resolvedEdu = [];
        if (Array.isArray(d.sections?.education) && d.sections.education.length > 0) {
          resolvedEdu = d.sections.education;
        } else if (Array.isArray(d.education) && d.education.length > 0) {
          resolvedEdu = d.education;
        } else {
          const rawResumeEdu = resumeStruct.education || resumeStruct.education_background || [];
          if (Array.isArray(rawResumeEdu) && rawResumeEdu.length > 0) {
            resolvedEdu = rawResumeEdu.map(e => ({
              degree: e.degree || '',
              field: e.field || e.field_of_study || '',
              institution: e.institution || e.school || e.university || '',
              duration: e.duration || e.dates || (e.graduation_year ? `Class of ${e.graduation_year}` : ''),
              gpa: e.gpa || e.grade || '',
              location: e.location || '',
            }));
          }
        }

        // 10. Certifications
        let resolvedCerts = [];
        if (Array.isArray(d.sections?.certifications) && d.sections.certifications.length > 0) {
          resolvedCerts = d.sections.certifications;
        } else if (Array.isArray(d.certifications) && d.certifications.length > 0) {
          resolvedCerts = d.certifications;
        } else {
          const rawResumeCerts = resumeStruct.certifications || resumeStruct.certifications_credentials || [];
          if (Array.isArray(rawResumeCerts) && rawResumeCerts.length > 0) {
            resolvedCerts = rawResumeCerts.map(c => ({
              name: typeof c === 'string' ? c : (c.name || c.title || c.certificationName || ''),
              issuer: typeof c === 'string' ? '' : (c.issuer || c.issuingOrganization || ''),
              date: typeof c === 'string' ? '' : (c.date || c.issued || ''),
              credentialUrl: typeof c === 'string' ? '' : (c.credentialId || c.url || ''),
            }));
          }
        }

        // 11. Social Links
        let resolvedSocials = [];
        if (Array.isArray(d.socialLinks) && d.socialLinks.length > 0) {
          resolvedSocials = d.socialLinks;
        } else if (Array.isArray(pContact.socialLinks) && pContact.socialLinks.length > 0) {
          resolvedSocials = pContact.socialLinks;
        } else {
          const socials = [];
          if (personal.github) socials.push({ platform: 'GitHub', url: personal.github.startsWith('http') ? personal.github : `https://${personal.github}` });
          if (personal.linkedin || personal.linkedIn) {
            const li = personal.linkedin || personal.linkedIn;
            socials.push({ platform: 'LinkedIn', url: li.startsWith('http') ? li : `https://${li}` });
          }
          resolvedSocials = socials;
        }

        // 12. Contact
        const resolvedContact = {
          email: pContact.email || d.email || pProf.email || personal.email || '',
          phone: pContact.phone || d.phone || pProf.phone || personal.phone || '',
          location: resolvedLocation,
          website: pContact.website || d.website || pProf.website || personal.portfolio_url || personal.website || '',
        };

        setPortfolioData({
          displayName: resolvedName,
          headline: resolvedHeadline,
          bio: resolvedBio,
          aboutHighlights: resolvedHighlights,
          statusPill: resolvedStatusPill,
          skills: resolvedSkills,
          experience: resolvedExp,
          projects: resolvedProjects,
          education: resolvedEdu,
          certifications: resolvedCerts,
          achievements: Array.isArray(d.sections?.achievements) ? d.sections.achievements : (Array.isArray(d.achievements) ? d.achievements : []),
          socialLinks: resolvedSocials,
          contact: resolvedContact,
        });

        const cust = d.customization || {};
        setSettings((prev) => ({
          ...prev,
          theme: d.meta?.theme || d.theme || 'modern',
          primaryColor: cust.primaryColor || '#6366f1',
          accentColor: cust.accentColor || '#ec4899',
          fontStyle: cust.fontStyle || 'Inter',
          layout: cust.layout || 'single-page',
          heroStyle: cust.heroStyle || 'split',
          projectCardStyle: cust.projectCardStyle || 'grid',
          navigationStyle: cust.navigationStyle || 'top-pill',
          backgroundStyle: cust.backgroundStyle || 'dark-slate',
          hiddenSections: Array.isArray(cust.hiddenSections) ? cust.hiddenSections : [],
          sectionOrder: (() => {
            const raw = Array.isArray(cust.sectionOrder) && cust.sectionOrder.length > 0 ? cust.sectionOrder : prev.sectionOrder;
            const res = [];
            let seenShowcase = false;
            for (const s of raw) {
              if (['projects', 'experience', 'certifications', 'showcase'].includes(s)) {
                if (!seenShowcase) {
                  res.push('showcase');
                  seenShowcase = true;
                }
              } else if (!res.includes(s)) {
                res.push(s);
              }
            }
            if (!seenShowcase) res.push('showcase');
            return res;
          })(),
          socialLinks: resolvedSocials,
        }));
      } catch (err) {
        console.error('Failed to load portfolio for customization:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPortfolioData();
  }, [user?._id || user?.id]);

  const handleChangeSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleSection = (sectionId) => {
    setSettings((prev) => {
      const hidden = prev.hiddenSections.includes(sectionId)
        ? prev.hiddenSections.filter((s) => s !== sectionId)
        : [...prev.hiddenSections, sectionId];
      return { ...prev, hiddenSections: hidden };
    });
  };

  const handleMoveSection = (index, direction) => {
    setSettings((prev) => {
      const list = [...prev.sectionOrder];
      const newIdx = index + direction;
      if (newIdx < 0 || newIdx >= list.length) return prev;
      const temp = list[index];
      list[index] = list[newIdx];
      list[newIdx] = temp;
      return { ...prev, sectionOrder: list };
    });
  };

  const handleSaveCustomization = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updatedSections = {
        ...(portfolio?.sections || {}),
        hero: {
          headline: portfolioData.displayName,
          subheadline: portfolioData.headline,
          avatarUrl: settings.profileImage,
          location: portfolioData.contact.location,
          statusPill: portfolioData.statusPill || 'Available for Opportunities',
        },
        about: {
          bio: portfolioData.bio,
          highlights: portfolioData.aboutHighlights || [],
        },
        skills: portfolioData.skills,
        experience: portfolioData.experience,
        projects: portfolioData.projects,
        education: portfolioData.education,
        certifications: portfolioData.certifications,
        achievements: portfolioData.achievements,
        contact: {
          email: portfolioData.contact.email,
          phone: portfolioData.contact.phone,
          location: portfolioData.contact.location,
          website: portfolioData.contact.website,
          socialLinks: portfolioData.socialLinks,
        },
      };

      const payload = {
        displayName: portfolioData.displayName,
        headline: portfolioData.headline,
        bio: portfolioData.bio,
        theme: settings.theme,
        customization: settings,
        profile: {
          name: portfolioData.displayName,
          professionalTitle: portfolioData.headline,
          shortIntro: portfolioData.bio,
          profileImage: settings.profileImage,
          socialLinks: portfolioData.socialLinks,
          location: portfolioData.contact.location,
          website: portfolioData.contact.website,
        },
        about: { 
          bio: portfolioData.bio,
          highlights: portfolioData.aboutHighlights || [],
        },
        skills: portfolioData.skills,
        experience: portfolioData.experience,
        projects: portfolioData.projects,
        education: portfolioData.education,
        certifications: portfolioData.certifications,
        achievements: portfolioData.achievements,
        socialLinks: portfolioData.socialLinks,
        contact: portfolioData.contact,
        sections: updatedSections,
        meta: {
          ...(portfolio?.meta || {}),
          theme: settings.theme,
        },
      };

      await apiService.updatePortfolioCustomize(payload);
      setSaveSuccess(true);
      setToastMessage('Saved ✓ Portfolio changes saved to database!');
      setTimeout(() => {
        setSaveSuccess(false);
        setToastMessage(null);
      }, 3500);
    } catch (err) {
      setToastMessage(`Unable to save: ${err.message}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setToastMessage('Settings reset to safe default theme preset');
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs font-mono text-slate-400">
        Loading portfolio editor...
      </div>
    );
  }

  // Single source of truth for preview canvas
  const liveRenderData = {
    ...(portfolio || {}),
    displayName: portfolioData.displayName || '',
    headline: portfolioData.headline || '',
    bio: portfolioData.bio || '',
    skills: portfolioData.skills,
    experience: portfolioData.experience,
    projects: portfolioData.projects,
    education: portfolioData.education,
    certifications: portfolioData.certifications,
    achievements: portfolioData.achievements,
    socialLinks: portfolioData.socialLinks,
    theme: settings.theme,
    meta: {
      ...(portfolio?.meta || {}),
      theme: settings.theme,
    },
    customization: {
      ...settings,
      theme: settings.theme,
    },
    sections: {
      ...(portfolio?.sections || {}),
      hero: {
        headline: portfolioData.displayName || '',
        subheadline: portfolioData.headline || '',
        avatarUrl: settings.profileImage,
        location: portfolioData.contact.location || '',
        statusPill: portfolioData.statusPill || 'Available for Opportunities',
      },
      about: {
        bio: portfolioData.bio || '',
        highlights: portfolioData.aboutHighlights || [],
      },
      skills: portfolioData.skills,
      experience: portfolioData.experience,
      projects: portfolioData.projects,
      education: portfolioData.education,
      certifications: portfolioData.certifications,
      achievements: portfolioData.achievements,
      contact: {
        email: portfolioData.contact.email,
        phone: portfolioData.contact.phone,
        location: portfolioData.contact.location,
        website: portfolioData.contact.website,
        socialLinks: portfolioData.socialLinks,
      },
    },
  };

  const filteredThemes = themeFilter === 'ALL'
    ? THEMES
    : THEMES.filter(t => t.category.toLowerCase() === themeFilter.toLowerCase());

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-brand-purple" />
            Portfolio Studio & Live Content Editor
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Edit your live portfolio content, themes, and layout order with immediate visual feedback
          </p>
        </div>

        <div className="flex items-center gap-3">
          {toastMessage && (
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {toastMessage}
            </span>
          )}

          <button
            onClick={handleReset}
            type="button"
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Preset
          </button>

          <button
            onClick={handleSaveCustomization}
            disabled={saving}
            className={`px-5 py-2 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all ${
              saveSuccess
                ? 'bg-emerald-600'
                : 'bg-gradient-to-r from-brand-indigo to-brand-purple hover:opacity-90'
            }`}
          >
            {saveSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : saveSuccess ? 'Saved ✓' : 'Save Portfolio'}</span>
          </button>

          <button
            onClick={() => {
              handleSaveCustomization();
              navigate('/portfolio/preview');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold flex items-center gap-2 hover:bg-slate-700"
          >
            <span>Preview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* WORKSPACE GRID: LEFT EDITOR (5 COLS), RIGHT PREVIEW (7 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT EDITING CONTROLS PANEL */}
        <div className="lg:col-span-5 space-y-5">

          {/* MAIN NAVIGATION TABS */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 gap-1">
            {[
              { id: 'content', name: 'Edit Content', icon: FileText },
              { id: 'style', name: 'Themes & Colors', icon: Palette },
              { id: 'layout', name: 'Layout & Order', icon: Layout },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === t.id
                    ? 'bg-white dark:bg-slate-800 text-brand-purple shadow-sm'
                    : 'text-slate-500 hover:text-white'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" /> {t.name}
              </button>
            ))}
          </div>

          {/* TAB 1: EDIT PORTFOLIO CONTENT (FULL SECTION BY SECTION EDITOR) */}
          {activeTab === 'content' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
              
              {/* Section selector pills */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar gap-1.5 pb-2">
                {[
                  { id: 'hero', label: 'Hero', icon: User },
                  { id: 'about', label: 'About', icon: FileText },
                  { id: 'skills', label: 'Skills', icon: Code2 },
                  { id: 'experience', label: 'Experience', icon: Briefcase },
                  { id: 'projects', label: 'Projects', icon: Sparkles },
                  { id: 'education', label: 'Education', icon: GraduationCap },
                  { id: 'certifications', label: 'Certs', icon: Award },
                  { id: 'contact', label: 'Contact', icon: Mail },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setContentSection(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-colors ${
                      contentSection === s.id
                        ? 'bg-brand-indigo/10 text-brand-purple border border-brand-indigo/30'
                        : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    <s.icon className="w-3.5 h-3.5" /> {s.label}
                  </button>
                ))}
              </div>

              {/* 1. HERO SECTION EDITOR */}
              {contentSection === 'hero' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-brand-purple" /> Hero & Headline Content
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={portfolioData.displayName}
                      onChange={(e) => setPortfolioData({ ...portfolioData, displayName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                      placeholder="e.g. Sowmya Shahukari"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Professional Headline / Subtitle</label>
                    <input
                      type="text"
                      value={portfolioData.headline}
                      onChange={(e) => setPortfolioData({ ...portfolioData, headline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                      placeholder="e.g. Senior Software Engineer & Full-Stack Architect"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                      <input
                        type="text"
                        value={portfolioData.contact.location}
                        onChange={(e) => setPortfolioData({
                          ...portfolioData,
                          contact: { ...portfolioData.contact, location: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                        placeholder="e.g. Hyderabad, India"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Pill / Availability</label>
                      <input
                        type="text"
                        value={portfolioData.statusPill}
                        onChange={(e) => setPortfolioData({ ...portfolioData, statusPill: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                        placeholder="e.g. Available for Opportunities"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Profile Photo URL</label>
                    <input
                      type="text"
                      value={settings.profileImage}
                      onChange={(e) => handleChangeSetting('profileImage', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              )}

              {/* 2. ABOUT SECTION EDITOR */}
              {contentSection === 'about' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-brand-purple" /> About & Bio Content
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Professional Summary / Bio</label>
                    <textarea
                      rows={6}
                      value={portfolioData.bio}
                      onChange={(e) => setPortfolioData({ ...portfolioData, bio: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white leading-relaxed"
                      placeholder="Write your professional bio and technical summary..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Key Highlights (comma-separated badges)
                    </label>
                    <input
                      type="text"
                      value={Array.isArray(portfolioData.aboutHighlights) ? portfolioData.aboutHighlights.join(', ') : ''}
                      onChange={(e) => {
                        const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setPortfolioData({ ...portfolioData, aboutHighlights: arr });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                      placeholder="e.g. Full Stack Architect, Cloud Solutions, High Performance Code"
                    />
                  </div>
                </div>
              )}

              {/* 3. SKILLS EDITOR */}
              {contentSection === 'skills' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-brand-purple" /> Technical Skills Matrix ({portfolioData.skills.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPortfolioData(prev => ({
                        ...prev,
                        skills: [...prev.skills, { category: 'Core Skills', items: ['React', 'JavaScript'] }]
                      }))}
                      className="px-2.5 py-1 rounded-lg bg-brand-indigo/10 text-brand-purple text-[11px] font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Category
                    </button>
                  </div>

                  <div className="space-y-3">
                    {portfolioData.skills.map((group, idx) => {
                      const isObj = typeof group === 'object' && group !== null;
                      const catName = isObj ? (group.category || 'Category') : 'Skill';
                      const itemsStr = isObj ? (Array.isArray(group.items) ? group.items.join(', ') : '') : String(group);

                      return (
                        <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={catName}
                              onChange={(e) => {
                                const list = [...portfolioData.skills];
                                list[idx] = { ...list[idx], category: e.target.value };
                                setPortfolioData({ ...portfolioData, skills: list });
                              }}
                              className="px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white w-48"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const list = portfolioData.skills.filter((_, i) => i !== idx);
                                setPortfolioData({ ...portfolioData, skills: list });
                              }}
                              className="p-1 text-rose-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Skill items (comma-separated)..."
                            value={itemsStr}
                            onChange={(e) => {
                              const val = e.target.value;
                              const arr = val.split(',').map(s => s.trim()).filter(Boolean);
                              const list = [...portfolioData.skills];
                              list[idx] = { ...list[idx], items: arr };
                              setPortfolioData({ ...portfolioData, skills: list });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. EXPERIENCE EDITOR (STRICTLY CONDITIONAL IF USER HAS EXPERIENCE) */}
              {contentSection === 'experience' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-start gap-2.5 text-xs">
                    <Info className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
                    <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      <strong>Work Experience is Optional:</strong> If you are a fresher or student and leave this empty, the experience section is cleanly hidden from your live portfolio.
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-brand-purple" /> Work Experience ({portfolioData.experience.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPortfolioData(prev => ({
                        ...prev,
                        experience: [...prev.experience, { title: 'Software Engineer', company: 'Tech Corp', duration: '2023 - Present', location: 'Remote', description: '' }]
                      }))}
                      className="px-2.5 py-1 rounded-lg bg-brand-indigo/10 text-brand-purple text-[11px] font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Role
                    </button>
                  </div>

                  {portfolioData.experience.length === 0 ? (
                    <div className="p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
                      <Briefcase className="w-6 h-6 text-slate-400 mx-auto" />
                      <div className="text-xs font-medium text-slate-500">No work experience added yet</div>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        Perfect for freshers & students. Click "Add Role" above if you'd like to include work or internship history.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {portfolioData.experience.map((exp, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">Position #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const list = portfolioData.experience.filter((_, i) => i !== idx);
                                setPortfolioData({ ...portfolioData, experience: list });
                              }}
                              className="p-1 text-rose-400 hover:text-rose-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Job Title"
                              value={exp.title || ''}
                              onChange={(e) => {
                                const list = [...portfolioData.experience];
                                list[idx] = { ...list[idx], title: e.target.value };
                                setPortfolioData({ ...portfolioData, experience: list });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Company"
                              value={exp.company || ''}
                              onChange={(e) => {
                                const list = [...portfolioData.experience];
                                list[idx] = { ...list[idx], company: e.target.value };
                                setPortfolioData({ ...portfolioData, experience: list });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Duration (e.g. Jan 2023 - Present)"
                              value={exp.duration || ''}
                              onChange={(e) => {
                                const list = [...portfolioData.experience];
                                list[idx] = { ...list[idx], duration: e.target.value };
                                setPortfolioData({ ...portfolioData, experience: list });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Location (e.g. San Francisco, CA)"
                              value={exp.location || ''}
                              onChange={(e) => {
                                const list = [...portfolioData.experience];
                                list[idx] = { ...list[idx], location: e.target.value };
                                setPortfolioData({ ...portfolioData, experience: list });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                          <textarea
                            rows={3}
                            placeholder="Key responsibilities & impact (bullet points or paragraph)..."
                            value={exp.description || ''}
                            onChange={(e) => {
                              const list = [...portfolioData.experience];
                              list[idx] = { ...list[idx], description: e.target.value };
                              setPortfolioData({ ...portfolioData, experience: list });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 5. PROJECTS EDITOR */}
              {contentSection === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-brand-purple" /> Featured Projects ({portfolioData.projects.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPortfolioData(prev => ({
                        ...prev,
                        projects: [...prev.projects, { title: 'New Project', description: '', technologies: ['React', 'Node.js'], githubUrl: '', liveUrl: '' }]
                      }))}
                      className="px-2.5 py-1 rounded-lg bg-brand-indigo/10 text-brand-purple text-[11px] font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Project
                    </button>
                  </div>

                  <div className="space-y-3">
                    {portfolioData.projects.map((proj, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            placeholder="Project Title"
                            value={proj.title || proj.name || ''}
                            onChange={(e) => {
                              const list = [...portfolioData.projects];
                              list[idx] = { ...list[idx], title: e.target.value, name: e.target.value };
                              setPortfolioData({ ...portfolioData, projects: list });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const list = portfolioData.projects.filter((_, i) => i !== idx);
                              setPortfolioData({ ...portfolioData, projects: list });
                            }}
                            className="p-1 text-rose-400 hover:text-rose-500 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <textarea
                          rows={2}
                          placeholder="Project description & key features..."
                          value={proj.description || ''}
                          onChange={(e) => {
                            const list = [...portfolioData.projects];
                            list[idx] = { ...list[idx], description: e.target.value };
                            setPortfolioData({ ...portfolioData, projects: list });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                        />

                        <input
                          type="text"
                          placeholder="Technologies (comma-separated)..."
                          value={Array.isArray(proj.technologies) ? proj.technologies.join(', ') : (proj.technologies || '')}
                          onChange={(e) => {
                            const val = e.target.value;
                            const arr = val.split(',').map(s => s.trim()).filter(Boolean);
                            const list = [...portfolioData.projects];
                            list[idx] = { ...list[idx], technologies: arr };
                            setPortfolioData({ ...portfolioData, projects: list });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                        />

                        <input
                          type="text"
                          placeholder="Key highlights / bullets (comma-separated)..."
                          value={Array.isArray(proj.highlights) ? proj.highlights.join(', ') : (Array.isArray(proj.features) ? proj.features.join(', ') : '')}
                          onChange={(e) => {
                            const val = e.target.value;
                            const arr = val.split(',').map(s => s.trim()).filter(Boolean);
                            const list = [...portfolioData.projects];
                            list[idx] = { ...list[idx], highlights: arr, features: arr };
                            setPortfolioData({ ...portfolioData, projects: list });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="GitHub URL"
                            value={proj.githubUrl || proj.github_url || ''}
                            onChange={(e) => {
                              const list = [...portfolioData.projects];
                              list[idx] = { ...list[idx], githubUrl: e.target.value, github_url: e.target.value };
                              setPortfolioData({ ...portfolioData, projects: list });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Live App URL"
                            value={proj.liveUrl || proj.live_url || ''}
                            onChange={(e) => {
                              const list = [...portfolioData.projects];
                              list[idx] = { ...list[idx], liveUrl: e.target.value, live_url: e.target.value };
                              setPortfolioData({ ...portfolioData, projects: list });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. EDUCATION EDITOR */}
              {contentSection === 'education' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-brand-purple" /> Education & Degrees ({portfolioData.education.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPortfolioData(prev => ({
                        ...prev,
                        education: [...prev.education, { degree: 'B.Tech / B.S.', field: 'Computer Science', institution: 'University', duration: '2020 - 2024', gpa: '3.8 / 4.0', location: '' }]
                      }))}
                      className="px-2.5 py-1 rounded-lg bg-brand-indigo/10 text-brand-purple text-[11px] font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Degree
                    </button>
                  </div>

                  <div className="space-y-3">
                    {portfolioData.education.map((edu, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            placeholder="Degree (e.g. B.Tech Computer Science)"
                            value={edu.degree || ''}
                            onChange={(e) => {
                              const list = [...portfolioData.education];
                              list[idx] = { ...list[idx], degree: e.target.value };
                              setPortfolioData({ ...portfolioData, education: list });
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const list = portfolioData.education.filter((_, i) => i !== idx);
                              setPortfolioData({ ...portfolioData, education: list });
                            }}
                            className="p-1 text-rose-400 hover:text-rose-500 ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Field of Study / Major"
                            value={edu.field || edu.field_of_study || ''}
                            onChange={(e) => {
                              const list = [...portfolioData.education];
                              list[idx] = { ...list[idx], field: e.target.value, field_of_study: e.target.value };
                              setPortfolioData({ ...portfolioData, education: list });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                          <input
                            type="text"
                            placeholder="Institution / University"
                            value={edu.institution || ''}
                            onChange={(e) => {
                              const list = [...portfolioData.education];
                              list[idx] = { ...list[idx], institution: e.target.value };
                              setPortfolioData({ ...portfolioData, education: list });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Duration / Class (e.g. 2020 - 2024)"
                            value={edu.duration || ''}
                            onChange={(e) => {
                              const list = [...portfolioData.education];
                              list[idx] = { ...list[idx], duration: e.target.value };
                              setPortfolioData({ ...portfolioData, education: list });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                          <input
                            type="text"
                            placeholder="GPA / Grade (e.g. 3.9 / 4.0)"
                            value={edu.gpa || ''}
                            onChange={(e) => {
                              const list = [...portfolioData.education];
                              list[idx] = { ...list[idx], gpa: e.target.value };
                              setPortfolioData({ ...portfolioData, education: list });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. CERTIFICATIONS EDITOR */}
              {contentSection === 'certifications' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-brand-purple" /> Certifications ({portfolioData.certifications.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => setPortfolioData(prev => ({
                        ...prev,
                        certifications: [...prev.certifications, { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2024', credentialUrl: '' }]
                      }))}
                      className="px-2.5 py-1 rounded-lg bg-brand-indigo/10 text-brand-purple text-[11px] font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Cert
                    </button>
                  </div>

                  <div className="space-y-3">
                    {portfolioData.certifications.map((cert, idx) => {
                      const cName = typeof cert === 'string' ? cert : (cert.name || cert.title || '');
                      const cIssuer = typeof cert === 'object' ? (cert.issuer || '') : '';
                      const cDate = typeof cert === 'object' ? (cert.date || '') : '';
                      const cUrl = typeof cert === 'object' ? (cert.credentialUrl || cert.url || '') : '';

                      return (
                        <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              placeholder="Certification Name"
                              value={cName}
                              onChange={(e) => {
                                const list = [...portfolioData.certifications];
                                list[idx] = { ...(list[idx] || {}), name: e.target.value };
                                setPortfolioData({ ...portfolioData, certifications: list });
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const list = portfolioData.certifications.filter((_, i) => i !== idx);
                                setPortfolioData({ ...portfolioData, certifications: list });
                              }}
                              className="p-1 text-rose-400 hover:text-rose-500 ml-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Issuing Organization"
                              value={cIssuer}
                              onChange={(e) => {
                                const list = [...portfolioData.certifications];
                                list[idx] = { ...(list[idx] || {}), issuer: e.target.value };
                                setPortfolioData({ ...portfolioData, certifications: list });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Issue Date (e.g. 2024)"
                              value={cDate}
                              onChange={(e) => {
                                const list = [...portfolioData.certifications];
                                list[idx] = { ...(list[idx] || {}), date: e.target.value };
                                setPortfolioData({ ...portfolioData, certifications: list });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Credential Verification URL"
                            value={cUrl}
                            onChange={(e) => {
                              const list = [...portfolioData.certifications];
                              list[idx] = { ...(list[idx] || {}), credentialUrl: e.target.value, url: e.target.value };
                              setPortfolioData({ ...portfolioData, certifications: list });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 8. CONTACT EDITOR */}
              {contentSection === 'contact' && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-brand-purple" /> Contact Information & Social Links
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
                      <input
                        type="text"
                        value={portfolioData.contact.email}
                        onChange={(e) => setPortfolioData({
                          ...portfolioData,
                          contact: { ...portfolioData.contact, email: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                      <input
                        type="text"
                        value={portfolioData.contact.phone}
                        onChange={(e) => setPortfolioData({
                          ...portfolioData,
                          contact: { ...portfolioData.contact, phone: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                      <input
                        type="text"
                        value={portfolioData.contact.location}
                        onChange={(e) => setPortfolioData({
                          ...portfolioData,
                          contact: { ...portfolioData.contact, location: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Personal Website / Portfolio</label>
                      <input
                        type="text"
                        value={portfolioData.contact.website}
                        onChange={(e) => setPortfolioData({
                          ...portfolioData,
                          contact: { ...portfolioData.contact, website: e.target.value }
                        })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  {/* Social links */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 dark:text-slate-200">Social Links ({portfolioData.socialLinks.length})</label>
                      <button
                        type="button"
                        onClick={() => setPortfolioData(prev => ({
                          ...prev,
                          socialLinks: [...prev.socialLinks, { platform: 'GitHub', url: 'https://github.com' }]
                        }))}
                        className="px-2.5 py-1 rounded-lg bg-brand-indigo/10 text-brand-purple text-[11px] font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Link
                      </button>
                    </div>

                    <div className="space-y-2">
                      {portfolioData.socialLinks.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Platform"
                            value={s.platform || ''}
                            onChange={(e) => {
                              const list = [...portfolioData.socialLinks];
                              list[idx] = { ...list[idx], platform: e.target.value };
                              setPortfolioData({ ...portfolioData, socialLinks: list });
                            }}
                            className="w-28 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                          <input
                            type="text"
                            placeholder="URL"
                            value={s.url || ''}
                            onChange={(e) => {
                              const list = [...portfolioData.socialLinks];
                              list[idx] = { ...list[idx], url: e.target.value };
                              setPortfolioData({ ...portfolioData, socialLinks: list });
                            }}
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const list = portfolioData.socialLinks.filter((_, i) => i !== idx);
                              setPortfolioData({ ...portfolioData, socialLinks: list });
                            }}
                            className="p-1 text-rose-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: THEMES, COLORS & TYPOGRAPHY */}
          {activeTab === 'style' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
              
              {/* 1. Theme Presets with Category Filter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Dynamic Portfolio Templates ({THEMES.length})
                  </label>
                  <span className="text-[10px] font-mono text-brand-purple font-bold">SIMPLE TO MODERN</span>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar pb-1">
                  {['ALL', 'SIMPLE', 'MODERN', 'DEVELOPER', 'EXECUTIVE'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setThemeFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                        themeFilter === cat
                          ? 'bg-brand-purple text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Theme Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {filteredThemes.map((t) => {
                    const isSelected = settings.theme === t.id;
                    const IconComp = t.icon || Sparkles;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleChangeSetting('theme', t.id)}
                        className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'bg-brand-indigo/10 border-brand-purple text-brand-purple ring-1 ring-brand-purple shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1.5">
                            <IconComp className="w-3.5 h-3.5 shrink-0" />
                            <div className="font-bold text-xs">{t.name}</div>
                          </div>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-brand-purple text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {t.badge}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-2">
                          {t.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Color Accents */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Primary Accent</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRIMARY_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleChangeSetting('primaryColor', c)}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          settings.primaryColor === c ? 'scale-125 ring-2 ring-white' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Accent Highlight</label>
                  <div className="flex flex-wrap gap-1.5">
                    {ACCENT_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleChangeSetting('accentColor', c)}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          settings.accentColor === c ? 'scale-125 ring-2 ring-white' : ''
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Typography & Background Style */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Typography Font</label>
                  <select
                    value={settings.fontStyle}
                    onChange={(e) => handleChangeSetting('fontStyle', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                  >
                    {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Background Palette</label>
                  <select
                    value={settings.backgroundStyle}
                    onChange={(e) => handleChangeSetting('backgroundStyle', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                  >
                    {BG_STYLES.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: LAYOUT & SECTION ORDERING */}
          {activeTab === 'layout' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
              
              {/* 1. Layout Mode & Components */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Hero Layout Style</label>
                  <select
                    value={settings.heroStyle}
                    onChange={(e) => handleChangeSetting('heroStyle', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                  >
                    {HERO_STYLES.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">Project Card Style</label>
                  <select
                    value={settings.projectCardStyle}
                    onChange={(e) => handleChangeSetting('projectCardStyle', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white"
                  >
                    {PROJECT_CARD_STYLES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* 2. Section Visibility & Ordering */}
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Reorder & Toggle Sections</label>
                <div className="space-y-2">
                  {settings.sectionOrder.map((secKey, idx) => {
                    const isHidden = settings.hiddenSections.includes(secKey);
                    const sectionLabelMap = {
                      hero: 'Hero & Headline Banner',
                      about: 'About Me & Highlights',
                      skills: 'Technical Skills Matrix',
                      showcase: 'Projects, Internships & Certs (Merged Showcase)',
                      projects: 'Projects, Internships & Certs (Merged Showcase)',
                      experience: 'Internships & Work Experience',
                      education: 'Education Section',
                      certifications: 'Certifications',
                      achievements: 'Achievements & Awards',
                      contact: 'Contact & Social Connections',
                    };
                    return (
                      <div
                        key={secKey}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                          isHidden
                            ? 'bg-slate-100 dark:bg-slate-950/40 text-slate-400 border-slate-200 dark:border-slate-800 opacity-60'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <span className="font-bold">{sectionLabelMap[secKey] || `${secKey} Section`}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => handleMoveSection(idx, -1)} disabled={idx === 0} className="p-1 disabled:opacity-30 hover:text-brand-purple"><ChevronUp className="w-3.5 h-3.5" /></button>
                          <button type="button" onClick={() => handleMoveSection(idx, 1)} disabled={idx === settings.sectionOrder.length - 1} className="p-1 disabled:opacity-30 hover:text-brand-purple"><ChevronDown className="w-3.5 h-3.5" /></button>
                          <button type="button" onClick={() => handleToggleSection(secKey)} className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-indigo/10 text-brand-purple">
                            {isHidden ? 'Show' : 'Hide'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT LIVE PREVIEW CANVAS (7 COLS) */}
        <div className="lg:col-span-7 space-y-3 sticky top-6">
          
          {/* Quick Template Switcher Toolbar above preview */}
          <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-2 shadow-xs">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-purple" />
                Templates (Simple to Modern):
              </span>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Live Updates
              </span>
            </div>

            {/* Quick Template Switcher Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
              {THEMES.map((t) => {
                const isSelected = settings.theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleChangeSetting('theme', t.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-brand-purple text-white shadow-xs scale-[1.02]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                  >
                    <span>{t.name.split('. ')[1] || t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="rounded-3xl border border-slate-800 overflow-hidden shadow-2xl max-h-[75vh] overflow-y-auto no-scrollbar bg-slate-950">
            <LivePortfolioPreview portfolio={liveRenderData} previewConfig={settings} theme={settings.theme} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default PortfolioCustomize;

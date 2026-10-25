import React, { useState, useMemo } from 'react';
import { 
  Briefcase, Sparkles, Award, ExternalLink, Github, Calendar, 
  MapPin, CheckCircle2, FolderGit2, Terminal, Shield, Layers, 
  Code2, Globe, ArrowUpRight, Zap, Check, ChevronRight
} from 'lucide-react';
import { usePortfolioTheme } from './PortfolioThemeProvider';

export const PortfolioMergedShowcase = ({
  projectsData = [],
  experienceData = [],
  certsData = [],
  customization = {},
}) => {
  const { themeConfig, themeKey, isDark } = usePortfolioTheme();
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'PROJECTS' | 'EXPERIENCE' | 'CERTS'
  const accentColor = customization.accentColor;
  const primaryColor = customization.primaryColor;

  const hasExperience = Array.isArray(experienceData) && experienceData.length > 0;
  const hasProjects = Array.isArray(projectsData) && projectsData.length > 0;
  const hasCerts = Array.isArray(certsData) && certsData.length > 0;

  // Normalize all items into a single unified timeline/feed
  const unifiedItems = useMemo(() => {
    const list = [];

    // 1. Projects
    if (hasProjects) {
      projectsData.forEach((p, idx) => {
        list.push({
          type: 'project',
          id: `proj-${idx}`,
          title: p.title || p.projectName || p.name || 'Project',
          subtitle: Array.isArray(p.technologies) ? p.technologies.join(' • ') : (p.technologies || ''),
          description: p.description || '',
          technologies: Array.isArray(p.technologies) ? p.technologies : [],
          highlights: Array.isArray(p.highlights) ? p.highlights : (Array.isArray(p.features) ? p.features : []),
          githubUrl: p.githubUrl || p.github_url || (p.link && p.link.includes('github') ? p.link : ''),
          liveUrl: p.liveUrl || p.live_url || (p.link && !p.link.includes('github') ? p.link : ''),
          badge: 'PROJECT',
          badgeColor: 'indigo',
        });
      });
    }

    // 2. Internships / Experience (strictly if user has experience)
    if (hasExperience) {
      experienceData.forEach((exp, idx) => {
        const start = exp.startDate || exp.start_date || '';
        const end = exp.endDate || exp.end_date || (exp.current ? 'Present' : '');
        const duration = exp.duration || (start ? `${start} — ${end || 'Present'}` : '');
        const bullets = Array.isArray(exp.responsibilities)
          ? exp.responsibilities
          : (Array.isArray(exp.highlights)
              ? exp.highlights
              : (typeof exp.responsibilities === 'string' && exp.responsibilities.includes('\n')
                  ? exp.responsibilities.split('\n').map(s => s.trim().replace(/^[-*•]\s*/, '')).filter(Boolean)
                  : []));

        list.push({
          type: 'experience',
          id: `exp-${idx}`,
          title: exp.title || exp.role || exp.job_title || 'Position',
          subtitle: exp.company || exp.employer || '',
          duration,
          location: exp.location || '',
          description: exp.description || '',
          highlights: bullets,
          technologies: [],
          badge: 'INTERNSHIP / ROLE',
          badgeColor: 'emerald',
        });
      });
    }

    // 3. Certifications
    if (hasCerts) {
      certsData.forEach((cert, idx) => {
        const cName = typeof cert === 'string' ? cert : (cert.name || cert.certificationName || cert.title || '');
        const cIssuer = typeof cert === 'string' ? '' : (cert.issuer || cert.issuingOrganization || '');
        const cDate = typeof cert === 'string' ? '' : (cert.date || cert.issued || '');
        const cUrl = typeof cert === 'string' ? '' : (cert.credentialUrl || cert.credentialId || cert.url || '');

        list.push({
          type: 'cert',
          id: `cert-${idx}`,
          title: cName,
          subtitle: cIssuer,
          duration: cDate ? `Issued ${cDate}` : '',
          credentialUrl: cUrl,
          badge: 'CERTIFICATION',
          badgeColor: 'amber',
        });
      });
    }

    return list;
  }, [projectsData, experienceData, certsData, hasProjects, hasExperience, hasCerts]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (activeFilter === 'PROJECTS') return unifiedItems.filter(i => i.type === 'project');
    if (activeFilter === 'EXPERIENCE') return unifiedItems.filter(i => i.type === 'experience');
    if (activeFilter === 'CERTS') return unifiedItems.filter(i => i.type === 'cert');
    return unifiedItems;
  }, [unifiedItems, activeFilter]);

  if (unifiedItems.length === 0) {
    return null;
  }

  // Calculate counts
  const projectCount = unifiedItems.filter(i => i.type === 'project').length;
  const expCount = unifiedItems.filter(i => i.type === 'experience').length;
  const certCount = unifiedItems.filter(i => i.type === 'cert').length;

  const currentTheme = themeKey ? themeKey.toLowerCase().trim() : 'modern';
  const isDeveloper = currentTheme.includes('developer') || currentTheme.includes('terminal');
  const isCyberpunk = currentTheme.includes('cyberpunk') || currentTheme.includes('neon');
  const isExecutive = currentTheme.includes('executive');
  const isSimple = currentTheme.includes('simple');
  const isMinimal = currentTheme.includes('minimal');
  const isCreative = currentTheme.includes('creative');
  const isElegance = currentTheme.includes('elegance');

  // =========================================================================
  // VARIANT 1: DEVELOPER TERMINAL MERGED SHOWCASE
  // Complete code terminal CLI interface with $ ls ./projects, cat ./internships
  // =========================================================================
  if (isDeveloper) {
    return (
      <section id="works" className="rounded-2xl border border-emerald-900/60 bg-[#070b12] text-emerald-300 font-mono overflow-hidden shadow-2xl">
        {/* Terminal Header Bar */}
        <div className="bg-[#0e1626] px-4 py-3 border-b border-emerald-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            <span className="text-xs text-slate-400 font-mono ml-2">bash — sowmya@portfolio: ~/showcase (git:main*)</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-bold hidden sm:flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>PORTFOLIO_HUB // MERGED_INDEX</span>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          {/* Terminal Command Line */}
          <div className="text-xs text-slate-400 space-y-1 bg-black/40 p-3 rounded-xl border border-emerald-900/40">
            <div className="text-emerald-400 font-bold">$ cat portfolio_manifest.json</div>
            <div className="text-slate-300 text-[11px]">
              &gt; Loading unified projects ({projectCount}), internships/experience ({expCount}), and certificates ({certCount})...
            </div>
          </div>

          {/* Terminal Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {[
              { id: 'ALL', label: `$ ls -la ./all/ (${unifiedItems.length})` },
              { id: 'PROJECTS', label: `$ ./projects.sh (${projectCount})` },
              ...(hasExperience ? [{ id: 'EXPERIENCE', label: `$ cat ./internships.log (${expCount})` }] : []),
              { id: 'CERTS', label: `$ openssl verify ./certs (${certCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                  activeFilter === tab.id
                    ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/30'
                    : 'bg-[#0f172a] text-emerald-400/80 hover:bg-emerald-950/60 border border-emerald-900/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Items Grid in Terminal Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <div 
                key={item.id}
                className="p-5 rounded-xl border border-emerald-900/50 bg-[#0a0f1d] hover:border-emerald-400/60 transition-all space-y-3 relative group"
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="text-emerald-500">➜</span>
                    <span className="uppercase">{item.badge}</span>
                  </span>
                  {item.duration && (
                    <span className="text-slate-400 font-mono">{item.duration}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-emerald-200 group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <div className="text-xs text-slate-400 font-mono">{item.subtitle}</div>
                  )}
                  {item.location && (
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" /> {item.location}
                    </div>
                  )}
                </div>

                {item.description && (
                  <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-3">
                    {item.description}
                  </p>
                )}

                {item.highlights && item.highlights.length > 0 && (
                  <ul className="text-[11px] text-slate-400 space-y-1 pl-1">
                    {item.highlights.slice(0, 3).map((h, i) => (
                      <li key={i} className="flex items-start gap-1.5 font-sans">
                        <span className="text-emerald-400 shrink-0 mt-0.5">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {item.technologies && item.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {item.technologies.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-400 text-[10px]">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between border-t border-emerald-900/40 text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">STATUS: OK // EXIT_0</span>
                  <div className="flex items-center gap-2">
                    {item.githubUrl && (
                      <a href={item.githubUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded bg-emerald-950 text-emerald-300 hover:text-white" title="GitHub">
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {item.liveUrl && (
                      <a href={item.liveUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold text-[10px] flex items-center gap-1">
                        <span>LIVE</span> <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {item.credentialUrl && (
                      <a href={item.credentialUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 font-bold text-[10px] flex items-center gap-1">
                        <span>VERIFY</span> <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // VARIANT 2: CYBERPUNK NEON MERGED SHOWCASE
  // High-voltage cyber HUD with glowing cyan & magenta borders, tech scanlines
  // =========================================================================
  if (isCyberpunk) {
    return (
      <section id="works" className="rounded-3xl border-2 border-cyan-500/50 bg-[#03060c] p-6 md:p-8 space-y-6 relative overflow-hidden shadow-[0_0_35px_-5px_rgba(6,182,212,0.25)]">
        {/* Cyber Neon Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/30 pb-4">
          <div>
            <div className="text-[10px] font-mono font-bold text-fuchsia-400 uppercase tracking-widest flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>// MATRIX_INDEX :: WORKS, ROLES & ACCREDITATIONS</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-wider uppercase font-mono mt-0.5">
              Practical Systems & Credentials
            </h2>
          </div>

          {/* Cyber Filter Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'ALL', label: `[ALL_MODULES (${unifiedItems.length})]` },
              { id: 'PROJECTS', label: `[PROJECTS (${projectCount})]` },
              ...(hasExperience ? [{ id: 'EXPERIENCE', label: `[WORK_LOGS (${expCount})]` }] : []),
              { id: 'CERTS', label: `[SEC_CERTS (${certCount})]` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all whitespace-nowrap ${
                  activeFilter === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-black shadow-lg shadow-cyan-500/40'
                    : 'bg-black/80 text-cyan-400 border border-cyan-500/40 hover:border-fuchsia-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cyber Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl border border-cyan-500/30 bg-[#070b16]/90 hover:border-fuchsia-500/70 transition-all duration-300 space-y-3 relative group shadow-[0_0_20px_-8px_rgba(6,182,212,0.15)] hover:shadow-[0_0_25px_-4px_rgba(217,70,239,0.25)]"
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                  item.type === 'project'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : item.type === 'experience'
                    ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  [{item.badge}]
                </span>
                {item.duration && <span className="text-slate-400">{item.duration}</span>}
              </div>

              <div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors font-mono">
                  {item.title}
                </h3>
                {item.subtitle && <div className="text-xs text-cyan-400 font-mono mt-0.5">{item.subtitle}</div>}
              </div>

              {item.description && (
                <p className="text-xs text-slate-300 leading-relaxed font-sans line-clamp-3">
                  {item.description}
                </p>
              )}

              {item.highlights && item.highlights.length > 0 && (
                <ul className="text-[11px] text-slate-300 space-y-1 font-sans">
                  {item.highlights.slice(0, 2).map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Zap className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              {item.technologies && item.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {item.technologies.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-black/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-cyan-500/20 text-xs">
                <span className="text-[10px] font-mono text-cyan-500">[STATUS: DEPLOYED]</span>
                <div className="flex items-center gap-2">
                  {item.githubUrl && (
                    <a href={item.githubUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-cyan-950 text-cyan-300 hover:text-white border border-cyan-500/30">
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {item.liveUrl && (
                    <a href={item.liveUrl} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-fuchsia-600 text-black font-extrabold text-[10px] flex items-center gap-1">
                      <span>RUN APP</span> <ArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                  {item.credentialUrl && (
                    <a href={item.credentialUrl} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
                      <span>VERIFY</span> <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // =========================================================================
  // VARIANT 3: EXECUTIVE LEADERSHIP MERGED SHOWCASE
  // Corporate Executive Dossier: Midnight navy & gold borders, serif titles
  // =========================================================================
  if (isExecutive) {
    return (
      <section id="works" className="rounded-2xl border-t-4 border-t-amber-400 border-x border-b border-slate-800 bg-[#0b101c] p-7 md:p-9 space-y-7 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>EXECUTIVE DOSSIER // PRACTICAL WORKS & ACCREDITATIONS</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight font-serif mt-1">
              Initiatives, Professional Engagements & Credentials
            </h2>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'ALL', label: `Complete Dossier (${unifiedItems.length})` },
              { id: 'PROJECTS', label: `Projects (${projectCount})` },
              ...(hasExperience ? [{ id: 'EXPERIENCE', label: `Experience (${expCount})` }] : []),
              { id: 'CERTS', label: `Accreditations (${certCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeFilter === tab.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-400/20'
                    : 'bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className="p-6 rounded-2xl bg-[#0f1728] border border-slate-800 hover:border-amber-400/50 transition-all space-y-4 shadow-xl"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/30">
                  {item.badge}
                </span>
                {item.duration && <span className="text-slate-400 font-mono">{item.duration}</span>}
              </div>

              <div>
                <h3 className="text-base font-bold text-white font-serif">{item.title}</h3>
                {item.subtitle && <div className="text-xs text-amber-300 font-medium mt-0.5">{item.subtitle}</div>}
                {item.location && <div className="text-xs text-slate-400 mt-0.5">{item.location}</div>}
              </div>

              {item.description && (
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              )}

              {item.highlights && item.highlights.length > 0 && (
                <ul className="text-xs text-slate-300 space-y-1.5">
                  {item.highlights.slice(0, 3).map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              {item.technologies && item.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.technologies.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-3 flex items-center justify-between border-t border-slate-800 text-xs">
                <span className="text-[10px] font-mono text-slate-400">VERIFIED EXECUTIVE ASSET</span>
                <div className="flex items-center gap-2">
                  {item.githubUrl && (
                    <a href={item.githubUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white border border-slate-700">
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {item.liveUrl && (
                    <a href={item.liveUrl} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-sm">
                      <span>View Project</span> <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {item.credentialUrl && (
                    <a href={item.credentialUrl} target="_blank" rel="noreferrer" className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center gap-1">
                      <span>Credential</span> <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // =========================================================================
  // VARIANT 4: CLASSIC SIMPLE & MINIMALIST
  // Clean resume paper layout, subtle divider lines, distraction-free reading
  // =========================================================================
  if (isSimple || isMinimal) {
    return (
      <section id="works" className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>Projects, Experience & Certifications</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Unified record of engineering projects, industrial internships, and credentials
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs">
            {[
              { id: 'ALL', label: `All (${unifiedItems.length})` },
              { id: 'PROJECTS', label: `Projects (${projectCount})` },
              ...(hasExperience ? [{ id: 'EXPERIENCE', label: `Experience (${expCount})` }] : []),
              { id: 'CERTS', label: `Certs (${certCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === tab.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-black dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div 
              key={item.id}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2.5 transition-colors hover:border-slate-400 dark:hover:border-slate-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                    {item.badge}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h3>
                </div>
                {item.duration && <span className="text-slate-500 dark:text-slate-400 text-xs">{item.duration}</span>}
              </div>

              {item.subtitle && (
                <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{item.subtitle}</div>
              )}

              {item.description && (
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              )}

              {item.highlights && item.highlights.length > 0 && (
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-1">
                  {item.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-slate-400">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              {item.technologies && item.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.technologies.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[10px]">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {(item.githubUrl || item.liveUrl || item.credentialUrl) && (
                <div className="pt-2 flex items-center gap-3 text-xs border-t border-slate-200/80 dark:border-slate-800">
                  {item.githubUrl && (
                    <a href={item.githubUrl} target="_blank" rel="noreferrer" className="text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1">
                      <Github className="w-3.5 h-3.5" /> <span>GitHub Repo</span>
                    </a>
                  )}
                  {item.liveUrl && (
                    <a href={item.liveUrl} target="_blank" rel="noreferrer" className="text-slate-900 dark:text-white font-bold hover:underline flex items-center gap-1">
                      <span>Live Demo</span> <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {item.credentialUrl && (
                    <a href={item.credentialUrl} target="_blank" rel="noreferrer" className="text-slate-900 dark:text-white font-bold hover:underline flex items-center gap-1">
                      <span>Verify Credential</span> <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  // =========================================================================
  // VARIANT 5: MODERN STUDIO (DEFAULT) & CREATIVE / ELEGANCE
  // Glassmorphic cards, gradient accents, pill filter tabs, high interactive WOW
  // =========================================================================
  return (
    <section id="works" className={`${themeConfig.cardStyle || 'p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800'} space-y-7 relative overflow-hidden shadow-2xl`}>
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-purple/10 text-brand-purple border border-brand-purple/20 uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
            <span>Unified Engineering Hub</span>
          </div>
          <h2 className={`text-xl sm:text-2xl font-extrabold flex items-center gap-2.5 ${themeConfig.colors?.textPrimary || (isDark ? 'text-white' : 'text-slate-900')}`}>
            <span>Projects, Internships & Certifications</span>
          </h2>
        </div>

        {/* Dynamic Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          {[
            { id: 'ALL', label: `All Works (${unifiedItems.length})` },
            { id: 'PROJECTS', label: `Projects (${projectCount})` },
            ...(hasExperience ? [{ id: 'EXPERIENCE', label: `Internships & Work (${expCount})` }] : []),
            { id: 'CERTS', label: `Certifications (${certCount})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === tab.id
                  ? 'bg-gradient-to-r from-brand-indigo to-brand-purple text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Unified Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between space-y-4 group relative overflow-hidden ${
              isDark
                ? 'bg-slate-950/90 border-slate-800/90 hover:border-brand-purple/40 shadow-xl'
                : 'bg-white border-slate-200/90 hover:border-brand-purple/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_32px_-5px_rgba(99,102,241,0.12)] hover:-translate-y-0.5'
            }`}
          >
            {/* Top Border Glow Accent */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-purple/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                  item.type === 'project'
                    ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25'
                    : item.type === 'experience'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                }`}>
                  {item.badge}
                </span>

                {item.duration && (
                  <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-brand-purple" />
                    <span>{item.duration}</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className={`text-base font-bold tracking-tight transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900 group-hover:text-brand-purple'
                }`}>
                  {item.title}
                </h3>
                {item.subtitle && (
                  <div className="text-xs text-brand-purple font-semibold mt-0.5">
                    {item.subtitle}
                  </div>
                )}
                {item.location && (
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" /> {item.location}
                  </div>
                )}
              </div>

              {item.description && (
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'} line-clamp-3`}>
                  {item.description}
                </p>
              )}

              {item.highlights && item.highlights.length > 0 && (
                <ul className="text-xs text-slate-300 space-y-1.5 pt-1">
                  {item.highlights.slice(0, 3).map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              {item.technologies && item.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.technologies.map((t, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium border ${
                        isDark 
                          ? 'bg-slate-900 border-slate-800 text-slate-300' 
                          : 'bg-indigo-50/70 border-indigo-100 text-slate-700'
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-slate-400">VERIFIED ITEM</span>
              <div className="flex items-center gap-2">
                {item.githubUrl && (
                  <a
                    href={item.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-brand-purple border border-slate-200/80 dark:border-slate-800 transition-colors"
                    title="View GitHub Repository"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {item.liveUrl && (
                  <a
                    href={item.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:scale-[1.02] transition-transform"
                  >
                    <span>Live Demo</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {item.credentialUrl && (
                  <a
                    href={item.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors"
                  >
                    <span>Verify Credential</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PortfolioMergedShowcase;

import React from 'react';
import { 
  Sparkles, Mail, Download, ShieldCheck, Github, Youtube, Linkedin, 
  MapPin, ArrowUpRight, Globe, Terminal, Shield, Award, Zap, CheckCircle2,
  ExternalLink, User, Code2, Star
} from 'lucide-react';
import { usePortfolioTheme } from './PortfolioThemeProvider';

export const PortfolioHero = ({
  heroData = {},
  aboutData = {},
  contactData = {},
  resumeDownloadEnabled = false,
  resumeDownloadUrl = null,
  customization = {},
  hasAboutData = false,
  hasContactData = false,
}) => {
  const { themeConfig, themeKey, isDark } = usePortfolioTheme();
  const currentTheme = themeKey ? themeKey.toLowerCase().trim() : 'modern';
  const primaryColor = customization.primaryColor;

  const isDeveloper = currentTheme.includes('developer') || currentTheme.includes('terminal');
  const isCyberpunk = currentTheme.includes('cyberpunk') || currentTheme.includes('neon');
  const isExecutive = currentTheme.includes('executive');
  const isSimple = currentTheme.includes('simple');
  const isMinimal = currentTheme.includes('minimal');
  const isCreative = currentTheme.includes('creative');
  const isElegance = currentTheme.includes('elegance');

  // Compute candidate name & initials
  const displayName = heroData.headline || 'Creator';
  const headline = heroData.subheadline || 'Full Stack Software Engineer & Solution Architect';
  const location = heroData.location || contactData.location || '';
  const statusPill = heroData.statusPill || 'Available for Opportunities';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'CP';

  // Dynamic social links
  const socialList = Array.isArray(contactData.socialLinks) && contactData.socialLinks.length > 0
    ? contactData.socialLinks
    : [
        { platform: 'GitHub', url: 'https://github.com' },
        { platform: 'LinkedIn', url: 'https://linkedin.com' },
      ];

  const renderSocialIcon = (platform = '') => {
    const p = platform.toLowerCase();
    if (p.includes('github')) return <Github className="w-4 h-4" />;
    if (p.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
    if (p.includes('youtube')) return <Youtube className="w-4 h-4" />;
    if (p.includes('leetcode')) return <Code2 className="w-4 h-4 text-amber-500" />;
    if (p.includes('codechef')) return <Award className="w-4 h-4 text-yellow-500" />;
    if (p.includes('instagram')) return <Star className="w-4 h-4 text-pink-500" />;
    return <Globe className="w-4 h-4" />;
  };

  // =========================================================================
  // 1. DEVELOPER TERMINAL HERO
  // Full Linux/Unix terminal window with interactive shell prompt
  // =========================================================================
  if (isDeveloper) {
    return (
      <section id="hero" className="rounded-2xl border border-emerald-900/60 bg-[#070b12] text-emerald-300 font-mono overflow-hidden shadow-2xl">
        {/* Window Title Bar */}
        <div className="bg-[#0e1626] px-4 py-3 border-b border-emerald-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            <span className="text-xs text-slate-400 font-mono ml-2">zsh — sowmya@devbox: ~</span>
          </div>
          <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" />
            <span>DEV_SHELL_v2.4</span>
          </div>
        </div>

        {/* Terminal Content Body */}
        <div className="p-6 sm:p-8 space-y-4">
          {/* Command 1: whoami */}
          <div className="space-y-1">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">sowmya@devbox:~$</span>
              <span className="text-emerald-200">whoami</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-emerald-300 tracking-tight pl-4 border-l-2 border-emerald-500/40">
              {displayName}
            </h1>
          </div>

          {/* Command 2: cat title.txt */}
          <div className="space-y-1">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">sowmya@devbox:~$</span>
              <span className="text-emerald-200">cat current_role.txt</span>
            </div>
            <div className="text-sm sm:text-base text-slate-200 pl-4 font-semibold">
              &gt; {headline}
            </div>
          </div>

          {/* Command 3: git status */}
          <div className="space-y-1">
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">sowmya@devbox:~$</span>
              <span className="text-emerald-200">git status --short</span>
            </div>
            <div className="pl-4 flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-bold">
                ● branch: main (VERIFIED)
              </span>
              <span className="px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-400 font-bold">
                ● status: {statusPill}
              </span>
              {location && (
                <span className="px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" /> {location}
                </span>
              )}
            </div>
          </div>

          {/* Bio paragraph if present */}
          {hasAboutData && aboutData.bio && (
            <div className="space-y-1 pt-1">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span className="text-emerald-400 font-bold">sowmya@devbox:~$</span>
                <span className="text-emerald-200">head -n 3 summary.md</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-4 font-sans max-w-3xl">
                {aboutData.bio}
              </p>
            </div>
          )}

          {/* Command 4: Action execution */}
          <div className="pt-3 border-t border-emerald-900/40 flex flex-wrap items-center gap-3">
            {hasContactData && contactData.email && (
              <a
                href={`mailto:${contactData.email}`}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>$ ./send_email.sh</span>
              </a>
            )}

            {resumeDownloadEnabled && resumeDownloadUrl && (
              <a
                href={resumeDownloadUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="px-4 py-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-bold hover:bg-emerald-900/50 flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>$ curl -O resume.pdf</span>
              </a>
            )}

            {/* Social links */}
            <div className="flex items-center gap-2 ml-auto">
              {socialList.map((s, idx) => (
                <a
                  key={idx}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-[#0e1626] border border-emerald-900/50 text-emerald-400 hover:text-white hover:border-emerald-500 transition-all"
                  title={s.platform}
                >
                  {renderSocialIcon(s.platform)}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 2. CYBERPUNK NEON HERO
  // High-voltage sci-fi HUD with glowing cyan/magenta border, tech brackets
  // =========================================================================
  if (isCyberpunk) {
    return (
      <section id="hero" className="rounded-3xl border-2 border-cyan-500/50 bg-[#03060c] p-8 md:p-12 relative overflow-hidden shadow-[0_0_40px_-5px_rgba(6,182,212,0.3)] space-y-6 font-mono">
        {/* Cyber scanline & corner accents */}
        <div className="absolute top-2 left-3 text-[10px] text-cyan-500 tracking-widest">// SEC_SYS :: READY</div>
        <div className="absolute top-2 right-3 text-[10px] text-fuchsia-400 tracking-widest">[PORTFOLIO_ONLINE]</div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-2">
          <div className="space-y-4 max-w-2xl">
            {/* Cyber status badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-500/50 uppercase tracking-widest">
                [IDENTITY_KEY: 0x8892]
              </span>
              <span className="px-3 py-1 rounded-md text-[10px] font-bold bg-fuchsia-950/80 text-fuchsia-300 border border-fuchsia-500/50 uppercase">
                {statusPill}
              </span>
              {location && (
                <span className="px-2.5 py-1 rounded-md text-[10px] bg-black border border-slate-700 text-slate-300 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-cyan-400" /> {location}
                </span>
              )}
            </div>

            {/* Glowing candidate name */}
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-wider uppercase drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
              {displayName}
            </h1>

            {/* Subtitle */}
            <div className="text-base sm:text-lg font-bold text-cyan-400 tracking-wide">
              // {headline}
            </div>

            {hasAboutData && aboutData.bio && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-xl">
                {aboutData.bio}
              </p>
            )}

            {/* Cyber CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {hasContactData && contactData.email && (
                <a
                  href={`mailto:${contactData.email}`}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-fuchsia-600 to-pink-500 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/40 hover:scale-[1.03] transition-all flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>TRANSMIT MESSAGE</span>
                </a>
              )}

              {resumeDownloadEnabled && resumeDownloadUrl && (
                <a
                  href={resumeDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-5 py-3 rounded-xl bg-black border border-cyan-500/50 text-cyan-300 font-bold text-xs uppercase hover:bg-cyan-950/50 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD DOSSIER</span>
                </a>
              )}

              <div className="flex items-center gap-2">
                {socialList.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-black border border-cyan-500/40 text-cyan-400 hover:text-white hover:border-fuchsia-500 transition-all"
                  >
                    {renderSocialIcon(s.platform)}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Cyber Avatar with Rotating Neon Ring */}
          <div className="relative group shrink-0">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1 bg-gradient-to-tr from-cyan-500 via-fuchsia-500 to-pink-500 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              {heroData.avatarUrl ? (
                <img
                  src={heroData.avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-full border-2 border-black"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-3xl font-black text-cyan-400">
                  {initials}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 3. EXECUTIVE LEADERSHIP HERO
  // Corporate Executive Dossier: Midnight navy & gold borders, serif titles
  // =========================================================================
  if (isExecutive) {
    return (
      <section id="hero" className="rounded-2xl border-t-4 border-t-amber-400 border-x border-b border-slate-800 bg-[#0b101c] p-8 md:p-12 space-y-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            {/* Executive Shield Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Executive Leadership Profile</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified Candidate
              </span>
              {location && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" /> {location}
                </span>
              )}
            </div>

            {/* Candidate Name in Regal Serif */}
            <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-serif">
              {displayName}
            </h1>

            {/* Professional Headline */}
            <div className="text-base sm:text-lg font-semibold text-amber-300">
              {headline}
            </div>

            {hasAboutData && aboutData.bio && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                {aboutData.bio}
              </p>
            )}

            {/* Executive Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {hasContactData && contactData.email && (
                <a
                  href={`mailto:${contactData.email}`}
                  className="px-6 py-3 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-amber-400/20 hover:bg-amber-300 transition-all flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Initiate Contact</span>
                </a>
              )}

              {resumeDownloadEnabled && resumeDownloadUrl && (
                <a
                  href={resumeDownloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-semibold text-xs hover:border-amber-400 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Executive Resume</span>
                </a>
              )}

              <div className="flex items-center gap-2">
                {socialList.map((s, idx) => (
                  <a
                    key={idx}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-400/40 transition-all"
                  >
                    {renderSocialIcon(s.platform)}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Executive Crest / Photo Card */}
          <div className="shrink-0 text-center space-y-3">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-2xl bg-[#0f1728]">
              {heroData.avatarUrl ? (
                <img
                  src={heroData.avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#141e33] to-[#0a0f1c] text-amber-400">
                  <Shield className="w-12 h-12 mb-1 opacity-80" />
                  <span className="text-xl font-bold font-serif">{initials}</span>
                </div>
              )}
            </div>
            <div className="text-[11px] font-mono text-amber-300/80 font-bold uppercase">
              Accredited Professional
            </div>
          </div>
        </div>
      </section>
    );
  }

  // =========================================================================
  // 4. CLASSIC SIMPLE & MINIMALIST HERO
  // Clean resume paper layout, subtle divider lines, distraction-free reading
  // =========================================================================
  if (isSimple || isMinimal) {
    return (
      <section id="hero" className="py-6 px-6 sm:px-8 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="space-y-2">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Curriculum Vitae & Professional Portfolio
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {displayName}
            </h1>
            <div className="text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300">
              {headline}
            </div>
          </div>

          {/* Clean Contact Metadata Strip */}
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 sm:text-right">
            {location && (
              <div className="flex items-center sm:justify-end gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{location}</span>
              </div>
            )}
            {contactData.email && (
              <div className="flex items-center sm:justify-end gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <a href={`mailto:${contactData.email}`} className="hover:underline">{contactData.email}</a>
              </div>
            )}
            <div className="flex items-center sm:justify-end gap-2 pt-1">
              {socialList.map((s, idx) => (
                <a
                  key={idx}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  {renderSocialIcon(s.platform)}
                </a>
              ))}
            </div>
          </div>
        </div>

        {hasAboutData && aboutData.bio && (
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
            {aboutData.bio}
          </p>
        )}

        <div className="flex items-center gap-3 pt-1">
          {hasContactData && contactData.email && (
            <a
              href={`mailto:${contactData.email}`}
              className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-all shadow-sm"
            >
              Contact Candidate
            </a>
          )}
          {resumeDownloadEnabled && resumeDownloadUrl && (
            <a
              href={resumeDownloadUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:border-slate-500 transition-all"
            >
              Download PDF Resume
            </a>
          )}
        </div>
      </section>
    );
  }

  // =========================================================================
  // 5. MODERN STUDIO (DEFAULT) & CREATIVE / ELEGANCE HERO
  // Split hero layout, glassmorphic cards, radiant ambient glow, pill buttons
  // =========================================================================
  return (
    <section id="hero" className={`${themeConfig.cardStyle || 'p-8 sm:p-12 rounded-3xl bg-slate-900/90 border border-slate-800'} flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl`}>
      {/* Top Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-brand-purple/20 via-brand-pink/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-4 max-w-2xl relative z-10">
        {/* Verification & Subheadline Pill */}
        <div className="flex flex-wrap items-center gap-2">
          <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-semibold transition-all ${
            isDark 
              ? 'bg-brand-purple/15 text-brand-purple border border-brand-purple/30 shadow-xs' 
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-brand-purple" />
            <span>{headline}</span>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>VERIFIED CREATOR</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {statusPill}
          </span>
        </div>

        {/* Candidate Full Name */}
        <h1 className={`text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {displayName}
        </h1>

        {/* Location & Quick Meta */}
        {location && (
          <div className={`flex items-center gap-1.5 text-xs font-mono ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>
            <MapPin className="w-3.5 h-3.5 text-brand-purple" />
            <span>{location}</span>
          </div>
        )}

        {/* Short Bio / Intro */}
        {hasAboutData && aboutData.bio && (
          <p className={`text-xs sm:text-sm leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          } max-w-xl`}>
            {aboutData.bio}
          </p>
        )}

        {/* Action Buttons & Quick Socials */}
        <div className="pt-2 flex flex-wrap items-center gap-3">
          {hasContactData && contactData.email && (
            <a
              href={`mailto:${contactData.email}`}
              className={themeConfig.buttonStyle || 'px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-indigo to-brand-purple text-white text-xs font-bold shadow-md hover:scale-[1.02] transition-all'}
              style={{ backgroundColor: primaryColor || undefined }}
            >
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Candidate</span>
              </span>
            </a>
          )}

          {resumeDownloadEnabled && resumeDownloadUrl && (
            <a
              href={resumeDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                isDark 
                  ? 'border-slate-800 bg-slate-900/80 text-slate-200 hover:border-brand-purple hover:text-white' 
                  : 'border-slate-200 bg-white text-slate-700 hover:border-brand-purple hover:text-brand-purple shadow-2xs'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-brand-purple" />
              <span>Resume</span>
            </a>
          )}

          {/* Social Icons */}
          <div className="flex items-center gap-2">
            {socialList.map((s, idx) => (
              <a
                key={idx}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-xl border transition-all ${
                  isDark 
                    ? 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-brand-purple hover:border-brand-purple' 
                    : 'border-slate-200 bg-white text-slate-600 hover:text-brand-purple hover:border-brand-purple shadow-2xs'
                }`}
                title={s.platform}
              >
                {renderSocialIcon(s.platform)}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Avatar / Visual Card */}
      <div className="relative group shrink-0">
        <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl p-1 bg-gradient-to-tr from-brand-indigo via-brand-purple to-brand-pink shadow-2xl relative overflow-hidden">
          {heroData.avatarUrl ? (
            <img
              src={heroData.avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover rounded-[22px]"
            />
          ) : (
            <div className={`w-full h-full rounded-[22px] flex flex-col items-center justify-center font-extrabold text-3xl sm:text-4xl shadow-inner ${
              isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center mb-1">
                <Sparkles className="w-6 h-6 text-brand-purple" />
              </div>
              <span>{initials}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PortfolioHero;

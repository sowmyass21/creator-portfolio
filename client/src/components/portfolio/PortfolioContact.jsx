import React, { useState } from 'react';
import { Mail, Phone, MapPin, Globe, ExternalLink, Copy, Check, Terminal, Shield, Cpu } from 'lucide-react';
import { usePortfolioTheme } from './PortfolioThemeProvider';

export const PortfolioContact = ({
  contactData = {},
  customization = {},
}) => {
  const { themeConfig, isDark } = usePortfolioTheme();
  const themeId = themeConfig.id || 'modern';
  const accentColor = customization.accentColor;
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    if (contactData.email) {
      navigator.clipboard.writeText(contactData.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 1. DEVELOPER TERMINAL TEMPLATE
  if (themeId === 'developer') {
    return (
      <section id="contact" key="contact" className="rounded-2xl bg-[#090d16] border border-emerald-900/50 shadow-2xl overflow-hidden font-mono text-xs">
        <div className="bg-[#050811] px-4 py-3 border-b border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-[11px] text-emerald-400 font-bold ml-2">bash: ~/network/contact.sh</span>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-mono">[PORT: 443 OPEN]</span>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="text-emerald-500 font-bold">$</span>
            <span>ping -c 1 {contactData.email ? contactData.email.split('@')[1] || 'remote.host' : 'remote.host'}</span>
            <span className="text-slate-500">// 64 bytes: time=0.42ms</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {contactData.email && (
              <div className="p-4 rounded-xl bg-[#0c1220] border border-emerald-900/40 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">// EMAIL_ENDPOINT</span>
                <div className="flex items-center justify-between gap-2">
                  <a href={`mailto:${contactData.email}`} className="text-emerald-300 font-bold hover:underline truncate">
                    {contactData.email}
                  </a>
                  <button onClick={copyEmail} className="p-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900" title="Copy">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {contactData.phone && (
              <div className="p-4 rounded-xl bg-[#0c1220] border border-emerald-900/40 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">// TELEPHONE_VOICE</span>
                <div className="text-emerald-300 font-bold">{contactData.phone}</div>
              </div>
            )}

            {contactData.location && (
              <div className="p-4 rounded-xl bg-[#0c1220] border border-emerald-900/40 space-y-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">// PHYSICAL_GEO</span>
                <div className="text-emerald-300 font-bold">{contactData.location}</div>
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // 2. CYBERPUNK NEON TEMPLATE
  if (themeId === 'cyberpunk') {
    return (
      <section id="contact" key="contact" className="rounded-2xl bg-black border border-cyan-500/40 shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)] overflow-hidden font-mono p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center text-cyan-300">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-cyan-400 tracking-widest block font-bold">// COMMS_TRANSMISSION</span>
              <h2 className="text-lg font-black text-white tracking-wide">DIRECT_COMMS_RELAY</h2>
            </div>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold">
            SIGNAL: LOCK 99.8%
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {contactData.email && (
            <div className="p-4 rounded-xl bg-[#05070d] border border-cyan-500/30 space-y-2">
              <span className="text-[10px] text-cyan-400/70 uppercase tracking-widest block">RELAY // EMAIL</span>
              <div className="flex items-center justify-between gap-2">
                <a href={`mailto:${contactData.email}`} className="text-xs font-bold text-cyan-200 hover:text-white truncate">
                  {contactData.email}
                </a>
                <button onClick={copyEmail} className="p-1.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  {copied ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          )}

          {contactData.phone && (
            <div className="p-4 rounded-xl bg-[#05070d] border border-cyan-500/30 space-y-2">
              <span className="text-[10px] text-cyan-400/70 uppercase tracking-widest block">RELAY // VOICE</span>
              <div className="text-xs font-bold text-cyan-200">{contactData.phone}</div>
            </div>
          )}

          {contactData.location && (
            <div className="p-4 rounded-xl bg-[#05070d] border border-cyan-500/30 space-y-2">
              <span className="text-[10px] text-cyan-400/70 uppercase tracking-widest block">RELAY // GEO_COORDINATES</span>
              <div className="text-xs font-bold text-cyan-200">{contactData.location}</div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // 3. EXECUTIVE LEADERSHIP TEMPLATE
  if (themeId === 'executive') {
    return (
      <section id="contact" key="contact" className="rounded-2xl bg-[#0f1523] border-t-4 border-t-amber-400 border-x border-b border-slate-800 shadow-2xl p-7 md:p-10 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-sans text-amber-400 uppercase tracking-widest font-bold">DIRECT CHANNELS</span>
              <h2 className="text-xl font-serif font-bold text-white">Executive Inquiries & Engagements</h2>
            </div>
          </div>
          <span className="text-xs font-serif italic text-amber-200/80">Prompt Attention Guaranteed</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {contactData.email && (
            <div className="p-5 rounded-xl bg-[#0a0e17] border border-amber-500/20 space-y-2">
              <span className="text-[10px] font-sans text-amber-400 uppercase tracking-wider block font-bold">Direct Correspondence</span>
              <div className="flex items-center justify-between gap-2">
                <a href={`mailto:${contactData.email}`} className="text-xs sm:text-sm font-serif font-bold text-white hover:text-amber-300 truncate">
                  {contactData.email}
                </a>
                <button onClick={copyEmail} className="p-1 rounded bg-slate-800 border border-slate-700 text-amber-300 hover:text-white">
                  {copied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {contactData.phone && (
            <div className="p-5 rounded-xl bg-[#0a0e17] border border-amber-500/20 space-y-2">
              <span className="text-[10px] font-sans text-amber-400 uppercase tracking-wider block font-bold">Confidential Telephone</span>
              <div className="text-xs sm:text-sm font-serif font-bold text-white">{contactData.phone}</div>
            </div>
          )}

          {contactData.location && (
            <div className="p-5 rounded-xl bg-[#0a0e17] border border-amber-500/20 space-y-2">
              <span className="text-[10px] font-sans text-amber-400 uppercase tracking-wider block font-bold">Headquarters / Location</span>
              <div className="text-xs sm:text-sm font-serif font-bold text-white">{contactData.location}</div>
            </div>
          )}
        </div>
      </section>
    );
  }

  // 4. CLASSIC SIMPLE & MINIMALIST TEMPLATES
  if (themeId === 'simple' || themeId === 'minimal') {
    return (
      <section id="contact" key="contact" className={`p-6 sm:p-8 rounded-2xl border ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'} space-y-5`}>
        <div className="border-b pb-3 border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
            Contact Details
          </h2>
          <span className="text-[11px] text-slate-400">Direct Inquiries</span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-700 dark:text-slate-300">
          {contactData.email && (
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <a href={`mailto:${contactData.email}`} className="font-semibold hover:underline">
                {contactData.email}
              </a>
              <button onClick={copyEmail} className="text-slate-400 hover:text-slate-600 dark:hover:text-white ml-1">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {contactData.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{contactData.phone}</span>
            </div>
          )}

          {contactData.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{contactData.location}</span>
            </div>
          )}
        </div>
      </section>
    );
  }

  // 5. MODERN STUDIO / CREATIVE / LUXURY ELEGANCE (DEFAULT)
  return (
    <section id="contact" key="contact" className={`${themeConfig.cardStyle || ''} space-y-6 relative overflow-hidden`}>
      <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
        <h2 className={`text-xl font-bold flex items-center gap-2.5 ${themeConfig.colors?.textPrimary || (isDark ? 'text-white' : 'text-slate-900')}`}>
          <div className="w-8 h-8 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/20 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4" style={{ color: accentColor || undefined }} />
          </div>
          <span>Connect & Direct Inquiries</span>
        </h2>
        <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-brand-purple/10 text-brand-purple border border-brand-purple/20">
          OPEN FOR OPPORTUNITIES
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {contactData.email && (
          <div className={`p-5 rounded-2xl border flex items-center justify-between gap-3.5 transition-all duration-200 group ${
            isDark 
              ? 'bg-slate-950/90 border-slate-800/90 hover:border-brand-purple/40 shadow-sm' 
              : 'bg-white border-slate-200/90 hover:border-brand-purple/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_25px_-5px_rgba(99,102,241,0.1)]'
          }`}>
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/10 text-brand-purple border border-brand-purple/20 flex items-center justify-center shrink-0 shadow-2xs">
                <Mail className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Email Address</span>
                <a 
                  href={`mailto:${contactData.email}`} 
                  className={`text-xs sm:text-sm font-bold truncate block transition-colors ${
                    isDark ? 'text-white hover:text-brand-purple' : 'text-slate-900 hover:text-brand-purple'
                  }`}
                >
                  {contactData.email}
                </a>
              </div>
            </div>

            <button
              onClick={copyEmail}
              className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white' 
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-brand-purple hover:bg-indigo-50 shadow-2xs'
              }`}
              title="Copy Email Address"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {contactData.phone && (
          <div className={`p-5 rounded-2xl border flex items-center gap-3.5 transition-all duration-200 group ${
            isDark 
              ? 'bg-slate-950/90 border-slate-800/90 hover:border-indigo-500/40 shadow-sm' 
              : 'bg-white border-slate-200/90 hover:border-indigo-500/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_25px_-5px_rgba(99,102,241,0.1)]'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20 flex items-center justify-center shrink-0 shadow-2xs">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Phone Contact</span>
              <span className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {contactData.phone}
              </span>
            </div>
          </div>
        )}

        {contactData.location && (
          <div className={`p-5 rounded-2xl border flex items-center gap-3.5 transition-all duration-200 group ${
            isDark 
              ? 'bg-slate-950/90 border-slate-800/90 hover:border-emerald-500/40 shadow-sm' 
              : 'bg-white border-slate-200/90 hover:border-emerald-500/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_25px_-5px_rgba(16,185,129,0.1)]'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-2xs">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Current Location</span>
              <span className={`text-xs sm:text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {contactData.location}
              </span>
            </div>
          </div>
        )}
      </div>

      {Array.isArray(contactData.socialLinks) && contactData.socialLinks.length > 0 && (
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/60 flex flex-wrap items-center gap-2.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono mr-1">
            Connected Profiles:
          </span>
          {contactData.socialLinks.map((s, idx) => (
            <a
              key={idx}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-105 ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-600' 
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-400 shadow-2xs'
              }`}
            >
              <span>{s.platform || 'Profile'}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          ))}
        </div>
      )}
    </section>
  );
};

export default PortfolioContact;

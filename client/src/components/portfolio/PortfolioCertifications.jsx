import React from 'react';
import { Award, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';
import { usePortfolioTheme } from './PortfolioThemeProvider';

export const PortfolioCertifications = ({
  certsData = [],
  customization = {},
}) => {
  const { themeConfig, isDark } = usePortfolioTheme();
  const accentColor = customization.accentColor;

  return (
    <section id="certifications" key="certifications" className={`${themeConfig.cardStyle || ''} space-y-6 relative overflow-hidden`}>
      <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
        <h2 className={`text-xl font-bold flex items-center gap-2.5 ${themeConfig.colors?.textPrimary || (isDark ? 'text-white' : 'text-slate-900')}`}>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" style={{ color: accentColor || undefined }} />
          </div>
          <span>Industry Certifications & Verified Credentials</span>
        </h2>
        <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          ENTERPRISE ACCREDITATIONS
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {certsData.map((cert, idx) => {
          const cName = typeof cert === 'string' ? cert : (cert.name || cert.certificationName || cert.title || '');
          const cIssuer = typeof cert === 'string' ? '' : (cert.issuer || cert.issuingOrganization || cert.organization || '');
          const cDesc = typeof cert === 'string' ? '' : (cert.description || '');
          const cDate = typeof cert === 'string' ? '' : (cert.date || cert.issued || '');
          const cUrl = typeof cert === 'string' ? '' : (cert.credentialId || cert.url || '');

          return (
            <div 
              key={idx} 
              className={`p-6 rounded-2xl border space-y-3 flex flex-col justify-between transition-all duration-200 group ${
                isDark 
                  ? 'bg-slate-950/90 border-slate-800/90 hover:border-amber-400/40 shadow-sm' 
                  : 'bg-white border-slate-200/90 hover:border-amber-400/50 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-5px_rgba(245,158,11,0.12)] hover:-translate-y-0.5'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`px-2.5 py-1 rounded-lg font-bold text-xs font-mono inline-flex items-center gap-1.5 border ${
                    isDark 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-amber-50 text-amber-700 border-amber-200/80 shadow-2xs'
                  }`}>
                    <Award className="w-3.5 h-3.5 shrink-0" />
                    <span>{cIssuer || 'Accredited'}</span>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>

                <h3 className={`text-sm sm:text-base font-bold leading-snug transition-colors ${
                  isDark ? 'text-white' : 'text-slate-900 group-hover:text-amber-600'
                }`}>
                  {cName}
                </h3>

                {cDesc && (
                  <p className={`text-xs leading-relaxed line-clamp-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {cDesc}
                  </p>
                )}

                {cDate && (
                  <div className="text-[11px] font-mono text-slate-400 pt-0.5">
                    Issued: {cDate}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Authenticated
                </span>
                {cUrl && (
                  <a
                    href={cUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-500 hover:text-amber-400 text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <span>Verify</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PortfolioCertifications;

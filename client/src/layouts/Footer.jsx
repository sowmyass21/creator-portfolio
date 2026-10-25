import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { Sparkles, Heart, Terminal, Github, Twitter, Youtube, Linkedin, Mail } from 'lucide-react';

export const Footer = () => {
  const { profile } = usePortfolio();

  const getSocialIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'twitter/x':
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'github': return <Github className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  return (
    <footer className="relative border-t border-slate-800/80 bg-slate-950/80 pt-16 pb-12 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-brand-indigo/10 blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/60">
          
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-indigo to-brand-purple p-[1px]">
                <div className="w-full h-full bg-dark-900 rounded-[7px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brand-purple" />
                </div>
              </div>
              <span className="font-bold text-lg text-white">Elena Vance</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              {profile?.tagline || 'Full-Stack Creator, Tech Educator & Open Source Architect.'}
            </p>
            <div className="flex items-center gap-3 pt-2">
              {profile?.socialLinks?.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all hover:scale-110"
                  title={link.platform}
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 font-mono">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#hero" className="text-slate-400 hover:text-brand-purple transition-colors">Home</a></li>
              <li><a href="#about" className="text-slate-400 hover:text-brand-purple transition-colors">About</a></li>
              <li><a href="#projects" className="text-slate-400 hover:text-brand-purple transition-colors">Portfolio</a></li>
              <li><a href="#metrics" className="text-slate-400 hover:text-brand-purple transition-colors">Social Metrics</a></li>
              <li><a href="#contact" className="text-slate-400 hover:text-brand-purple transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Col 3: API & Tech Stack */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 font-mono">
              Tech Stack (Phase 1)
            </h4>
            <div className="flex flex-wrap gap-1.5 text-xs text-slate-400">
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">React + Vite</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Node.js</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Express.js</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">MongoDB</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Tailwind CSS</span>
              <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800">Axios</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500/20" />
            <span>for Creators & Developers</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <Terminal className="w-3.5 h-3.5 text-brand-purple" />
            <span>Phase 1 REST API • Clean MERN Architecture</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { User, Code, Award, CheckCircle, Terminal, MapPin, Mail, Globe } from 'lucide-react';

export const AboutSection = () => {
  const { profile } = usePortfolio();

  return (
    <section id="about" className="py-20 relative bg-slate-950/40 border-y border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-indigo/10 border border-brand-indigo/30 text-xs font-mono font-semibold text-brand-purple">
            <User className="w-3.5 h-3.5" />
            ABOUT THE CREATOR
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Crafting code, sharing knowledge & scaling platforms
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Combining software engineering excellence with real-time creator analytics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Bio & Highlights (Col 6) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-brand-purple" />
                Engineering Background
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {profile?.bio || 'Building scalable web applications, open-source libraries, and technical tutorials for a global audience.'}
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Full-Stack MERN Architecture, REST APIs, Microservices & Data Aggregation</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>250K+ combined audience across YouTube, Twitter/X, GitHub & Substack</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Open Source Contributor & Technical Speaker</span>
                </div>
              </div>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-brand-indigo" />
                <div>
                  <div className="text-xs text-slate-400">Location</div>
                  <div className="text-sm font-semibold text-white">{profile?.location || 'San Francisco, CA'}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-pink" />
                <div>
                  <div className="text-xs text-slate-400">Email</div>
                  <div className="text-sm font-semibold text-white truncate max-w-[160px]">{profile?.email || 'elena@elenavance.dev'}</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Skills & Proficiency Breakdown (Col 6) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Code className="w-5 h-5 text-brand-indigo" />
                Core Technical Skills
              </h3>

              <div className="space-y-4">
                {profile?.skills?.map((skill, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-200">{skill.name}</span>
                      <span className="font-mono text-brand-purple">{skill.proficiency}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-pink rounded-full transition-all duration-1000"
                        style={{ width: `${skill.proficiency}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default AboutSection;

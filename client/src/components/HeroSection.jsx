import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { formatNumber } from '../utils/formatters';
import { ArrowRight, Sparkles, Code2, Users, Eye, Layers, ChevronDown } from 'lucide-react';

export const HeroSection = () => {
  const { profile, loading } = usePortfolio();

  return (
    <section id="hero" className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-brand-indigo/20 via-brand-purple/20 to-brand-pink/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-brand-cyan/15 rounded-full blur-[90px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content (Col 7) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Creator Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-semibold text-brand-purple shadow-inner backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-brand-pink animate-spin-slow" />
              <span>{profile?.availability || 'Available for Select Projects & Collaborations'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Building modern web apps & aggregate{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-pink">
                creator metrics
              </span>
            </h1>

            {/* Tagline & Bio */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {profile?.bio || 'Full-Stack Creator & Technical Educator. Building high-performance software systems and synthesizing real-time audience metrics.'}
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <a
                href="#projects"
                className="px-6 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-pink shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                Explore Portfolio
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#metrics"
                className="px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 transition-all flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-brand-purple" />
                View Social Metrics
              </a>
            </div>

            {/* Summary Stat Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-xl mx-auto lg:mx-0 border-t border-slate-800/80">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-left">
                <div className="text-xs text-slate-400 font-medium">Total Reach</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">
                  {formatNumber(profile?.statsSummary?.totalAudience ?? 0)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-left">
                <div className="text-xs text-slate-400 font-medium">Monthly Views</div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">
                  {formatNumber(profile?.statsSummary?.monthlyViews ?? 0)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-left">
                <div className="text-xs text-slate-400 font-medium">Avg Engagement</div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                  {profile?.statsSummary?.avgEngagementRate ?? 0}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-left">
                <div className="text-xs text-slate-400 font-medium">Projects</div>
                <div className="text-lg font-bold text-brand-purple font-mono mt-0.5">
                  {profile?.statsSummary?.publishedProjects ?? 0}
                </div>
              </div>
            </div>

          </div>

          {/* Right Hero Visual Card (Col 5) */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Card Background Glow Frame */}
            <div className="relative w-full max-w-md glass-card rounded-3xl p-6 space-y-5 border border-slate-700/50 shadow-2xl shadow-purple-950/40 transform hover:-translate-y-1 transition-all duration-300">
              
              {/* Creator Profile Card Header */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={profile?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"}
                    alt={profile?.fullName || "Elena Vance"}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-brand-purple/50 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-dark-900"></span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{profile?.fullName || 'Elena Vance'}</h3>
                  <p className="text-xs text-brand-purple font-mono font-medium">{profile?.handle || '@elenacodes'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{profile?.location || 'San Francisco & Remote'}</p>
                </div>
              </div>

              {/* Live Metric Ticker Widget */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-brand-indigo" />
                    Cross-Platform Audience
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-semibold">
                    +11.2% this mo
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">YouTube</span>
                    <span className="font-mono text-white font-semibold">185.0K</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-[68%] rounded-full"></div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Twitter/X</span>
                    <span className="font-mono text-white font-semibold">94.5K</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400 w-[48%] rounded-full"></div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Substack</span>
                    <span className="font-mono text-white font-semibold">63.0K</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-400 w-[35%] rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Skills Tag Cloud */}
              <div className="flex flex-wrap gap-2 pt-1">
                {profile?.skills?.slice(0, 4).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default HeroSection;

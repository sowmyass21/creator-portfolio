import React from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import SectionHeader from '../components/SectionHeader';
import SeoHead from '../components/SeoHead';
import { 
  Sparkles, ArrowRight, Layers, BarChart3, Cpu, Terminal, ShieldCheck, 
  RefreshCw, Github, Youtube, Linkedin, Mail, Zap, CheckCircle2, Play, ChevronRight, Globe, Lock
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-300 selection:bg-brand-purple/30">
      <SeoHead 
        title="CreatorPulse — Social Metric Aggregator & Dynamic Portfolio Builder"
        description="Aggregate your GitHub stars, YouTube subscribers, Substack feeds, and social metrics into a self-updating developer portfolio."
        type="website"
      />
      
      {/* 1. NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-indigo via-brand-purple to-brand-pink p-[1px]">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-brand-purple" />
              </div>
            </div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
              CreatorPulse
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-brand-purple transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-brand-purple transition-colors">How It Works</a>
            <a href="#integrations" className="hover:text-brand-purple transition-colors">Integrations</a>
            <a href="#analytics" className="hover:text-brand-purple transition-colors">Analytics</a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-pink shadow-md hover:scale-[1.02] transition-transform"
            >
              Get Started Free
            </Link>
          </div>

        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-indigo/15 rounded-full blur-[140px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 text-xs font-mono font-semibold text-brand-purple">
            <Zap className="w-3.5 h-3.5 text-brand-pink" />
            <span>Phase 2 Production SaaS Architecture Released</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
            Aggregate your social metrics.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-pink">
              Build dynamic portfolios.
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            CreatorPulse automatically pulls your GitHub stars, YouTube subscribers, Substack feeds, and social metrics into a sleek, self-updating developer portfolio.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-pink shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/portfolio/elenacodes"
              className="px-6 py-3.5 rounded-xl font-semibold text-xs text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 text-brand-purple fill-brand-purple" />
              View Demo Portfolio
            </Link>
          </div>

          {/* Animated Metrics Preview Mockup */}
          <div className="pt-8 max-w-4xl mx-auto">
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl text-left space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-mono text-slate-400 pl-2">creatorpulse.dev/dashboard</span>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">
                  ● LIVE SYNC ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Total Audience</div>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">384,500</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">GitHub Stars</div>
                  <div className="text-xl font-bold font-mono text-brand-purple mt-1">4,600</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-800">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">YouTube Views</div>
                  <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">9.4M</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-800">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Monthly Growth</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-1">+11.2%</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. PLATFORM INTEGRATIONS */}
      <section id="integrations" className="py-16 border-y border-slate-200 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <SectionHeader
            badge="INTEGRATIONS"
            title="Supported Platforms"
            description="Native API connections to pull live follower counts, repositories, and engagement."
            align="center"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'GitHub', icon: Github, color: 'text-purple-400' },
              { name: 'YouTube', icon: Youtube, color: 'text-red-500' },
              { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-500' },
              { name: 'Substack', icon: Mail, color: 'text-orange-400' },
              { name: 'Twitch', icon: Play, color: 'text-purple-500' },
              { name: 'Custom REST API', icon: Globe, color: 'text-emerald-400' },
            ].map((p, idx) => (
              <div key={idx} className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-2">
                <p.icon className={`w-6 h-6 ${p.color}`} />
                <span className="text-xs font-bold text-slate-800 dark:text-white">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <SectionHeader
            badge="AUTOMATION WORKFLOW"
            title="How CreatorPulse Works"
            description="4 seamless steps from connecting accounts to deploying your live portfolio."
            align="center"
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Connect Platforms', desc: 'Securely authenticate your GitHub, YouTube, and Substack API keys.' },
              { step: '02', title: 'Aggregate Metrics', desc: 'Background cron jobs continuously collect audience growth & star trends.' },
              { step: '03', title: 'AI Portfolio Build', desc: 'AI highlights your top repositories, projects, and impact summaries.' },
              { step: '04', title: 'Auto-Publish', desc: 'Deploy to your custom domain or share your portfolio link instantly.' },
            ].map((item, idx) => (
              <div key={idx} className="glass-card rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="font-mono text-2xl font-extrabold text-brand-purple">{item.step}</span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURE HIGHLIGHTS */}
      <section id="features" className="py-20 bg-slate-100/50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <SectionHeader
            badge="CAPABILITIES"
            title="Engineered for Modern Developers & Creators"
            description="Everything you need to showcase technical impact without manual updates."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-4">
              <BarChart3 className="w-8 h-8 text-brand-indigo" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Metric Aggregation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Real-time synchronization across YouTube, GitHub, Substack, and Twitter/X with zero code manual entry.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-4">
              <Cpu className="w-8 h-8 text-brand-purple" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Content Generation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Automatically generate project summaries, case studies, and engineering bios tailored for hiring managers.
              </p>
            </div>

            <div className="glass-card rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-4">
              <Terminal className="w-8 h-8 text-brand-pink" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">CLI & Git Automation</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Push changes via command line tools or trigger portfolio updates on every git commit.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 6. FINAL CTA */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">
            Ready to automate your developer portfolio?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Join 10,000+ creators and engineers using CreatorPulse to highlight real-time project metrics.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-brand-indigo via-brand-purple to-brand-pink shadow-xl hover:scale-105 transition-transform"
          >
            Create Your Account Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 CreatorPulse Inc. Built for Developers & Creators worldwide.</p>
      </footer>

    </div>
  );
};

export default LandingPage;

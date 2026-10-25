import React from 'react';
import { useGitHubMetrics } from '../hooks/useGitHubMetrics';
import SectionHeader from './SectionHeader';
import { SkeletonCard, ErrorState } from './SkeletonLoader';
import { formatNumber, formatDate } from '../utils/formatters';
import { 
  Github, Star, GitFork, BookOpen, Users, RefreshCw, ExternalLink, Code2, Calendar, ShieldCheck
} from 'lucide-react';

export const GitHubSection = ({ username = null }) => {
  const { metrics, meta, loading, error, refetch } = useGitHubMetrics(username);

  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          badge="GITHUB INTEGRATION"
          title="Open Source & GitHub Analytics"
          description="Fetching live repositories, stars, and language distribution..."
        />
        <SkeletonCard count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <SectionHeader
          badge="GITHUB INTEGRATION"
          title="Open Source & GitHub Analytics"
          description="Live data from the GitHub REST API."
        />
        <ErrorState message={error} onRetry={() => refetch(true)} />
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <section id="github-analytics" className="space-y-8">
      
      {/* Section Header with Force Refresh Action */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <SectionHeader
          badge="GITHUB REST API"
          title="Live GitHub Open Source Metrics"
          description={`Direct REST API sync for @${metrics.username}. Verified data snapshot.`}
        />

        <button
          onClick={() => refetch(true)}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-900 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 shadow-sm self-start sm:self-auto hover:border-brand-purple transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-brand-purple ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh GitHub API</span>
        </button>
      </div>

      {/* GitHub Account Header Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <img
              src={metrics.avatar}
              alt={metrics.username}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-500/50 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{metrics.username}</h3>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{metrics.bio}</p>
              <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-brand-purple" />
                  Joined {formatDate(metrics.accountCreatedAt)}
                </span>
                {meta?.source && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                    Source: {meta.source}
                  </span>
                )}
              </div>
            </div>
          </div>

          <a
            href={`https://github.com/${metrics.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center gap-2 hover:scale-105 transition-all"
          >
            <Github className="w-4 h-4" /> View GitHub Profile
          </a>

        </div>

        {/* Global Summary KPI Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Total Stars</div>
            <div className="text-lg font-bold font-mono text-amber-400 flex items-center gap-1 mt-0.5">
              <Star className="w-4 h-4 fill-amber-400" />
              {formatNumber(metrics.totalStars)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Total Forks</div>
            <div className="text-lg font-bold font-mono text-brand-indigo flex items-center gap-1 mt-0.5">
              <GitFork className="w-4 h-4" />
              {formatNumber(metrics.totalForks)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Public Repos</div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {metrics.publicRepositories}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Followers</div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {formatNumber(metrics.followers)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
            <div className="text-[10px] text-slate-500 dark:text-slate-400">Public Gists</div>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-white mt-0.5">
              {metrics.publicGists}
            </div>
          </div>
        </div>
      </div>

      {/* Top Languages Breakdown & Popular Repos Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Col: Top Languages (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Code2 className="w-4 h-4 text-brand-purple" />
              Top Programming Languages
            </h3>

            <div className="space-y-3">
              {metrics.topLanguages?.map((lang, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 dark:text-slate-200">{lang.name}</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">{lang.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-brand-indigo to-brand-purple rounded-full"
                      style={{ width: `${lang.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Popular Repositories Grid (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-indigo" />
            Most Popular Repositories
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.popularRepositories?.map((repo, idx) => (
              <div
                key={idx}
                className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-brand-purple/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <a
                      href={repo.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-sm text-slate-900 dark:text-white hover:text-brand-purple transition-colors truncate flex items-center gap-1.5"
                    >
                      {repo.name}
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {repo.description || 'No repository description provided.'}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800/60">
                  {/* Topics Pills */}
                  {repo.topics && repo.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {repo.topics.slice(0, 3).map((topic, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded bg-brand-purple/10 text-brand-purple text-[10px] font-mono"
                        >
                          #{topic}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stars & Language Counters */}
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-purple inline-block"></span>
                      {repo.language}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {formatNumber(repo.stars)}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3.5 h-3.5" />
                        {repo.forks}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

    </section>
  );
};

export default GitHubSection;

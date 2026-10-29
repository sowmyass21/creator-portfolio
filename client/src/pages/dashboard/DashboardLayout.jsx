import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePortfolio } from '../../context/PortfolioContext';
import apiService from '../../services/api';
import ThemeToggle from '../../components/ThemeToggle';
import { 
  Sparkles, LayoutDashboard, User, FolderGit2, Share2, BarChart3, Cpu, 
  LogOut, RefreshCw, Menu, X, ChevronRight, ExternalLink, FileText, UploadCloud, CheckCircle2, AlertCircle
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, role, isAdmin, logout } = useAuth();
  const { profile, refetchMetrics } = usePortfolio();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await apiService.triggerManualSync();
      if (refetchMetrics) {
        await refetchMetrics();
      }
      setSyncFeedback({
        type: 'success',
        message: res?.message || 'Sync completed successfully'
      });
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (err) {
      setSyncFeedback({
        type: 'error',
        message: `Sync failed: ${err.message || 'Network error'}`
      });
      setTimeout(() => setSyncFeedback(null), 5000);
    } finally {
      setSyncing(false);
    }
  };

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Resume Upload', path: '/dashboard/resume', icon: UploadCloud },
    { name: 'AI Resume Portfolio', path: '/portfolio', icon: FileText },
    { name: 'Profile Builder', path: '/dashboard/profile', icon: User },
    { name: 'Projects', path: '/dashboard/projects', icon: FolderGit2 },
    { name: 'Connected Platforms', path: '/dashboard/platforms', icon: Share2 },
    { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'AI Generator', path: '/dashboard/content', icon: Cpu },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#090D16] text-[#172033] dark:text-slate-100 flex transition-colors duration-200">
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#E4E7EC] dark:border-slate-800 bg-white dark:bg-[#0F172A] p-4 justify-between shrink-0 sticky top-0 h-screen select-none">
        <div className="space-y-5 overflow-y-auto pr-0.5">
          
          {/* Brand Header */}
          <Link to="/dashboard" className="flex items-center gap-3 px-2 py-1.5 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D5EF7]">
            <div className="w-9 h-9 rounded-xl bg-[#6D5EF7] flex items-center justify-center text-white shadow-sm shadow-[#6D5EF7]/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base text-[#172033] dark:text-white tracking-tight block">CreatorPulse</span>
              <span className="block text-[10px] font-semibold text-[#667085] dark:text-slate-400 tracking-wider">CREATOR STUDIO</span>
            </div>
          </Link>

          {/* User Profile Card */}
          <div className="p-3 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 flex items-center gap-3">
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"}
              alt={user?.name || 'Creator'}
              className="w-9 h-9 rounded-lg object-cover border border-[#E4E7EC] dark:border-slate-700 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#172033] dark:text-white truncate">
                {user?.name || profile?.fullName || 'Creator'}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded ${
                  isAdmin 
                    ? 'bg-[#6D5EF7]/10 text-[#6D5EF7] border border-[#6D5EF7]/20' 
                    : 'bg-[#F2F4F7] dark:bg-slate-800 text-[#475467] dark:text-slate-300 border border-[#E4E7EC] dark:border-slate-700'
                }`}>
                  {role || 'CREATOR'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#16803D]"></span>
              </div>
            </div>
          </div>

          {/* Navigation Links (9 Items) */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D5EF7] ${
                    isActive
                      ? 'bg-[#6D5EF7]/10 text-[#6D5EF7] dark:text-[#8B7FF9] font-semibold shadow-xs border-l-4 border-l-[#6D5EF7] pl-2.5'
                      : 'text-[#475467] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white hover:bg-[#F8F9FC] dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </nav>

        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-[#E4E7EC] dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#D92D20] hover:bg-[#FEF3F2] dark:hover:bg-rose-950/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D92D20]"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP HEADER */}
        <header className="bg-white dark:bg-[#0F172A] border-b border-[#E4E7EC] dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 lg:hidden text-[#475467] dark:text-slate-300 rounded-lg bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 hover:bg-slate-100 transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-[#172033] dark:text-white leading-none">Creator Studio Dashboard</h1>
              <p className="text-xs text-[#667085] dark:text-slate-400 font-medium mt-1">
                Authenticated Creator Session • Role: {role || 'Creator'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            
            {/* Sync Feedback Toast / Badge */}
            {syncFeedback && (
              <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border animate-in fade-in ${
                syncFeedback.type === 'success' 
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-[#16803D] dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-rose-50 dark:bg-rose-950/30 text-[#D92D20] dark:text-rose-400 border-rose-200 dark:border-rose-800'
              }`}>
                {syncFeedback.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{syncFeedback.message}</span>
              </div>
            )}

            {/* Quick Trigger Sync Button */}
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="px-3.5 py-1.5 rounded-lg bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-xs font-semibold text-[#172033] dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 flex items-center gap-1.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D5EF7] disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#6D5EF7] ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Trigger Sync'}</span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile Avatar with link to profile */}
            <Link to="/dashboard/profile" title="View profile settings" className="shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D5EF7] rounded-full">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"}
                alt={user?.name || 'Creator'}
                className="w-8 h-8 rounded-full object-cover border border-[#E4E7EC] dark:border-slate-700 hover:ring-2 hover:ring-[#6D5EF7]/40 transition-all"
              />
            </Link>

          </div>

        </header>

        {/* SUB PAGE CONTENT */}
        <main className="p-4 sm:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>

      </div>

      {/* MOBILE DRAWER */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setMobileSidebarOpen(false)}></div>
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-[#0F172A] border-r border-[#E4E7EC] dark:border-slate-800 p-5 flex flex-col justify-between z-10 shadow-xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#E4E7EC] dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#6D5EF7] flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-sm text-[#172033] dark:text-white">CreatorPulse</span>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)} className="p-1 rounded-md text-[#667085] hover:text-[#172033] dark:hover:text-white" aria-label="Close menu">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Profile Card */}
              <div className="p-3 rounded-xl bg-[#F8F9FC] dark:bg-[#131D31] border border-[#E4E7EC] dark:border-slate-800 flex items-center gap-3">
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300"}
                  alt={user?.name || 'Creator'}
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#172033] dark:text-white truncate">{user?.name || 'Creator'}</div>
                  <div className="text-[10px] text-[#667085] dark:text-slate-400 font-medium">{role || 'CREATOR'}</div>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive 
                          ? 'bg-[#6D5EF7]/10 text-[#6D5EF7] font-semibold border-l-4 border-l-[#6D5EF7]' 
                          : 'text-[#475467] dark:text-slate-400 hover:text-[#172033] dark:hover:text-white hover:bg-[#F8F9FC] dark:hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#E4E7EC] dark:border-slate-800">
              <button 
                onClick={handleLogout} 
                className="w-full text-[#D92D20] text-xs font-semibold flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#FEF3F2] dark:hover:bg-rose-950/30"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardLayout;


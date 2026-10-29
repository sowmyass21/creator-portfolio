import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Terminal, GitBranch, Shield, Key, Copy, Check, CheckCircle2 } from 'lucide-react';

export const DashboardSettings = () => {
  const { user, role } = useAuth();
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText('cpy_live_tok_984f912849012840912489');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-extrabold text-[#172033] dark:text-white tracking-tight">
          CLI Automation & Deployment Settings
        </h2>
        <p className="text-xs sm:text-sm text-[#667085] dark:text-slate-400 mt-1">
          Configure Git deploy hooks, CLI credentials, and server security roles.
        </p>
      </div>

      <div className="space-y-4">
        
        {/* CLI Integration Widget */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-[#E4E7EC] dark:border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-[#172033] dark:text-white">
            <Terminal className="w-5 h-5 text-[#6D5EF7]" />
            <span>Command Line Interface (CLI) Access Token</span>
          </div>
          <p className="text-xs text-[#667085] dark:text-slate-400">
            Use this token to update portfolio data directly from your terminal or CI/CD pipelines.
          </p>
          <div className="p-3 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 font-mono text-xs text-[#172033] dark:text-slate-200 border border-[#E4E7EC] dark:border-slate-800 flex items-center justify-between">
            <span className="truncate pr-2">cpy_live_tok_984f912849012840912489</span>
            <button
              onClick={handleCopyKey}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-[#E4E7EC] dark:border-slate-700 text-xs font-semibold text-[#172033] dark:text-slate-200 hover:border-[#6D5EF7] flex items-center gap-1 transition-all shadow-xs shrink-0"
            >
              {copiedKey ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#16803D]" />
                  <span className="text-[#16803D]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#667085]" />
                  <span>Copy Key</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Git Automation Widget */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-[#E4E7EC] dark:border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-[#172033] dark:text-white">
            <GitBranch className="w-5 h-5 text-[#6D5EF7]" />
            <span>Automatic Git Commit Trigger</span>
          </div>
          <p className="text-xs text-[#667085] dark:text-slate-400">
            Sync portfolio content automatically whenever you push new commits to your main repository.
          </p>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-md bg-emerald-500/10 text-[#16803D] dark:text-emerald-400 text-xs font-mono font-bold border border-emerald-500/20">
              Enabled
            </span>
            <span className="text-xs font-mono text-[#667085] dark:text-slate-400">Branch: main</span>
          </div>
        </div>

        {/* Authorization Security */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 border border-[#E4E7EC] dark:border-slate-800 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-[#172033] dark:text-white">
            <Shield className="w-5 h-5 text-[#16803D]" />
            <span>Role-Based Access Control</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#F8F9FC] dark:bg-slate-950 border border-[#E4E7EC] dark:border-slate-800 text-xs space-y-1.5">
            <div>
              <span className="text-[#667085] dark:text-slate-400 mr-2">Active User:</span> 
              <span className="font-bold text-[#172033] dark:text-white">{user?.name || 'Authenticated User'} ({user?.email || 'No email provided'})</span>
            </div>
            <div>
              <span className="text-[#667085] dark:text-slate-400 mr-2">Assigned Server Role:</span> 
              <span className="font-mono font-bold text-[#6D5EF7]">{role || 'CREATOR_PRO'}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardSettings;

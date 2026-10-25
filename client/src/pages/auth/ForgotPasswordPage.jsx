import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import apiService from '../../services/api';
import { Sparkles, Mail, ArrowRight, CheckCircle2, ArrowLeft, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiService.forgotPassword(email);
      setResult(res?.data || { email });
    } catch (err) {
      setError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAgain = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F7F8FC] dark:bg-[#090D16] text-[#172033] dark:text-slate-100 relative overflow-hidden transition-colors">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#6D5EF7] flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl text-[#172033] dark:text-white tracking-tight">CreatorPulse</span>
          </Link>
          <h2 className="text-2xl font-bold text-[#172033] dark:text-white tracking-tight pt-2">Reset Password</h2>
          <p className="text-xs text-[#667085] dark:text-slate-400">Enter your email address to receive password recovery instructions</p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-8 border border-[#E4E7EC] dark:border-slate-800 space-y-6 shadow-sm">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <div className="flex-1">
                <span>{error}</span>
                {error.includes('No account found') && (
                  <div className="mt-1">
                    <Link to="/register" className="font-semibold underline hover:opacity-80">
                      Create a new account now &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {result ? (
            <div className="text-center py-4 space-y-4 animate-in fade-in">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#172033] dark:text-white">Reset Instructions Dispatched</h3>
                <p className="text-xs text-[#667085] dark:text-slate-400">
                  We have sent password recovery instructions to{' '}
                  <span className="font-semibold text-[#172033] dark:text-slate-200">{result.email || email}</span>.
                </p>
                <p className="text-[11px] text-[#667085] dark:text-slate-400 pt-1">
                  Please check your inbox (and spam folder). The link will expire in 60 minutes.
                </p>
              </div>

              {/* Developer helper / preview URL if present (useful in dev mode or with test mailer) */}
              {result.resetUrl && (
                <div className="p-3 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-left space-y-1 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#667085] dark:text-slate-400">
                    <span>Direct Password Reset Link:</span>
                    <a
                      href={result.resetUrl}
                      className="text-[#6D5EF7] hover:underline inline-flex items-center gap-1 font-semibold"
                    >
                      Open Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="font-mono text-[11px] text-[#172033] dark:text-slate-300 break-all select-all p-1.5 rounded bg-white dark:bg-[#090D16] border border-[#E4E7EC] dark:border-slate-800">
                    {result.resetUrl}
                  </div>
                </div>
              )}

              {result.previewUrl && (
                <div className="text-center pt-1">
                  <a
                    href={result.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6D5EF7] hover:underline"
                  >
                    View Dispatch in Ethereal Mail Viewer <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
                </Link>
                <button
                  type="button"
                  onClick={handleResetAgain}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium text-[#475467] dark:text-slate-300 bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Try Different Email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#172033] dark:text-slate-300">Registered Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="elena@creator.dev"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-sm text-[#172033] dark:text-white placeholder:text-[#667085]/60 focus:bg-white focus:outline-none focus:border-[#6D5EF7] focus:ring-2 focus:ring-[#6D5EF7]/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Sending Instructions...</span>
                ) : (
                  <>
                    <span>Send Password Reset Link</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-[#E4E7EC] dark:border-slate-800 text-xs text-[#667085] dark:text-slate-400">
            Remembered your credentials?{' '}
            <Link to="/login" className="font-semibold text-[#6D5EF7] hover:underline">
              Sign in
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ForgotPasswordPage;

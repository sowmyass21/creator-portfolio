import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import apiService from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Lock, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const { refetchUser } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Password reset token is missing. Please click the link sent to your email.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await apiService.resetPassword({ token, password });
      setSubmitted(true);
      if (refetchUser) {
        await refetchUser().catch(() => {});
      }
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
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
          <h2 className="text-2xl font-bold text-[#172033] dark:text-white tracking-tight pt-2">Set New Password</h2>
          <p className="text-xs text-[#667085] dark:text-slate-400">Choose a new, secure password for your account</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-8 border border-[#E4E7EC] dark:border-slate-800 space-y-6 shadow-sm">
          
          {!token && !submitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#172033] dark:text-white">Invalid or Missing Reset Token</h3>
                <p className="text-xs text-[#667085] dark:text-slate-400">
                  We could not find a valid password recovery token in the URL. Please request a new link.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" /> Request Password Reset
                </Link>
              </div>
            </div>
          ) : submitted ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#172033] dark:text-white">Password Updated!</h3>
                <p className="text-xs text-[#667085] dark:text-slate-400">Your account is verified. Redirecting to your dashboard...</p>
              </div>
              <div className="pt-2">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] transition-colors"
                >
                  Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <div className="flex-1">
                    <span>{error}</span>
                    {error.includes('expired') && (
                      <div className="mt-1">
                        <Link to="/forgot-password" className="font-semibold underline">
                          Request a new reset link &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#172033] dark:text-slate-300">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-sm text-[#172033] dark:text-white placeholder:text-[#667085]/60 focus:bg-white focus:outline-none focus:border-[#6D5EF7] focus:ring-2 focus:ring-[#6D5EF7]/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#172033] dark:text-slate-300">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Repeat your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                  <span>Updating Password...</span>
                ) : (
                  <>
                    <span>Save & Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="text-center pt-2 border-t border-[#E4E7EC] dark:border-slate-800 text-xs text-[#667085] dark:text-slate-400">
            Remembered your existing password?{' '}
            <Link to="/login" className="font-semibold text-[#6D5EF7] hover:underline">
              Sign in
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ResetPasswordPage;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import { Sparkles, User, Mail, Lock, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';

export const RegisterPage = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await register(name, email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          <h2 className="text-2xl font-bold text-[#172033] dark:text-white tracking-tight pt-2">Create Your Creator Account</h2>
          <p className="text-xs text-[#667085] dark:text-slate-400">Aggregate your social metrics & build dynamic portfolios</p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-8 border border-[#E4E7EC] dark:border-slate-800 space-y-6 shadow-sm">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <div className="flex-1">
                <span>{error}</span>
                {error.toLowerCase().includes('already exists') && (
                  <div className="mt-1.5 flex items-center gap-3 font-semibold">
                    <Link to="/login" state={{ email }} className="underline hover:opacity-80">
                      Sign In &rarr;
                    </Link>
                    <span>•</span>
                    <Link to="/forgot-password" state={{ email }} className="underline hover:opacity-80">
                      Reset Password for this email &rarr;
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#172033] dark:text-slate-300">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Elena Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-sm text-[#172033] dark:text-white placeholder:text-[#667085]/60 focus:bg-white focus:outline-none focus:border-[#6D5EF7] focus:ring-2 focus:ring-[#6D5EF7]/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#172033] dark:text-slate-300">Email Address</label>
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

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#172033] dark:text-slate-300">Password</label>
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

            <div className="p-3 rounded-xl bg-[#F8F9FC] dark:bg-slate-900 border border-[#E4E7EC] dark:border-slate-800 text-[11px] text-[#667085] dark:text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#16803D] shrink-0" />
              <span>Accounts are registered with standard USER role. HTTP-only cookie security enforced.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-xs text-white bg-[#6D5EF7] hover:bg-[#5B4CE6] shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>

          </form>

          <div className="text-center pt-2 border-t border-[#E4E7EC] dark:border-slate-800 text-xs text-[#667085] dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#6D5EF7] hover:underline">
              Sign in
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};

export default RegisterPage;

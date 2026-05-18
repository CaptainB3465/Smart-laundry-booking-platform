import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, Mail, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Forgot password flow
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Force no dark mode on this page (#5)
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.remove('dark');
    return () => { if (wasDark) root.classList.add('dark'); };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      const isAdminEmail = email === import.meta.env.VITE_ADMIN_EMAIL;
      navigate(isAdminEmail ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) return setResetError('Please enter your email address.');
    try {
      setResetError('');
      setResetLoading(true);
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (err) {
      setResetError(err.message || 'Failed to send reset email. Check the address and try again.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex justify-center items-center px-4 overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(20, 30, 60, 0.65) 0%, rgba(60, 80, 160, 0.55) 50%, rgba(120, 100, 200, 0.5) 100%)`,
      }}
    >
      {/* Glow Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-120px] right-[-120px] w-[320px] h-[320px] bg-purple-500/30 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-120px] left-[-120px] w-[320px] h-[320px] bg-blue-500/30 rounded-full blur-[140px]" />
      </div>

      {/* Back Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white transition-all hover:-translate-x-1 group z-20"
      >
        <div className="p-1.5 rounded-full bg-white/10 backdrop-blur-md group-hover:bg-white/20 border border-white/10">
          <ArrowLeft size={16} />
        </div>
        Back to Home
      </Link>

      {/* Glass Card */}
      <div className="w-full max-w-[400px] p-6 sm:p-8 rounded-[24px] backdrop-blur-[18px] bg-[rgba(255,255,255,0.15)] border border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative z-10 text-white">

        {/* ── FORGOT PASSWORD VIEW ── */}
        {showForgot ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex p-3 rounded-2xl bg-white/10 border border-white/20 mb-4">
                <Mail size={28} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Reset Password</h2>
              <p className="mt-2 text-white/80 text-sm">Enter your email and we'll send you a reset link.</p>
            </div>

            {resetSent ? (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle size={48} className="text-emerald-400" />
                </div>
                <p className="text-white font-semibold mb-2">Email sent!</p>
                <p className="text-white/70 text-sm mb-6">Check your inbox at <strong>{resetEmail}</strong> for the password reset link.</p>
                <button onClick={() => { setShowForgot(false); setResetSent(false); setResetEmail(''); }} className="text-sm font-semibold text-white/80 hover:text-white underline">
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {resetError && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl text-sm text-center">
                    {resetError}
                  </div>
                )}
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="!min-h-[48px] !bg-[rgba(255,255,255,0.1)] !border-[rgba(255,255,255,0.25)] !text-white placeholder:!text-white/60 focus:!bg-[rgba(255,255,255,0.15)] focus:!border-white/50"
                  required
                />
                <Button
                  type="submit"
                  fullWidth
                  loading={resetLoading}
                  className="!min-h-[48px] text-base font-bold !text-white !bg-[linear-gradient(135deg,#4f8cff,#2563eb)] shadow-[0_10px_25px_rgba(37,99,235,0.4)] hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Send Reset Link
                </Button>
                <div className="text-center pt-2">
                  <button type="button" onClick={() => { setShowForgot(false); setResetError(''); }} className="text-sm text-white/70 hover:text-white font-semibold underline">
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          /* ── SIGN IN VIEW ── */
          <>
            <div className="text-center mb-8">
              <div className="inline-flex p-3 rounded-2xl bg-white/10 border border-white/20 mb-4 transition-transform hover:scale-105">
                <Droplets size={28} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
              <p className="mt-2 text-white/80">Log in to manage your laundry effortlessly.</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl text-sm text-center backdrop-blur-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="!min-h-[48px] !bg-[rgba(255,255,255,0.1)] !border-[rgba(255,255,255,0.25)] !text-white placeholder:!text-white/60 focus:!bg-[rgba(255,255,255,0.15)] focus:!border-white/50"
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={16}
                className="!min-h-[48px] !bg-[rgba(255,255,255,0.1)] !border-[rgba(255,255,255,0.25)] !text-white placeholder:!text-white/60 focus:!bg-[rgba(255,255,255,0.15)] focus:!border-white/50"
                required
              />

              <div className="flex items-center justify-between text-sm pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/30 bg-white/10" />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => { setShowForgot(true); setResetEmail(email); }}
                  className="font-semibold text-white hover:text-blue-200 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                fullWidth
                loading={loading}
                className="!min-h-[48px] text-lg font-bold mt-4 !text-white !bg-[linear-gradient(135deg,#4f8cff,#2563eb)] shadow-[0_10px_25px_rgba(37,99,235,0.4)] hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Sign In
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-white/80">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-white hover:text-blue-200 border-b border-transparent hover:border-blue-300">
                  Create one
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
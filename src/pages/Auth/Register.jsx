import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

// Allowed global email providers commonly used in Kenya
const ALLOWED_DOMAINS = [
  'gmail.com', 'googlemail.com',
  'yahoo.com', 'yahoo.co.ke', 'ymail.com',
  'outlook.com', 'hotmail.com', 'hotmail.co.ke', 'live.com', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me',
  'zoho.com', 'mail.com', 'yandex.com',
];

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Force no dark mode on this page (#5)
  useEffect(() => {
    const root = document.documentElement;
    const wasDark = root.classList.contains('dark');
    root.classList.remove('dark');
    return () => { if (wasDark) root.classList.add('dark'); };
  }, []);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: 'bg-slate-200', text: 'text-slate-400', percent: 0 };
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    switch (strength) {
      case 0:
      case 1: return { label: 'Weak', color: 'bg-red-500', percent: 25 };
      case 2: return { label: 'Medium', color: 'bg-yellow-500', percent: 50 };
      case 3: return { label: 'Good', color: 'bg-blue-500', percent: 75 };
      case 4: return { label: 'Strong', color: 'bg-emerald-500', percent: 100 };
      default: return { label: '', color: 'bg-slate-200', percent: 0 };
    }
  };

  const strength = getPasswordStrength(password);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 9) setPhone(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Name Validation
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return setError('Full Name can only contain letters (no numbers or symbols).');
    }

    // Phone validation
    if (phone.length !== 9) {
      return setError('Phone number must be exactly 9 digits after +254.');
    }

    // Email Validation: check allowed domain
    const emailLower = email.toLowerCase();
    const emailParts = emailLower.split('@');
    if (emailParts.length !== 2 || !ALLOWED_DOMAINS.includes(emailParts[1])) {
      return setError(`Please use a supported email provider (e.g. Gmail, Yahoo, Outlook, iCloud, Hotmail).`);
    }

    // Email must be lowercase
    if (email !== emailLower) {
      return setError('Email must be entirely lowercase.');
    }

    // Password Validation
    if (password.length < 8) return setError('Password must be at least 8 characters');
    if (password.length > 16) return setError('Password cannot exceed 16 characters.');
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return setError('Password must contain letters, numbers, and symbols');
    }
    if (password !== confirmPassword) return setError('Passwords do not match');

    try {
      setError('');
      setLoading(true);
      const user = await register(email, password, name);
      // Save phone to localStorage keyed by uid
      if (user?.uid) {
        localStorage.setItem(`phone_${user.uid}`, `+254${phone}`);
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex justify-center items-center px-4 py-8 overflow-hidden"
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
      <div className="w-full max-w-[420px] p-6 sm:p-8 rounded-[24px] backdrop-blur-[18px] bg-[rgba(255,255,255,0.15)] border border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative z-10 text-white mt-12">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
          <p className="mt-2 text-white/80">Join SmartWash today</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl text-sm text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="!min-h-[48px] !bg-[rgba(255,255,255,0.1)] !border-[rgba(255,255,255,0.25)] !text-white placeholder:!text-white/60 focus:!bg-[rgba(255,255,255,0.15)] focus:!border-white/50"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@gmail.com"
            className="!min-h-[48px] !bg-[rgba(255,255,255,0.1)] !border-[rgba(255,255,255,0.25)] !text-white placeholder:!text-white/60 focus:!bg-[rgba(255,255,255,0.15)] focus:!border-white/50"
            required
          />

          {/* Phone Number with Kenya code */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-white/90">Phone Number</label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-white/25 bg-white/10 text-white/80 text-sm font-semibold">
                +254
              </span>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="7XXXXXXXX"
                className="flex-1 min-w-0 px-4 py-2.5 bg-[rgba(255,255,255,0.1)] border border-white/25 rounded-r-lg text-white placeholder:text-white/50 focus:outline-none focus:bg-[rgba(255,255,255,0.15)] focus:border-white/50 transition-all min-h-[48px]"
                required
              />
            </div>
            <p className="text-[10px] text-white/50">Enter 9 digits after +254 (e.g. 712345678)</p>
          </div>

          {/* Password */}
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={16}
              className="!min-h-[48px] !bg-[rgba(255,255,255,0.1)] !border-[rgba(255,255,255,0.25)] !text-white placeholder:!text-white/60 focus:!bg-[rgba(255,255,255,0.15)] focus:!border-white/50"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-white/50 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            {/* Password Strength */}
            {password && (
              <div className="mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    strength.label === 'Weak' ? 'text-red-400' :
                    strength.label === 'Medium' ? 'text-yellow-400' :
                    strength.label === 'Good' ? 'text-blue-400' :
                    'text-emerald-400'
                  }`}>{strength.label} Password</span>
                  <span className="text-[10px] text-white/60">{strength.percent}% Secure</span>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-500 ease-out`} style={{ width: `${strength.percent}%` }} />
                </div>
                <p className="mt-1.5 text-[9px] text-white/50">Requires 8–16 chars, letters, numbers, and symbols.</p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            maxLength={16}
            className="!min-h-[48px] !bg-[rgba(255,255,255,0.1)] !border-[rgba(255,255,255,0.25)] !text-white placeholder:!text-white/60 focus:!bg-[rgba(255,255,255,0.15)] focus:!border-white/50"
            required
          />

          {/* Submit */}
          <Button
            type="submit"
            fullWidth
            loading={loading}
            className="!min-h-[48px] text-lg font-bold mt-4 !text-white !bg-[linear-gradient(135deg,#4f8cff,#2563eb)] shadow-[0_10px_25px_rgba(37,99,235,0.4)] hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Sign Up
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-white/80">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-white hover:text-blue-200 border-b border-transparent hover:border-blue-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

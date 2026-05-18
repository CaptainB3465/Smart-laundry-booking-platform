import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Eye, EyeOff, Shield, ShieldAlert, ShieldCheck, ArrowLeft } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: 'bg-slate-200', text: 'text-slate-400', percent: 0 };
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    switch (strength) {
      case 0:
      case 1:
        return { label: 'Weak', color: 'bg-red-500', text: 'text-red-500', percent: 25 };
      case 2:
        return { label: 'Medium', color: 'bg-yellow-500', text: 'text-yellow-600', percent: 50 };
      case 3:
        return { label: 'Good', color: 'bg-brand-400', text: 'text-brand-500', percent: 75 };
      case 4:
        return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600', percent: 100 };
      default:
        return { label: '', color: 'bg-slate-200', text: 'text-slate-400', percent: 0 };
    }
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Name Validation: Only letters and spaces
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return setError('Full Name can only contain letters (no numbers or symbols).');
    }

    // Email Validation: Must end with @gmail.com
    if (!email.endsWith('@gmail.com')) {
      return setError('Email must end with @gmail.com');
    }
    
    // Email Validation: Entirely lowercase
    if (email !== email.toLowerCase()) {
      return setError('Email must be entirely lowercase.');
    }

    // Email Validation: Prefix can only be lowercase letters (no numbers, dots, or symbols)
    const emailPrefix = email.split('@')[0];
    if (!/^[a-z]+$/.test(emailPrefix)) {
      return setError('The name before @gmail.com can only contain lowercase letters (no numbers or symbols).');
    }

    // Password Validation
    if (password.length < 8) {
      return setError('Password must be at least 8 characters');
    }
    if (password.length > 16) {
      return setError('Password cannot exceed 16 characters.');
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return setError('Password must contain letters, numbers, and symbols');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await register(email, password, name);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/src/assets/bg.jpg')" }}>
      {/* Overlay layer */}
      <div className="absolute inset-0 pointer-events-none z-0 transition-all duration-300 bg-gradient-to-r from-[rgba(10,20,40,0.6)] to-[rgba(30,60,120,0.5)] backdrop-blur-[2px] dark:from-[rgba(5,10,25,0.8)] dark:to-[rgba(15,30,60,0.7)] dark:backdrop-blur-[4px]" />

      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white transition-all hover:-translate-x-1 group z-20"
      >
        <div className="p-1.5 rounded-full bg-white/10 backdrop-blur-md group-hover:bg-white/20 transition-colors border border-white/10">
          <ArrowLeft size={16} />
        </div>
        Back to Home
      </Link>

      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md backdrop-blur-[12px] bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] rounded-[20px] shadow-2xl p-8 sm:p-10 [&_label]:!text-white/90">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-sm text-white/80">Join SmartWash today</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg text-sm text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="!bg-[rgba(255,255,255,0.05)] !border-[rgba(255,255,255,0.2)] !text-white focus:!bg-[rgba(255,255,255,0.1)] focus:!border-white/40 placeholder:!text-white/40"
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="!bg-[rgba(255,255,255,0.05)] !border-[rgba(255,255,255,0.2)] !text-white focus:!bg-[rgba(255,255,255,0.1)] focus:!border-white/40 placeholder:!text-white/40"
            required
          />
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={16}
              className="!bg-[rgba(255,255,255,0.05)] !border-[rgba(255,255,255,0.2)] !text-white focus:!bg-[rgba(255,255,255,0.1)] focus:!border-white/40 placeholder:!text-white/40"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-white/50 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 animate-fade-in">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    strength.label === 'Weak' ? 'text-red-400' :
                    strength.label === 'Medium' ? 'text-yellow-400' :
                    strength.label === 'Good' ? 'text-blue-400' :
                    strength.label === 'Strong' ? 'text-emerald-400' : 'text-white/50'
                  }`}>
                    {strength.label} Password
                  </span>
                  <span className="text-[10px] text-white/60">
                    {strength.percent}% Secure
                  </span>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${strength.color} transition-all duration-500 ease-out`} 
                    style={{ width: `${strength.percent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[9px] text-white/50 leading-tight">
                  Requires 8+ chars, letters, numbers, and symbols.
                </p>
              </div>
            )}
          </div>
          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            maxLength={16}
            className="!bg-[rgba(255,255,255,0.05)] !border-[rgba(255,255,255,0.2)] !text-white focus:!bg-[rgba(255,255,255,0.1)] focus:!border-white/40 placeholder:!text-white/40"
            required
          />
          <Button type="submit" fullWidth loading={loading} className="mt-6 py-3.5 shadow-xl shadow-blue-900/20 !bg-gradient-to-r !from-blue-500 !to-blue-600 !border-none hover:!from-blue-600 hover:!to-blue-700 !text-white">
            Sign Up
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-white/70">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-white hover:text-blue-200 transition-all border-b-2 border-transparent hover:border-blue-300 pb-0.5">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

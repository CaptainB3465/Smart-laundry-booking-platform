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
    
    // Validation
    if (password.length < 8) {
      return setError('Password must be at least 8 characters');
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
    <div className="relative">
      <Link 
        to="/" 
        className="absolute -top-10 left-0 sm:-left-4 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-600 transition-all hover:-translate-x-1 group"
      >
        <div className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 transition-colors">
          <ArrowLeft size={16} />
        </div>
        Back to Home
      </Link>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create Account</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Join SmartWash today</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-slate-400 hover:text-brand-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          
          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-2 animate-fade-in">
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${strength.text}`}>
                  {strength.label} Password
                </span>
                <span className="text-[10px] text-slate-400">
                  {strength.percent}% Secure
                </span>
              </div>
              <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${strength.color} transition-all duration-500 ease-out`} 
                  style={{ width: `${strength.percent}%` }}
                />
              </div>
              <p className="mt-1.5 text-[9px] text-slate-500 leading-tight">
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
          required
        />
        <Button type="submit" fullWidth loading={loading} className="mt-6">
          Sign Up
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400">
          Sign in
        </Link>
      </div>
    </div>
  );
};

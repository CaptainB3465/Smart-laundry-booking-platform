import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      // Explicitly navigate to the correct portal
      const isAdminEmail = email === import.meta.env.VITE_ADMIN_EMAIL;
      navigate(isAdminEmail ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
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
      <div className="text-center mb-10">
        <div className="inline-flex p-3 rounded-2xl bg-brand-50 dark:bg-brand-900/30 text-brand-600 mb-4 animate-bounce">
          <Droplets size={28} className="text-brand-600" />
        </div>
        <h2 className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
        <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium">Log in to manage your laundry effortlessly.</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm text-center font-medium animate-shake">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-brand-600 transition-colors">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
            <span>Remember me</span>
          </label>
          <button type="button" onClick={() => alert("Password reset link sent to your email (Demo)")} className="font-bold text-brand-600 hover:text-brand-500 transition-colors">
            Forgot password?
          </button>
        </div>

        <Button type="submit" fullWidth loading={loading} className="py-4 text-lg font-bold shadow-xl shadow-brand-500/20 mt-4">
          Sign In to Account
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-500 transition-all border-b-2 border-transparent hover:border-brand-500">
            Create one for free
          </Link>
        </p>
      </div>
    </div>
  );
};

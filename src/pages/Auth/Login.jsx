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
        <div className="text-center mb-10">
          <div className="inline-flex p-3 rounded-2xl bg-white/10 text-white mb-4 animate-bounce border border-white/20">
            <Droplets size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-heading font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-white/80 font-medium">Log in to manage your laundry effortlessly.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-2xl text-sm text-center font-medium animate-shake backdrop-blur-sm">
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
            className="!bg-[rgba(255,255,255,0.05)] !border-[rgba(255,255,255,0.2)] !text-white focus:!bg-[rgba(255,255,255,0.1)] focus:!border-white/40 placeholder:!text-white/40"
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={16}
            className="!bg-[rgba(255,255,255,0.05)] !border-[rgba(255,255,255,0.2)] !text-white focus:!bg-[rgba(255,255,255,0.1)] focus:!border-white/40 placeholder:!text-white/40"
            required
          />
          
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-white/70 hover:text-white transition-colors !text-xs">
              <input type="checkbox" className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500/50" />
              <span>Remember me</span>
            </label>
            <button type="button" onClick={() => alert("Password reset link sent to your email (Demo)")} className="font-bold text-white/90 hover:text-white transition-colors">
              Forgot password?
            </button>
          </div>

          <Button type="submit" fullWidth loading={loading} className="py-4 text-lg font-bold shadow-xl shadow-blue-900/20 mt-4 !bg-gradient-to-r !from-blue-500 !to-blue-600 !border-none hover:!from-blue-600 hover:!to-blue-700 !text-white">
            Sign In to Account
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-white/70 font-medium">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-white hover:text-blue-200 transition-all border-b-2 border-transparent hover:border-blue-300">
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

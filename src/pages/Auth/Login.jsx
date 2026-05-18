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
    <div 
      className="min-h-screen w-full flex justify-center items-center" 
      style={{ 
        background: "linear-gradient(rgba(20, 30, 60, 0.75), rgba(80, 100, 180, 0.6)), url('/src/assets/bg.jpg') center/cover no-repeat" 
      }}
    >
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
      <div 
        className="w-[90%] max-w-[400px] p-6 sm:p-8 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.3)] backdrop-blur-[16px] bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.25)] relative z-10 [&_label]:!text-white/90"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-white/10 text-white mb-4 animate-bounce border border-white/20">
            <Droplets size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="mt-2 text-white/80 font-medium">Log in to manage your laundry effortlessly.</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-xl text-sm text-center font-medium animate-shake backdrop-blur-sm">
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
            className="!min-h-[48px] !bg-[rgba(255,255,255,0.1)] !border-[rgba(255,255,255,0.2)] !text-white focus:!bg-[rgba(255,255,255,0.15)] focus:!border-white/50 placeholder:!text-white/60"
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={16}
            className="!min-h-[48px] !bg-[rgba(255,255,255,0.1)] !border-[rgba(255,255,255,0.2)] !text-white focus:!bg-[rgba(255,255,255,0.15)] focus:!border-white/50 placeholder:!text-white/60"
            required
          />
          
          <div className="flex items-center justify-between text-sm pt-2 pb-2">
            <label className="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white transition-colors">
              <input type="checkbox" className="w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500/50" />
              <span>Remember me</span>
            </label>
            <button type="button" onClick={() => alert("Password reset link sent to your email (Demo)")} className="font-bold text-white hover:text-blue-200 transition-colors">
              Forgot password?
            </button>
          </div>

          <Button 
            type="submit" 
            fullWidth 
            loading={loading} 
            className="!min-h-[48px] text-lg font-bold shadow-lg shadow-blue-900/30 mt-4 !bg-[linear-gradient(to_right,#3b82f6,#2563eb)] !border-none hover:opacity-90 active:scale-[0.98] !text-white transition-all"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-white/80 font-medium">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-white hover:text-blue-200 transition-all border-b-2 border-transparent hover:border-blue-300 pb-0.5">
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

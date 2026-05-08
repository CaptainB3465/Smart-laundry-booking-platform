import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { Droplets, LogOut, User, Menu, Settings } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const { companyName } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isCurrent = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-b border-slate-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-brand-600 hover:text-brand-700 transition-colors dark:text-brand-400 dark:hover:text-brand-300">
          <Droplets size={28} />
          <span className="font-heading text-xl font-bold text-slate-900 dark:text-white tracking-tight">{companyName}</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-brand-600 ${isCurrent('/') ? 'text-brand-600' : 'text-slate-600'}`}
          >
            Home
          </Link>
          {currentUser && (
            <Link 
              to="/booking" 
              className={`text-sm font-medium transition-colors hover:text-brand-600 ${isCurrent('/booking') ? 'text-brand-600' : 'text-slate-600'}`}
            >
              Book Service
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <Link 
                to={isAdmin ? '/admin' : '/dashboard'} 
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
              >
                <User size={18} />
                {isAdmin ? 'Admin' : 'Dashboard'}
              </Link>
              <Link 
                to="/settings" 
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
              >
                <Settings size={18} />
                Settings
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex">
                <LogOut size={16} />
                Logout
              </Button>
              <button className="md:hidden text-slate-600 hover:text-brand-600">
                <Menu size={24} />
              </button>
            </>
          ) : (
            <>
              <Button size="sm" onClick={() => navigate('/booking')}>
                Book Now
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

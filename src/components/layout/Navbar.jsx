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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isCurrent = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-brand-600 hover:text-brand-700 transition-colors dark:text-brand-400 dark:hover:text-brand-300 group">
          <div className="p-1.5 bg-brand-500/10 rounded-lg group-hover:bg-brand-500/20 transition-colors">
            <Droplets size={24} />
          </div>
          <span className="font-heading text-xl font-bold text-slate-900 dark:text-white tracking-tight">{companyName}</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {!currentUser && (
            <Link 
              to="/" 
              className={`text-sm font-semibold transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${isCurrent('/') ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Home
            </Link>
          )}
          {currentUser && !isAdmin && (
            <Link 
              to="/booking" 
              className={`text-sm font-semibold transition-colors hover:text-brand-600 dark:hover:text-brand-400 ${isCurrent('/booking') ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Book Service
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <div className="hidden sm:flex items-center gap-1">
                <Link 
                  to={isAdmin ? '/admin' : '/dashboard'} 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${isCurrent(isAdmin ? '/admin' : '/dashboard') ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  <User size={18} />
                  {isAdmin ? 'Admin' : 'Dashboard'}
                </Link>
                <Link 
                  to="/settings" 
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${isCurrent('/settings') ? 'text-brand-600 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  <Settings size={18} />
                  Settings
                </Link>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1" />
              <Button variant="outline" size="sm" onClick={handleLogout} className="hidden sm:flex border-slate-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                <LogOut size={16} />
                Logout
              </Button>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
            </>
          ) : (
            <>
              {!isAdmin && (
                <Button size="sm" onClick={() => navigate('/booking')} className="shadow-lg shadow-brand-500/20">
                  Book Now
                </Button>
              )}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 animate-fade-in-down shadow-xl z-50">
          <div className="flex flex-col p-4 gap-2">
            {!currentUser && (
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">Home</Link>
            )}
            {currentUser && (
              <>
                {!isAdmin && (
                  <Link to="/booking" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">Book Service</Link>
                )}
                <Link to={isAdmin ? '/admin' : '/dashboard'} onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">{isAdmin ? 'Admin Panel' : 'Dashboard'}</Link>
                <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">Settings</Link>
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="px-4 py-3 text-red-600 font-medium hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl text-left">Logout</button>
              </>
            )}
            {!currentUser && (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 text-brand-600 font-bold hover:bg-brand-50 dark:hover:bg-brand-900/10 rounded-xl">Login / Sign Up</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

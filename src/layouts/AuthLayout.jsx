import React from 'react';
import { Outlet } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const AuthLayout = () => {
  const { companyName } = useSettings();
  return (
    <div className="min-h-screen relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-slate-900">
        <img 
          src="/bg.jpg" 
          alt="Background" 
          className="w-full h-full object-cover"
          onError={(e) => console.error("Image failed to load:", e)}
        />
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md mb-6 animate-fade-in-down">
        <div className="flex justify-center items-center gap-2 text-white">
          <div className="p-2 bg-brand-500 rounded-xl shadow-lg shadow-brand-500/20">
            <Droplets size={32} />
          </div>
          <span className="text-4xl font-heading font-bold tracking-tight">{companyName}</span>
        </div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl py-10 px-4 shadow-2xl sm:rounded-3xl sm:px-12 border border-white/20 dark:border-slate-700/50">
          <Outlet />
        </div>
        
        <p className="mt-8 text-center text-sm text-white/80 font-medium">
          &copy; {new Date().getFullYear()} {companyName} Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};

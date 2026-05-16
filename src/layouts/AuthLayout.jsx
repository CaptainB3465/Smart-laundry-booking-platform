import React from 'react';
import { Outlet } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const AuthLayout = () => {
  const { companyName } = useSettings();
  return (
    <div className="min-h-[100dvh] relative flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
        {/* Ken Burns Animated Background */}
        <div className="absolute inset-0 animate-ken-burns">
          <img 
            src="/premium_laundry_bg_1778956713611.png" 
            alt="" 
            className="w-full h-full object-cover opacity-50"
          />
        </div>

        {/* Dynamic Blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-600/20 rounded-full blur-[100px] animate-blob" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-accent-600/20 rounded-full blur-[80px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[100px] animate-blob animation-delay-4000" />

        <div className="absolute inset-0 bg-slate-50/20 dark:bg-slate-950/60 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-[400px] mb-8 animate-fade-in-down">
        <div className="flex justify-center items-center gap-3 text-slate-900 dark:text-white">
          <div className="p-2.5 bg-brand-500 rounded-2xl shadow-lg shadow-brand-500/20">
            <Droplets size={32} className="text-white" />
          </div>
          <span className="text-3xl sm:text-4xl font-heading font-bold tracking-tight">{companyName}</span>
        </div>
      </div>

      <div className="relative z-10 mx-4 sm:mx-auto sm:w-full sm:max-w-[400px] animate-fade-in-up">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl py-10 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/40 dark:border-slate-800/50">
          <Outlet />
        </div>
        
        <p className="mt-8 text-center text-sm text-slate-500 dark:text-white/80 font-medium">
          &copy; {new Date().getFullYear()} {companyName} Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};

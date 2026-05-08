import React from 'react';
import { Outlet } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const AuthLayout = () => {
  const { companyName } = useSettings();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <div className="flex justify-center items-center gap-2 text-brand-600 dark:text-brand-400">
          <Droplets size={40} />
          <span className="text-3xl font-heading font-bold text-slate-900 dark:text-white">{companyName}</span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-soft sm:rounded-2xl sm:px-10 border border-slate-100">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useSettings } from '../../context/SettingsContext';

export const Footer = () => {
  const { companyName } = useSettings();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-slate-500 dark:text-slate-400 text-sm">
          &copy; {currentYear} {companyName}. All rights reserved.
        </div>
        <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          Built by <span className="text-brand-600 dark:text-brand-400">Munyua B.</span>
        </div>
      </div>
    </footer>
  );
};

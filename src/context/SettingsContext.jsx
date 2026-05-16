import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  // Initialize state from localStorage or use defaults
  // Initialize state from localStorage or use defaults with safety wrapper
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('laundry_theme') || 'light';
    } catch (e) {
      console.warn("Settings: localStorage access failed", e);
      return 'light';
    }
  });
  const [companyName, setCompanyName] = useState(() => {
    try {
      return localStorage.getItem('laundry_company') || 'SmartWash';
    } catch (e) {
      return 'SmartWash';
    }
  });
  const [currency, setCurrency] = useState(() => {
    try {
      return localStorage.getItem('laundry_currency') || '$';
    } catch (e) {
      return '$';
    }
  });

  // Apply theme to document element and save to localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    console.log('Applying theme:', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('laundry_theme', theme);
  }, [theme]);

  // Save company name to localStorage
  useEffect(() => {
    localStorage.setItem('laundry_company', companyName);
  }, [companyName]);

  // Save currency to localStorage
  useEffect(() => {
    localStorage.setItem('laundry_currency', currency);
  }, [currency]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
    companyName,
    setCompanyName,
    currency,
    setCurrency
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

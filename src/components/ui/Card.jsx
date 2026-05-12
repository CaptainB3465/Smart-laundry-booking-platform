import React from 'react';

export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-xl shadow-soft dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-5 border-b border-slate-50 dark:border-slate-800 ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '' }) => {
  return <h3 className={`text-xl font-semibold text-slate-900 dark:text-white ${className}`}>{children}</h3>;
};

export const CardBody = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-50 dark:border-slate-800 ${className}`}>
      {children}
    </div>
  );
};

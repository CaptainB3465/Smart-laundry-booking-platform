import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  type = 'text',
  className = '',
  ...props
}, ref) => {
  return (
    <div className="flex flex-col mb-4">
      {label && <label className="text-sm font-medium text-secondary mb-1.5">{label}</label>}
      <input
        ref={ref}
        type={type}
        className={`
          px-4 py-2.5 bg-primary border rounded-lg text-primary
          transition-colors duration-200 focus:outline-none focus:ring-2 
          ${error 
            ? 'border-red-300 dark:border-red-900/50 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/20' 
            : 'border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:ring-brand-100 dark:focus:ring-brand-900/20 hover:border-slate-300 dark:hover:border-slate-600'}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-red-500 dark:text-red-400 text-xs mt-1.5">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

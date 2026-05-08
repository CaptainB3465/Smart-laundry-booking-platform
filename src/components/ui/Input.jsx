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
      {label && <label className="text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
      <input
        ref={ref}
        type={type}
        className={`
          px-4 py-2.5 bg-white border rounded-lg text-slate-900 
          transition-colors duration-200 focus:outline-none focus:ring-2 
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
            : 'border-slate-200 focus:border-brand-500 focus:ring-brand-100 hover:border-slate-300'}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-red-500 text-xs mt-1.5">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

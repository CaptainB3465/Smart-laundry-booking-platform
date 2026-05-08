import React from 'react';

export const Badge = ({ status }) => {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '-');
  
  const statusStyles = {
    'pending': 'bg-amber-100 text-amber-800 border-amber-200',
    'washing': 'bg-blue-100 text-blue-800 border-blue-200',
    'picked-up': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'out-for-delivery': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
    'delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const style = statusStyles[normalizedStatus] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border ${style}`}>
      {status}
    </span>
  );
};

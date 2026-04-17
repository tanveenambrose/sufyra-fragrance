'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: LucideIcon;
  error?: string;
}

const AuthInput: React.FC<AuthInputProps> = ({ label, icon: Icon, error, ...props }) => {
  return (
    <div className="w-full space-y-2">
      <label className="block text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-luxury-gold transition-colors" />
        )}
        <input
          {...props}
          className={`w-full bg-white/5 border ${
            error ? 'border-red-500/50' : 'border-white/10'
          } rounded-xl py-3 ${
            Icon ? 'pl-11' : 'px-4'
          } pr-4 focus:outline-none focus:border-luxury-gold transition-all text-sm placeholder:text-white/10 hover:bg-white/10`}
        />
      </div>
      {error && <p className="text-[10px] text-red-400 mt-1 ml-1">{error}</p>}
    </div>
  );
};

export default AuthInput;

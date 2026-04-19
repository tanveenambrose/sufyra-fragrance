'use client';

import React from 'react';
import Image from 'next/image';

interface SocialButtonProps {
  provider: 'google' | 'facebook';
  onClick: () => void;
  isLoading?: boolean;
}

const SocialButton: React.FC<SocialButtonProps> = ({ provider, onClick, isLoading }) => {
  const isGoogle = provider === 'google';
  
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center justify-center gap-3 w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 hover:bg-white/10 hover:border-white/20 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="relative w-5 h-5 flex-shrink-0">
        {isGoogle ? (
          <Image 
            src="https://www.google.com/favicon.ico" 
            alt="Google" 
            fill
            sizes="20px"
            className="object-contain"
          />

        ) : (
          <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )}
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">
        Sign in with {isGoogle ? 'Google' : 'Facebook'}
      </span>
    </button>
  );
};

export default SocialButton;

import React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-(--background) flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full luxury-card p-8 sm:p-10 rounded-[30px] border border-luxury-gold/20 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif text-(--foreground) mb-3">Authentication Error</h1>
        <p className="text-sm text-(--foreground)/60 mb-8 leading-relaxed">
          We could not complete your sign-in verification. The authentication code may have expired or is no longer valid.
        </p>
        <div className="space-y-3">
          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 bg-luxury-gold text-black py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-luxury-gold/90 transition-all shadow-lg"
          >
            <ArrowLeft size={16} /> Return to Login
          </Link>
          <Link
            href="/"
            className="w-full inline-block py-3 text-xs uppercase tracking-widest text-(--foreground)/40 hover:text-(--foreground) transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

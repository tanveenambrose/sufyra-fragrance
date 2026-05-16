'use client';

import React, { useEffect, useState } from 'react';
import { Check, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface OrderSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
}

export default function OrderSuccess({ isOpen, onClose, orderId }: OrderSuccessProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Use setTimeout to avoid synchronous setState in effect warning
      const timer = setTimeout(() => setMounted(true), 0);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setMounted(false), 300); // match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !mounted) return null;

  return (
    <div 
      className={`fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
    >
      <div 
        className={`relative w-full max-w-lg bg-[#0A0A0A] border border-luxury-gold/20 rounded-[2.5rem] p-8 sm:p-12 overflow-hidden shadow-[0_0_100px_rgba(212,175,55,0.1)] transition-all duration-500 transform ${isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-90 translate-y-8 opacity-0'}`}
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-luxury-gold/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-luxury-gold/5 rounded-full blur-[100px] -ml-32 -mb-32" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Animated Check Icon */}
          <div 
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-luxury-gold flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(212,175,55,0.3)] transition-all duration-700 delay-200 transform ${isOpen ? 'scale-100 rotate-0' : 'scale-0 -rotate-45'}`}
          >
            <Check size={40} className="text-luxury-charcoal" strokeWidth={3} />
          </div>

          <div className={`space-y-4 transition-all duration-500 delay-300 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-luxury-gold/30 bg-luxury-gold/10 mb-2">
              <Sparkles size={12} className="text-luxury-gold" />
              <span className="text-[10px] text-luxury-gold uppercase tracking-[0.2em] font-bold">Procurement Successful</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-serif text-white italic">Your Scent Journey <br /> <span className="text-luxury-gold not-italic font-normal">Has Begun</span></h2>
            
            <p className="text-[var(--foreground)]/40 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed uppercase tracking-widest font-medium py-2">
              We have received your manifest. Our artisans are now curating your selection with meticulous care.
            </p>

            {orderId && (
              <div className="py-4 border-y border-white/5 my-6">
                <p className="text-[9px] uppercase tracking-[0.3em] text-white/20 font-bold mb-1">Manifest Reference</p>
                <p className="text-sm font-mono text-luxury-gold font-bold">#{orderId.slice(0, 8).toUpperCase()}</p>
              </div>
            )}

            <div className="flex flex-col gap-4 mt-8">
              <button 
                onClick={onClose}
                className="luxury-gradient px-12 py-4 rounded-xl text-luxury-charcoal font-bold uppercase tracking-[0.2em] text-[10px] hover:brightness-110 transition-all flex items-center justify-center gap-2 group"
              >
                Enter the Sanctuary <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <Link 
                href="/admin/orders" 
                onClick={onClose}
                className="px-12 py-4 rounded-xl text-white/40 hover:text-white font-bold uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={14} /> View My Manifests
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Decorative Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-luxury-gold/50 to-transparent" />
      </div>
    </div>
  );
}

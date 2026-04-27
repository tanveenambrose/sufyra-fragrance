'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ChevronRight } from 'lucide-react';
import { useTheme } from 'next-themes';

const Hero = () => {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const bgRef = useRef(null);
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.to(bgRef.current, {
        scale: 1,
        duration: 3,
        ease: 'power3.out'
      })
        .from(titleRef.current, {
          y: 50,
          opacity: 0,
          duration: 1.2,
          ease: 'power4.out',
        }, '-=2.5')
        .from(subtitleRef.current, {
          y: 30,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        }, '-=1.8')
        .from(ctaRef.current, {
          scale: 0.8,
          opacity: 0,
          duration: 0.8,
          ease: 'back.out(1.7)',
        }, '-=1.5');
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden bg-[var(--background)] transition-colors duration-500">
      {/* Subtle Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-luxury-gold/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-luxury-bronze/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-7xl pt-20" suppressHydrationWarning>
        <h2 ref={subtitleRef} className="mb-8 md:mb-12">
          <span className="text-luxury-gold uppercase tracking-[1em] sm:tracking-[1.5em] text-[10px] sm:text-[13px] font-bold">
            Pure Essence of Luxury
          </span>
        </h2>
        <h1 ref={titleRef} className="text-5xl sm:text-8xl md:text-[9rem] lg:text-[11rem] font-serif text-[var(--foreground)] mb-12 md:mb-16 leading-[1] tracking-tight transition-colors duration-300">
          Fragrance That <br /> <span className="font-normal italic">Suits you</span>
        </h1>
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-8 mt-10 md:mt-16">
          <button className="luxury-gradient px-12 sm:px-16 py-4 sm:py-5 rounded-full text-luxury-charcoal font-bold uppercase tracking-[0.2em] text-[11px] sm:text-sm hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 min-w-[220px] shadow-2xl shadow-luxury-gold/10" suppressHydrationWarning>
            Discover Collection
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce opacity-40">
        <span className="text-[10px] uppercase tracking-[0.4em] text-[var(--foreground)] font-bold">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-luxury-gold to-transparent" />
      </div>
    </div>
  );
};

export default Hero;

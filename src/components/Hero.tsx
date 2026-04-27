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
    <div ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background with Zoom Effect */}
      <div ref={bgRef} className="absolute inset-0 scale-110" suppressHydrationWarning>
        <Image
          src="/hero.png"
          alt="Luxury Fragrance Hero"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className={`absolute inset-0 transition-colors duration-500 ${
          mounted && theme === 'light' 
            ? 'bg-luxury-cream/20' 
            : 'bg-gradient-to-b from-black/60 via-black/20 to-[var(--background)]'
        }`} />

      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl pt-20 pb-24 sm:pb-32" suppressHydrationWarning>
        <h2 ref={subtitleRef} className="mb-4 md:mb-6">
          <div className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-lg px-4 sm:px-6 py-2 sm:py-2.5 transition-all hover:bg-black/50 overflow-hidden">
            <span className="bg-[#c5a059] text-black px-3 sm:px-4 py-1.5 font-serif uppercase tracking-[0.3em] sm:tracking-[0.5em] text-[10px] sm:text-[11px] font-bold">
              Pure Essence of Luxury
            </span>
          </div>
        </h2>
        <h1 ref={titleRef} className="text-3xl sm:text-6xl md:text-8xl font-serif text-[var(--foreground)] mb-6 md:mb-8 leading-tight transition-colors duration-300">
          Fragrance That <br /> <span className="font-normal italic">Suits you</span>
        </h1>
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6 md:mt-10">
          <button className="luxury-gradient w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-4 rounded-full text-luxury-charcoal font-bold uppercase tracking-wider text-[11px] sm:text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2 min-w-[180px] sm:min-w-[220px]" suppressHydrationWarning>
            Discover Collection
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
 
      {/* Scroll Indicator */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-bounce opacity-50">
        <span className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/50">Scroll</span>
        <div className="w-[1px] h-8 sm:h-12 bg-gradient-to-b from-luxury-gold to-transparent" />
      </div>
    </div>
  );
};

export default Hero;

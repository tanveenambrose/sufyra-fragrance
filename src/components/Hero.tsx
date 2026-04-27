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
            ? 'bg-gradient-to-b from-black/50 via-black/20 to-black/30' 
            : 'bg-gradient-to-b from-black/60 via-black/20 to-[var(--background)]'
        }`} />


      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl pt-20 pb-24 sm:pb-32" suppressHydrationWarning>
        <h2 ref={subtitleRef} className="mb-6 md:mb-10">
          <div className="inline-flex items-center justify-center border-b border-luxury-gold/60 pb-3 transition-all">
            <span className="text-luxury-gold uppercase tracking-[0.5em] sm:tracking-[0.8em] text-[10px] sm:text-[13px] font-bold">
              Pure Essence of Luxury
            </span>
          </div>
        </h2>
        <h1 ref={titleRef} className="text-4xl sm:text-7xl md:text-9xl font-serif text-white mb-8 md:mb-12 leading-tight transition-colors duration-300 drop-shadow-2xl">
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
      <div className="absolute bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce opacity-80">
        <span className="text-[10px] uppercase tracking-[0.3em] text-white font-bold">Scroll</span>
        <div className="w-[1px] h-10 sm:h-16 bg-gradient-to-b from-luxury-gold to-transparent" />
      </div>
    </div>
  );
};

export default Hero;

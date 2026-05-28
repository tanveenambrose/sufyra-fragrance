'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="relative min-h-[580px] h-[100dvh] lg:h-screen lg:min-h-screen w-full flex flex-col lg:flex-row items-center justify-center overflow-hidden bg-[var(--background)] transition-colors duration-500 pt-20 lg:pt-20 pb-4 lg:pb-0">
      {/* Subtle Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-luxury-gold/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-luxury-bronze/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Left Content (60%) */}
      <div className="relative z-10 w-full lg:w-[60%] px-6 lg:px-20 text-center lg:text-left" suppressHydrationWarning>
        <h2 className="mb-2 md:mb-6 animate-[hero-subtitle_1s_cubic-bezier(0.04,0.56,0.4,1)_0.2s_both]">
          <span className="text-luxury-gold uppercase tracking-[1em] sm:tracking-[1.2em] text-[10px] sm:text-[12px] font-bold block">
            Pure Essence of Luxury
          </span>
        </h2>
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif text-[var(--foreground)] mb-4 md:mb-8 leading-[1.1] tracking-tight transition-colors duration-300 animate-[hero-title_1.2s_cubic-bezier(0.18,0.89,0.32,1.28)_0.5s_both]">
          Fragrance That <br /> <span className="font-normal italic">Suits you</span>
        </h1>
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-2 md:mt-8 animate-[hero-cta_0.8s_cubic-bezier(0.68,-0.55,0.265,1.55)_0.8s_both]">
          <button className="luxury-gradient px-10 sm:px-14 py-3 sm:py-4 rounded-full text-luxury-charcoal font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 min-w-[180px] sm:min-w-[200px] shadow-2xl shadow-luxury-gold/10" suppressHydrationWarning>
            Discover Collection
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Photo Cluster (40%) */}
      <div className="relative w-full lg:w-[40%] h-[260px] sm:h-[350px] lg:h-screen flex items-center justify-center px-6 pointer-events-none">
        <div className="relative w-full h-full max-w-md">
          {/* Main Large Image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-56 sm:w-72 sm:h-[400px] z-20 rounded-2xl overflow-hidden shadow-2xl rotate-3 animate-[float-1_6s_ease-in-out_0s_infinite]">
            <Image
              src="/cluster-oud.png"
              alt="Luxury Oud"
              fill
              sizes="(max-width: 640px) 176px, 288px"
              priority
              className="object-cover"
            />
          </div>

          {/* Secondary Top Image */}
          <div className="absolute top-1/4 right-0 w-28 h-36 sm:w-48 sm:h-64 z-10 rounded-2xl overflow-hidden shadow-xl -rotate-6 animate-[float-2_5s_ease-in-out_0.5s_infinite]">
            <Image
              src="/cluster-floral.png"
              alt="Floral Essence"
              fill
              sizes="(max-width: 640px) 112px, 192px"
              className="object-cover"
            />
          </div>

          {/* Third Bottom Image */}
          <div className="absolute bottom-1/4 left-0 w-32 h-40 sm:w-52 sm:h-64 z-30 rounded-2xl overflow-hidden shadow-xl rotate-12 animate-[float-3_8s_ease-in-out_1s_infinite]">
            <Image
              src="/cluster-modern.png"
              alt="Modern Minimalist"
              fill
              sizes="(max-width: 640px) 8rem, 13rem"
              priority
              className="object-cover"
            />
          </div>

          {/* Decorative Review Quote Tag */}
          <div className="absolute top-[10%] left-0 z-40 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-lg max-w-[200px] animate-[float-2_5s_ease-in-out_0.5s_infinite] hidden sm:block">
            <p className="text-[10px] text-[var(--foreground)] font-bold italic leading-relaxed">
              &quot;The most captivating scent I have ever worn. Pure luxury in a bottle.&quot;
            </p>
            <div className="mt-2 text-luxury-gold text-[8px] font-bold uppercase tracking-widest">- Sarah J.</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 sm:gap-4 animate-bounce opacity-40">
        <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-[var(--foreground)] font-bold">Scroll</span>
        <div className="w-[1px] h-6 sm:h-12 bg-gradient-to-b from-luxury-gold to-transparent" />
      </div>
    </div>
  );
};

export default Hero;

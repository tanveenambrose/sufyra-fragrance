'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ChevronRight } from 'lucide-react';

const Hero = () => {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const bgRef = useRef(null);
  const containerRef = useRef(null);

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
      <div ref={bgRef} className="absolute inset-0 scale-110">
        <Image
          src="/hero.png"
          alt="Luxury Fragrance Hero"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-luxury-charcoal" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <h2 ref={subtitleRef} className="text-luxury-gold uppercase tracking-[0.5em] text-sm md:text-base mb-6 font-medium">
          Pure Essence of Luxury
        </h2>
        <h1 ref={titleRef} className="text-5xl md:text-8xl font-serif text-luxury-cream mb-8 leading-tight">
          Fragrance That <br /> <span className="font-normal">Suites you</span>
        </h1>
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
          <button className="luxury-gradient px-12 py-4 rounded-full text-luxury-charcoal font-bold uppercase tracking-wider text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2 min-w-[220px]">
            Discover Collection
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-bounce opacity-50">
        <span className="text-[10px] uppercase tracking-widest text-white/50">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-luxury-gold to-transparent" />
      </div>
    </div>
  );
};

export default Hero;

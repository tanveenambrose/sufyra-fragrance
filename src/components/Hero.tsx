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
  const containerRef = useRef(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(titleRef.current, {
          y: 50,
          opacity: 0,
          duration: 1.2,
          ease: 'power4.out',
        })
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
      // Floating Cluster Animations
      gsap.to('.floating-item-1', {
        y: 20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut'
      });
      gsap.to('.floating-item-2', {
        y: -15,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 0.5
      });
      gsap.to('.floating-item-3', {
        y: 25,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 1
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen w-full flex flex-col lg:flex-row items-center justify-center overflow-hidden bg-[var(--background)] transition-colors duration-500 pt-32 lg:pt-20">
      {/* Subtle Decorative Elements */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-luxury-gold/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-luxury-bronze/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Left Content (60%) */}
      <div className="relative z-10 w-full lg:w-[60%] px-6 lg:px-20 text-center lg:text-left py-8" suppressHydrationWarning>
        <h2 ref={subtitleRef} className="mb-4 md:mb-6">
          <span className="text-luxury-gold uppercase tracking-[1em] sm:tracking-[1.2em] text-[10px] sm:text-[12px] font-bold block">
            Pure Essence of Luxury
          </span>
        </h2>
        <h1 ref={titleRef} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-serif text-[var(--foreground)] mb-6 md:mb-8 leading-[1.1] tracking-tight transition-colors duration-300">
          Fragrance That <br /> <span className="font-normal italic">Suits you</span>
        </h1>
        <div ref={ctaRef} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 mt-4 md:mt-8">
          <button className="luxury-gradient px-12 sm:px-14 py-4 rounded-full text-luxury-charcoal font-bold uppercase tracking-[0.2em] text-[11px] sm:text-xs hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-3 min-w-[200px] shadow-2xl shadow-luxury-gold/10" suppressHydrationWarning>
            Discover Collection
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right Photo Cluster (40%) */}
      <div className="relative w-full lg:w-[40%] h-[500px] lg:h-screen flex items-center justify-center px-6 pointer-events-none">
        <div className="relative w-full h-full max-w-md">
          {/* Main Large Image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-72 sm:w-72 sm:h-[400px] z-20 rounded-2xl overflow-hidden shadow-2xl rotate-3 floating-item-1">
            <Image
              src="/cluster-oud.png"
              alt="Luxury Oud"
              fill
              sizes="(max-width: 640px) 14rem, 18rem"
              priority
              quality={100}
              className="object-cover"
            />
          </div>
          
          {/* Secondary Top Image */}
          <div className="absolute top-1/4 right-0 w-36 h-48 sm:w-48 sm:h-64 z-10 rounded-2xl overflow-hidden shadow-xl -rotate-6 floating-item-2">
            <Image
              src="/cluster-floral.png"
              alt="Floral Essence"
              fill
              sizes="(max-width: 640px) 9rem, 12rem"
              priority
              quality={100}
              className="object-cover"
            />
          </div>

          {/* Third Bottom Image */}
          <div className="absolute bottom-1/4 left-0 w-40 h-52 sm:w-52 sm:h-64 z-30 rounded-2xl overflow-hidden shadow-xl rotate-12 floating-item-3">
            <Image
              src="/cluster-modern.png"
              alt="Modern Minimalist"
              fill
              sizes="(max-width: 640px) 10rem, 13rem"
              priority
              className="object-cover"
            />
          </div>

          {/* Decorative Review Quote Tag */}
          <div className="absolute top-[10%] left-0 z-40 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-lg max-w-[200px] floating-item-2 hidden sm:block">
            <p className="text-[10px] text-[var(--foreground)] font-bold italic leading-relaxed">
              "The most captivating scent I have ever worn. Pure luxury in a bottle."
            </p>
            <div className="mt-2 text-luxury-gold text-[8px] font-bold uppercase tracking-widest">- Sarah J.</div>
          </div>
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

'use client';

import React, { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import ProductSlider from '@/components/ProductSlider';
import { products } from '@/data/products';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Reveal animations for product cards
      const cards = gsap.utils.toArray('.reveal');
      
      cards.forEach((card) => {
        gsap.to(card as HTMLElement, {
          scrollTrigger: {
            trigger: card as HTMLElement,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
        });
      });
    });

    return () => {
      ctx.revert(); // Properly cleanup all GSAP animations
    };
  }, []);

  return (
    <main className="min-h-screen bg-luxury-charcoal" suppressHydrationWarning>
      <Hero />

      {/* Featured Collections */}
      <ProductSlider 
        products={products.filter(p => p.category === 'perfume-oil')}
        title="Timeless Fragrances"
        subtitle="Perfume Oils"
      />

      <ProductSlider 
        products={products.filter(p => p.category === 'combo')}
        title="Exclusive Sets"
        subtitle="Combo Packs"
      />

      {/* Luxury Quote Section */}
      <section className="py-32 bg-white/[0.02] border-y border-white/5 reveal">
        <div className="container mx-auto px-6 text-center">
          <span className="text-5xl md:text-8xl text-luxury-gold/10 font-serif absolute -top-10 left-1/2 -translate-x-1/2 select-none">&quot;</span>
          <p className="text-2xl md:text-4xl font-serif text-luxury-cream/80 max-w-3xl mx-auto italic leading-snug">
            Perfume is the most intense form of memory. <br />
            It is the key to our heart, and the soul of our identity.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
             <div className="w-12 h-[1px] bg-luxury-gold/30" />
             <span className="text-luxury-gold uppercase tracking-[0.5em] text-xs">Sufyra Signature</span>
             <div className="w-12 h-[1px] bg-luxury-gold/30" />
          </div>
        </div>
      </section>

      {/* Footer Placeholder for completeness */}
      <footer className="py-12 border-t border-white/5">
         <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-xl font-serif text-luxury-gold">SUFYRA</div>
            <div className="flex gap-8 text-[10px] uppercase tracking-[0.2em] text-white/30">
               <a href="#" className="hover:text-luxury-gold transition-colors">Privacy Policy</a>
               <a href="#" className="hover:text-luxury-gold transition-colors">Terms of Service</a>
               <a href="#" className="hover:text-luxury-gold transition-colors">Contact Us</a>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/20">
               © 2026 Sufyra Fragrances. All rights reserved.
            </div>
         </div>
      </footer>

    </main>
  );
}

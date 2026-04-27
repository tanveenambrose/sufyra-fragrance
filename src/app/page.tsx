'use client';

import React, { useState, useEffect } from 'react';
import Hero from '@/components/Hero';
import ProductSlider from '@/components/ProductSlider';
import { Product } from '@/data/products';
import { supabase } from '@/lib/supabase';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data) setDbProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
  }, [dbProducts]);

  return (
    <main className="min-h-screen bg-[var(--background)] transition-colors duration-300" suppressHydrationWarning>
      <Hero />

      {/* Featured Collections */}
      <ProductSlider 
        products={dbProducts.filter(p => p.category === 'perfume-oil')}
        title="Timeless Fragrances"
        subtitle="Perfume Oils"
      />

      <ProductSlider 
        products={dbProducts.filter(p => p.category === 'combo')}
        title="Exclusive Sets"
        subtitle="Combo Packs"
      />

      {/* Luxury Quote Section */}
      <section className="py-20 sm:py-32 bg-[var(--accent-soft)] border-y border-[var(--foreground)]/5 relative overflow-hidden reveal">
        <div className="container mx-auto px-6 text-center">
          <span className="text-6xl sm:text-8xl text-luxury-gold/10 font-serif absolute top-[-20px] left-1/2 -translate-x-1/2 select-none">&quot;</span>
          <p className="text-lg sm:text-2xl md:text-4xl font-serif text-[var(--foreground)]/80 max-w-3xl mx-auto italic leading-snug sm:leading-normal transition-colors duration-300">
            Perfume is the most intense form of memory. <br className="hidden sm:block" />
            It is the key to our heart, and the soul of our identity.
          </p>
          <div className="mt-6 sm:mt-10 flex items-center justify-center gap-3 sm:gap-4">
             <div className="w-8 sm:w-12 h-[1px] bg-luxury-gold/30" />
             <span className="text-luxury-gold uppercase tracking-[0.3em] sm:tracking-[0.5em] text-[8px] sm:text-xs font-bold">Sufyra Signature</span>
             <div className="w-8 sm:w-12 h-[1px] bg-luxury-gold/30" />
          </div>
        </div>
      </section>


    </main>
  );
}

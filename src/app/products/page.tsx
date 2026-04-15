'use client';

import React, { useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProductsPage() {

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.reveal');
      
      cards.forEach((card) => {
        gsap.to(card as HTMLElement, {
          scrollTrigger: {
            trigger: card as HTMLElement,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
        });
      });
    });

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <main className="min-h-screen bg-luxury-charcoal pb-24">
      {/* Page Header */}
      <section className="pt-40 pb-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-luxury-gold uppercase tracking-[0.4em] text-sm mb-6">Explore Our</h1>
          <h2 className="text-5xl md:text-7xl font-serif text-luxury-cream mb-8">Full Collection</h2>
          <div className="w-20 h-[1px] bg-luxury-gold mx-auto" />
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

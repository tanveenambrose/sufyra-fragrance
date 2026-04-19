'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { products } from '@/data/products';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.reveal');
      
      cards.forEach((card) => {
        gsap.fromTo(card as HTMLElement, 
          { y: 30, opacity: 0 },
          {
            scrollTrigger: {
              trigger: card as HTMLElement,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
          }
        );
      });
    });

    return () => ctx.revert();
  }, [selectedCategory, minPrice, maxPrice]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const productPrice = Math.min(...product.variants.map(v => v.price));
    const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;
    return matchesCategory && matchesPrice;
  });

  const categories = [
    { id: 'all', label: 'All Collection' },
    { id: 'perfume-oil', label: 'Regular' },
    { id: 'combo', label: 'Combo Packs' },
  ];

  return (
    <main className="min-h-screen bg-luxury-charcoal pb-24 pt-32">
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="mb-16 text-center md:text-left">
          <h1 className="text-luxury-cream font-serif text-4xl md:text-6xl mb-4">Sufyra Boutique</h1>
          <p className="text-white/40 text-sm tracking-widest uppercase">Elegance in every drop</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-72 flex-shrink-0 space-y-12">
            {/* Price Filter */}
            <div className="space-y-6">
              <h3 className="text-luxury-gold text-xs font-bold uppercase tracking-[0.3em] border-b border-white/5 pb-4">Filter By Price</h3>
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                     <label className="text-[10px] text-white/20 uppercase tracking-widest">Min Price</label>
                     <input 
                       type="range" 
                       min="0" 
                       max="2000" 
                       step="50"
                       value={minPrice}
                       onChange={(e) => setMinPrice(Math.min(parseInt(e.target.value), maxPrice - 50))}
                       className="w-full accent-luxury-gold bg-white/10 h-1 rounded-full cursor-pointer appearance-none"
                     />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] text-white/20 uppercase tracking-widest">Max Price</label>
                     <input 
                       type="range" 
                       min="0" 
                       max="2000" 
                       step="50"
                       value={maxPrice}
                       onChange={(e) => setMaxPrice(Math.max(parseInt(e.target.value), minPrice + 50))}
                       className="w-full accent-luxury-gold bg-white/10 h-1 rounded-full cursor-pointer appearance-none"
                     />
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-white/40 uppercase tracking-widest bg-white/5 p-3 rounded-lg border border-white/5">
                  <span>{minPrice}৳ — {maxPrice}৳</span>
                  <button 
                    onClick={() => { setMinPrice(0); setMaxPrice(2000); }} 
                    className="text-luxury-gold hover:text-white transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-6">
              <h3 className="text-luxury-gold text-xs font-bold uppercase tracking-[0.3em] border-b border-white/5 pb-4">Product Status</h3>
              <div className="flex flex-col gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-left text-[11px] uppercase tracking-widest transition-all duration-300 flex items-center justify-between group ${
                      selectedCategory === cat.id ? 'text-luxury-gold' : 'text-white/30 hover:text-white'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`w-1.5 h-1.5 rounded-full transition-all ${
                      selectedCategory === cat.id ? 'bg-luxury-gold scale-100' : 'bg-white/10 scale-0 group-hover:scale-50'
                    }`} />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center justify-between border-y border-white/5 py-4 mb-8">
             <button 
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="flex items-center gap-2 text-luxury-gold text-[10px] font-bold uppercase tracking-widest"
             >
                <SlidersHorizontal size={14} />
                Filters
             </button>
             <span className="text-[10px] text-white/30 uppercase tracking-widest">{filteredProducts.length} Products Found</span>
          </div>

          {/* Product Grid */}
          <div className="flex-grow">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                <p className="text-white/20 uppercase tracking-widest text-sm">No scents found in this range.</p>
                <button 
                  onClick={() => { setSelectedCategory('all'); setMinPrice(0); setMaxPrice(2000); }}
                  className="text-luxury-gold text-xs font-bold uppercase tracking-[0.2em] border-b border-luxury-gold pb-1"
                >
                  View All Scents
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100] bg-luxury-charcoal/95 backdrop-blur-lg p-8 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-luxury-gold text-xs font-bold uppercase tracking-[0.3em]">Filters</h2>
            <button onClick={() => setIsMobileFilterOpen(false)} className="text-white hover:text-luxury-gold">
              <ChevronDown size={24} />
            </button>
          </div>
          
          <div className="space-y-12">
            <div className="space-y-6">
              <h3 className="text-white text-[10px] font-bold uppercase tracking-widest text-white/40">Status</h3>
              <div className="flex flex-col gap-6">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setIsMobileFilterOpen(false); }}
                    className={`text-2xl font-serif text-left ${
                      selectedCategory === cat.id ? 'text-luxury-gold' : 'text-white/60'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-white text-[10px] font-bold uppercase tracking-widest text-white/40 uppercase">Price Range: {minPrice}৳ — {maxPrice}৳</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] text-white/20">Min Price</label>
                   <input 
                     type="range" 
                     min="0" 
                     max="2000" 
                     step="50"
                     value={minPrice}
                     onChange={(e) => setMinPrice(Math.min(parseInt(e.target.value), maxPrice - 50))}
                     className="w-full accent-luxury-gold"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] text-white/20">Max Price</label>
                   <input 
                     type="range" 
                     min="0" 
                     max="2000" 
                     step="50"
                     value={maxPrice}
                     onChange={(e) => setMaxPrice(Math.max(parseInt(e.target.value), minPrice + 50))}
                     className="w-full accent-luxury-gold"
                   />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsMobileFilterOpen(false)}
            className="w-full luxury-gradient py-4 rounded-xl text-luxury-charcoal font-bold uppercase tracking-widest text-xs mt-12 mb-8"
          >
            Show {filteredProducts.length} Results
          </button>
        </div>
      )}
    </main>
  );
}


export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-luxury-charcoal" />}>
      <ProductsContent />
    </Suspense>
  );
}


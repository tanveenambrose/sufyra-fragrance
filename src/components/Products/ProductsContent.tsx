'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Product } from '@/data/products';

interface ProductsContentProps {
  initialProducts: Product[];
}

export default function ProductsContent({ initialProducts }: ProductsContentProps) {
  const searchParams = useSearchParams();
  const [dbProducts] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(2000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setTimeout(() => setSelectedCategory(category), 0);
    }
  }, [searchParams]);

  // Scroll reveal for product cards
  useEffect(() => {
    const cards = document.querySelectorAll('.reveal');
    if (!cards.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [selectedCategory, minPrice, maxPrice, dbProducts]);

  const filteredProducts = dbProducts.filter(product => {
    const searchQuery = searchParams.get('search')?.toLowerCase() || '';
    const matchesSearch = !searchQuery ||
      product.name.toLowerCase().includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery) ||
      product.category.toLowerCase().includes(searchQuery);

    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const lowestPrice = Math.min(...product.variants.map(v => v.price));

    const discount = product.discount_percent || 0;
    const productPrice = discount > 0 ? Math.round(lowestPrice * (1 - discount / 100)) : lowestPrice;

    const matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const categories = [
    { id: 'all', label: 'All Collection' },
    { id: 'perfume-oil', label: 'Regular' },
    { id: 'combo', label: 'Combo Packs' },
  ];

  return (
    <main className="min-h-screen bg-(--background) pb-24 pt-28 sm:pt-32 lg:pt-36 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          <aside className="hidden lg:block w-64 shrink-0 space-y-16 sticky top-32">
            <div className="space-y-6">
              <h3 className="text-luxury-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-6">Filter By Price</h3>
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-(--foreground)/60 uppercase tracking-widest font-bold">Min Price</label>
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="50"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Math.min(parseInt(e.target.value), maxPrice - 50))}
                      className="w-full accent-luxury-gold bg-(--foreground)/10 h-1 rounded-full cursor-pointer appearance-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-(--foreground)/60 uppercase tracking-widest font-bold">Max Price</label>
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      step="50"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Math.max(parseInt(e.target.value), minPrice + 50))}
                      className="w-full accent-luxury-gold bg-(--foreground)/10 h-1 rounded-full cursor-pointer appearance-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-4 py-4 border-y border-(--foreground)/5">
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-bold text-(--foreground)/60 uppercase tracking-widest">Range</span>
                    <span className="text-[10px] font-bold text-luxury-gold uppercase tracking-widest">{minPrice}৳ — {maxPrice}৳</span>
                  </div>
                  <button
                    onClick={() => { setMinPrice(0); setMaxPrice(2000); }}
                    className="text-[10px] text-luxury-gold hover:text-(--foreground) transition-colors uppercase tracking-widest font-bold text-left w-fit"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-luxury-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-6">Product Status</h3>
              <div className="flex flex-col gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`text-left text-[11px] uppercase tracking-widest transition-all duration-300 flex items-center justify-between group ${
                      selectedCategory === cat.id ? 'text-luxury-gold' : 'text-(--foreground)/60 hover:text-(--foreground)'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`w-1.5 h-1.5 rounded-full transition-all ${selectedCategory === cat.id ? 'bg-luxury-gold scale-100' : 'bg-(--foreground)/10 scale-0 group-hover:scale-50'
                      }`} />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="lg:hidden flex items-center justify-between border-y border-(--foreground)/5 py-4 mb-8">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="flex items-center gap-2 text-luxury-gold text-[10px] font-bold uppercase tracking-widest"
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>
            <span className="text-[10px] text-(--foreground)/60 uppercase tracking-widest font-bold">{filteredProducts.length} Products Found</span>
          </div>

          <div className="grow">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-10 sm:gap-y-16">
                {filteredProducts.map((product, index) => (
                  <div key={product.id} className="reveal reveal-fast">
                    <ProductCard product={product} priority={index < 4} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
                <p className="text-(--foreground)/20 uppercase tracking-widest text-sm">No scents found in this range.</p>
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

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-100 bg-(--background)/95 backdrop-blur-lg p-8 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-luxury-gold text-[10px] font-bold uppercase tracking-[0.4em]">Filters</h2>
            <button onClick={() => setIsMobileFilterOpen(false)} className="text-(--foreground) hover:text-luxury-gold">
              <ChevronDown size={24} />
            </button>
          </div>

          <div className="space-y-12">
            <div className="space-y-6">
              <h3 className="text-(--foreground)/70 text-[10px] font-bold uppercase tracking-widest">Status</h3>
              <div className="flex flex-col gap-6">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setIsMobileFilterOpen(false); }}
                    className={`text-2xl font-serif text-left ${selectedCategory === cat.id ? 'text-luxury-gold' : 'text-(--foreground)/70'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-(--foreground)/10">
              <h3 className="text-(--foreground)/70 text-[10px] font-bold uppercase tracking-widest">Price Range: {minPrice}৳ — {maxPrice}৳</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-(--foreground)/60 font-bold uppercase tracking-widest">Min Price</label>
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
                  <label className="text-[10px] text-(--foreground)/60 font-bold uppercase tracking-widest">Max Price</label>
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

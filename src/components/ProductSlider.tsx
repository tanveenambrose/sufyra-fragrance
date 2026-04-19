'use client';

import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import ProductCard from './ProductCard';
import { Product } from '@/data/products';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductSliderProps {
  products: Product[];
  title: string;
  subtitle?: string;
}

const ProductSlider: React.FC<ProductSliderProps> = ({ products, title, subtitle }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start',
      slidesToScroll: 1,
      containScroll: 'trimSnaps'
    }, 
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="py-12 sm:py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center sm:items-end mb-8 sm:mb-12 gap-6 reveal">
          <div className="text-center md:text-left">
            {subtitle && (
              <h2 className="text-luxury-gold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-sm mb-2 sm:mb-4">
                {subtitle}
              </h2>
            )}
            <h3 className="text-3xl sm:text-5xl md:text-6xl font-serif text-luxury-cream">{title}</h3>
          </div>
          
          <div className="flex gap-3 sm:gap-4 scale-90 sm:scale-100">
            <button 
              onClick={scrollPrev}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:border-luxury-gold hover:text-luxury-gold transition-all"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button 
              onClick={scrollNext}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:border-luxury-gold hover:text-luxury-gold transition-all"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" ref={emblaRef} suppressHydrationWarning>
          <div className="flex -ml-4 md:-ml-6" suppressHydrationWarning>
            {products.map((product) => (
              <div 
                key={product.id} 
                className="flex-[0_0_80%] sm:flex-[0_0_45%] lg:flex-[0_0_25%] xl:flex-[0_0_20%] pl-4 md:pl-6 min-w-0"
              >
                <div className="h-full" suppressHydrationWarning>
                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSlider;

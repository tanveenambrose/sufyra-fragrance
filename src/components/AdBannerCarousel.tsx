'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import { 
  Sparkles, 
  Truck, 
  Flame, 
  Gift, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

interface AdSlide {
  id: string;
  badge: string;
  badgeIcon: React.ReactNode;
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaHref: string;
  highlightText?: string;
  accentColor: string;
}

export default function AdBannerCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const slides: AdSlide[] = [
    {
      id: 'welcome-offer',
      badge: 'Haute Privilege',
      badgeIcon: <Sparkles size={11} className="text-luxury-gold" />,
      headline: 'COMPLIMENTARY FIRST ORDER PRIVILEGE',
      subheadline: 'Receive 15% off your first artisanal flacon acquisition with code',
      highlightText: 'SUFYRA15',
      ctaText: 'Claim Offer',
      ctaHref: '/products',
      accentColor: 'from-[#1c1810] via-[#241e14] to-[#1c1810]'
    },
    {
      id: 'nationwide-shipping',
      badge: 'Concierge Logistics',
      badgeIcon: <Truck size={11} className="text-emerald-400" />,
      headline: 'FREE NATIONWIDE DELIVERY ACROSS BANGLADESH',
      subheadline: 'Guaranteed express courier service on all orders exceeding ৳1,000',
      highlightText: 'EXPRESS DISPATCH',
      ctaText: 'Explore Scents',
      ctaHref: '/products',
      accentColor: 'from-[#0e1713] via-[#14231c] to-[#0e1713]'
    },
    {
      id: 'pure-attars',
      badge: '100% Pure Oils',
      badgeIcon: <Flame size={11} className="text-amber-400" />,
      headline: 'HAUTE CONCENTRATION • 12+ HOUR SILLAGE',
      subheadline: 'Alcohol-free organic perfume oils hand-poured in small artisanal batches',
      highlightText: 'PURE ESSENCE',
      ctaText: 'View Attars',
      ctaHref: '/products',
      accentColor: 'from-[#1a1410] via-[#231b14] to-[#1a1410]'
    },
    {
      id: 'curated-sets',
      badge: 'Bespoke Gifts',
      badgeIcon: <Gift size={11} className="text-purple-400" />,
      headline: 'LUXURY FLACON COMBOS & GIFT BOXES',
      subheadline: 'Pair multiple signature fragrances packaged in our signature golden vault',
      highlightText: 'LIMITED EDITION',
      ctaText: 'Shop Combos',
      ctaHref: '/products',
      accentColor: 'from-[#16121c] via-[#201928] to-[#16121c]'
    }
  ];

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start',
      skipSnaps: false
    }, 
    [Autoplay({ delay: 4500, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="w-full px-4 sm:px-6 pt-4 pb-8 sm:pb-12" aria-label="Special Announcements">
      {/* 1250px Width & 100px Height Container */}
      <div className="max-w-[1250px] w-full h-25 mx-auto relative rounded-2xl overflow-hidden border border-luxury-gold/30 bg-[#0f0e0c] shadow-[0_10px_30px_rgba(0,0,0,0.4),0_0_20px_rgba(212,175,55,0.08)] group">
        
        {/* Subtle Luxury Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none" />

        {/* Embla Carousel Viewport */}
        <div className="overflow-hidden w-full h-full" ref={emblaRef}>
          <div className="flex h-full">
            {slides.map((slide) => (
              <div 
                key={slide.id} 
                className="flex-[0_0_100%] min-w-0 h-full relative"
              >
                <div className={`w-full h-full bg-linear-to-r ${slide.accentColor} px-4 sm:px-8 lg:px-10 flex items-center justify-between gap-3 sm:gap-6 text-white relative`}>
                  
                  {/* Left: Badge & Text */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* Badge */}
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 border border-luxury-gold/30 text-luxury-gold text-[9px] font-bold uppercase tracking-[0.2em] shrink-0 shadow-xs">
                      {slide.badgeIcon}
                      <span>{slide.badge}</span>
                    </div>

                    {/* Headline and Description */}
                    <div className="min-w-0 flex flex-col justify-center">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="sm:hidden flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-luxury-gold">
                          {slide.badgeIcon}
                          {slide.badge}
                        </span>
                        <h3 className="font-serif text-xs sm:text-sm lg:text-base font-bold tracking-wide text-white truncate">
                          {slide.headline}
                        </h3>
                        {slide.highlightText && (
                          <span className="px-1.5 py-0.5 rounded bg-luxury-gold/20 border border-luxury-gold/40 text-luxury-gold font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0">
                            {slide.highlightText}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-xs text-zinc-300 dark:text-zinc-300 line-clamp-1 font-light tracking-wide mt-0.5">
                        {slide.subheadline}
                      </p>
                    </div>
                  </div>

                  {/* Right: CTA Button */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <Link
                      href={slide.ctaHref}
                      className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-linear-to-r from-luxury-gold via-[#e6cf8b] to-luxury-gold text-black font-bold text-[9px] sm:text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md shadow-luxury-gold/20 flex items-center gap-1.5 group/btn whitespace-nowrap"
                    >
                      <span>{slide.ctaText}</span>
                      <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Previous promotional slide"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/60 hover:bg-black/90 border border-luxury-gold/40 text-luxury-gold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 shadow-md"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Next promotional slide"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/60 hover:bg-black/90 border border-luxury-gold/40 text-luxury-gold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 shadow-md"
        >
          <ChevronRight size={14} />
        </button>

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => emblaApi?.scrollTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                selectedIndex === idx 
                  ? 'w-4 h-1 bg-luxury-gold shadow-[0_0_8px_rgba(212,175,55,0.8)]' 
                  : 'w-1 h-1 bg-white/30 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

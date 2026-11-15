'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { 
  CarouselSlide, 
  getSavedCarouselSlides, 
  CAROUSEL_EVENT_NAME 
} from '@/lib/carouselStore';

export default function AdBannerCarousel() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load and listen for carousel slides updates from Admin panel
  useEffect(() => {
    const loadSlides = () => {
      const all = getSavedCarouselSlides();
      const activeSlides = all.filter((s) => s.isActive !== false);
      setSlides(activeSlides.length > 0 ? activeSlides : all);
    };

    loadSlides();
    setMounted(true);

    window.addEventListener(CAROUSEL_EVENT_NAME, loadSlides);
    window.addEventListener('storage', loadSlides);

    return () => {
      window.removeEventListener(CAROUSEL_EVENT_NAME, loadSlides);
      window.removeEventListener('storage', loadSlides);
    };
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start',
      skipSnaps: false
    }, 
    [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
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

  if (!mounted || slides.length === 0) {
    return (
      <section className="w-full px-3 sm:px-6 pt-3 pb-6 sm:pb-10" aria-label="Special Announcements">
        <div className="max-w-325 w-full h-24 sm:h-28 md:h-30 mx-auto rounded-2xl bg-(--card)/50 border border-(--foreground)/10 animate-pulse" />
      </section>
    );
  }

  return (
    <section className="w-full px-3 sm:px-6 pt-3 pb-6 sm:pb-10" aria-label="Special Announcements">
      {/* 1300px Width & 120px Height Container (max-w-325 & h-30) */}
      <div className="max-w-325 w-full h-24 sm:h-28 md:h-30 mx-auto relative rounded-2xl overflow-hidden border border-luxury-gold/30 bg-[#0f0e0c] shadow-[0_10px_30px_rgba(0,0,0,0.4),0_0_20px_rgba(212,175,55,0.08)] group">
        
        {/* Subtle Luxury Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-luxury-gold/5 rounded-full blur-3xl pointer-events-none" />

        {/* Embla Carousel Viewport */}
        <div className="overflow-hidden w-full h-full" ref={emblaRef}>
          <div className="flex h-full">
            {slides.map((slide) => {
              const hasBadge = Boolean(slide.showBadge && slide.badge?.trim());
              const hasHeadline = Boolean(slide.showHeadline && slide.headline?.trim());
              const hasSubheadline = Boolean(slide.showSubheadline && slide.subheadline?.trim());
              const hasButton = Boolean(slide.showButton && slide.buttonText?.trim());
              const hasAnyOverlay = hasBadge || hasHeadline || hasSubheadline || hasButton;
              const linkHref = slide.buttonLink?.trim() || '/products';

              // If pure graphic banner (no text overlay enabled/filled)
              if (!hasAnyOverlay && slide.imageUrl) {
                return (
                  <div key={slide.id} className="flex-[0_0_100%] min-w-0 h-full relative">
                    <Link 
                      href={linkHref}
                      className="block w-full h-full relative group/slide overflow-hidden cursor-pointer"
                    >
                      <Image
                        src={slide.imageUrl}
                        alt="Promotional Banner"
                        fill
                        sizes="(max-width: 1300px) 100vw, 1300px"
                        priority
                        className="object-cover object-center group-hover/slide:scale-[1.01] transition-transform duration-500"
                        unoptimized
                      />
                    </Link>
                  </div>
                );
              }

              // Standard / Custom Overlay Slide
              const fallbackGradient = slide.accentColor || 'from-[#1c1810] via-[#241e14] to-[#1c1810]';

              return (
                <div key={slide.id} className="flex-[0_0_100%] min-w-0 h-full relative">
                  <div className={`w-full h-full relative overflow-hidden bg-linear-to-r ${fallbackGradient} px-4 sm:px-8 lg:px-10 flex items-center justify-between gap-3 sm:gap-6 text-white`}>
                    
                    {/* Background Banner Image (if provided) */}
                    {slide.imageUrl && (
                      <div className="absolute inset-0 z-0">
                        <Image
                          src={slide.imageUrl}
                          alt="Banner background"
                          fill
                          sizes="(max-width: 1300px) 100vw, 1300px"
                          className="object-cover object-center opacity-40"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/60 to-black/80" />
                      </div>
                    )}

                    {/* Left: Badge & Text Overlays */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 relative z-10">
                      {/* Badge (Rendered only if enabled and filled) */}
                      {hasBadge && (
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-luxury-gold/40 text-luxury-gold text-[9px] font-bold uppercase tracking-[0.2em] shrink-0 shadow-xs">
                          <Sparkles size={11} className="text-luxury-gold" />
                          <span>{slide.badge}</span>
                        </div>
                      )}

                      {/* Headline and Description */}
                      <div className="min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 flex-wrap">
                          {hasBadge && (
                            <span className="sm:hidden flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider text-luxury-gold">
                              <Sparkles size={9} />
                              {slide.badge}
                            </span>
                          )}

                          {/* Headline (Rendered only if enabled and filled) */}
                          {hasHeadline && (
                            <h3 className="font-serif text-xs sm:text-sm md:text-base font-bold tracking-wide text-white truncate leading-tight">
                              {slide.headline}
                            </h3>
                          )}
                        </div>

                        {/* Subheadline (Rendered only if enabled and filled) */}
                        {hasSubheadline && (
                          <p className="text-[10px] sm:text-xs text-zinc-300 line-clamp-1 font-light tracking-wide mt-1">
                            {slide.subheadline}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: CTA Button (Rendered only if enabled and filled) */}
                    {hasButton && (
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative z-10">
                        <Link
                          href={linkHref}
                          className="px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full bg-linear-to-r from-luxury-gold via-[#e6cf8b] to-luxury-gold text-black font-bold text-[9px] sm:text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md shadow-luxury-gold/20 flex items-center gap-1.5 group/btn whitespace-nowrap"
                        >
                          <span>{slide.buttonText}</span>
                          <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/60 hover:bg-black/90 border border-luxury-gold/40 text-luxury-gold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 shadow-md"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Next slide"
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
          </>
        )}
      </div>
    </section>
  );
}

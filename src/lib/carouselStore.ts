'use client';

export interface CarouselSlide {
  id: string;
  imageUrl?: string;
  accentColor?: string;

  // Text parts and their visibility flags
  showHeadline: boolean;
  headline?: string;

  showBadge: boolean;
  badge?: string;

  showSubheadline: boolean;
  subheadline?: string;

  showButton: boolean;
  buttonText?: string;
  buttonLink?: string;

  isActive: boolean;
  createdAt: number;
}

export const DEFAULT_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'slide-1',
    accentColor: 'from-[#1c1810] via-[#241e14] to-[#1c1810]',
    showHeadline: true,
    headline: 'COMPLIMENTARY FIRST ORDER PRIVILEGE',
    showBadge: true,
    badge: 'Haute Privilege',
    showSubheadline: true,
    subheadline: 'Receive 15% off your first artisanal flacon acquisition with code SUFYRA15',
    showButton: true,
    buttonText: 'Claim Offer',
    buttonLink: '/products',
    isActive: true,
    createdAt: 1
  },
  {
    id: 'slide-2',
    accentColor: 'from-[#0e1713] via-[#14231c] to-[#0e1713]',
    showHeadline: true,
    headline: 'FREE NATIONWIDE DELIVERY ACROSS BANGLADESH',
    showBadge: true,
    badge: 'Concierge Logistics',
    showSubheadline: true,
    subheadline: 'Guaranteed express courier service on all orders exceeding ৳1,000',
    showButton: true,
    buttonText: 'Explore Scents',
    buttonLink: '/products',
    isActive: true,
    createdAt: 2
  },
  {
    id: 'slide-3',
    accentColor: 'from-[#1a1410] via-[#231b14] to-[#1a1410]',
    showHeadline: true,
    headline: 'HAUTE CONCENTRATION • 12+ HOUR SILLAGE',
    showBadge: true,
    badge: '100% Pure Oils',
    showSubheadline: true,
    subheadline: 'Alcohol-free organic perfume oils hand-poured in small artisanal batches',
    showButton: true,
    buttonText: 'View Attars',
    buttonLink: '/products',
    isActive: true,
    createdAt: 3
  },
  {
    id: 'slide-4',
    accentColor: 'from-[#16121c] via-[#201928] to-[#16121c]',
    showHeadline: true,
    headline: 'LUXURY FLACON COMBOS & GIFT BOXES',
    showBadge: true,
    badge: 'Bespoke Gifts',
    showSubheadline: true,
    subheadline: 'Pair multiple signature fragrances packaged in our signature golden vault',
    showButton: true,
    buttonText: 'Shop Combos',
    buttonLink: '/products',
    isActive: true,
    createdAt: 4
  }
];

const STORAGE_KEY = 'sufyra_carousel_slides_v2';
export const CAROUSEL_EVENT_NAME = 'sufyra-carousel-updated';

/**
 * Retrieve saved carousel slides from LocalStorage or default collection
 */
export function getSavedCarouselSlides(): CarouselSlide[] {
  if (typeof window === 'undefined') return DEFAULT_CAROUSEL_SLIDES;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CAROUSEL_SLIDES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load carousel slides from localStorage:', err);
  }
  return DEFAULT_CAROUSEL_SLIDES;
}

/**
 * Persist carousel slides to LocalStorage and broadcast update event across components
 */
export function saveCarouselSlides(slides: CarouselSlide[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
    window.dispatchEvent(new Event(CAROUSEL_EVENT_NAME));
  } catch (err) {
    console.error('Failed to save carousel slides to localStorage:', err);
  }
}

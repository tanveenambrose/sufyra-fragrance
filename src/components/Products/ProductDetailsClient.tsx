'use client';

import React, { useState } from 'react';
import { Product } from '@/data/products';
import { useCart } from '@/store/useCart';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronRight,
  Minus,
  Plus,
  Maximize2,
  MessageCircle,
  X,
  ArrowLeft,
  ArrowRight,
  LayoutGrid,
  Sparkles,
  ShieldCheck,
  Truck,
  Gift,
  Check,
  Info
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import PurchaseFlow from '@/components/Purchase/PurchaseFlow';
import CartSparkBurst, { SparkleStar } from '@/components/CartSparkEffect';
import ProductCard from '@/components/ProductCard';

interface ProductDetailsClientProps {
  product: Product;
  adjacentIds: {
    prev: string | null;
    next: string | null;
  };
  relatedProducts?: Product[];
}

export default function ProductDetailsClient({ 
  product, 
  adjacentIds,
  relatedProducts = []
}: ProductDetailsClientProps) {
  const [selectedSize, setSelectedSize] = useState<string>(product.variants[0]?.size || '');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>(
    product.variants[0]?.image_url || product.image_url
  );
  const [activeView, setActiveView] = useState<string>(
    product.variants[0]?.image_url ? product.variants[0].size : 'main'
  );
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isSparking, setIsSparking] = useState(false);

  const addItem = useCart((state) => state.addItem);
  const router = useRouter();

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    setActiveView(size);
    const variant = product.variants.find((v) => v.size === size);
    if (variant?.image_url) {
      setActiveImage(variant.image_url);
    } else {
      setActiveImage(product.image_url);
    }
  };

  const currentVariant = product.variants.find((v) => v.size === selectedSize) || product.variants[0];
  const discount = product.discount_percent || 0;
  const originalPrice = discount > 0 ? Math.round(currentVariant.price / (1 - discount / 100)) : null;

  const minPrice = Math.min(...product.variants.map((v) => v.price));
  const maxPrice = Math.max(...product.variants.map((v) => v.price));
  const hasMultiplePrices = minPrice !== maxPrice;

  const handleAddToCart = () => {
    addItem(product, selectedSize);
    for (let i = 1; i < quantity; i++) {
      addItem(product, selectedSize);
    }
    setIsSparking(true);
    setTimeout(() => setIsSparking(false), 1200);
  };

  // Official Sufyra Fragrance WhatsApp URL
  const officialPhone = '+8801886141861';
  const whatsappUrl = `https://wa.me/8801886141861?text=${encodeURIComponent(
    `Hello Sufyra Fragrance! I would like to inquire about "${product.name}" (${selectedSize}, ৳${currentVariant.price}).`
  )}`;

  return (
    <main className="min-h-screen bg-(--background) pt-12 sm:pt-16 pb-16 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Navigation & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-5 gap-3 border-b border-(--foreground)/10 pb-2.5">
          <nav className="flex items-center gap-2 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-medium text-(--foreground)/60 flex-wrap">
            <Link href="/" className="hover:text-luxury-gold transition-colors">Home</Link>
            <ChevronRight size={10} className="text-(--foreground)/30" />
            <Link href="/products" className="hover:text-luxury-gold transition-colors">
              {product.category === 'combo' ? 'Bundle Collection' : 'Perfume Oil'}
            </Link>
            <ChevronRight size={10} className="text-(--foreground)/30" />
            <span className="text-luxury-gold font-semibold truncate max-w-50 sm:max-w-none">{product.name}</span>
          </nav>

          <div className="flex items-center gap-4 text-(--foreground)/50 text-[10px] uppercase tracking-widest font-semibold shrink-0">
            <button
              onClick={() => adjacentIds.prev && router.push(`/product-details/${adjacentIds.prev}`)}
              disabled={!adjacentIds.prev}
              className={`hover:text-luxury-gold transition-colors flex items-center gap-1.5 ${
                !adjacentIds.prev ? 'opacity-20 cursor-not-allowed' : ''
              }`}
              title="Previous Fragrance"
            >
              <ArrowLeft size={13} />
              <span>Prev</span>
            </button>
            <span className="text-(--foreground)/20">|</span>
            <Link 
              href="/products" 
              className="hover:text-luxury-gold transition-colors p-1"
              title="All Fragrances"
            >
              <LayoutGrid size={14} />
            </Link>
            <span className="text-(--foreground)/20">|</span>
            <button
              onClick={() => adjacentIds.next && router.push(`/product-details/${adjacentIds.next}`)}
              disabled={!adjacentIds.next}
              className={`hover:text-luxury-gold transition-colors flex items-center gap-1.5 ${
                !adjacentIds.next ? 'opacity-20 cursor-not-allowed' : ''
              }`}
              title="Next Fragrance"
            >
              <span>Next</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

        {/* Main Product Showcase: 2-Column Balanced Viewport Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 items-start">
          
          {/* Left Column (5 cols): Compact Flacon Portrait & Perspective Switcher (Zero-scroll Above-the-fold) */}
          <div className="lg:col-span-5 w-full flex flex-col items-center lg:sticky lg:top-24">
            {/* Main Portrait Frame - Compact Sizing to Fit in Viewport */}
            <div className="relative w-full max-w-67.5 sm:max-w-75 lg:max-w-80 aspect-4/5 max-h-87.5 sm:max-h-92.5 rounded-2xl overflow-hidden border border-luxury-gold/25 bg-linear-to-b from-white/4 via-black/40 to-black/80 shadow-[0_15px_35px_rgba(0,0,0,0.5)] group">
              {/* Subtle Ambient Gold Glow behind flacon */}
              <div className="absolute inset-0 bg-radial from-luxury-gold/15 via-transparent to-transparent opacity-60 pointer-events-none" />

              {/* Product Image */}
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 40vw, 320px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105 saturate-[1.08] contrast-[1.02]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-(--foreground)/20 text-xs uppercase tracking-widest">
                  No Portrait Available
                </div>
              )}

              {/* Floating Status Badges (Left) */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-[8px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles size={9} />
                    -{discount}% Special
                  </span>
                )}
                <span className="bg-black/65 backdrop-blur-md text-luxury-gold border border-luxury-gold/30 text-[8px] font-bold uppercase tracking-[0.2em] px-2 py-0.5 rounded-full w-fit">
                  {product.category === 'combo' ? 'Curated Set' : 'Pure Attar'}
                </span>
              </div>

              {/* Active Perspective Badge (Right) */}
              <div className="absolute top-3 right-3 z-10 pointer-events-none">
                <span className="bg-black/80 backdrop-blur-md border border-luxury-gold/40 text-luxury-gold text-[8px] font-bold uppercase tracking-[0.18em] px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                  {activeView === 'main' ? '✦ Box Set' : `🧴 ${selectedSize}`}
                </span>
              </div>

              {/* Expand Lightbox Button */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                aria-label="Enlarge scent portrait"
                className="absolute bottom-3 right-3 p-2 rounded-full bg-black/65 backdrop-blur-md border border-white/20 text-white/70 hover:text-luxury-gold hover:border-luxury-gold/60 transition-all opacity-90 sm:opacity-0 group-hover:opacity-100 shadow-xl hover:scale-110 active:scale-95"
              >
                <Maximize2 size={13} />
              </button>
            </div>

            {/* Compact Flacon Perspective Switcher (Full Box vs 3ml vs 6ml Bottles) */}
            <div className="w-full max-w-67.5 sm:max-w-75 lg:max-w-80 mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[8px] uppercase tracking-[0.25em] text-(--foreground)/50 font-bold flex items-center gap-1">
                  <Sparkles size={10} className="text-luxury-gold" />
                  Bottle &amp; Box Views
                </span>
                <span className="text-[8px] font-mono text-luxury-gold font-semibold">
                  {activeView === 'main' ? 'Box View' : `${selectedSize} Bottle`}
                </span>
              </div>

              {/* Perspective Pills Row */}
              <div className="grid grid-cols-3 gap-1.5">
                {/* 1. Full Set / Presentation View */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('main');
                    setActiveImage(product.image_url);
                  }}
                  className={`p-1.5 rounded-xl border transition-all flex flex-col items-center gap-1 text-center group ${
                    activeView === 'main'
                      ? 'bg-luxury-gold/15 border-luxury-gold shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                      : 'bg-white/2 border-white/10 hover:border-luxury-gold/40'
                  }`}
                >
                  <div className="w-8 h-10 rounded-md overflow-hidden relative border border-white/10 group-hover:scale-105 transition-transform bg-black">
                    <Image src={product.image_url} alt="Box Set View" fill sizes="40px" className="object-cover" />
                  </div>
                  <span className="text-[8px] uppercase tracking-wider font-bold truncate max-w-full">
                    Box Set
                  </span>
                </button>

                {/* 2 & 3: Variant Bottle Views (3ml, 6ml, etc.) */}
                {product.variants.map((v) => {
                  const isViewing = activeView === v.size;
                  const vImg = v.image_url || product.image_url;
                  const displayLabel = v.size.includes('3ml') 
                    ? '3ml Bottle' 
                    : v.size.includes('6ml') 
                    ? '6ml Bottle' 
                    : `${v.size} View`;

                  return (
                    <button
                      key={v.size}
                      type="button"
                      onClick={() => {
                        handleSelectSize(v.size);
                      }}
                      className={`p-1.5 rounded-xl border transition-all flex flex-col items-center gap-1 text-center group ${
                        isViewing
                          ? 'bg-luxury-gold/15 border-luxury-gold shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                          : 'bg-white/2 border-white/10 hover:border-luxury-gold/40'
                      }`}
                    >
                      <div className="w-8 h-10 rounded-md overflow-hidden relative border border-white/10 group-hover:scale-105 transition-transform bg-black">
                        <Image src={vImg} alt={`${v.size} Bottle View`} fill sizes="40px" className="object-cover" />
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 py-0.5 text-[6px] text-center text-luxury-gold font-mono font-bold">
                          {v.size}
                        </div>
                      </div>
                      <span className="text-[8px] uppercase tracking-wider font-bold truncate max-w-full">
                        {displayLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Balanced, Proportional Details */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            
            {/* Header & Title Section */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-luxury-gold/15 border border-luxury-gold/30 text-luxury-gold text-[8px] font-bold uppercase tracking-[0.25em]">
                  Sufyra Atelier
                </span>
                <span className="text-[9px] text-(--foreground)/40 uppercase tracking-widest font-mono">
                  {product.category === 'combo' ? 'Artisanal Set' : 'Concentrated Perfume Oil'}
                </span>
              </div>

              {/* Refined title */}
              <h1 className="text-2xl sm:text-3xl font-serif text-(--foreground) font-normal tracking-wide leading-snug">
                {product.name}
              </h1>

              {/* Clean Pricing Block */}
              <div className="flex items-baseline gap-2.5 pt-0.5 flex-wrap">
                <span className="text-2xl sm:text-3xl font-serif text-luxury-gold font-bold">
                  ৳{currentVariant.price * quantity}
                </span>

                {originalPrice && (
                  <span className="text-sm sm:text-base text-(--foreground)/40 line-through">
                    ৳{originalPrice * quantity}
                  </span>
                )}

                {discount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] font-bold uppercase tracking-wider">
                    Save {discount}%
                  </span>
                )}

                {hasMultiplePrices && (
                  <span className="text-[10px] text-(--foreground)/40 font-mono">
                    (৳{minPrice} – ৳{maxPrice} across sizes)
                  </span>
                )}
              </div>
            </div>

            {/* Visual Flacon Bottle Size Selector */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <label className="text-[9px] uppercase tracking-[0.2em] text-(--foreground)/60 font-bold flex items-center gap-2">
                  <span>Bottle Selection:</span>
                  <span className="text-luxury-gold font-bold">{selectedSize}</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(!isSizeGuideOpen)}
                  className="text-[9px] text-luxury-gold hover:underline flex items-center gap-1 font-semibold"
                >
                  <Info size={11} />
                  <span>Size Comparison</span>
                </button>
              </div>

              {/* Visual Bottle Variant Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.variants.map((v) => {
                  const isSelected = selectedSize === v.size;
                  const vImg = v.image_url || product.image_url;
                  const bottleSubtitle = v.size.includes('3ml')
                    ? 'Pocket Crystal Flacon'
                    : v.size.includes('6ml')
                    ? 'Signature Royal Bottle'
                    : 'Artisanal Flacon';

                  return (
                    <div
                      key={v.size}
                      onClick={() => handleSelectSize(v.size)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group relative ${
                        isSelected
                          ? 'bg-luxury-gold/10 border-luxury-gold ring-1 ring-luxury-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.12)]'
                          : 'bg-white/2 border-white/10 hover:border-luxury-gold/40 hover:bg-white/4'
                      }`}
                    >
                      {/* Bottle Preview Box */}
                      <div className="w-11 h-13 rounded-lg overflow-hidden relative shrink-0 border border-luxury-gold/30 bg-black/60 group-hover:scale-105 transition-transform">
                        <Image src={vImg} alt={`${v.size} Bottle`} fill sizes="44px" className="object-cover" />
                        <div className="absolute bottom-0 inset-x-0 bg-black/80 py-0.5 text-[6px] text-center text-luxury-gold font-mono font-bold">
                          {v.size}
                        </div>
                      </div>

                      {/* Info & Price */}
                      <div className="grow min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-xs font-bold truncate ${isSelected ? 'text-luxury-gold' : 'text-(--foreground)'}`}>
                            {v.size}
                          </p>
                          {isSelected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold animate-pulse shrink-0" />
                          )}
                        </div>
                        <p className="text-[9px] text-(--foreground)/50 truncate mt-0.5">
                          {v.size.includes('+') ? 'Curated Duo Bottles' : bottleSubtitle}
                        </p>
                        <p className="text-xs font-mono font-bold text-luxury-gold mt-0.5">
                          ৳{v.price}
                        </p>
                      </div>

                      {/* Selection Radio Indicator */}
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-luxury-gold bg-luxury-gold text-black' : 'border-white/20'
                      }`}>
                        {isSelected && <Check size={10} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Collapsible Bottle Size Comparison Guide */}
              {isSizeGuideOpen && (
                <div className="p-3.5 rounded-xl bg-white/2 border border-luxury-gold/20 space-y-2.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[9px] uppercase tracking-[0.2em] font-bold text-luxury-gold flex items-center gap-1.5">
                      <Sparkles size={11} />
                      Flacon Size &amp; Longevity Guide
                    </h4>
                    <button
                      type="button"
                      onClick={() => setIsSizeGuideOpen(false)}
                      className="text-white/40 hover:text-white p-1"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-white/2 border border-white/5 space-y-0.5">
                      <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-wider">3ml Flacon</p>
                      <p className="text-[10px] text-(--foreground)/70 leading-relaxed">
                        • Approx. 60–75 applications
                        <br />
                        • Pocket-sized glass dip rod
                        <br />
                        • Ideal for travel &amp; daily carry
                      </p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/2 border border-white/5 space-y-0.5">
                      <p className="text-[9px] font-bold text-luxury-gold uppercase tracking-wider">6ml Flacon</p>
                      <p className="text-[10px] text-(--foreground)/70 leading-relaxed">
                        • Approx. 140–160 applications
                        <br />
                        • Double volume artisanal flacon
                        <br />
                        • Signature daily fragrance choice
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Olfactory Notes Pyramid (Aromatic Structure) */}
            {(product.top_notes || product.middle_notes || product.base_notes) && (
              <div className="space-y-2 p-3 rounded-xl bg-white/2 border border-white/5">
                <h3 className="text-[9px] uppercase tracking-[0.25em] text-luxury-gold font-bold flex items-center gap-1.5">
                  <Sparkles size={11} />
                  Olfactory Composition
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
                  {product.top_notes && (
                    <div className="p-2.5 rounded-lg bg-white/2 border border-white/5">
                      <p className="text-[8px] uppercase tracking-wider text-(--foreground)/50 font-bold mb-0.5">Top Notes</p>
                      <p className="text-[11px] text-(--foreground)/80 italic leading-relaxed">{product.top_notes}</p>
                    </div>
                  )}
                  {product.middle_notes && (
                    <div className="p-2.5 rounded-lg bg-white/2 border border-white/5">
                      <p className="text-[8px] uppercase tracking-wider text-(--foreground)/50 font-bold mb-0.5">Heart Notes</p>
                      <p className="text-[11px] text-(--foreground)/80 italic leading-relaxed">{product.middle_notes}</p>
                    </div>
                  )}
                  {product.base_notes && (
                    <div className="p-2.5 rounded-lg bg-white/2 border border-white/5">
                      <p className="text-[8px] uppercase tracking-wider text-(--foreground)/50 font-bold mb-0.5">Base Notes</p>
                      <p className="text-[11px] text-(--foreground)/80 italic leading-relaxed">{product.base_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-1.5">
              <p className="text-(--foreground)/75 text-xs leading-relaxed font-light italic">
                {product.description}
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="w-5 h-px bg-luxury-gold/50" />
                <span className="text-[8px] uppercase tracking-[0.2em] text-luxury-gold font-semibold">
                  Hand-poured • Zero Alcohol • Long-lasting Sillage
                </span>
              </div>
            </div>

            {/* Purchasing & Action Dock */}
            <div className="space-y-3 pt-1">
              <div className="flex flex-col sm:flex-row gap-2.5">
                {/* Quantity Stepper */}
                <div className="flex items-center justify-between bg-white/3 rounded-xl border border-white/10 h-11 px-3 w-full sm:w-28 shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    className="p-1 text-(--foreground)/70 hover:text-luxury-gold transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-bold text-(--foreground) font-mono">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label="Increase quantity"
                    className="p-1 text-(--foreground)/70 hover:text-luxury-gold transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <div className="relative flex-1 h-11">
                  <CartSparkBurst active={isSparking} />
                  <button
                    onClick={handleAddToCart}
                    className={`w-full h-full luxury-gradient rounded-xl text-luxury-charcoal font-bold uppercase tracking-[0.18em] text-[10px] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-luxury-gold/15 ${
                      isSparking ? 'brightness-125 ring-2 ring-luxury-gold/60 scale-[1.01]' : ''
                    }`}
                  >
                    {isSparking ? (
                      <>
                        <SparkleStar size={13} className="text-luxury-charcoal animate-spin" />
                        <span>Added to Cart ✨</span>
                      </>
                    ) : (
                      <span>Add to Cart Portfolio</span>
                    )}
                  </button>
                </div>

                {/* Instant Order Button */}
                <button
                  onClick={() => setIsPurchaseModalOpen(true)}
                  className="h-11 px-6 bg-luxury-gold text-luxury-charcoal font-bold uppercase tracking-[0.18em] text-[10px] hover:bg-luxury-gold/90 active:scale-[0.98] transition-all rounded-xl shadow-lg shadow-luxury-gold/20 shrink-0"
                >
                  Purchase Now
                </button>
              </div>

              {/* Luxury Guarantees Banner */}
              <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-(--foreground)/10 text-center">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck size={14} className="text-luxury-gold" />
                  <span className="text-[8px] uppercase tracking-wider text-(--foreground)/70 font-semibold">100% Pure Attar</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck size={14} className="text-luxury-gold" />
                  <span className="text-[8px] uppercase tracking-wider text-(--foreground)/70 font-semibold">Fast Nationwide COD</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Gift size={14} className="text-luxury-gold" />
                  <span className="text-[8px] uppercase tracking-wider text-(--foreground)/70 font-semibold">Luxury Flacon Box</span>
                </div>
              </div>

              {/* WhatsApp Concierge Card - Directly links to official WhatsApp +8801886141861 */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3.5 rounded-xl bg-white/2 hover:bg-white/4 border border-white/5 hover:border-emerald-500/40 flex items-center justify-between gap-3 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
                    <MessageCircle size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-(--foreground) truncate">Need fragrance advice?</p>
                    <p className="text-[10px] text-(--foreground)/50 truncate">Chat directly with the Sufyra Concierge ({officialPhone})</p>
                  </div>
                </div>

                <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider transition-colors shrink-0">
                  WhatsApp
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Curated Recommendations Shelf - Balanced & Proportionate */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-(--foreground)/10">
            <div className="text-center space-y-1 mb-6">
              <span className="text-[8px] uppercase tracking-[0.25em] text-luxury-gold font-bold">
                Complementary Olfactory Works
              </span>
              <h2 className="text-xl sm:text-2xl font-serif text-(--foreground)">
                You May Also Admire
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4.5">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Quick Purchase Bar on Mobile Viewports */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-luxury-gold/25 p-2.5 flex items-center justify-between gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg overflow-hidden relative shrink-0 border border-luxury-gold/30 bg-black">
            {activeImage && (
              <Image src={activeImage} alt={product.name} fill sizes="36px" className="object-cover" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{product.name}</p>
            <p className="text-xs font-serif text-luxury-gold font-bold">
              ৳{currentVariant.price * quantity} <span className="text-[8px] font-mono text-white/50">({selectedSize})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAddToCart}
            className="px-3 py-2 rounded-lg luxury-gradient text-luxury-charcoal font-bold text-[9px] uppercase tracking-wider"
          >
            Add
          </button>
          <button
            onClick={() => setIsPurchaseModalOpen(true)}
            className="px-3.5 py-2 rounded-lg bg-luxury-gold text-luxury-charcoal font-bold text-[9px] uppercase tracking-wider"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Fullscreen High-Fidelity Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 sm:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setIsLightboxOpen(false)} />

          <button
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close portrait view"
            className="absolute top-6 right-6 z-210 p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-all border border-white/15"
          >
            <X size={18} />
          </button>

          <div className="relative w-full max-w-4xl h-full flex items-center justify-center animate-in zoom-in-95 duration-300 pointer-events-none">
            <div className="relative w-full h-full max-h-[85vh] pointer-events-auto">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                priority
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-[0.25em] text-white/40 font-bold pointer-events-none">
            Sufyra High Fidelity Scent Portrait
          </div>
        </div>
      )}

      {/* Purchase Flow Modal */}
      <PurchaseFlow
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        items={[{
          ...product,
          selectedSize,
          quantity,
          selectedPrice: currentVariant.price,
          image_url: activeImage
        }]}
      />
    </main>
  );
}
'use client';

import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/data/products';
import { useCart } from '@/store/useCart';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronRight,
  Minus,
  Plus,
  Share2,
  Heart,
  ArrowLeft,
  ArrowRight,
  LayoutGrid,
  Maximize2,
  MessageCircle,
  X,
  Smartphone,
  Send
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [adjacentIds, setAdjacentIds] = useState<{ prev: string | null, next: string | null }>({ prev: null, next: null });
  const addItem = useCart((state) => state.addItem);
  const router = useRouter();

  useEffect(() => {
    const fetchProductAndNavigation = async () => {
      try {
        // Fetch current product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (productError) throw productError;
        if (productData) {
          setProduct(productData);
          setSelectedSize(productData.variants[0].size);
          const initialImage = productData.variants[0].image_url || productData.image_url;
          setActiveImage(initialImage);
        }

        // Fetch all products to determine navigation
        const { data: allProducts, error: navError } = await supabase
          .from('products')
          .select('id')
          .order('created_at', { ascending: true });

        if (allProducts) {
          const currentIndex = allProducts.findIndex(p => p.id === id);
          setAdjacentIds({
            prev: currentIndex > 0 ? allProducts[currentIndex - 1].id : null,
            next: currentIndex < allProducts.length - 1 ? allProducts[currentIndex + 1].id : null
          });
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductAndNavigation();
  }, [id]);

  useEffect(() => {
    if (product) {
      const variant = product.variants.find(v => v.size === selectedSize);
      if (variant?.image_url) {
        setActiveImage(variant.image_url);
      } else {
        setActiveImage(product.image_url);
      }
    }
  }, [selectedSize, product]);

  useGSAP(() => {
    if (!isLoading && product) {
      const tl = gsap.timeline();

      tl.fromTo('.reveal-text',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );

      tl.fromTo('.reveal-img',
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2, ease: 'power4.out' },
        '-=0.6'
      );
    }
  }, { dependencies: [isLoading, product] });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-charcoal flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-6 transition-colors duration-500">
        <p className="text-[var(--foreground)]/40 uppercase tracking-widest font-serif">Scent not found in the manifest</p>
        <Link href="/products" className="text-luxury-gold border-b border-luxury-gold pb-1 text-sm uppercase tracking-widest">Back to Collection</Link>
      </div>
    );
  }

  const currentVariant = product.variants.find(v => v.size === selectedSize) || product.variants[0];
  const discount = product.discount_percent || 0;
  const originalPrice = discount > 0 ? Math.round(currentVariant.price / (1 - discount / 100)) : null;

  const minPrice = Math.min(...product.variants.map(v => v.price));
  const maxPrice = Math.max(...product.variants.map(v => v.price));

  const handleAddToCart = () => {
    const sizeType = selectedSize.includes('+') ? 'combo' : (selectedSize as any);
    addItem(product, sizeType);
    for (let i = 1; i < quantity; i++) {
      addItem(product, sizeType);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] pt-40 lg:pt-32 pb-24 transition-colors duration-500">
      <div className="container mx-auto px-6">
        {/* Top Navigation & Breadcrumbs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <nav className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold">
            <Link href="/" className="text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors">Home</Link>
            <ChevronRight size={10} className="text-[var(--foreground)]/20" />
            <Link href="/products" className="text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-colors">
              {product.category === 'combo' ? 'Bundle Collection' : 'Perfume Oil'}
            </Link>
            <ChevronRight size={10} className="text-[var(--foreground)]/20" />
            <span className="text-luxury-gold">{product.name}</span>
          </nav>

          <div className="flex items-center gap-6 text-[var(--foreground)]/40">
            <button
              onClick={() => adjacentIds.prev && router.push(`/product-details/${adjacentIds.prev}`)}
              disabled={!adjacentIds.prev}
              className={`hover:text-luxury-gold transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${!adjacentIds.prev ? 'opacity-20 cursor-not-allowed' : ''}`}
            >
              <ArrowLeft size={14} /> Prev
            </button>
            <Link href="/products" className="hover:text-luxury-gold transition-colors">
              <LayoutGrid size={16} />
            </Link>
            <button
              onClick={() => adjacentIds.next && router.push(`/product-details/${adjacentIds.next}`)}
              disabled={!adjacentIds.next}
              className={`hover:text-luxury-gold transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${!adjacentIds.next ? 'opacity-20 cursor-not-allowed' : ''}`}
            >
              Next <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">
          {/* Left: Product Image */}
          <div className="reveal-img relative w-full flex flex-col items-center lg:items-end">
            <div className="relative aspect-[4/5] bg-[var(--foreground)]/5 rounded-2xl overflow-hidden shadow-2xl group border border-[var(--foreground)]/10 w-[85%] md:w-[70%] lg:w-full lg:max-w-[480px]">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  quality={90}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-transform duration-[1.5s] group-hover:scale-105 saturate-[1.1] contrast-[1.02] brightness-[1.05]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--foreground)]/10 uppercase tracking-widest text-[10px]">No Portrait Available</div>
              )}

              {/* Expand Icon - Bottom Left per reference */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute bottom-6 left-6 p-3.5 bg-[var(--background)]/90 backdrop-blur-md rounded-full text-luxury-charcoal dark:text-[var(--foreground)] hover:bg-[var(--background)] transition-all opacity-0 group-hover:opacity-100 border border-[var(--foreground)]/20 shadow-xl z-10 hover:scale-110 active:scale-95"
              >
                <Maximize2 size={18} />
              </button>

              {/* Status Tags */}
              {discount > 0 && (
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className="bg-red-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-xl">-{discount}% SPECIAL</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-4 mt-6 justify-center lg:justify-start overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setActiveImage(product.image_url)}
                className={`relative w-20 aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === product.image_url ? 'border-luxury-gold shadow-lg shadow-luxury-gold/20' : 'border-[var(--foreground)]/15 hover:border-[var(--foreground)]/40'
                  }`}
              >
                <Image src={product.image_url} alt={product.name} fill sizes="80px" className="object-cover" />
              </button>
              {product.variants.map((v, i) => v.image_url && (
                <button
                  key={i}
                  onClick={() => {
                    setActiveImage(v.image_url!);
                    setSelectedSize(v.size);
                  }}
                  className={`relative w-20 aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === v.image_url ? 'border-luxury-gold shadow-lg shadow-luxury-gold/20' : 'border-[var(--foreground)]/15 hover:border-[var(--foreground)]/40'
                    }`}
                >
                  <Image src={v.image_url} alt={`${product.name} - ${v.size}`} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col pt-4 lg:pt-0">
            <div className="reveal-text opacity-0">
              <h1 className="text-4xl md:text-6xl xl:text-8xl font-serif text-[var(--foreground)] mb-6 leading-[0.9] tracking-tight">{product.name}</h1>
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xl md:text-3xl text-luxury-gold font-bold">৳{minPrice} — ৳{maxPrice}</span>
                </div>
                <div className="h-4 w-px bg-[var(--foreground)]/20" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)]/60 font-bold">{product.category === 'combo' ? 'Bundle Collection' : 'Pure Scent Profile'}</span>
              </div>
            </div>

            <div className="reveal-text space-y-8">
              {/* Size Selection */}
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)]/60 font-bold flex items-center gap-2">
                  Size Selection: <span className="text-[var(--foreground)]">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.size}
                      onClick={() => setSelectedSize(v.size)}
                      className={`px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${selectedSize === v.size
                        ? 'bg-luxury-gold border-luxury-gold text-white shadow-lg shadow-luxury-gold/20'
                        : 'bg-[var(--foreground)]/10 border-[var(--foreground)]/30 text-[var(--foreground)] hover:border-luxury-gold hover:text-luxury-gold'
                        }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aromatic Structure (Notes) */}
              {(product.top_notes || product.middle_notes || product.base_notes) && (
                <div className="space-y-4 py-8 border-y border-[var(--foreground)]/15">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-bold">Aromatic Structure</h3>
                  <ul className="space-y-2">
                    {product.top_notes && (
                      <li className="flex items-start gap-3 text-xs leading-relaxed">
                        <span className="text-[var(--foreground)]/60 font-bold uppercase tracking-widest w-24 flex-shrink-0">Top:</span>
                        <span className="text-[var(--foreground)]/70 italic">{product.top_notes}</span>
                      </li>
                    )}
                    {product.middle_notes && (
                      <li className="flex items-start gap-3 text-xs leading-relaxed">
                        <span className="text-[var(--foreground)]/60 font-bold uppercase tracking-widest w-24 flex-shrink-0">Middle:</span>
                        <span className="text-[var(--foreground)]/70 italic">{product.middle_notes}</span>
                      </li>
                    )}
                    {product.base_notes && (
                      <li className="flex items-start gap-3 text-xs leading-relaxed">
                        <span className="text-[var(--foreground)]/60 font-bold uppercase tracking-widest w-24 flex-shrink-0">Base:</span>
                        <span className="text-[var(--foreground)]/70 italic">{product.base_notes}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Description */}
              <div className="space-y-4">
                <p className="text-[var(--foreground)]/70 text-sm leading-relaxed font-light italic">
                  {product.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-px bg-luxury-gold/50" />
                  <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold">Artisanal Craftsmanship</span>
                </div>
              </div>

              {/* Pricing & Add to Cart */}
              <div className="space-y-8 pt-8">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl sm:text-6xl font-serif text-[var(--foreground)]">৳{currentVariant.price * quantity}</span>
                  {originalPrice && (
                    <span className="text-xl sm:text-2xl text-[var(--foreground)]/50 line-through">৳{originalPrice * quantity}</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:h-14">
                  {/* Quantity */}
                  <div className="flex items-center justify-between bg-[var(--foreground)]/5 rounded-xl border border-[var(--foreground)]/20 h-14 sm:h-full px-4 w-full sm:w-32">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-[var(--foreground)]/90 hover:text-luxury-gold transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold text-[var(--foreground)] font-mono">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-[var(--foreground)]/90 hover:text-luxury-gold transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* ATC Button */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-grow h-14 sm:h-full luxury-gradient rounded-xl text-luxury-charcoal font-bold uppercase tracking-[0.2em] text-[10px] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-2xl shadow-luxury-gold/10"
                  >
                    Add to Cart Portfolio
                  </button>

                  {/* Buy Now Button */}
                  <button
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="flex-grow sm:flex-none sm:px-8 h-14 sm:h-full bg-luxury-gold text-luxury-charcoal font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-luxury-gold/90 transition-all text-center rounded-xl shadow-xl shadow-luxury-gold/20"
                  >
                    Purchase Now
                  </button>
                </div>
              </div>

              {/* Order Support */}
              <div className="p-6 bg-[var(--foreground)]/[0.02] border border-dashed border-[var(--foreground)]/10 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-[var(--foreground)]/70 mb-1">Need assistance with your procurement?</p>
                  <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold cursor-pointer hover:underline">
                    Contact our Concierge via WhatsApp
                  </p>
                </div>
              </div>

              {/* Metadata & Social */}
              <div className="space-y-4 pt-8 border-t border-[var(--foreground)]/5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest">
                    <span className="text-[var(--foreground)]/20 font-bold w-20">Art Code:</span>
                    <span className="text-[var(--foreground)]/60">SF-00{product.id}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest">
                    <span className="text-[var(--foreground)]/20 font-bold w-20">Category:</span>
                    <span className="text-[var(--foreground)]/60">{product.category === 'combo' ? 'Bundle Selection' : 'Premium Oil'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <span className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/20 font-bold">Transmit:</span>
                  <div className="flex items-center gap-4 text-[var(--foreground)]/40">
                    <Share2 size={14} className="hover:text-luxury-gold cursor-pointer transition-colors" />
                    <Share2 size={14} className="hover:text-luxury-gold cursor-pointer transition-colors" />
                    <Share2 size={14} className="hover:text-luxury-gold cursor-pointer transition-colors" />
                    <Share2 size={14} className="hover:text-luxury-gold cursor-pointer transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Image Lightbox Portal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setIsLightboxOpen(false)} />

          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-8 right-8 z-[210] p-4 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 rounded-full text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-all border border-[var(--foreground)]/10"
          >
            <X size={24} />
          </button>

          <div className="relative w-full max-w-5xl h-full flex items-center justify-center animate-in zoom-in-95 duration-500 ease-out pointer-events-none">
            <div className="relative w-full h-full max-h-[90vh] pointer-events-auto">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                quality={90}
                priority
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>

          {/* Aromatic Preview Label */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-[var(--foreground)]/20 font-bold pointer-events-none">
            High Fidelity Scent Portrait
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsPurchaseModalOpen(false)} />

          {/* Decorative Review Quote Tag */}
          <div className="absolute top-[10%] left-0 z-40 bg-[var(--foreground)]/5 backdrop-blur-md border border-[var(--foreground)]/10 p-4 rounded-2xl shadow-lg max-w-[200px] floating-item-2 hidden sm:block">
            <p className="text-[10px] text-[var(--foreground)] font-bold italic leading-relaxed">
              "The most captivating scent I have ever worn. Pure luxury in a bottle."
            </p>
            <div className="mt-2 text-luxury-gold text-[8px] font-bold uppercase tracking-widest">- Sarah J.</div>
          </div>

          <div className="relative w-full max-w-lg bg-[var(--background)] border border-[var(--foreground)]/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setIsPurchaseModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 rounded-full text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-all"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 bg-luxury-gold/10 rounded-full flex items-center justify-center">
                  <Smartphone size={32} className="text-luxury-gold" />
                </div>

                <div>
                  <h2 className="text-2xl font-serif text-[var(--foreground)] mb-2">Finalize Your Purchase</h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)]/40 font-bold">Exquisite Selection</p>
                </div>

                {/* Product Summary for Screenshot */}
                <div className="w-full bg-[var(--foreground)]/5 rounded-2xl p-6 border border-[var(--foreground)]/10 flex items-center gap-6 text-left">
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={activeImage}
                      alt={product.name}
                      fill
                      sizes="100px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif text-[var(--foreground)] mb-1">{product.name}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold mb-2">Size: {selectedSize}</p>
                    <p className="text-2xl font-bold text-[var(--foreground)]">৳{currentVariant.price * quantity}</p>
                  </div>
                </div>

                {/* The Noticeable Note */}
                <div className="w-full bg-luxury-gold/10 border border-luxury-gold/30 rounded-2xl p-5 relative overflow-hidden text-left">
                  <div className="absolute top-0 left-0 w-1 h-full bg-luxury-gold" />
                  <p className="text-sm text-[var(--foreground)] leading-relaxed font-medium">
                    <span className="text-luxury-gold mr-2 text-lg">📸</span>
                    <span className="font-bold text-luxury-gold">Action Required:</span> Please take a screenshot of this screen and share it with our concierge to complete your purchase. <span className="text-luxury-gold font-bold">( Courier Charge Applicable )</span>
                  </p>
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <a
                    href="https://wa.me/message/ALWRUNUBV6L3A1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 py-4 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-green-500/10"
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </a>
                  <a
                    href="https://m.me/SufyraFragrance"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 py-4 bg-[#0084FF] hover:bg-[#0077e6] text-white rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-blue-500/10"
                  >
                    <Send size={18} />
                    Messenger
                  </a>
                </div>

                <p className="text-[9px] uppercase tracking-widest text-[var(--foreground)]/20 font-bold">
                  Sufyra Fragrance — Artisanal Perfumery
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

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
  X
} from 'lucide-react';
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
  const addItem = useCart((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          setProduct(data);
          setSelectedSize(data.variants[0].size);
          const initialImage = data.variants[0].image_url || data.image_url;
          setActiveImage(initialImage);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
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
      <div className="min-h-screen bg-luxury-charcoal flex flex-col items-center justify-center gap-6">
        <p className="text-white/40 uppercase tracking-widest font-serif">Scent not found in the manifest</p>
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
    <main className="min-h-screen bg-luxury-charcoal pt-32 pb-24">
      <div className="container mx-auto px-6">
        {/* Top Navigation & Breadcrumbs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <nav className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] font-bold">
            <Link href="/" className="text-white/40 hover:text-white transition-colors">Home</Link>
            <ChevronRight size={10} className="text-white/20" />
            <Link href="/products" className="text-white/40 hover:text-white transition-colors">
              {product.category === 'combo' ? 'Combo Packs' : 'Perfume Oil'}
            </Link>
            <ChevronRight size={10} className="text-white/20" />
            <span className="text-luxury-gold">{product.name}</span>
          </nav>

          <div className="flex items-center gap-6 text-white/40">
            <button className="hover:text-luxury-gold transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
              <ArrowLeft size={14} /> Prev
            </button>
            <Link href="/products" className="hover:text-luxury-gold transition-colors">
              <LayoutGrid size={16} />
            </Link>
            <button className="hover:text-luxury-gold transition-colors flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
              Next <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-start">
          {/* Left: Product Image */}
          <div className="reveal-img relative w-full flex flex-col items-center lg:items-end">
            <div className="relative aspect-[4/5] bg-white/5 rounded-2xl overflow-hidden shadow-2xl group border border-white/10 w-[85%] md:w-[70%] lg:w-full lg:max-w-[480px]">
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  quality={100}
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-transform duration-[1.5s] group-hover:scale-105 saturate-[1.1] contrast-[1.02] brightness-[1.05]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/10 uppercase tracking-widest text-[10px]">No Portrait Available</div>
              )}

              {/* Expand Icon - Bottom Left per reference */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute bottom-6 left-6 p-3.5 bg-white/90 backdrop-blur-md rounded-full text-luxury-charcoal hover:bg-white transition-all opacity-0 group-hover:opacity-100 border border-white/20 shadow-xl z-10 hover:scale-110 active:scale-95"
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
                className={`relative w-20 aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === product.image_url ? 'border-luxury-gold shadow-lg shadow-luxury-gold/20' : 'border-white/5 hover:border-white/20'
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
                  className={`relative w-20 aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${activeImage === v.image_url ? 'border-luxury-gold shadow-lg shadow-luxury-gold/20' : 'border-white/5 hover:border-white/20'
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
              <h1 className="text-4xl md:text-5xl xl:text-7xl font-serif text-luxury-cream mb-6 leading-tight">{product.name}</h1>
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-xl md:text-2xl text-luxury-gold font-medium">৳{minPrice} — ৳{maxPrice}</span>
                </div>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">{product.category === 'combo' ? 'Bundle Collection' : 'Pure Scent Profile'}</span>
              </div>
            </div>

            <div className="reveal-text space-y-8">
              {/* Size Selection */}
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold flex items-center gap-2">
                  Size Selection: <span className="text-white">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.size}
                      onClick={() => setSelectedSize(v.size)}
                      className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${selectedSize === v.size
                          ? 'bg-luxury-gold border-luxury-gold text-luxury-charcoal shadow-lg shadow-luxury-gold/20'
                          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:text-white'
                        }`}
                    >
                      {v.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aromatic Structure (Notes) */}
              {(product.top_notes || product.middle_notes || product.base_notes) && (
                <div className="space-y-4 py-8 border-y border-white/5">
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-bold">Aromatic Structure</h3>
                  <ul className="space-y-2">
                    {product.top_notes && (
                      <li className="flex items-start gap-3 text-xs leading-relaxed">
                        <span className="text-white/20 font-bold uppercase tracking-widest w-24 flex-shrink-0">Top:</span>
                        <span className="text-white/70 italic">{product.top_notes}</span>
                      </li>
                    )}
                    {product.middle_notes && (
                      <li className="flex items-start gap-3 text-xs leading-relaxed">
                        <span className="text-white/20 font-bold uppercase tracking-widest w-24 flex-shrink-0">Middle:</span>
                        <span className="text-white/70 italic">{product.middle_notes}</span>
                      </li>
                    )}
                    {product.base_notes && (
                      <li className="flex items-start gap-3 text-xs leading-relaxed">
                        <span className="text-white/20 font-bold uppercase tracking-widest w-24 flex-shrink-0">Base:</span>
                        <span className="text-white/70 italic">{product.base_notes}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Description */}
              <div className="space-y-4">
                <p className="text-white/50 text-sm leading-relaxed font-light italic">
                  {product.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-px bg-luxury-gold/30" />
                  <span className="text-[10px] uppercase tracking-widest text-luxury-gold font-bold">Artisanal Craftsmanship</span>
                </div>
              </div>

              {/* Pricing & Add to Cart */}
              <div className="space-y-8 pt-8">
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-serif text-white">৳{currentVariant.price * quantity}</span>
                  {originalPrice && (
                    <span className="text-xl text-white/30 line-through">৳{originalPrice * quantity}</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:h-14">
                  {/* Quantity */}
                  <div className="flex items-center justify-between bg-white/5 rounded-xl border border-white/10 h-14 sm:h-full px-4 w-full sm:w-32">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-white/40 hover:text-white transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold text-white font-mono">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-white/40 hover:text-white transition-colors"
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
                  <button className="flex-grow sm:flex-none sm:px-8 h-14 sm:h-full bg-white/[0.03] border border-white/10 rounded-xl text-white/80 font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-white/5 transition-all text-center">
                    Purchase Now
                  </button>
                </div>
              </div>

              {/* Order Support */}
              <div className="p-6 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <MessageCircle size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-white/70 mb-1">Need assistance with your procurement?</p>
                  <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold cursor-pointer hover:underline">
                    Contact our Concierge via WhatsApp
                  </p>
                </div>
              </div>

              {/* Metadata & Social */}
              <div className="space-y-4 pt-8 border-t border-white/5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest">
                    <span className="text-white/20 font-bold w-20">Art Code:</span>
                    <span className="text-white/60">SF-00{product.id}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest">
                    <span className="text-white/20 font-bold w-20">Category:</span>
                    <span className="text-white/60">{product.category === 'combo' ? 'Bundle Selection' : 'Premium Oil'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <span className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Transmit:</span>
                  <div className="flex items-center gap-4 text-white/40">
                    <Share2 size={14} className="hover:text-white cursor-pointer transition-colors" />
                    <Share2 size={14} className="hover:text-white cursor-pointer transition-colors" />
                    <Share2 size={14} className="hover:text-white cursor-pointer transition-colors" />
                    <Share2 size={14} className="hover:text-white cursor-pointer transition-colors" />
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
            className="absolute top-8 right-8 z-[210] p-4 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all border border-white/10"
          >
            <X size={24} />
          </button>

          <div className="relative w-full max-w-5xl h-full flex items-center justify-center animate-in zoom-in-95 duration-500 ease-out pointer-events-none">
            <div className="relative w-full h-full max-h-[90vh] pointer-events-auto">
              <Image
                src={activeImage}
                alt={product.name}
                fill
                quality={100}
                priority
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </div>

          {/* Aromatic Preview Label */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold pointer-events-none">
            High Fidelity Scent Portrait
          </div>
        </div>
      )}
    </main>
  );
}

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/store/useCart';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState<string>(product.variants[0].size);
  const addItem = useCart((state) => state.addItem);

  const currentVariant = product.variants.find(v => v.size === selectedSize) || product.variants[0];
  const currentPrice = currentVariant.price;
  const displayImage = product.image_url;

  const handleAddItem = () => {
    // Determine the correct size type for the cart store
    const size = selectedSize as '3ml' | '6ml' | 'set';
    addItem(product, size);
  };

  const discount = product.discount_percent || 0;
  const discountedPrice = discount > 0 ? Math.round(currentPrice * (1 - discount / 100)) : currentPrice;

  return (
    <div className="luxury-card group rounded-2xl overflow-hidden flex flex-col h-full reveal relative" suppressHydrationWarning>
      {/* Discount Badge */}
      {discount > 0 && (
        <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
          -{discount}%
        </div>
      )}

      {/* Product Image */}
      <Link href={`/product-details/${product.id}`} className="relative aspect-[4/5] block overflow-hidden bg-white/5 border-b border-white/5 group-hover:cursor-pointer" suppressHydrationWarning>
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.name}
            fill
            quality={100}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110 saturate-[1.1] contrast-[1.02] brightness-[1.05]"
            priority={product.id === '1' || product.id === '9'} // Example of prioritizing top products
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white/[0.02] text-white/10 gap-2">
            <Plus className="w-8 h-8 opacity-20" strokeWidth={1} />
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-20">Scent Portrait Missing</span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4 sm:p-5 flex flex-col flex-1" suppressHydrationWarning>
        <div className="flex justify-between items-start mb-1 gap-2" suppressHydrationWarning>
          <Link href={`/product-details/${product.id}`} className="hover:text-luxury-gold transition-colors">
            <h3 className="text-sm sm:text-lg font-serif text-luxury-cream leading-tight">{product.name}</h3>
          </Link>
          <div className="flex flex-col items-end">
             {discount > 0 && (
               <span className="text-white/30 line-through text-[10px]">{currentPrice}৳</span>
             )}
             <span className="text-luxury-gold font-bold text-sm sm:text-base whitespace-nowrap">{discountedPrice}৳</span>
          </div>
        </div>
        
        <p className="text-white/40 text-[9px] sm:text-[10px] mb-4 line-clamp-1" suppressHydrationWarning>
          {product.description}
        </p>

        {/* Size Selection */}
        <div className="mb-4" suppressHydrationWarning>
          <label className="text-[8px] sm:text-[9px] uppercase tracking-widest text-white/20 mb-2 block" suppressHydrationWarning>
            {product.category === 'combo' ? 'Bundle Includes' : 'Size'}
          </label>
          <div className="flex gap-1 sm:gap-1.5" suppressHydrationWarning>
            {product.variants.map((variant) => (
              <button
                key={variant.size}
                onClick={() => setSelectedSize(variant.size)}
                className={`flex-1 py-1.5 rounded-md transition-all text-[9px] sm:text-[10px] font-bold border ${
                  selectedSize === variant.size
                    ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold'
                    : 'border-white/5 text-white/30 hover:border-white/20'
                }`}
              >
                {variant.size}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleAddItem}
          className="w-full bg-[#FFD700] text-black py-3 sm:py-3.5 rounded-xl font-bold text-[10px] sm:text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#FFE55C] active:scale-95 transition-all mt-auto shadow-[0_0_20px_rgba(255,215,0,0.2)]"
          suppressHydrationWarning
        >
          <Plus className="w-4 h-4" />
          Add to Bag
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

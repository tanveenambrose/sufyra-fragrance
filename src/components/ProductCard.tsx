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
    <div className="group rounded-3xl overflow-hidden flex flex-col h-full reveal bg-[var(--foreground)]/[0.02] hover:bg-[var(--foreground)]/[0.03] transition-all duration-500 hover:shadow-2xl hover:shadow-luxury-gold/5" suppressHydrationWarning>
      {/* Product Image */}
      <Link href={`/product-details/${product.id}`} className="relative aspect-[1/1] block overflow-hidden p-4 group-hover:cursor-pointer" suppressHydrationWarning>
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={product.name}
              fill
              quality={90}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
              priority={product.id === '1' || product.id === '9'} 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--foreground)]/[0.02] text-[var(--foreground)]/10 gap-2">
              <Plus className="w-8 h-8 opacity-20" strokeWidth={1} />
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-20">Scent Portrait Missing</span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-8 sm:p-10 flex flex-col flex-1" suppressHydrationWarning>
        <div className="flex justify-between items-baseline mb-4 gap-4" suppressHydrationWarning>
          <Link href={`/product-details/${product.id}`} className="hover:text-luxury-gold transition-colors flex-1">
            <h3 className="text-lg sm:text-2xl font-serif text-[var(--foreground)] font-bold tracking-tight">{product.name}</h3>
          </Link>
          <div className="flex flex-col items-end">
             <span className="text-luxury-gold font-bold text-lg sm:text-2xl whitespace-nowrap">{discountedPrice}৳</span>
             {discount > 0 && (
               <span className="text-[var(--foreground)]/30 line-through text-[12px] font-medium">{currentPrice}৳</span>
             )}
          </div>
        </div>
        
        <p className="text-[var(--foreground)]/50 text-[10px] sm:text-[12px] mb-8 line-clamp-2 leading-relaxed font-medium" suppressHydrationWarning>
          {product.description}
        </p>

        {/* Size Selection - Minimalistic */}
        <div className="flex flex-wrap gap-2 mb-8" suppressHydrationWarning>
          {product.variants.map((variant) => (
            <button
              key={variant.size}
              onClick={() => setSelectedSize(variant.size)}
              className={`px-4 py-2 rounded-full transition-all text-[10px] font-bold border ${
                selectedSize === variant.size
                  ? 'border-luxury-gold bg-luxury-gold text-white'
                  : 'border-[var(--foreground)]/10 text-[var(--foreground)]/40 hover:border-luxury-gold hover:text-luxury-gold'
              }`}
            >
              {variant.size}
            </button>
          ))}
        </div>

        <button 
          onClick={handleAddItem}
          className="w-full bg-luxury-charcoal text-white dark:bg-white dark:text-black py-4 sm:py-5 rounded-2xl font-bold text-[11px] sm:text-[12px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-luxury-gold dark:hover:bg-luxury-gold transition-all mt-auto shadow-lg"
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

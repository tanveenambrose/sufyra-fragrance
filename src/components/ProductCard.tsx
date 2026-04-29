'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/store/useCart';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false }) => {
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
    <div className="group rounded-[2rem] overflow-hidden flex flex-col h-full reveal bg-[var(--foreground)]/[0.03] hover:bg-[var(--foreground)]/[0.05] border border-[var(--foreground)]/[0.05] transition-all duration-500 hover:shadow-xl hover:shadow-luxury-gold/5" suppressHydrationWarning>
      {/* Product Image */}
      <Link href={`/product-details/${product.id}`} className="relative aspect-square block overflow-hidden group-hover:cursor-pointer" suppressHydrationWarning>
        <div className="relative w-full h-full bg-luxury-cream/5">
          {displayImage ? (
            <Image
              src={displayImage}
              alt={product.name}
              fill
              quality={100}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-110"
              priority={priority} 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--foreground)]/[0.02] text-[var(--foreground)]/10 gap-2">
              <Plus className="w-8 h-8 opacity-20" strokeWidth={1} />
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-20">No Image</span>
            </div>
          )}
          
          {/* Badge if discount */}
          {discount > 0 && (
            <div className="absolute top-4 right-4 bg-luxury-gold text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg z-10">
              -{discount}%
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5 sm:p-6 flex flex-col flex-1" suppressHydrationWarning>
        <div className="mb-4" suppressHydrationWarning>
          <Link href={`/product-details/${product.id}`} className="hover:text-luxury-gold transition-colors block mb-1">
            <h3 className="text-sm sm:text-lg font-serif text-[var(--foreground)] font-bold tracking-tight line-clamp-1 leading-tight">{product.name}</h3>
          </Link>
          <div className="flex items-center gap-2">
             <span className="text-luxury-gold font-bold text-sm sm:text-lg">{discountedPrice}৳</span>
             {discount > 0 && (
               <span className="text-[var(--foreground)]/30 line-through text-[10px] sm:text-[11px] font-medium">{currentPrice}৳</span>
             )}
          </div>
        </div>
        
        <p className="text-[var(--foreground)]/50 text-[10px] sm:text-[11px] mb-5 line-clamp-2 leading-relaxed font-medium" suppressHydrationWarning>
          {product.description}
        </p>
        
        {/* Size Selection */}
        <div className="flex flex-wrap gap-2 mb-6 mt-auto" suppressHydrationWarning>
          {product.variants.map((variant) => (
            <button
              key={variant.size}
              onClick={() => setSelectedSize(variant.size)}
              className={`px-3 py-1 rounded-full transition-all text-[9px] font-bold border ${
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
          className="w-full bg-luxury-charcoal text-white dark:bg-white dark:text-black py-3 sm:py-4 rounded-xl font-bold text-[10px] sm:text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-luxury-gold dark:hover:bg-luxury-gold transition-all shadow-md active:scale-[0.98]"
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

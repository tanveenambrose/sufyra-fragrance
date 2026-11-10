'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/store/useCart';
import CartSparkBurst, { SparkleStar } from '@/components/CartSparkEffect';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
  reveal?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, priority = false, reveal = false }) => {
  const [selectedSize, setSelectedSize] = useState<string>(product.variants[0].size);
  const [isSparking, setIsSparking] = useState(false);
  const addItem = useCart((state) => state.addItem);

  const currentVariant = product.variants.find(v => v.size === selectedSize) || product.variants[0];
  const currentPrice = currentVariant.price;
  const displayImage = product.image_url;

  const handleAddItem = () => {
    // Determine the correct size type for the cart store
    const size = selectedSize as '3ml' | '6ml' | 'set';
    addItem(product, size);
    setIsSparking(true);
    setTimeout(() => setIsSparking(false), 1000);
  };

  const discount = product.discount_percent || 0;
  const discountedPrice = discount > 0 ? Math.round(currentPrice * (1 - discount / 100)) : currentPrice;

  return (
    <div className={`group rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col h-full ${reveal ? 'reveal' : ''} bg-(--foreground)/3 hover:bg-(--foreground)/5 border border-(--foreground)/10 hover:border-luxury-gold/40 transition-all duration-300 hover:shadow-xl hover:shadow-luxury-gold/5`} suppressHydrationWarning>
      {/* Product Image */}
      <Link href={`/product-details/${product.id}`} className="relative aspect-square block overflow-hidden group-hover:cursor-pointer" suppressHydrationWarning>
        <div className="relative w-full h-full bg-luxury-cream/5" suppressHydrationWarning>
          {displayImage ? (
            <Image
              src={displayImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority={priority} 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-(--foreground)/2 text-(--foreground)/10 gap-2">
              <Plus className="w-8 h-8 opacity-20" strokeWidth={1} />
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-20">No Image</span>
            </div>
          )}
          
          {/* Badge if discount */}
          {discount > 0 && (
            <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 bg-luxury-gold text-white text-[8px] sm:text-[10px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg z-10">
              -{discount}%
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3 sm:p-5 flex flex-col flex-1" suppressHydrationWarning>
        <div className="mb-2 sm:mb-3" suppressHydrationWarning>
          <Link href={`/product-details/${product.id}`} className="hover:text-luxury-gold transition-colors block mb-1">
            <h3 className="text-xs sm:text-base font-serif text-(--foreground) font-bold tracking-tight line-clamp-1 leading-tight">{product.name}</h3>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2" suppressHydrationWarning>
             <span className="text-luxury-gold font-bold text-xs sm:text-base">{discountedPrice}৳</span>
             {discount > 0 && (
               <span className="text-(--foreground)/30 line-through text-[9px] sm:text-xs font-medium">{currentPrice}৳</span>
             )}
          </div>
        </div>
        
        {/* Size Selection */}
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2.5 sm:mb-4 mt-auto pt-2" suppressHydrationWarning>
          {product.variants.map((variant) => (
            <button
              key={variant.size}
              onClick={() => setSelectedSize(variant.size)}
              className={`px-2.5 py-0.5 rounded-md sm:rounded-full transition-all text-[8px] sm:text-[9px] font-bold border ${
                selectedSize === variant.size
                  ? 'border-luxury-gold bg-luxury-gold text-white'
                  : 'border-(--foreground)/15 text-(--foreground)/50 hover:border-luxury-gold hover:text-luxury-gold'
              }`}
            >
              {variant.size}
            </button>
          ))}
        </div>

        <div className="relative w-full">
          <CartSparkBurst active={isSparking} />
          <button 
            onClick={handleAddItem}
            className={`w-full py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-bold text-[9px] sm:text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-[0.98] ${
              isSparking 
                ? 'bg-luxury-gold text-white scale-[1.02] shadow-luxury-gold/30' 
                : 'bg-luxury-charcoal text-white dark:bg-white dark:text-black hover:bg-luxury-gold dark:hover:bg-luxury-gold dark:hover:text-white'
            }`}
            suppressHydrationWarning
          >
            {isSparking ? (
              <>
                <SparkleStar size={12} className="text-white animate-spin" />
                <span>Added ✨</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

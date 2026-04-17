'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/store/useCart';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState<string>(product.variants[0].size);
  const addItem = useCart((state) => state.addItem);

  const currentPrice = product.variants.find(v => v.size === selectedSize)?.price || product.variants[0].price;

  const handleAddItem = () => {
    // Determine the correct size type for the cart store
    const size = selectedSize as '3ml' | '6ml' | 'set';
    addItem(product, size);
  };

  return (
    <div className="luxury-card group rounded-2xl overflow-hidden flex flex-col h-full reveal" suppressHydrationWarning>
      {/* Product Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-white/5 border-b border-white/5" suppressHydrationWarning>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 30vw, 20vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-1" suppressHydrationWarning>
        <div className="flex justify-between items-start mb-1" suppressHydrationWarning>
          <h3 className="text-lg font-serif text-luxury-cream leading-tight">{product.name}</h3>
          <span className="text-luxury-gold font-bold text-base">{currentPrice}৳</span>
        </div>
        
        <p className="text-white/40 text-[10px] mb-4 line-clamp-1">
          {product.description}
        </p>

        {/* Size Selection */}
        <div className="mb-4">
          <label className="text-[9px] uppercase tracking-widest text-white/20 mb-2 block">
            {product.category === 'combo' ? 'Bundle Includes' : 'Size'}
          </label>
          <div className="flex gap-1.5">
            {product.variants.map((variant) => (
              <button
                key={variant.size}
                onClick={() => setSelectedSize(variant.size)}
                className={`flex-1 py-1.5 rounded-md transition-all text-[10px] font-bold border ${
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
          className="w-full bg-[#FFD700] text-black py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#FFE55C] active:scale-95 transition-all mt-auto shadow-[0_0_20px_rgba(255,215,0,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Add to Bag
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

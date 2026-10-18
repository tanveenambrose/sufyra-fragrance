'use client';

import React, { useEffect } from 'react';
import { X, Plus, Minus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '@/store/useCart';
import Image from 'next/image';
import { useState } from 'react';
import PurchaseFlow from './Purchase/PurchaseFlow';

const CartDrawer: React.FC = () => {
  const { items, removeItem, updateQuantity, getTotalPrice, isCartOpen, setIsCartOpen } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const isOpen = isCartOpen;
  const onClose = () => setIsCartOpen(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-100 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-(--background) z-101 cart-drawer flex flex-col transition-all duration-500 ease-[cubic-bezier(0.04,0.56,0.4,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="p-6 border-b border-(--foreground)/10 flex items-center justify-between">
          <h2 className="text-2xl font-serif text-(--foreground)">Shopping Bag</h2>
          <button onClick={onClose} className="p-2 hover:bg-(--foreground)/5 rounded-full transition-colors text-(--foreground)">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-(--foreground)/5 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-(--foreground)/20" />
              </div>
              <p className="text-(--foreground)/40 uppercase tracking-widest text-sm">Your bag is empty</p>
              <button 
                onClick={onClose}
                className="mt-6 text-luxury-gold font-bold uppercase tracking-widest text-xs underline underline-offset-8"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              {(isExpanded ? items : items.slice(0, 3)).map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 group">
                  <div className="relative w-20 h-24 bg-(--foreground)/5 rounded-lg overflow-hidden shrink-0">
                    <Image 
                      src={item.image_url} 
                      alt={item.name} 
                      fill 
                      sizes="80px"
                      className="object-cover" 
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1 text-(--foreground)">
                      <h3 className="font-serif text-lg">{item.name}</h3>
                      <button 
                          onClick={() => removeItem(item.id, item.selectedSize)}
                          className="text-(--foreground)/20 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-luxury-gold uppercase tracking-widest mb-3">{item.selectedSize}</p>
                    
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-3 bg-(--foreground)/5 rounded-md px-2 py-1 text-(--foreground)">
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)}
                          className="p-1 hover:text-luxury-gold transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)}
                          className="p-1 hover:text-luxury-gold transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-bold text-(--foreground)">{item.selectedPrice * item.quantity}৳</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {items.length > 3 && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full py-3 border border-(--foreground)/5 rounded-xl text-luxury-gold text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-(--foreground)/5 transition-all"
                >
                  {isExpanded ? (
                    <><ChevronUp size={14} /> See Less</>
                  ) : (
                    <><ChevronDown size={14} /> See More ({items.length - 3})</>
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-(--foreground)/10 space-y-4">
            <div className="flex justify-between items-center text-(--foreground)/60">
              <span className="uppercase tracking-[0.2em] text-[10px]">Subtotal</span>
              <span className="text-xl font-serif text-(--foreground)">{getTotalPrice()}৳</span>
            </div>
            <button 
              onClick={() => setIsPurchaseModalOpen(true)}
              className="w-full luxury-gradient py-4 rounded-full text-luxury-charcoal font-bold uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform"
            >
              Proceed to Checkout
            </button>
            <p className="text-[9px] text-center text-(--foreground)/30 uppercase tracking-widest">
              Shipping & taxes calculated at checkout
            </p>
          </div>
        )}
      </div>

      {/* Purchase Flow Integration */}
      <PurchaseFlow 
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        items={items}
      />
    </>
  );
};

export default CartDrawer;

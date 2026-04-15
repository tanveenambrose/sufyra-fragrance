'use client';

import React, { useEffect, useRef } from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/store/useCart';
import Image from 'next/image';
import { gsap } from 'gsap';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC = () => {
  const { items, removeItem, updateQuantity, getTotalPrice, isCartOpen, setIsCartOpen } = useCart();
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);

  const isOpen = isCartOpen;
  const onClose = () => setIsCartOpen(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.to(overlayRef.current, { opacity: 1, display: 'block', duration: 0.3 });
      gsap.to(drawerRef.current, { x: 0, duration: 0.5, ease: 'power3.out' });
    } else {
      document.body.style.overflow = 'unset';
      gsap.to(overlayRef.current, { opacity: 0, display: 'none', duration: 0.3 });
      gsap.to(drawerRef.current, { x: '100%', duration: 0.5, ease: 'power3.in' });
    }
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-luxury-charcoal z-[101] translate-x-full cart-drawer flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-2xl font-serif text-luxury-cream">Shopping Bag</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/40 uppercase tracking-widest text-sm">Your bag is empty</p>
              <button 
                onClick={onClose}
                className="mt-6 text-luxury-gold font-bold uppercase tracking-widest text-xs underline underline-offset-8"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 group">
                <div className="relative w-20 h-24 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-serif text-lg">{item.name}</h3>
                    <button 
                        onClick={() => removeItem(item.id, item.selectedSize)}
                        className="text-white/20 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-luxury-gold uppercase tracking-widest mb-3">{item.selectedSize}</p>
                  
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3 bg-white/5 rounded-md px-2 py-1">
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
                    <span className="font-bold text-luxury-cream">{item.selectedPrice * item.quantity}৳</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 space-y-4">
            <div className="flex justify-between items-center text-white/60">
              <span className="uppercase tracking-[0.2em] text-[10px]">Subtotal</span>
              <span className="text-xl font-serif text-luxury-cream">{getTotalPrice()}৳</span>
            </div>
            <button className="w-full luxury-gradient py-4 rounded-full text-luxury-charcoal font-bold uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform">
              Proceed to Checkout
            </button>
            <p className="text-[9px] text-center text-white/30 uppercase tracking-widest">
              Shipping & taxes calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;

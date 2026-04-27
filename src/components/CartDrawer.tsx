'use client';

import React, { useEffect, useRef } from 'react';
import { X, Plus, Minus, Trash2, Smartphone, Send, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '@/store/useCart';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useState } from 'react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC = () => {
  const { items, removeItem, updateQuantity, getTotalPrice, isCartOpen, setIsCartOpen } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
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
            <>
              {(isExpanded ? items : items.slice(0, 3)).map((item) => (
                <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 group">
                  <div className="relative w-20 h-24 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                    <Image 
                      src={item.image_url} 
                      alt={item.name} 
                      fill 
                      sizes="80px"
                      className="object-cover" 
                    />
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
              ))}
              
              {items.length > 3 && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="w-full py-3 border border-white/5 rounded-xl text-luxury-gold text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
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
          <div className="p-6 border-t border-white/10 space-y-4">
            <div className="flex justify-between items-center text-white/60">
              <span className="uppercase tracking-[0.2em] text-[10px]">Subtotal</span>
              <span className="text-xl font-serif text-luxury-cream">{getTotalPrice()}৳</span>
            </div>
            <button 
              onClick={() => setIsPurchaseModalOpen(true)}
              className="w-full luxury-gradient py-4 rounded-full text-luxury-charcoal font-bold uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform"
            >
              Proceed to Checkout
            </button>
            <p className="text-[9px] text-center text-white/30 uppercase tracking-widest">
              Shipping & taxes calculated at checkout
            </p>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsPurchaseModalOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-luxury-charcoal border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <button
              onClick={() => setIsPurchaseModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="flex flex-col items-center text-center gap-6">
                <div className="w-20 h-20 bg-luxury-gold/10 rounded-full flex items-center justify-center">
                  <Smartphone size={32} className="text-luxury-gold" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-serif text-luxury-cream mb-2">Finalize Your Purchase</h2>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Your Exquisite Collection</p>
                </div>

                {/* Cart Summary for Screenshot */}
                <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col gap-4 text-left max-h-60 overflow-y-auto scrollbar-hide">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="relative w-12 h-14 rounded-lg overflow-hidden flex-shrink-0">
                        <Image 
                          src={item.image_url} 
                          alt={item.name} 
                          fill 
                          sizes="100px"
                          className="object-cover" 
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-serif text-white">{item.name}</h3>
                        <p className="text-[8px] uppercase tracking-widest text-luxury-gold font-bold">Qty: {item.quantity} | {item.selectedSize}</p>
                      </div>
                      <span className="text-sm font-bold text-white">{item.selectedPrice * item.quantity}৳</span>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Total Amount</span>
                    <span className="text-xl font-bold text-luxury-gold">{getTotalPrice()}৳</span>
                  </div>
                </div>

                {/* The Noticeable Note */}
                <div className="w-full bg-luxury-gold/10 border border-luxury-gold/30 rounded-2xl p-5 relative overflow-hidden text-left">
                  <div className="absolute top-0 left-0 w-1 h-full bg-luxury-gold" />
                  <p className="text-sm text-luxury-cream leading-relaxed font-medium">
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
                
                <p className="text-[9px] uppercase tracking-widest text-white/20 font-bold">
                  Sufyra Fragrance — Artisanal Perfumery
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartDrawer;

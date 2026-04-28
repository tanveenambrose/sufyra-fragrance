'use client';

import React, { useState } from 'react';
import { X, MapPin, Phone, User, CheckCircle2, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/data/products';

interface PurchaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedSize: string;
  quantity: number;
  activeImage: string;
  currentPrice: number;
  onSubmit: (formData: PurchaseFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface PurchaseFormData {
  name: string;
  zone: 'Inside Dhaka' | 'Outside Dhaka';
  address: string;
  whatsapp?: string;
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({
  isOpen,
  onClose,
  product,
  selectedSize,
  quantity,
  activeImage,
  currentPrice,
  onSubmit,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<PurchaseFormData>({
    name: '',
    zone: 'Inside Dhaka',
    address: '',
    whatsapp: ''
  });

  if (!isOpen) return null;

  const deliveryCost = formData.zone === 'Inside Dhaka' ? 80 : 150;
  const totalSubtotal = currentPrice * quantity;
  const grandTotal = totalSubtotal + deliveryCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-[var(--background)] border border-luxury-gold/20 rounded-[30px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-2 bg-[var(--foreground)]/5 hover:bg-[var(--foreground)]/10 rounded-full text-[var(--foreground)]/40 hover:text-[var(--foreground)] transition-all"
        >
          <X size={18} />
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Left Side: Order Summary (Visible on Desktop) */}
          <div className="hidden md:flex md:w-[35%] bg-[var(--foreground)]/[0.02] border-r border-white/5 p-8 flex-col gap-6">
            <h3 className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-bold">Curated Selection</h3>
            
            <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-white/10">
              <Image src={activeImage} alt={product.name} fill className="object-cover" />
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-serif text-[var(--foreground)] leading-tight">{product.name}</h4>
                <p className="text-[9px] uppercase tracking-widest text-luxury-gold mt-1">Size: {selectedSize}</p>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-[var(--foreground)]/40">
                  <span>Subtotal</span>
                  <span className="text-[var(--foreground)]">৳{totalSubtotal}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase tracking-widest text-[var(--foreground)]/40">
                  <span>Delivery</span>
                  <span className="text-[var(--foreground)]">৳{deliveryCost}</span>
                </div>
                <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/10">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-luxury-gold">Total</span>
                  <span className="text-2xl font-bold text-[var(--foreground)]">৳{grandTotal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Shipping Form */}
          <div className="flex-grow p-8 md:p-10 flex flex-col">
            <div className="mb-8">
              <h2 className="text-2xl font-serif text-[var(--foreground)] mb-1">Procurement Details</h2>
              <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--foreground)]/40 font-bold">Please specify your delivery coordinates</p>
            </div>

            <div className="space-y-5 flex-grow">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/40 font-bold ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold w-4 h-4" />
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tanveen Ambrose"
                    className="w-full bg-[var(--foreground)]/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-[var(--foreground)] focus:outline-none focus:border-luxury-gold/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/40 font-bold ml-1">Delivery Zone</label>
                  <select
                    value={formData.zone}
                    onChange={(e) => setFormData({ ...formData, zone: e.target.value as any })}
                    className="w-full bg-[var(--foreground)]/5 border border-white/10 rounded-xl py-3.5 px-4 text-sm text-[var(--foreground)] focus:outline-none focus:border-luxury-gold/50 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="Inside Dhaka" className="bg-black">Inside Dhaka</option>
                    <option value="Outside Dhaka" className="bg-black">Outside Dhaka</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/40 font-bold ml-1">WhatsApp (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-gold w-4 h-4" />
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="01XXX-XXXXXX"
                      className="w-full bg-[var(--foreground)]/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-[var(--foreground)] focus:outline-none focus:border-luxury-gold/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/40 font-bold ml-1">Precise Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-luxury-gold w-4 h-4" />
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                    placeholder="House, Road, Area, etc."
                    className="w-full bg-[var(--foreground)]/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-sm text-[var(--foreground)] focus:outline-none focus:border-luxury-gold/50 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Mobile-only Summary */}
            <div className="md:hidden mt-6 mb-6 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[8px] uppercase tracking-[0.2em] text-luxury-gold font-bold">Grand Total</p>
                  <p className="text-xl font-bold text-[var(--foreground)]">৳{grandTotal}</p>
                </div>
                <p className="text-[8px] uppercase tracking-widest text-[var(--foreground)]/30">Inc. ৳{deliveryCost} delivery</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full luxury-gradient text-luxury-charcoal py-4.5 rounded-xl font-bold uppercase tracking-[0.2em] text-[11px] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-luxury-gold/10 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-luxury-charcoal border-t-transparent rounded-full animate-spin" />
                  Processing Order...
                </>
              ) : (
                <>
                  Confirm Selection
                  <CheckCircle2 size={16} />
                </>
              )}
            </button>

            <p className="mt-4 text-[8px] text-center uppercase tracking-[0.3em] text-[var(--foreground)]/20 font-bold italic">
              * Secure Order Submission to the Admin Mansion
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseForm;

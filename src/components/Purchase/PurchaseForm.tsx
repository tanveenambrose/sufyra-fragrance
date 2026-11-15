'use client';

import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  Sparkles, 
  Truck, 
  CreditCard,
  ShieldCheck,
  Package
} from 'lucide-react';
import Image from 'next/image';

export interface CartItem {
  id: string;
  name: string;
  selectedSize: string;
  selectedPrice: number;
  quantity: number;
  image_url?: string;
  product_image?: string;
  image?: string;
}

interface PurchaseFormProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onSubmit: (formData: PurchaseFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface PurchaseFormData {
  name: string;
  zone: 'Inside Dhaka' | 'Outside Dhaka';
  address: string;
  whatsapp?: string;
  paymentMethod: 'Cash on Delivery' | 'bKash (Manual)';
}

const PurchaseForm: React.FC<PurchaseFormProps> = ({
  isOpen,
  onClose,
  items,
  onSubmit,
  isSubmitting
}) => {
  const [formData, setFormData] = useState<PurchaseFormData>({
    name: '',
    zone: 'Inside Dhaka',
    address: '',
    whatsapp: '',
    paymentMethod: 'Cash on Delivery'
  });

  if (!isOpen) return null;

  const deliveryCost = formData.zone === 'Inside Dhaka' ? 80 : 150;
  const totalSubtotal = items.reduce((acc, item) => acc + (item.selectedPrice * item.quantity), 0);
  const grandTotal = totalSubtotal + deliveryCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-500 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-300">
      {/* Semi-transparent Black Backdrop with Blur Effect */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose} 
      />

      {/* Luxury Modal Container */}
      <div className="relative w-full max-w-4xl bg-(--card) border border-luxury-gold/30 rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.6),0_0_35px_rgba(212,175,55,0.12)] animate-in zoom-in-95 duration-300 max-h-[92vh] flex flex-col z-10">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close procurement modal"
          className="absolute top-5 right-5 z-30 p-2.5 rounded-full bg-(--foreground)/5 hover:bg-(--foreground)/10 text-(--foreground)/60 hover:text-(--foreground) transition-all border border-(--foreground)/10 shadow-xs"
        >
          <X size={16} />
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row h-full overflow-hidden">
          
          {/* Left Column: Product Thumbnail & Pricing Summary */}
          <div className="w-full md:w-[42%] lg:w-[40%] bg-(--foreground)/[0.02] border-b md:border-b-0 md:border-r border-(--foreground)/10 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center gap-1.5 text-luxury-gold mb-1">
                  <Sparkles size={12} />
                  <span className="text-[9px] uppercase tracking-[0.3em] font-bold">
                    Order Selection
                  </span>
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-(--foreground) tracking-tight">
                  Curated Vault
                </h3>
              </div>

              {/* Product Items List & Thumbnails */}
              <div className="space-y-3.5 max-h-60 md:max-h-72 overflow-y-auto pr-1">
                {items.map((item, idx) => {
                  const imageSrc = item.image_url || item.product_image || item.image || '';
                  return (
                    <div 
                      key={idx} 
                      className="p-3 rounded-2xl bg-(--card) border border-(--foreground)/10 hover:border-luxury-gold/30 transition-all flex items-center gap-3.5 shadow-xs"
                    >
                      {/* Product Thumbnail */}
                      <div className="relative w-14 h-16 sm:w-16 sm:h-20 rounded-xl overflow-hidden bg-black/40 border border-luxury-gold/20 shrink-0 shadow-inner">
                        {imageSrc ? (
                          <Image 
                            src={imageSrc} 
                            alt={item.name} 
                            fill 
                            sizes="64px"
                            className="object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-luxury-gold/40">
                            <Package size={18} />
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded-md bg-black/80 text-[8px] font-mono text-luxury-gold font-bold">
                          x{item.quantity}
                        </span>
                      </div>

                      {/* Product Details */}
                      <div className="min-w-0 grow">
                        <h4 className="text-xs sm:text-sm font-serif font-bold text-(--foreground) leading-snug truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] uppercase tracking-wider text-luxury-gold font-bold px-1.5 py-0.5 rounded bg-luxury-gold/10 border border-luxury-gold/20">
                            Size: {item.selectedSize}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-(--foreground) font-mono mt-1">
                          ৳{item.selectedPrice * item.quantity}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="pt-5 border-t border-(--foreground)/10 space-y-2.5">
              <div className="flex justify-between items-center text-xs text-(--foreground)/70">
                <span className="uppercase tracking-widest text-[10px] font-semibold">Subtotal</span>
                <span className="font-mono font-bold text-(--foreground)">৳{totalSubtotal}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-(--foreground)/70">
                <span className="uppercase tracking-widest text-[10px] font-semibold flex items-center gap-1.5">
                  <Truck size={12} className="text-luxury-gold" />
                  Delivery ({formData.zone})
                </span>
                <span className="font-mono font-bold text-(--foreground)">৳{deliveryCost}</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-(--foreground)/15">
                <div>
                  <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-luxury-gold block">
                    Grand Total
                  </span>
                  <span className="text-[9px] text-(--foreground)/40 font-light">
                    All taxes &amp; packaging included
                  </span>
                </div>
                <span className="font-serif text-2xl font-bold text-luxury-gold tracking-tight">
                  ৳{grandTotal}
                </span>
              </div>

              {/* Trust Badge */}
              <div className="pt-2 flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest text-(--foreground)/50">
                <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                <span>100% Pure Artisanal Oils • Authentic</span>
              </div>
            </div>
          </div>

          {/* Right Column: Delivery Form with Refined Softer Inputs & Serif Hierarchy */}
          <div className="w-full md:w-[58%] lg:w-[60%] p-6 sm:p-8 lg:p-10 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-6">
              {/* Serif Header Hierarchy */}
              <div>
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold text-luxury-gold block mb-1">
                  Haute Concierge
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-(--foreground) tracking-tight">
                  Procurement Details
                </h2>
                <p className="text-xs text-(--foreground)/60 mt-1 font-light leading-relaxed">
                  Specify your recipient coordinates for express nationwide white-glove dispatch.
                </p>
              </div>

              {/* Refined, Softer Inputs Grid */}
              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-(--foreground)/70 ml-1 flex items-center gap-1.5">
                    <User size={11} className="text-luxury-gold" />
                    Consignee Full Name
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Tanveen Ambrose"
                    className="w-full bg-(--foreground)/[0.03] hover:bg-(--foreground)/[0.05] focus:bg-(--card) border border-(--foreground)/12 focus:border-luxury-gold/50 rounded-xl px-4 py-3 text-xs sm:text-sm text-(--foreground) transition-all focus:ring-2 focus:ring-luxury-gold/15 outline-none placeholder:text-(--foreground)/30 font-medium"
                  />
                </div>

                {/* Delivery Zone & Payment Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-(--foreground)/70 ml-1 flex items-center gap-1.5">
                      <Truck size={11} className="text-luxury-gold" />
                      Delivery Zone
                    </label>
                    <select
                      value={formData.zone}
                      onChange={(e) => setFormData({ ...formData, zone: e.target.value as 'Inside Dhaka' | 'Outside Dhaka' })}
                      className="w-full bg-(--foreground)/[0.03] hover:bg-(--foreground)/[0.05] focus:bg-(--card) border border-(--foreground)/12 focus:border-luxury-gold/50 rounded-xl px-4 py-3 text-xs sm:text-sm text-(--foreground) transition-all focus:ring-2 focus:ring-luxury-gold/15 outline-none cursor-pointer font-medium"
                    >
                      <option value="Inside Dhaka" className="bg-(--card) text-(--foreground)">Inside Dhaka (৳80)</option>
                      <option value="Outside Dhaka" className="bg-(--card) text-(--foreground)">Outside Dhaka (৳150)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-(--foreground)/70 ml-1 flex items-center gap-1.5">
                      <CreditCard size={11} className="text-luxury-gold" />
                      Payment Method
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as 'Cash on Delivery' | 'bKash (Manual)' })}
                      className="w-full bg-(--foreground)/[0.03] hover:bg-(--foreground)/[0.05] focus:bg-(--card) border border-(--foreground)/12 focus:border-luxury-gold/50 rounded-xl px-4 py-3 text-xs sm:text-sm text-(--foreground) transition-all focus:ring-2 focus:ring-luxury-gold/15 outline-none cursor-pointer font-medium"
                    >
                      <option value="Cash on Delivery" className="bg-(--card) text-(--foreground)">Cash on Delivery</option>
                      <option value="bKash (Manual)" className="bg-(--card) text-(--foreground)">bKash (Manual)</option>
                    </select>
                  </div>
                </div>

                {/* WhatsApp Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-(--foreground)/70 ml-1 flex items-center gap-1.5">
                    <Phone size={11} className="text-luxury-gold" />
                    WhatsApp / Contact Number
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="e.g. 01700-000000"
                    className="w-full bg-(--foreground)/[0.03] hover:bg-(--foreground)/[0.05] focus:bg-(--card) border border-(--foreground)/12 focus:border-luxury-gold/50 rounded-xl px-4 py-3 text-xs sm:text-sm text-(--foreground) transition-all focus:ring-2 focus:ring-luxury-gold/15 outline-none placeholder:text-(--foreground)/30 font-mono font-medium"
                  />
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-(--foreground)/70 ml-1 flex items-center gap-1.5">
                    <MapPin size={11} className="text-luxury-gold" />
                    Delivery Address
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Apartment/Flat, Building, Road No., Area, District..."
                    className="w-full bg-(--foreground)/[0.03] hover:bg-(--foreground)/[0.05] focus:bg-(--card) border border-(--foreground)/12 focus:border-luxury-gold/50 rounded-xl px-4 py-3 text-xs sm:text-sm text-(--foreground) transition-all focus:ring-2 focus:ring-luxury-gold/15 outline-none placeholder:text-(--foreground)/30 resize-none font-medium leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl luxury-gradient text-luxury-charcoal font-bold uppercase tracking-[0.2em] text-xs hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-luxury-gold/20 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-luxury-charcoal border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting Manifest...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Procurement &bull; ৳{grandTotal}</span>
                    <CheckCircle2 size={16} className="group-hover:scale-110 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseForm;

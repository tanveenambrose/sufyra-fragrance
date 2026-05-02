'use client';

import React from 'react';
import { X, User, MapPin, Phone, CreditCard, Calendar, Package, Tag, Hash } from 'lucide-react';

interface OrderDetailModalProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'received': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'processing': return 'text-luxury-gold bg-luxury-gold/10 border-luxury-gold/20';
      case 'shipped': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-[30px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-luxury-gold font-bold">Order Manifest</span>
                <span className={`px-3 py-1 rounded-full text-[8px] uppercase tracking-widest font-bold border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <h2 className="text-3xl font-serif text-luxury-cream">#{order.id.slice(0, 8).toUpperCase()}</h2>
              <div className="flex items-center gap-2 text-white/40 mt-2">
                <Calendar size={12} />
                <span className="text-[10px] uppercase tracking-widest">{formatDate(order.created_at)}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Customer & Delivery */}
            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold mb-4 flex items-center gap-2">
                  <User size={12} className="text-luxury-gold" />
                  Consignee Details
                </h3>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-luxury-cream">{order.delivery_name}</p>
                  <div className="flex items-start gap-2 text-xs text-white/60">
                    <MapPin size={14} className="text-luxury-gold flex-shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{order.delivery_address}</p>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 ml-5">{order.delivery_zone}</p>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold mb-4 flex items-center gap-2">
                  <Phone size={12} className="text-luxury-gold" />
                  Contact Channels
                </h3>
                <div className="space-y-2">
                  <p className="text-xs text-white/60 flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest w-16">WhatsApp:</span>
                    <span className="text-luxury-cream font-mono">{order.whatsapp_number || 'Not Provided'}</span>
                  </p>
                  <p className="text-xs text-white/60 flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest w-16">Account:</span>
                    <span className="text-luxury-cream truncate">{order.user_id}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Order Content */}
            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold mb-4 flex items-center gap-2">
                  <Package size={12} className="text-luxury-gold" />
                  Procurement Content
                </h3>
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-luxury-cream">{order.product_name}</p>
                      <p className="text-[9px] uppercase tracking-widest text-luxury-gold mt-1">Size: {order.variant_size} | Qty: {order.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-luxury-cream">৳{order.subtotal}</span>
                  </div>
                  <div className="pt-4 border-t border-white/5 space-y-2">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/40">
                      <span>Delivery Service</span>
                      <span>৳{order.delivery_cost}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/10">
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-luxury-gold">Grand Total</span>
                      <span className="text-xl font-bold text-luxury-cream">৳{order.total_price}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold mb-4 flex items-center gap-2">
                  <CreditCard size={12} className="text-luxury-gold" />
                  Payment Status
                </h3>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest text-luxury-cream">
                    {order.payment_method || 'Cash on Delivery'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;

'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { 
  Package, 
  Clock, 
  Truck, 
  RefreshCw, 
  ChevronRight, 
  MapPin, 
  ShoppingBag,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import Reveal from '@/components/Reveal';

interface Order {
  id: string;
  created_at: string;
  product_name: string;
  variant_size: string;
  quantity: number;
  total_price: number;
  status: string;
  delivery_address: string;
  delivery_zone: string;
  product_id?: string;
}

export default function MyOrders() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchOrders();
      
      // Real-time subscription for status updates
      const channel = supabase
        .channel('order-status-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setOrders(currentOrders => 
              currentOrders.map(order => 
                order.id === payload.new.id ? { ...order, status: payload.new.status } : order
              )
            );
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': 
        return { 
          label: 'Awaiting Review', 
          icon: <Clock size={16} />, 
          color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
          description: 'Your request is in our sanctuary queue.'
        };
      case 'received': 
        return { 
          label: 'Manifest Received', 
          icon: <CheckCircle2 size={16} />, 
          color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
          description: 'We have successfully accepted your procurement.'
        };
      case 'processing': 
        return { 
          label: 'Artisan Preparation', 
          icon: <RefreshCw size={16} className="animate-spin-slow" />, 
          color: 'text-luxury-gold bg-luxury-gold/10 border-luxury-gold/20',
          description: 'Our curators are preparing your selection.'
        };
      case 'shipped': 
        return { 
          label: 'En Route', 
          icon: <Truck size={16} />, 
          color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
          description: 'Your scents are traveling to your destination.'
        };
      default: 
        return { 
          label: status, 
          icon: <AlertCircle size={16} />, 
          color: 'text-white/40 bg-white/5 border-white/10',
          description: 'Current status update in progress.'
        };
    }
  };

  const filteredOrders = orders.filter(o => 
    o.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <RefreshCw className="w-8 h-8 text-luxury-gold animate-spin" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 text-center">
      <Reveal>
        <div className="w-20 h-20 rounded-full bg-luxury-gold/10 flex items-center justify-center mb-8 mx-auto">
          <ShoppingBag className="w-10 h-10 text-luxury-gold" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif text-[var(--foreground)] mb-4 italic">Exclusive Access</h1>
        <p className="text-[var(--foreground)]/40 max-w-md mx-auto mb-10 tracking-widest uppercase text-[10px] leading-relaxed">
          Please enter your credentials to access your procurement manifest and tracking details.
        </p>
        <Link 
          href="/login" 
          className="luxury-gradient px-12 py-4 rounded-xl text-luxury-charcoal font-bold uppercase tracking-[0.2em] text-xs hover:scale-105 transition-transform inline-block shadow-2xl shadow-luxury-gold/20"
        >
          Proceed to Sanctuary
        </Link>
      </Reveal>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] pt-32 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12 sm:mb-16 border-b border-[var(--foreground)]/5 pb-12">
            <div>
              <span className="text-luxury-gold uppercase tracking-[0.4em] text-[10px] font-bold mb-4 block">Concierge Desk</span>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-serif text-[var(--foreground)] italic leading-tight">My Procurement Manifest</h1>
              <p className="text-[var(--foreground)]/30 text-[9px] sm:text-xs mt-4 tracking-widest uppercase font-medium">Tracking your artisanal scent journey</p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/20" size={18} />
              <input
                type="text"
                placeholder="Find Manifest..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[var(--foreground)]/[0.03] border border-[var(--foreground)]/10 rounded-2xl py-3 sm:py-4 pl-12 pr-4 text-xs text-[var(--foreground)] focus:outline-none focus:border-luxury-gold/40 transition-all placeholder:text-[var(--foreground)]/30 font-bold"
              />
            </div>
          </div>
        </Reveal>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <RefreshCw className="w-10 h-10 text-luxury-gold animate-spin" strokeWidth={1} />
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--foreground)]/20 font-bold">Synchronizing Archives...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 sm:py-32 border border-dashed border-[var(--foreground)]/5 rounded-[2rem] sm:rounded-[3rem] bg-[var(--foreground)]/[0.01]">
            <Package className="w-12 h-12 sm:w-16 h-16 text-[var(--foreground)]/10 mx-auto mb-8" strokeWidth={1} />
            <h3 className="text-lg sm:text-xl font-serif text-[var(--foreground)]/40 mb-2">No Manifests Found</h3>
            <p className="text-[10px] uppercase tracking-widest text-[var(--foreground)]/20 mb-10">Your procurement history is currently empty.</p>
            <Link 
              href="/products" 
              className="text-luxury-gold border border-luxury-gold/30 px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-luxury-gold/10 transition-all"
            >
              Start Your Journey
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredOrders.map((order, index) => {
              const status = getStatusInfo(order.status);
              return (
                <Reveal key={order.id}>
                  <div className="group bg-[var(--foreground)]/[0.02] border border-[var(--foreground)]/10 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden hover:bg-[var(--foreground)]/[0.04] transition-all duration-500 hover:border-luxury-gold/20 shadow-xl hover:shadow-luxury-gold/5">
                    <div className="p-5 sm:p-10">
                      <div className="flex flex-col lg:flex-row justify-between gap-6 lg:gap-10">
                        {/* Order Identity */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <span className="text-[9px] sm:text-[10px] font-mono text-luxury-gold px-2.5 py-1 bg-luxury-gold/10 rounded-full border border-luxury-gold/20 self-start">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-[var(--foreground)]/30 uppercase tracking-widest font-bold">
                              {new Date(order.created_at).toLocaleDateString(undefined, { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          
                          <h3 className="text-lg sm:text-2xl md:text-3xl font-serif text-[var(--foreground)] mb-3 group-hover:text-luxury-gold transition-colors duration-500 line-clamp-2 leading-tight">{order.product_name}</h3>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold text-[var(--foreground)]/40 mb-6 sm:mb-8">
                            <span className="flex items-center gap-1.5"><ShoppingBag size={10} className="text-luxury-gold/40" /> Size: {order.variant_size}</span>
                            <span className="hidden sm:block w-1 h-1 rounded-full bg-[var(--foreground)]/10" />
                            <span className="flex items-center gap-1.5"><Package size={10} className="text-luxury-gold/40" /> Qty: {order.quantity}</span>
                          </div>
                          
                          <div className="flex items-start gap-3 text-[var(--foreground)]/60 bg-[var(--foreground)]/[0.03] p-3 rounded-xl border border-[var(--foreground)]/5 sm:bg-transparent sm:p-0 sm:border-0">
                            <MapPin size={14} className="text-luxury-gold/50 shrink-0 mt-0.5" />
                            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest font-medium leading-relaxed">
                              {order.delivery_address}, {order.delivery_zone}
                            </span>
                          </div>
                        </div>

                        {/* Order Economics & Status */}
                        <div className="flex flex-col sm:flex-row lg:flex-col justify-between items-start sm:items-center lg:items-end gap-6 sm:gap-8 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-[var(--foreground)]/5 lg:pl-10">
                          <div className="text-left sm:text-right lg:text-right w-full sm:w-auto">
                            <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[var(--foreground)]/40 font-bold mb-1">Procurement Total</p>
                            <p className="text-2xl sm:text-3xl font-bold text-luxury-gold">৳{order.total_price}</p>
                          </div>
                          
                          <div className="flex flex-col items-start sm:items-end lg:items-end gap-3 sm:gap-4 w-full sm:w-auto">
                            <div className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border ${status.color} transition-all duration-500 whitespace-nowrap`}>
                              {status.icon}
                              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">{status.label}</span>
                            </div>
                            <p className="text-[8px] sm:text-[9px] text-[var(--foreground)]/40 uppercase tracking-widest font-medium max-w-[200px] text-left sm:text-right lg:text-right italic leading-relaxed">
                              {status.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* View Details Footer */}
                    <Link 
                      href={`/product-details/${order.product_id}`}
                      className="bg-[var(--foreground)]/[0.01] border-t border-[var(--foreground)]/5 p-4 flex items-center justify-center gap-2 group/link hover:bg-luxury-gold/5 transition-all"
                    >
                      <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-[var(--foreground)]/20 font-bold group-hover/link:text-luxury-gold transition-colors">View Product Archives</span>
                      <ChevronRight size={12} className="text-[var(--foreground)]/10 group-hover/link:text-luxury-gold transition-all transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

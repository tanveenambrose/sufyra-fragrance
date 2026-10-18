'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, products as hardcodedProducts } from '@/data/products';
import { 
  Plus, 
  Database, 
  Tag, 
  ShoppingBag, 
  ArrowRight, 
  Image as ImageIcon,
  ClipboardList,
  Sparkles,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface DashboardOrder {
  id: string;
  created_at: string;
  delivery_name: string;
  delivery_email?: string;
  total_price: number;
  product_name: string;
  status: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([]);
  const [ordersCount, setOrdersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, onSale: 0, regular: 0, combo: 0 });

  useEffect(() => {
    fetchProducts();
    fetchRecentOrders();

    // Real-time listener for orders feed on dashboard
    const channel = supabase
      .channel('admin-dashboard-orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as DashboardOrder;
          setRecentOrders((prev) => [newOrder, ...prev.slice(0, 4)]);
          setOrdersCount((prev) => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updated = payload.new as DashboardOrder;
          setRecentOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setProducts(data);
        calculateStats(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const { data, count, error } = await supabase
        .from('orders')
        .select('id, created_at, delivery_name, delivery_email, total_price, product_name, status', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentOrders(data || []);
      setOrdersCount(count || 0);
    } catch (err) {
      console.error('Error fetching dashboard orders:', err);
    }
  };

  const calculateStats = (p: Product[]) => {
    setStats({
      total: p.length,
      onSale: p.filter(x => (x.discount_percent || 0) > 0).length,
      regular: p.filter(x => x.category === 'perfume-oil').length,
      combo: p.filter(x => x.category === 'combo').length,
    });
  };

  const handleSeedData = async () => {
    if (!confirm('This will seed existing hardcoded products into the database. Continue?')) return;
    
    try {
      const productsToSeed = hardcodedProducts.map(p => {
        const productData = { ...p };
        delete (productData as { id?: string }).id;
        return {
          ...productData,
          discount_percent: 0,
        };
      });

      const { error } = await supabase.from('products').insert(productsToSeed);
      if (error) throw error;
      
      alert('Data seeded successfully!');
      fetchProducts();
    } catch (err) {
      console.error('Error seeding data:', err);
      alert('Error seeding data. Make sure the table "products" exists in Supabase.');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-serif text-luxury-gold">Mansion Overview</h2>
          <p className="text-white/40 text-xs tracking-widest uppercase mt-2">Real-time control center of Sufyra</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSeedData}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-luxury-gold/30 text-luxury-gold text-[10px] font-bold uppercase tracking-widest hover:bg-luxury-gold/5 transition-all"
          >
            <Database size={14} />
            Seed From Code
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
        {[
          { label: 'Live Orders', value: ordersCount, icon: ClipboardList, color: 'text-emerald-400', href: '/admin/orders' },
          { label: 'Total Scents', value: stats.total, icon: ShoppingBag, color: 'text-luxury-gold', href: '/admin/products' },
          { label: 'Regulars', value: stats.regular, icon: Tag, color: 'text-blue-400', href: '/admin/products' },
          { label: 'Combos', value: stats.combo, icon: Database, color: 'text-purple-400', href: '/admin/products' },
          { label: 'Live Deals', value: stats.onSale, icon: Tag, color: 'text-red-400', href: '/admin/products' },
        ].map((stat, i) => (
          <Link 
            key={i} 
            href={stat.href}
            className="bg-luxury-charcoal p-4 sm:p-6 rounded-2xl border border-white/5 hover:border-luxury-gold/20 transition-all space-y-3 sm:space-y-4 shadow-xl group block"
          >
            <div className="flex justify-between items-center">
              <stat.icon size={16} className={stat.color} />
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Live</span>
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-serif text-luxury-cream group-hover:text-luxury-gold transition-colors">{stat.value}</p>
              <p className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Live Orders Feed & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Orders Stream & Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Live Orders Panel */}
          <div className="bg-luxury-charcoal rounded-2xl border border-white/5 p-6 shadow-xl space-y-5">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-luxury-gold flex items-center gap-2">
                  <Sparkles size={14} />
                  Live Procurements Stream
                </h3>
              </div>
              <Link 
                href="/admin/orders" 
                className="text-[10px] uppercase tracking-widest text-luxury-gold hover:underline font-bold flex items-center gap-1 group"
              >
                All Orders <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="divide-y divide-white/5">
              {recentOrders.length === 0 ? (
                <div className="py-8 text-center text-white/30 text-xs tracking-wider">
                  No orders placed yet. Real-time updates will appear here automatically.
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="py-3.5 flex items-center justify-between gap-4 group">
                    <div className="min-w-0 grow">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-luxury-cream truncate">{order.delivery_name}</span>
                        <span className="text-[9px] font-mono text-luxury-gold/70">#{order.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-white/40 mt-1">
                        <span className="flex items-center gap-1 text-luxury-gold/80 font-mono truncate">
                          <Mail size={10} />
                          {order.delivery_email || 'No email'}
                        </span>
                        <span>•</span>
                        <span className="truncate max-w-50">
                          {(() => {
                            try {
                              if (order.product_name?.startsWith('[') && order.product_name?.endsWith(']')) {
                                const parsed = JSON.parse(order.product_name);
                                return parsed.map((x: { name: string }) => x.name).join(', ');
                              }
                              return order.product_name;
                            } catch {
                              return order.product_name;
                            }
                          })()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs font-bold text-luxury-gold font-mono">৳{order.total_price}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${
                        order.status === 'Delivered' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : order.status === 'Shipped'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/30'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Operations */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Quick Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/admin/products/new" className="group p-6 rounded-2xl bg-white/2 border border-white/5 hover:border-luxury-gold/30 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform">
                  <Plus size={20} />
                </div>
                <div>
                  <h4 className="text-base font-serif text-luxury-cream mb-1">Release New Scent</h4>
                  <p className="text-xs text-white/40">Add a single fragrance or curated set.</p>
                </div>
              </Link>

              <Link href="/admin/orders" className="group p-6 rounded-2xl bg-white/2 border border-white/5 hover:border-luxury-gold/30 transition-all space-y-3">
                <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h4 className="text-base font-serif text-luxury-cream mb-1">Manifests &amp; Orders</h4>
                  <p className="text-xs text-white/40">Inspect customer shipments and trigger status notifications.</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Col: Recent Library Additions */}
        <div className="space-y-6">
           <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Recent Additions</h3>
              <Link href="/admin/products" className="text-[9px] uppercase tracking-widest text-luxury-gold hover:underline">View All</Link>
           </div>
           
           <div className="bg-luxury-charcoal rounded-2xl border border-white/5 overflow-hidden shadow-xl">
             <div className="divide-y divide-white/5">
                {isLoading ? (
                  <div className="p-8 text-center text-white/20 uppercase tracking-widest text-[9px]">Optimizing...</div>
                ) : products.length === 0 ? (
                  <div className="p-8 text-center text-white/20 uppercase tracking-widest text-[9px]">No items yet</div>
                ) : (
                  products.slice(0, 5).map((p) => (
                    <div key={p.id} className="p-4 flex items-center gap-4 group">
                      <div className="w-12 h-14 rounded-lg bg-white/5 overflow-hidden shrink-0 border border-white/10 group-hover:border-luxury-gold/30 transition-colors">
                        {p.image_url ? (
                          <Image src={p.image_url} alt={p.name} width={48} height={56} className="w-full h-full object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center">
                            <ImageIcon size={14} className="text-white/20" />
                          </div>
                        )}
                      </div>
                      <div className="grow min-w-0">
                        <p className="text-sm font-bold text-luxury-cream truncate">{p.name}</p>
                        <p className="text-[8px] uppercase tracking-widest text-white/20">{p.category === 'combo' ? 'Combo' : 'Regular'}</p>
                      </div>
                      <Link href={`/admin/products/${p.id}/edit`} className="p-2 text-white/20 hover:text-luxury-gold transition-colors">
                         <ArrowRight size={14} />
                      </Link>
                    </div>
                  ))
                )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, products as hardcodedProducts } from '@/data/products';
import { 
  Plus, 
  Database, 
  ShoppingBag, 
  ArrowRight, 
  Image as ImageIcon,
  ClipboardList,
  Sparkles,
  Mail,
  Coins,
  Layers,
  Flame,
  TrendingUp,
  RefreshCw,
  ShieldCheck,
  Package
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
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, onSale: 0, regular: 0, combo: 0 });

  const calculateStats = useCallback((p: Product[]) => {
    setStats({
      total: p.length,
      onSale: p.filter((x) => (x.discount_percent || 0) > 0).length,
      regular: p.filter((x) => x.category === 'perfume-oil').length,
      combo: p.filter((x) => x.category === 'combo').length,
    });
  }, []);

  const fetchProducts = useCallback(async () => {
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
  }, [calculateStats]);

  const fetchOrdersAndRevenue = useCallback(async () => {
    try {
      // Fetch recent 6 orders for the feed
      const { data, count, error } = await supabase
        .from('orders')
        .select('id, created_at, delivery_name, delivery_email, total_price, product_name, status', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setRecentOrders(data || []);
      setOrdersCount(count || 0);

      // Fetch sum of total_price for gross revenue
      const { data: revData } = await supabase
        .from('orders')
        .select('total_price');

      if (revData) {
        const sum = revData.reduce((acc, cur) => acc + (Number(cur.total_price) || 0), 0);
        setTotalRevenue(sum);
      }
    } catch (err) {
      console.error('Error fetching dashboard orders:', err);
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([fetchProducts(), fetchOrdersAndRevenue()]);
    setIsRefreshing(false);
  }, [fetchProducts, fetchOrdersAndRevenue]);

  useEffect(() => {
    fetchDashboardData();

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
          setTotalRevenue((prev) => prev + (Number(newOrder.total_price) || 0));
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
  }, [fetchDashboardData]);

  const handleSeedData = async () => {
    if (!confirm('This will seed existing hardcoded products into the database. Continue?')) return;

    try {
      const productsToSeed = hardcodedProducts.map((p) => {
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

  // Helper for human-readable order timestamps
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-8">
      {/* Executive Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#12100e] via-[#0d0c0a] to-[#070707] border border-luxury-gold/25 p-6 sm:p-8 lg:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        {/* Subtle background luxury glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-luxury-gold/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-luxury-gold/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-luxury-gold/15 border border-luxury-gold/30 text-luxury-gold text-[9px] font-bold uppercase tracking-[0.25em] flex items-center gap-1.5">
                <Sparkles size={11} />
                Sufyra Atelier HQ
              </span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Operational
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif tracking-wide text-white">
              Executive <span className="text-transparent bg-clip-text bg-linear-to-r from-luxury-gold via-[#e6cf8b] to-luxury-gold font-normal">Console</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/50 max-w-xl font-light leading-relaxed">
              Real-time surveillance of flacon inventory, haute procurements stream, and client fulfillment metrics.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={isRefreshing}
              title="Refresh metrics"
              className="p-3 rounded-xl border border-white/10 hover:border-luxury-gold/30 bg-white/3 text-white/60 hover:text-luxury-gold transition-all"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-luxury-gold' : ''} />
            </button>

            <button
              onClick={handleSeedData}
              className="px-4 py-3 rounded-xl border border-white/10 text-white/70 hover:text-luxury-gold hover:border-luxury-gold/30 text-xs font-semibold uppercase tracking-wider bg-white/2 hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <Database size={15} />
              <span>Seed Catalog</span>
            </button>

            <Link
              href="/admin/products/new"
              className="px-5 py-3 rounded-xl bg-linear-to-r from-luxury-gold via-[#e5c76b] to-luxury-gold text-black font-bold text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(212,175,55,0.3)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 group"
            >
              <Plus size={16} className="text-black group-hover:rotate-90 transition-transform duration-300" />
              <span>Release New Scent</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
        {/* 1. Gross Revenue */}
        <div className="col-span-2 sm:col-span-1 p-5 rounded-2xl bg-luxury-charcoal border border-luxury-gold/25 hover:border-luxury-gold/50 shadow-lg hover:shadow-[0_8px_30px_rgba(212,175,55,0.1)] transition-all group flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-luxury-gold/15 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform">
              <Coins size={18} />
            </div>
            <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1">
              <TrendingUp size={11} />
              Gross
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-serif text-white group-hover:text-luxury-gold transition-colors font-bold">
              ৳{totalRevenue.toLocaleString()}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 mt-1">
              Total Volume
            </p>
          </div>
        </div>

        {/* 2. Live Orders */}
        <Link
          href="/admin/orders"
          className="p-5 rounded-2xl bg-luxury-charcoal border border-white/5 hover:border-luxury-gold/40 shadow-lg hover:shadow-[0_8px_30px_rgba(212,175,55,0.08)] transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <ClipboardList size={18} />
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Live</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-serif text-white group-hover:text-luxury-gold transition-colors font-bold">
              {ordersCount}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 mt-1">
              Procurements
            </p>
          </div>
        </Link>

        {/* 3. Total Scents */}
        <Link
          href="/admin/products"
          className="p-5 rounded-2xl bg-luxury-charcoal border border-white/5 hover:border-luxury-gold/40 shadow-lg hover:shadow-[0_8px_30px_rgba(212,175,55,0.08)] transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 border border-luxury-gold/20 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform">
              <ShoppingBag size={18} />
            </div>
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Active</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-serif text-white group-hover:text-luxury-gold transition-colors font-bold">
              {stats.total}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 mt-1">
              Fragrance Flacons
            </p>
          </div>
        </Link>

        {/* 4. Combos & Sets */}
        <Link
          href="/admin/products"
          className="p-5 rounded-2xl bg-luxury-charcoal border border-white/5 hover:border-luxury-gold/40 shadow-lg hover:shadow-[0_8px_30px_rgba(212,175,55,0.08)] transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Layers size={18} />
            </div>
            <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Sets</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-serif text-white group-hover:text-luxury-gold transition-colors font-bold">
              {stats.combo}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 mt-1">
              Curated Sets
            </p>
          </div>
        </Link>

        {/* 5. Live Deals */}
        <Link
          href="/admin/products"
          className="p-5 rounded-2xl bg-luxury-charcoal border border-white/5 hover:border-luxury-gold/40 shadow-lg hover:shadow-[0_8px_30px_rgba(212,175,55,0.08)] transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
              <Flame size={18} />
            </div>
            <span className="text-[9px] font-mono text-rose-400 font-bold uppercase tracking-widest">Discount</span>
          </div>
          <div className="mt-4">
            <p className="text-2xl sm:text-3xl font-serif text-white group-hover:text-luxury-gold transition-colors font-bold">
              {stats.onSale}
            </p>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/40 mt-1">
              Promotional Deals
            </p>
          </div>
        </Link>
      </div>

      {/* Main Grid: Orders Stream + Quick Operations & Additions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Live Orders Stream & Management Modules */}
        <div className="lg:col-span-2 space-y-8">
          {/* Live Procurements Stream Card */}
          <div className="rounded-3xl bg-luxury-charcoal border border-luxury-gold/15 overflow-hidden shadow-xl">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
                    Live Procurements Stream
                  </h3>
                  <p className="text-[10px] text-white/40 font-mono mt-0.5">
                    Real-time Supabase postgres feed
                  </p>
                </div>
              </div>

              <Link
                href="/admin/orders"
                className="text-[11px] uppercase tracking-widest text-luxury-gold hover:text-white font-bold flex items-center gap-1.5 group transition-colors"
              >
                <span>View All Manifests</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* List */}
            <div className="divide-y divide-white/5">
              {recentOrders.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/20">
                    <ClipboardList size={22} />
                  </div>
                  <p className="text-xs uppercase tracking-widest text-white/40">No procurements placed yet</p>
                  <p className="text-[11px] text-white/25">New customer orders will stream here instantly via WebSocket.</p>
                </div>
              ) : (
                recentOrders.map((order) => {
                  // Customer initials monogram
                  const initials = order.delivery_name
                    ? order.delivery_name
                        .split(' ')
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((n) => n[0].toUpperCase())
                        .join('')
                    : 'CU';

                  // Parse items
                  let parsedSummary = order.product_name;
                  try {
                    if (order.product_name?.startsWith('[') && order.product_name?.endsWith(']')) {
                      const items = JSON.parse(order.product_name);
                      parsedSummary = items.map((x: { name: string; quantity?: number }) => `${x.name}${x.quantity ? ` × ${x.quantity}` : ''}`).join(', ');
                    }
                  } catch {
                    // keep raw
                  }

                  const statusColors: Record<string, string> = {
                    Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                    Shipped: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
                    Processing: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
                    Pending: 'bg-luxury-gold/15 text-luxury-gold border-luxury-gold/30',
                  };

                  return (
                    <div
                      key={order.id}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/2 transition-colors group"
                    >
                      {/* Left: Avatar & Info */}
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 border border-luxury-gold/25 flex items-center justify-center text-luxury-gold font-serif font-bold text-xs shrink-0 group-hover:border-luxury-gold/50 transition-colors">
                          {initials}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white group-hover:text-luxury-gold transition-colors truncate">
                              {order.delivery_name || 'Anonymous Client'}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-luxury-gold/90 border border-white/10">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="text-[10px] text-white/30 font-mono">
                              {formatTimeAgo(order.created_at)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-white/50 mt-1 flex-wrap">
                            {order.delivery_email && (
                              <span className="flex items-center gap-1 font-mono text-[11px] text-white/40 truncate max-w-50">
                                <Mail size={11} className="text-luxury-gold/70" />
                                {order.delivery_email}
                              </span>
                            )}
                            {order.delivery_email && <span className="text-white/20">•</span>}
                            <span className="text-[11px] text-white/60 truncate max-w-65">
                              {parsedSummary}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Price & Status */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <div className="text-right">
                          <p className="text-sm sm:text-base font-bold text-luxury-gold font-mono">
                            ৳{order.total_price}
                          </p>
                          <p className="text-[9px] uppercase tracking-wider text-white/30 font-mono">
                            COD Order
                          </p>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
                            statusColors[order.status] || 'bg-white/5 text-white/60 border-white/10'
                          }`}
                        >
                          {order.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Operations Suite */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-white/50 flex items-center gap-2">
                <Sparkles size={13} className="text-luxury-gold" />
                Atelier Quick Operations
              </h3>
              <span className="text-[10px] text-white/30 font-mono">Action Shortcuts</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Add Fragrance */}
              <Link
                href="/admin/products/new"
                className="group p-6 rounded-3xl bg-luxury-charcoal border border-white/5 hover:border-luxury-gold/40 transition-all shadow-lg hover:shadow-[0_8px_30px_rgba(212,175,55,0.08)] space-y-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 rounded-full blur-2xl group-hover:bg-luxury-gold/10 transition-all pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-luxury-gold/15 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform">
                    <Plus size={22} />
                  </div>
                  <ArrowRight size={16} className="text-white/20 group-hover:text-luxury-gold group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                  <h4 className="text-base font-serif text-white group-hover:text-luxury-gold transition-colors font-bold">
                    Release New Scent
                  </h4>
                  <p className="text-xs text-white/40 mt-1 leading-relaxed">
                    Upload flacon photography, compose olfactory notes, and publish single oils or combo boxes.
                  </p>
                </div>
              </Link>

              {/* Card 2: Orders Manifest */}
              <Link
                href="/admin/orders"
                className="group p-6 rounded-3xl bg-luxury-charcoal border border-white/5 hover:border-luxury-gold/40 transition-all shadow-lg hover:shadow-[0_8px_30px_rgba(212,175,55,0.08)] space-y-4 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <ClipboardList size={22} />
                  </div>
                  <ArrowRight size={16} className="text-white/20 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </div>
                <div>
                  <h4 className="text-base font-serif text-white group-hover:text-emerald-400 transition-colors font-bold">
                    Fulfillment & Manifests
                  </h4>
                  <p className="text-xs text-white/40 mt-1 leading-relaxed">
                    Audit incoming shipments, update delivery progress, and dispatch automated status emails to customers.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Col: Recent Library Additions & System Health */}
        <div className="space-y-8">
          {/* Recent Fragrance Flacons */}
          <div className="rounded-3xl bg-luxury-charcoal border border-luxury-gold/15 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/1">
              <div className="flex items-center gap-2">
                <Package size={15} className="text-luxury-gold" />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Recent Additions</h3>
              </div>
              <Link
                href="/admin/products"
                className="text-[10px] uppercase tracking-widest text-luxury-gold hover:underline font-bold"
              >
                View Catalog
              </Link>
            </div>

            <div className="divide-y divide-white/5">
              {isLoading ? (
                <div className="p-8 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-[10px] uppercase tracking-widest text-white/30">Loading catalog...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center text-white/30 text-xs">
                  No scents cataloged yet.
                </div>
              ) : (
                products.slice(0, 5).map((p) => (
                  <div key={p.id} className="p-4 flex items-center gap-3.5 hover:bg-white/2 transition-colors group">
                    <div className="w-12 h-14 rounded-xl bg-white/5 overflow-hidden shrink-0 border border-white/10 group-hover:border-luxury-gold/40 transition-colors relative">
                      {p.image_url ? (
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          width={48}
                          height={56}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <ImageIcon size={16} className="text-white/20" />
                        </div>
                      )}
                    </div>

                    <div className="grow min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-luxury-gold transition-colors truncate">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-white/40 font-mono">
                          {p.category === 'combo' ? 'Combo Set' : 'Perfume Oil'}
                        </span>
                        {p.discount_percent && p.discount_percent > 0 ? (
                          <span className="text-[8px] font-mono text-rose-400 font-bold">
                            -{p.discount_percent}%
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="p-2 rounded-lg text-white/20 hover:text-luxury-gold hover:bg-white/5 transition-all"
                      title="Edit Fragrance"
                    >
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Infrastructure Health Card */}
          <div className="p-6 rounded-3xl bg-luxury-charcoal border border-white/5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-luxury-gold" />
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">System Infrastructure</h3>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/2 border border-white/5">
                <span className="text-white/50 text-[11px]">Database (PostgreSQL)</span>
                <span className="text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Supabase Connected
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/2 border border-white/5">
                <span className="text-white/50 text-[11px]">Email Dispatch</span>
                <span className="text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Gmail SMTP Active
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/2 border border-white/5">
                <span className="text-white/50 text-[11px]">Media Assets (CDN)</span>
                <span className="text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Cloudinary Ready
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/2 border border-white/5">
                <span className="text-white/50 text-[11px]">Cart Engine</span>
                <span className="text-luxury-gold font-mono text-[10px] font-bold">
                  Persisted (LocalStorage)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
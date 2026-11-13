'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Search, 
  Eye, 
  RefreshCw, 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  Truck, 
  AlertCircle, 
  Sparkles, 
  Mail,
  Filter,
  Package
} from 'lucide-react';
import OrderDetailModal from '@/components/Admin/OrderDetailModal';
import { useAuth } from '@/hooks/useAuth';

export interface Order {
  id: string;
  created_at: string;
  delivery_name: string;
  delivery_email?: string;
  delivery_zone: string;
  delivery_address: string;
  whatsapp_number: string;
  payment_method: string;
  product_name: string;
  variant_size: string;
  quantity: number;
  total_price: number;
  status: string;
  user_id?: string;
  subtotal?: number;
  delivery_cost?: number;
}

type OrderStatus = 'all' | 'pending' | 'received' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export default function AdminOrders() {
  const { user: adminUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOrders();

    // Setup Supabase Realtime channel for live orders
    const channel = supabase
      .channel('admin-orders-page-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as Order;
          setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
          setNewOrderIds((prev) => {
            const next = new Set(prev);
            next.add(newOrder.id);
            return next;
          });

          // Remove "NEW" badge highlight after 30 seconds
          setTimeout(() => {
            setNewOrderIds((prev) => {
              const next = new Set(prev);
              next.delete(newOrder.id);
              return next;
            });
          }, 30000);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updated = payload.new as Order;
          setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      // 1. Update status in Supabase
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      const authorizedAdmins = ['rs80359@gmail.com', 'racoctanveen15@gmail.com'];
      const isAuthorized = adminUser && authorizedAdmins.includes(adminUser.email || '');

      // 2. Trigger email notification via API (only if authorized)
      if (isAuthorized) {
        await fetch(`/api/orders/${id}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
      }

      // Update local state
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Status Counts
  const statusCounts = useMemo(() => {
    const counts = {
      all: orders.length,
      pending: 0,
      received: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orders.forEach((o) => {
      const st = (o.status || '').toLowerCase() as keyof typeof counts;
      if (counts[st] !== undefined) {
        counts[st]++;
      }
    });

    return counts;
  }, [orders]);

  // Combined Search & Status Filtering Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        o.delivery_name.toLowerCase().includes(query) ||
        (o.delivery_email && o.delivery_email.toLowerCase().includes(query)) ||
        o.id.toLowerCase().includes(query) ||
        o.product_name.toLowerCase().includes(query) ||
        (o.whatsapp_number && o.whatsapp_number.includes(query));

      const matchesStatus =
        selectedStatus === 'all' ||
        (o.status || '').toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, selectedStatus]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock size={13} className="text-amber-800 dark:text-amber-300 shrink-0" />;
      case 'received': return <Clock size={13} className="text-blue-800 dark:text-blue-300 shrink-0" />;
      case 'processing': return <RefreshCw size={13} className="animate-spin-slow text-yellow-900 dark:text-yellow-300 shrink-0" />;
      case 'shipped': return <Truck size={13} className="text-teal-800 dark:text-teal-300 shrink-0" />;
      case 'delivered': return <CheckCircle2 size={13} className="text-emerald-900 dark:text-emerald-300 shrink-0" />;
      case 'cancelled': return <AlertCircle size={13} className="text-rose-900 dark:text-rose-300 shrink-0" />;
      default: return null;
    }
  };

  // High-contrast, vivid status badge classes
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': 
        return 'bg-amber-100 text-amber-950 border-amber-400 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-500/50';
      case 'received': 
        return 'bg-blue-100 text-blue-950 border-blue-400 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/50';
      case 'processing': 
        return 'bg-yellow-100 text-yellow-950 border-yellow-400 hover:bg-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-200 dark:border-yellow-500/50';
      case 'shipped': 
        return 'bg-teal-100 text-teal-950 border-teal-400 hover:bg-teal-200 dark:bg-teal-500/20 dark:text-teal-200 dark:border-teal-500/50';
      case 'delivered': 
        return 'bg-emerald-100 text-emerald-950 border-emerald-400 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/50';
      case 'cancelled': 
        return 'bg-rose-100 text-rose-950 border-rose-400 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/50';
      default: 
        return 'bg-zinc-100 text-zinc-900 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700';
    }
  };

  const statusFilterTabs: Array<{ id: OrderStatus; label: string; count: number }> = [
    { id: 'all', label: 'All Manifests', count: statusCounts.all },
    { id: 'pending', label: 'Pending', count: statusCounts.pending },
    { id: 'received', label: 'Received', count: statusCounts.received },
    { id: 'processing', label: 'Processing', count: statusCounts.processing },
    { id: 'shipped', label: 'Shipped', count: statusCounts.shipped },
    { id: 'delivered', label: 'Delivered', count: statusCounts.delivered },
    { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-(--foreground)/10 pb-8">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-serif text-luxury-gold font-bold">Procurement Manifest</h2>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs tracking-wider uppercase mt-2 font-medium">
            Real-time fulfillment surveillance, customer order logs, and status orchestrations.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400" size={16} />
          <input
            type="text"
            placeholder="Search name, email, manifest ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-(--card) border border-(--foreground)/20 rounded-xl py-3 pl-12 pr-4 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-luxury-gold transition-all placeholder:text-zinc-500 dark:placeholder:text-zinc-400 shadow-sm"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Status Filter Component */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-(--card) border border-(--foreground)/10 rounded-2xl shadow-sm">
        {/* Desktop / Tablet: Status Pills */}
        <div className="hidden sm:flex flex-wrap items-center gap-1.5 overflow-x-auto py-1 px-1">
          {statusFilterTabs.map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
                className={`
                  flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
                  ${isActive 
                    ? 'bg-luxury-gold text-black shadow-md shadow-luxury-gold/20 scale-[1.02]' 
                    : 'text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:bg-(--foreground)/5'
                  }
                `}
              >
                <span>{tab.label}</span>
                <span className={`
                  text-[10px] px-2 py-0.5 rounded-full font-mono font-bold
                  ${isActive 
                    ? 'bg-black text-luxury-gold' 
                    : 'bg-(--foreground)/8 text-zinc-700 dark:text-zinc-300'
                  }
                `}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Dropdown View */}
        <div className="sm:hidden flex items-center justify-between gap-2 px-2 py-1 w-full">
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            <Filter size={14} className="text-luxury-gold" />
            <span>Filter Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
            className="bg-(--foreground)/5 border border-(--foreground)/15 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 outline-none focus:border-luxury-gold"
          >
            {statusFilterTabs.map((tab) => (
              <option key={tab.id} value={tab.id} className="bg-white dark:bg-zinc-900 text-black dark:text-white">
                {tab.label} ({tab.count})
              </option>
            ))}
          </select>
        </div>

        {/* Active Filter Reset */}
        {(selectedStatus !== 'all' || searchTerm) && (
          <button
            type="button"
            onClick={() => {
              setSelectedStatus('all');
              setSearchTerm('');
            }}
            className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-luxury-gold hover:underline whitespace-nowrap self-end sm:self-auto mr-2"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Main Table Container */}
      <div className="bg-(--card) rounded-2xl border border-(--foreground)/15 overflow-hidden shadow-xl">
        <div className="w-full">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left min-w-200">
              <thead>
                <tr className="border-b border-(--foreground)/15 bg-(--foreground)/4 text-zinc-800 dark:text-zinc-200">
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.18em] font-bold">Manifest ID</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.18em] font-bold">Consignee &amp; Email</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.18em] font-bold">Selection</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.18em] font-bold">Total</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.18em] font-bold">Status</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.18em] font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--foreground)/10">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-zinc-600 dark:text-zinc-400 uppercase tracking-widest text-xs font-medium">
                      <div className="w-8 h-8 border-2 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      Loading Procurement Manifests...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-(--foreground)/5 flex items-center justify-center text-zinc-400 mx-auto">
                        <Package size={22} />
                      </div>
                      <p className="text-zinc-800 dark:text-zinc-200 font-bold text-sm">
                        No orders match your filter criteria
                      </p>
                      <p className="text-zinc-500 text-xs">
                        Try changing the active status tab or clearing your search term.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStatus('all');
                          setSearchTerm('');
                        }}
                        className="mt-2 text-xs font-bold text-luxury-gold hover:underline uppercase tracking-wider"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isNew = newOrderIds.has(order.id);
                    return (
                      <tr 
                        key={order.id} 
                        className={`group transition-all ${
                          isNew 
                            ? 'bg-luxury-gold/10 border-l-4 border-luxury-gold animate-in fade-in duration-500' 
                            : 'hover:bg-(--foreground)/3'
                        }`}
                      >
                        {/* 1. MANIFEST ID */}
                        <td className="px-6 py-5 align-top">
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-(--foreground)/5 border border-luxury-gold/30 text-luxury-gold tracking-wider shadow-2xs">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </span>
                              {isNew && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-luxury-gold text-black uppercase tracking-wider animate-pulse">
                                  <Sparkles size={10} />
                                  NEW
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mt-1">
                              {new Date(order.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                              {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>

                        {/* 2. CONSIGNEE & EMAIL */}
                        <td className="px-6 py-5 align-top">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                              {order.delivery_name}
                            </span>
                            <span className="text-xs text-zinc-700 dark:text-luxury-gold/90 font-mono font-medium flex items-center gap-1.5 mt-0.5">
                              <Mail size={12} className="text-luxury-gold shrink-0" />
                              {order.delivery_email || order.whatsapp_number || 'Direct Guest'}
                            </span>
                            <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-1 max-w-64">
                              {order.delivery_address || order.delivery_zone}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mt-0.5">
                              Zone: {order.delivery_zone}
                            </span>
                          </div>
                        </td>

                        {/* 3. SELECTION */}
                        <td className="px-6 py-5 align-top max-w-72">
                          <div className="flex flex-col">
                            <span className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">
                              {(() => {
                                try {
                                  if (order.product_name.startsWith('[') && order.product_name.endsWith(']')) {
                                    const items = JSON.parse(order.product_name);
                                    return items.length > 1 
                                      ? `${items[0].name} + ${items.length - 1} more flacons`
                                      : items[0].name;
                                  }
                                  return order.product_name;
                                } catch {
                                  return order.product_name;
                                }
                              })()}
                            </span>
                            <span className="text-xs font-bold text-luxury-gold uppercase tracking-wider mt-1">
                              {order.variant_size} × {order.quantity}
                            </span>
                          </div>
                        </td>

                        {/* 4. TOTAL */}
                        <td className="px-6 py-5 align-top whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-base sm:text-lg font-serif font-bold text-zinc-900 dark:text-white tracking-tight">
                              ৳{order.total_price?.toLocaleString()}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 mt-0.5">
                              {order.payment_method || 'Cash on Delivery'}
                            </span>
                          </div>
                        </td>

                        {/* 5. STATUS (Interactive Badge) */}
                        <td className="px-6 py-5 align-top">
                          <div className="relative inline-block">
                            <select
                              disabled={updatingId === order.id}
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              className={`
                                appearance-none pl-8 pr-10 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs transition-all cursor-pointer outline-none
                                ${getStatusColor(order.status)}
                              `}
                            >
                              <option value="Pending" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Pending</option>
                              <option value="Received" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Received</option>
                              <option value="Processing" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Processing</option>
                              <option value="Shipped" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Shipped</option>
                              <option value="Delivered" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Delivered</option>
                              <option value="Cancelled" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Cancelled</option>
                            </select>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              {getStatusIcon(order.status)}
                            </div>
                            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                          </div>
                        </td>

                        {/* 6. ACTIONS */}
                        <td className="px-6 py-5 align-top text-right">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsModalOpen(true);
                            }}
                            className="p-2.5 rounded-xl border border-(--foreground)/15 hover:border-luxury-gold bg-(--card) text-zinc-700 dark:text-zinc-300 hover:text-luxury-gold transition-all shadow-xs inline-flex items-center justify-center"
                            title="Inspect Order Manifest"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden flex flex-col divide-y divide-(--foreground)/10">
            {isLoading ? (
              <div className="px-6 py-12 text-center text-zinc-500 uppercase tracking-widest text-xs font-medium">
                Loading manifests...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="px-6 py-12 text-center text-zinc-600 dark:text-zinc-400 uppercase tracking-widest text-xs">
                No manifests found matching filter
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isNew = newOrderIds.has(order.id);
                return (
                  <div 
                    key={order.id} 
                    className={`p-5 flex flex-col gap-4 ${
                      isNew ? 'bg-luxury-gold/10 border-l-4 border-luxury-gold' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-(--foreground)/5 border border-luxury-gold/30 text-luxury-gold">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                          {isNew && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-luxury-gold text-black uppercase tracking-wider animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-base font-serif font-bold text-zinc-900 dark:text-white">
                        ৳{order.total_price?.toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Consignee</span>
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{order.delivery_name}</span>
                        <span className="text-[11px] text-zinc-700 dark:text-luxury-gold/90 font-mono truncate">{order.delivery_email || order.whatsapp_number || 'Direct Guest'}</span>
                        <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400 mt-0.5">{order.delivery_zone}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Selection</span>
                        <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 line-clamp-2">
                          {order.product_name}
                        </span>
                        <span className="text-xs font-bold text-luxury-gold uppercase tracking-wider mt-0.5">
                          {order.variant_size} × {order.quantity}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-(--foreground)/10">
                      <div className="relative inline-block">
                        <select
                          disabled={updatingId === order.id}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`
                            appearance-none pl-7 pr-8 py-1 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs transition-all cursor-pointer outline-none
                            ${getStatusColor(order.status)}
                          `}
                        >
                          <option value="Pending" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Pending</option>
                          <option value="Received" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Received</option>
                          <option value="Processing" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Processing</option>
                          <option value="Shipped" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Shipped</option>
                          <option value="Delivered" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Delivered</option>
                          <option value="Cancelled" className="bg-white text-black dark:bg-zinc-900 dark:text-white">Cancelled</option>
                        </select>
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                          {getStatusIcon(order.status)}
                        </div>
                        <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
                      </div>

                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-(--foreground)/15 hover:border-luxury-gold text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-200 hover:text-luxury-gold transition-colors"
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </div>
  );
}

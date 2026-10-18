'use client';

import React, { useState, useEffect } from 'react';
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
  Mail
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

export default function AdminOrders() {
  const { user: adminUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  const filteredOrders = orders.filter(o => 
    o.delivery_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.delivery_email && o.delivery_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock size={14} className="text-amber-400" />;
      case 'received': return <Clock size={14} className="text-blue-400" />;
      case 'processing': return <RefreshCw size={14} className="animate-spin-slow text-luxury-gold" />;
      case 'shipped': return <Truck size={14} className="text-emerald-400" />;
      case 'delivered': return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'cancelled': return <AlertCircle size={14} className="text-red-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-amber-400 border-amber-400/30 bg-amber-400/5';
      case 'received': return 'text-blue-400 border-blue-400/30 bg-blue-400/5';
      case 'processing': return 'text-luxury-gold border-luxury-gold/30 bg-luxury-gold/5';
      case 'shipped': return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5';
      case 'delivered': return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5';
      case 'cancelled': return 'text-red-400 border-red-400/30 bg-red-400/5';
      default: return 'text-white/40 border-white/10 bg-white/5';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-serif text-luxury-gold">Procurement Manifest</h2>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <p className="text-white/40 text-xs tracking-widest uppercase mt-2">Manage customer scents, live orders and deliveries</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          <input
            type="text"
            placeholder="Search name, email, manifest..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/2 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs text-luxury-cream focus:outline-none focus:border-luxury-gold/50 transition-all placeholder:text-white/20"
          />
        </div>
      </div>

      <div className="bg-luxury-charcoal rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="w-full">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left min-w-212.5">
              <thead>
                <tr className="border-b border-white/5 bg-white/1">
                  <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Manifest ID</th>
                  <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Consignee &amp; Email</th>
                  <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Selection</th>
                  <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Total</th>
                  <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Status</th>
                  <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/20 uppercase tracking-widest text-[10px]">
                      Optimizing Manifests...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-white/20 uppercase tracking-widest text-[10px]">
                      No manifests found in current library
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
                            ? 'bg-luxury-gold/6 border-l-4 border-luxury-gold animate-in fade-in duration-500' 
                            : 'hover:bg-white/1'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-luxury-gold">#{order.id.slice(0, 8).toUpperCase()}</span>
                              {isNew && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold bg-luxury-gold text-luxury-charcoal uppercase tracking-wider animate-pulse">
                                  <Sparkles size={10} />
                                  NEW
                                </span>
                              )}
                            </div>
                            <span className="text-[8px] text-white/20 uppercase tracking-tighter mt-1">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-luxury-cream">{order.delivery_name}</span>
                            <span className="text-[10px] text-luxury-gold/90 font-mono flex items-center gap-1 mt-0.5">
                              <Mail size={10} className="text-luxury-gold/60" />
                              {order.delivery_email || 'No email saved'}
                            </span>
                            <span className="text-[8px] text-white/30 uppercase tracking-widest mt-0.5">{order.delivery_zone}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-white/60">
                              {(() => {
                                try {
                                  if (order.product_name.startsWith('[') && order.product_name.endsWith(']')) {
                                    const items = JSON.parse(order.product_name);
                                    return items.length > 1 
                                      ? `${items[0].name} + ${items.length - 1} more`
                                      : items[0].name;
                                }
                                return order.product_name;
                              } catch {
                                return order.product_name;
                              }
                            })()}
                          </span>
                          <span className="text-[9px] text-luxury-gold/50 font-bold uppercase tracking-widest">{order.variant_size} x {order.quantity}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-luxury-cream">৳{order.total_price}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block">
                          <select
                            disabled={updatingId === order.id}
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`
                              appearance-none pl-8 pr-10 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all cursor-pointer outline-none
                              ${getStatusColor(order.status)}
                            `}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Received">Received</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            {getStatusIcon(order.status)}
                          </div>
                          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-white/20 hover:text-luxury-gold transition-colors"
                          title="View Order Manifest"
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
        <div className="md:hidden flex flex-col divide-y divide-white/5">
          {isLoading ? (
            <div className="px-6 py-12 text-center text-white/20 uppercase tracking-widest text-[10px]">
              Optimizing Manifests...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="px-6 py-12 text-center text-white/20 uppercase tracking-widest text-[10px]">
              No manifests found in current library
            </div>
          ) : (
            filteredOrders.map((order) => {
              const isNew = newOrderIds.has(order.id);
              return (
                <div 
                  key={order.id} 
                  className={`p-4 sm:p-6 flex flex-col gap-4 ${
                    isNew ? 'bg-luxury-gold/6 border-l-4 border-luxury-gold' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-luxury-gold">#{order.id.slice(0, 8).toUpperCase()}</span>
                        {isNew && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-luxury-gold text-luxury-charcoal uppercase tracking-wider animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                      <span className="text-[8px] text-white/20 uppercase tracking-tighter mt-1">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-luxury-cream">৳{order.total_price}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] text-white/40 uppercase tracking-widest mb-1">Consignee</span>
                      <span className="text-xs font-bold text-luxury-cream">{order.delivery_name}</span>
                      <span className="text-[9px] text-luxury-gold/90 font-mono truncate">{order.delivery_email || 'No email'}</span>
                      <span className="text-[9px] text-white/40 uppercase tracking-widest mt-0.5">{order.delivery_zone}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] text-white/40 uppercase tracking-widest mb-1">Selection</span>
                      <span className="text-xs text-white/60">
                        {(() => {
                          try {
                            if (order.product_name.startsWith('[') && order.product_name.endsWith(']')) {
                              const items = JSON.parse(order.product_name);
                              return items.length > 1 
                                ? `${items[0].name} + ${items.length - 1} more`
                                : items[0].name;
                            }
                            return order.product_name;
                          } catch {
                            return order.product_name;
                          }
                        })()}
                      </span>
                      <span className="text-[9px] text-luxury-gold/50 font-bold uppercase tracking-widest">{order.variant_size} x {order.quantity}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-white/5">
                    <div className="relative inline-block">
                      <select
                        disabled={updatingId === order.id}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`
                          appearance-none pl-8 pr-8 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all cursor-pointer outline-none
                          ${getStatusColor(order.status)}
                        `}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Received">Received</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        {getStatusIcon(order.status)}
                      </div>
                      <ChevronDown size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                    </div>

                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-luxury-gold hover:bg-luxury-gold/10 transition-colors"
                    >
                      <Eye size={12} />
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

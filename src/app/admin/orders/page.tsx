'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  ClipboardList, 
  Search, 
  Eye, 
  RefreshCw, 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  Truck,
  AlertCircle
} from 'lucide-react';
import OrderDetailModal from '@/components/Admin/OrderDetailModal';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
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

      // 2. Trigger email notification via API
      await fetch(`/api/orders/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

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
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock size={14} className="text-amber-400" />;
      case 'received': return <Clock size={14} className="text-blue-400" />;
      case 'processing': return <RefreshCw size={14} className="animate-spin-slow text-luxury-gold" />;
      case 'shipped': return <Truck size={14} className="text-emerald-400" />;
      default: return <AlertCircle size={14} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'received': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'processing': return 'text-luxury-gold bg-luxury-gold/10 border-luxury-gold/20';
      case 'shipped': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-serif text-luxury-gold">Procurement Manifest</h2>
          <p className="text-white/40 text-xs tracking-widest uppercase mt-2">Manage customer scents and deliveries</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
          <input
            type="text"
            placeholder="Search manifests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs text-luxury-cream focus:outline-none focus:border-luxury-gold/50 transition-all"
          />
        </div>
      </div>

      <div className="bg-[#0A0A0A] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.01]">
                <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Manifest ID</th>
                <th className="px-6 py-4 text-[9px] uppercase tracking-[0.2em] text-white/40 font-bold">Consignee</th>
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
                filteredOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-luxury-gold">#{order.id.slice(0, 8).toUpperCase()}</span>
                        <span className="text-[8px] text-white/20 uppercase tracking-tighter mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-luxury-cream">{order.delivery_name}</span>
                        <span className="text-[9px] text-white/40 uppercase tracking-widest">{order.delivery_zone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-white/60">{order.product_name}</span>
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
                        </select>
                        <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${getStatusColor(order.status).split(' ')[0]}`}>
                          {updatingId === order.id ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            getStatusIcon(order.status)
                          )}
                        </div>
                        <ChevronDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-white/20 hover:text-luxury-gold transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <OrderDetailModal 
        order={selectedOrder} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

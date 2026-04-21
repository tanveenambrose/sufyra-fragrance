'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product, products as hardcodedProducts } from '@/data/products';
import { Edit2, Trash2, Plus, Database, Tag, ShoppingBag, ArrowRight, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, onSale: 0, regular: 0, combo: 0 });

  useEffect(() => {
    fetchProducts();
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
      // Remove IDs to let Supabase generate new ones or keep them if preferred
      const productsToSeed = hardcodedProducts.map(p => {
        const { id, ...rest } = p;
        return {
          ...rest,
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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error deleting product.');
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div>
          <h2 className="text-3xl font-serif text-luxury-gold">Mansion Overview</h2>
          <p className="text-white/40 text-xs tracking-widest uppercase mt-2">The control center of Sufyra</p>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {[
          { label: 'Total Scents', value: stats.total, icon: ShoppingBag, color: 'text-luxury-gold' },
          { label: 'Regulars', value: stats.regular, icon: Tag, color: 'text-blue-400' },
          { label: 'Combos', value: stats.combo, icon: Database, color: 'text-purple-400' },
          { label: 'Live Deals', value: stats.onSale, icon: Tag, color: 'text-red-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0A0A0A] p-4 sm:p-6 rounded-2xl border border-white/5 space-y-3 sm:space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <stat.icon size={16} className={stat.color} />
              <div className="flex gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[8px] font-bold text-white/20 uppercase tracking-[0.2em]">Realtime</span>
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-serif text-luxury-cream">{stat.value}</p>
              <p className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 mb-6">Quick Operations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/admin/products/new" className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-luxury-gold/30 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform">
                <Plus size={24} />
              </div>
              <div>
                <h4 className="text-lg font-serif text-luxury-cream mb-1">Release New Scent</h4>
                <p className="text-xs text-white/40">Add a single fragrance or a curated collection to the shop.</p>
              </div>
            </Link>

            <Link href="/admin/products" className="group p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-luxury-gold/30 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-luxury-gold/10 flex items-center justify-center text-luxury-gold group-hover:scale-110 transition-transform">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h4 className="text-lg font-serif text-luxury-cream mb-1">Manage Library</h4>
                <p className="text-xs text-white/40">Edit pricing, update notes, or remove items from your collection.</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Additions Sidebar */}
        <div className="space-y-6">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Recent Additions</h3>
              <Link href="/admin/products" className="text-[9px] uppercase tracking-widest text-luxury-gold hover:underline">View All</Link>
           </div>
           
           <div className="bg-[#0A0A0A] rounded-2xl border border-white/5 overflow-hidden">
             <div className="divide-y divide-white/5">
                {isLoading ? (
                  <div className="p-8 text-center text-white/20 uppercase tracking-widest text-[9px]">Optimizing...</div>
                ) : products.length === 0 ? (
                  <div className="p-8 text-center text-white/20 uppercase tracking-widest text-[9px]">No items yet</div>
                ) : (
                  products.slice(0, 5).map((p) => (
                    <div key={p.id} className="p-4 flex items-center gap-4 group">
                      <div className="w-12 h-14 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-luxury-gold/30 transition-colors">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-white/5 flex items-center justify-center">
                            <ImageIcon size={14} className="text-white/20" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
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

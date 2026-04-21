'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/data/products';
import { Edit2, Trash2, Plus, Search, Filter, ArrowLeft, MoreVertical, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'perfume-oil' | 'combo'>('all');

  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;
    
    if (searchQuery) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }
    
    setFilteredProducts(result);
  }, [searchQuery, categoryFilter, products]);

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
        setFilteredProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.from('products').delete().eq('id', deleteConfirm.id);
      if (error) throw error;
      setProducts(prev => prev.filter(p => p.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Error deleting product. Please verify your permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 relative min-h-[600px]">
      {/* Custom Deletion Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setDeleteConfirm(null)} />
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 max-w-sm w-full space-y-8 animate-in zoom-in-95 duration-300 relative shadow-[0_0_50px_rgba(0,0,0,1)]">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto border border-red-500/20">
              <Trash2 size={32} className="text-red-500" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-serif text-luxury-cream">Irreversible Action</h3>
              <p className="text-xs text-white/40 leading-relaxed">
                You are about to remove <span className="text-white font-bold">&quot;{deleteConfirm.name}&quot;</span> from the mansion collection. This cannot be undone. Are you certain?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <button 
                onClick={() => setDeleteConfirm(null)}
                className="py-4 rounded-xl border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="py-4 rounded-xl bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                {isLoading ? 'Removing...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <Link href="/admin" className="text-[10px] text-luxury-gold hover:underline uppercase tracking-widest font-bold flex items-center gap-2 mb-4">
            <ArrowLeft size={12} /> Back to Dashboard
          </Link>
          <h2 className="text-3xl font-serif text-luxury-gold">Scent Library</h2>
          <p className="text-white/40 text-xs tracking-widest uppercase mt-2">Manage your luxury fragrance collection</p>
        </div>
        <Link 
          href="/admin/products/new"
          className="flex items-center gap-2 px-8 py-3 rounded-xl luxury-gradient text-luxury-charcoal text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-luxury-gold/20"
        >
          <Plus size={16} />
          Release New Scent
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group md:col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-luxury-gold transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl py-4 pl-12 pr-6 focus:border-luxury-gold/50 focus:outline-none transition-all text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="w-full bg-[#0A0A0A] border border-white/5 rounded-xl py-4 pl-12 pr-6 focus:border-luxury-gold/50 focus:outline-none transition-all text-sm appearance-none"
          >
            <option value="all">All Collections</option>
            <option value="perfume-oil">Regular Versions</option>
            <option value="combo">Combo Packs</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#0A0A0A] rounded-2xl border border-white/5 overflow-hidden">
        {isLoading && products.length === 0 ? (
          <div className="px-6 py-24 text-center">
            <div className="w-12 h-12 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">Optimizing catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="px-6 py-24 text-center space-y-4">
            <p className="text-white/20 uppercase tracking-[0.2em] text-[10px]">No scents found matching your criteria</p>
            <button onClick={() => {setSearchQuery(''); setCategoryFilter('all');}} className="text-luxury-gold text-xs hover:underline">Clear all filters</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-[10px] uppercase tracking-[0.2em] text-white/40">
                  <th className="px-8 py-5 font-bold">Product Details</th>
                  <th className="px-8 py-5 font-bold text-center">Category</th>
                  <th className="px-8 py-5 font-bold text-center">Variants</th>
                  <th className="px-8 py-5 font-bold text-center">Status</th>
                  <th className="px-8 py-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-20 rounded-lg bg-white/5 overflow-hidden flex-shrink-0 relative border border-white/10">
                          {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center">
                              <ImageIcon size={18} className="text-white/20" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-base font-bold text-luxury-cream group-hover:text-luxury-gold transition-colors">{p.name}</p>
                          <p className="text-[10px] text-white/40 line-clamp-1 max-w-[250px] uppercase tracking-wider">{p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                        p.category === 'combo' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {p.category === 'combo' ? 'Combo' : 'Regular'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        {p.variants.map((v, i) => (
                          <span key={i} className="text-[10px] text-white/60 font-mono">{v.size}: {v.price}৳</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      {(p.discount_percent || 0) > 0 ? (
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-red-400 text-[10px] font-bold bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">SALE</span>
                            <span className="text-[9px] text-red-400/60 font-bold">-{p.discount_percent}%</span>
                        </div>
                      ) : (
                        <span className="text-emerald-400 text-[9px] font-bold uppercase tracking-widest">Active</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 relative z-10 pointer-events-none group-hover:pointer-events-auto">
                        <Link 
                          href={`/admin/products/${p.id}/edit`}
                          className="p-2.5 bg-white/5 hover:bg-luxury-gold/10 rounded-lg text-white/40 hover:text-luxury-gold transition-all flex items-center justify-center pointer-events-auto"
                          title="Edit Scent"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteConfirm({id: p.id, name: p.name});
                          }}
                          className="p-2.5 bg-white/5 hover:bg-red-500/10 rounded-lg text-white/40 hover:text-red-400 transition-all flex items-center justify-center cursor-pointer pointer-events-auto"
                          title="Delete Scent"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="group-hover:hidden transition-all flex justify-end">
                         <MoreVertical size={16} className="text-white/20" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

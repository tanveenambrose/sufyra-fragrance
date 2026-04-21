'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product } from '@/data/products';
import ProductForm from '@/components/Admin/ProductForm';

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-6">
        <div className="w-12 h-12 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] uppercase tracking-widest text-white/20">Retrieving scent details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-6">
        <p className="text-white/40 uppercase tracking-widest text-lg">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-serif text-luxury-gold">Refine Scents</h2>
        <p className="text-white/40 text-xs tracking-widest uppercase mt-2">Adjust details for {product.name}</p>
      </div>

      <ProductForm initialData={product} />
    </div>
  );
}

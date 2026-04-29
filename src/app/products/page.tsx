import React, { Suspense } from 'react';
import ProductsContent from '@/components/Products/ProductsContent';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 3600; // Revalidate every hour

export default async function ProductsPage() {
  const supabase = await createClient();
  
  const { data: dbProducts, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
  }

  const products = dbProducts || [];

  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
      <ProductsContent initialProducts={products} />
    </Suspense>
  );
}

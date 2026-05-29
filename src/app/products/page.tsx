import React, { Suspense } from 'react';
import ProductsContent from '@/components/Products/ProductsContent';
import { supabaseStatic } from '@/utils/supabase/static';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsPage() {
  const { data: dbProducts, error } = await supabaseStatic
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

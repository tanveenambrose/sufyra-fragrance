import React from 'react';
import { supabaseStatic } from '@/utils/supabase/static';
import ProductDetailsClient from '@/components/Products/ProductDetailsClient';
import { notFound } from 'next/navigation';
import { Product } from '@/data/products';

export const revalidate = 3600; // Revalidate every hour

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const { data: products } = await supabaseStatic
    .from('products')
    .select('id');

  return (products || []).map((product) => ({
    id: String(product.id),
  }));
}

export default async function ProductDetailsPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch current product
  const { data: dbProduct, error: productError } = await supabaseStatic
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (productError || !dbProduct) {
    notFound();
  }

  // Cast product to application type
  const product = dbProduct as Product;

  // Fetch all products to determine navigation (prev / next)
  const { data: allProducts } = await supabaseStatic
    .from('products')
    .select('id')
    .order('created_at', { ascending: true });

  let adjacentIds: { prev: string | null; next: string | null } = { prev: null, next: null };
  if (allProducts) {
    const currentIndex = allProducts.findIndex(p => p.id === id);
    adjacentIds = {
      prev: currentIndex > 0 ? String(allProducts[currentIndex - 1].id) : null,
      next: currentIndex < allProducts.length - 1 ? String(allProducts[currentIndex + 1].id) : null,
    };
  }

  return (
    <ProductDetailsClient
      product={product}
      adjacentIds={adjacentIds}
    />
  );
}

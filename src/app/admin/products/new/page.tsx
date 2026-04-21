import React from 'react';
import ProductForm from '@/components/Admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-serif text-luxury-gold">Add New Scent</h2>
        <p className="text-white/40 text-xs tracking-widest uppercase mt-2">Expand the Sufyra collection</p>
      </div>

      <ProductForm />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from '../Auth/LoginModal';
import PurchaseForm, { PurchaseFormData } from './PurchaseForm';
import { Product } from '@/data/products';
import { supabase } from '@/lib/supabase';

interface PurchaseFlowProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedSize: string;
  quantity: number;
  activeImage: string;
  currentPrice: number;
}

const PurchaseFlow: React.FC<PurchaseFlowProps> = ({
  isOpen,
  onClose,
  product,
  selectedSize,
  quantity,
  activeImage,
  currentPrice
}) => {
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogin, setShowLogin] = useState(!user);

  // If user state changes and they become logged in, hide login modal
  React.useEffect(() => {
    if (user) setShowLogin(false);
  }, [user]);

  if (!isOpen) return null;

  const handleSubmit = async (formData: PurchaseFormData) => {
    if (!user) {
      setShowLogin(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const deliveryCost = formData.zone === 'Inside Dhaka' ? 80 : 150;
      const subtotal = currentPrice * quantity;
      const totalPrice = subtotal + deliveryCost;

      // 1. Insert into Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          product_id: product.id,
          product_name: product.name,
          variant_size: selectedSize,
          quantity: quantity,
          subtotal: subtotal,
          delivery_cost: deliveryCost,
          total_price: totalPrice,
          delivery_name: formData.name,
          delivery_zone: formData.zone,
          delivery_address: formData.address,
          whatsapp_number: formData.whatsapp,
          payment_method: formData.paymentMethod,
          status: 'Pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Send Email Notification
      await fetch('/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          customerName: formData.name,
          productName: product.name,
          size: selectedSize,
          quantity: quantity,
          total: totalPrice,
          zone: formData.zone,
          address: formData.address,
          whatsapp: formData.whatsapp,
          paymentMethod: formData.paymentMethod,
          customerEmail: user.email
        }),
      });

      alert('Order placed successfully! Our concierge will contact you shortly.');
      onClose();
    } catch (err) {
      console.error('Purchase error:', err);
      alert('Failed to place order: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return null;

  if (showLogin && !user) {
    return (
      <LoginModal 
        isOpen={isOpen} 
        onClose={onClose} 
        onSuccess={() => setShowLogin(false)} 
      />
    );
  }

  return (
    <PurchaseForm
      isOpen={isOpen}
      onClose={onClose}
      product={product}
      selectedSize={selectedSize}
      quantity={quantity}
      activeImage={activeImage}
      currentPrice={currentPrice}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
};

export default PurchaseFlow;

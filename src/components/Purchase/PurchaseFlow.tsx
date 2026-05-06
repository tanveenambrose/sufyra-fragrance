'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LoginModal from '../Auth/LoginModal';
import PurchaseForm, { PurchaseFormData } from './PurchaseForm';
import OrderSuccess from './OrderSuccess';
import { Product } from '@/data/products';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/store/useCart';

interface PurchaseFlowProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[]; // Changed from single product props to items array
}

const PurchaseFlow: React.FC<PurchaseFlowProps> = ({
  isOpen,
  onClose,
  items
}) => {
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogin, setShowLogin] = useState(!user);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const { clearCart } = useCart();

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
      const subtotal = items.reduce((acc, item) => acc + (item.selectedPrice * item.quantity), 0);
      const totalPrice = subtotal + deliveryCost;

      // Prepare order items for storage
      const orderItems = items.map(item => ({
        id: item.id,
        name: item.name,
        size: item.selectedSize,
        quantity: item.quantity,
        price: item.selectedPrice,
        image: item.image_url || item.product_image
      }));

      // We store the full JSON in product_name for multi-item orders
      // For single item, we keep it as is for backward compatibility or use JSON too
      const productNameValue = items.length === 1 
        ? items[0].name 
        : JSON.stringify(orderItems);

      // 1. Insert into Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          product_id: items[0].id, // Use first item's ID as representative
          product_name: productNameValue,
          variant_size: items.length === 1 ? items[0].selectedSize : 'multiple',
          quantity: items.reduce((acc, item) => acc + item.quantity, 0),
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
          items: orderItems,
          total: totalPrice,
          zone: formData.zone,
          address: formData.address,
          whatsapp: formData.whatsapp,
          paymentMethod: formData.paymentMethod,
          customerEmail: user.email
        }),
      });

      // Clear cart if it was a cart checkout
      if (items.length > 1 || items[0].id === undefined) {
          clearCart();
      }

      setSuccessOrderId(order.id);
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
    <>
      <PurchaseForm
        isOpen={isOpen && !successOrderId}
        onClose={onClose}
        items={items}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <OrderSuccess 
        isOpen={!!successOrderId} 
        onClose={() => {
          setSuccessOrderId(null);
          onClose();
        }}
        orderId={successOrderId || undefined}
      />
    </>
  );
};

export default PurchaseFlow;

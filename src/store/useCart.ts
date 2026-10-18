import { create } from 'zustand';
import { Product } from '@/data/products';

interface CartItem extends Product {
  selectedSize: string;
  selectedPrice: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  lastAddedTimestamp: number;
  triggerSpark: () => void;
  setIsCartOpen: (isOpen: boolean) => void;
  addItem: (product: Product, size: string) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  isCartOpen: false,
  lastAddedTimestamp: 0,
  triggerSpark: () => set({ lastAddedTimestamp: Date.now() }),
  setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  addItem: (product, size) => {
    const variant = product.variants.find((v) => v.size === size);
    if (!variant) return;

    const currentItems = get().items;
    const existingItemIndex = currentItems.findIndex(
      (item) => item.id === product.id && item.selectedSize === size
    );

    const now = Date.now();
    if (existingItemIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity += 1;
      set({ items: updatedItems, lastAddedTimestamp: now });
    } else {
      const discount = product.discount_percent || 0;
      const discountedPrice = discount > 0 ? Math.round(variant.price * (1 - discount / 100)) : variant.price;
      
      set({
        items: [
          ...currentItems,
          {
            ...product,
            selectedSize: size,
            selectedPrice: discountedPrice,
            quantity: 1,
          },
        ],
        lastAddedTimestamp: now,
      });
    }
  },
  removeItem: (productId, size) => {
    set({
      items: get().items.filter(
        (item) => !(item.id === productId && item.selectedSize === size)
      ),
    });
  },
  updateQuantity: (productId, size, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId, size);
      return;
    }
    const updatedItems = get().items.map((item) =>
      item.id === productId && item.selectedSize === size
        ? { ...item, quantity }
        : item
    );
    set({ items: updatedItems });
  },
  clearCart: () => set({ items: [] }),
  getTotalPrice: () => {
    return get().items.reduce(
      (total, item) => total + item.selectedPrice * item.quantity,
      0
    );
  },
  getItemCount: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
}));

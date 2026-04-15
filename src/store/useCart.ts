import { create } from 'zustand';
import { Product } from '@/data/products';

interface CartItem extends Product {
  selectedSize: '3ml' | '6ml' | 'set';
  selectedPrice: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  addItem: (product: Product, size: '3ml' | '6ml' | 'set') => void;
  removeItem: (productId: string, size: '3ml' | '6ml' | 'set') => void;
  updateQuantity: (productId: string, size: '3ml' | '6ml' | 'set', quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  isCartOpen: false,
  setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),
  addItem: (product, size) => {
    const variant = product.variants.find((v) => v.size === size);
    if (!variant) return;

    const currentItems = get().items;
    const existingItemIndex = currentItems.findIndex(
      (item) => item.id === product.id && item.selectedSize === size
    );

    if (existingItemIndex > -1) {
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity += 1;
      set({ items: updatedItems });
    } else {
      set({
        items: [
          ...currentItems,
          {
            ...product,
            selectedSize: size,
            selectedPrice: variant.price,
            quantity: 1,
          },
        ],
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

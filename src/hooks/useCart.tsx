import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  priceFormatted: string;
  image: string;
  quantity: number;
  category: string;
  size?: string;
  color?: string;
  stock?: number;
  // Bundle tracking for lookbook items
  lookId?: string;
  lookName?: string;
  productId?: string;
}

export type ShippingProgressTier = 'start' | 'halfway' | 'almost' | 'unlocked';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  hasFreeShipping: boolean;
  shippingProgress: number;
  progressTier: ShippingProgressTier;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  lastAddedItem: CartItem | null;
}

const CART_STORAGE_KEY = 'loj-cart';
const FREE_SHIPPING_THRESHOLD = 99; // $99 CAD for free shipping

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setItems(parsed);
      }
    } catch (e) {
      console.error('Failed to load cart from storage:', e);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage when items change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to storage:', e);
      }
    }
  }, [items, isInitialized]);

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const quantity = newItem.quantity || 1;
    
    setItems(currentItems => {
      const existingIndex = currentItems.findIndex(
        item => item.id === newItem.id && item.size === newItem.size && item.color === newItem.color
      );

      if (existingIndex > -1) {
        const updated = [...currentItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity
        };
        return updated;
      }

      return [...currentItems, { ...newItem, quantity }];
    });

    setLastAddedItem({ ...newItem, quantity } as CartItem);
    setIsCartOpen(true);
    
    // Haptic feedback for mobile
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    // Clear last added item after animation
    setTimeout(() => setLastAddedItem(null), 2000);
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    
    setItems(currentItems =>
      currentItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const hasFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const progressTier: ShippingProgressTier = 
    hasFreeShipping ? 'unlocked' :
    shippingProgress >= 90 ? 'almost' :
    shippingProgress >= 50 ? 'halfway' : 'start';

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountToFreeShipping,
        hasFreeShipping,
        shippingProgress,
        progressTier,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        lastAddedItem
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

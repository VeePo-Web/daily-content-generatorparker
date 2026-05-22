import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  is_on_sale: boolean;
  category_slug?: string;
  image_url: string;
  viewedAt: number; // timestamp
  viewCount: number;
}

interface RecentlyViewedContextType {
  recentProducts: RecentlyViewedProduct[];
  addProduct: (product: Omit<RecentlyViewedProduct, 'viewedAt' | 'viewCount'>) => void;
  getViewCount: (productId: string) => number;
  isHighIntent: (productId: string) => boolean;
  clearHistory: () => void;
}

const RecentlyViewedContext = createContext<RecentlyViewedContextType | null>(null);

const STORAGE_KEY = 'loj-recently-viewed';
const MAX_PRODUCTS = 20;
const HIGH_INTENT_THRESHOLD = 3; // 3+ views = high intent

const loadFromStorage = (): RecentlyViewedProduct[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Filter out stale items (older than 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      return parsed.filter((p: RecentlyViewedProduct) => p.viewedAt > thirtyDaysAgo);
    }
  } catch {
    // Ignore parse errors
  }
  return [];
};

const saveToStorage = (products: RecentlyViewedProduct[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {
    // Ignore storage errors
  }
};

interface RecentlyViewedProviderProps {
  children: ReactNode;
}

export const RecentlyViewedProvider = ({ children }: RecentlyViewedProviderProps) => {
  const [recentProducts, setRecentProducts] = useState<RecentlyViewedProduct[]>(() => loadFromStorage());

  // Persist to localStorage on change
  useEffect(() => {
    saveToStorage(recentProducts);
  }, [recentProducts]);

  const addProduct = useCallback((product: Omit<RecentlyViewedProduct, 'viewedAt' | 'viewCount'>) => {
    setRecentProducts(prev => {
      const existingIndex = prev.findIndex(p => p.id === product.id);
      
      if (existingIndex !== -1) {
        // Update existing entry
        const updated = [...prev];
        const existing = updated[existingIndex];
        updated.splice(existingIndex, 1);
        updated.unshift({
          ...existing,
          ...product,
          viewedAt: Date.now(),
          viewCount: existing.viewCount + 1,
        });
        return updated;
      } else {
        // Add new entry
        const newProduct: RecentlyViewedProduct = {
          ...product,
          viewedAt: Date.now(),
          viewCount: 1,
        };
        const updated = [newProduct, ...prev];
        // Limit to MAX_PRODUCTS
        return updated.slice(0, MAX_PRODUCTS);
      }
    });
  }, []);

  const getViewCount = useCallback((productId: string): number => {
    const product = recentProducts.find(p => p.id === productId);
    return product?.viewCount || 0;
  }, [recentProducts]);

  const isHighIntent = useCallback((productId: string): boolean => {
    return getViewCount(productId) >= HIGH_INTENT_THRESHOLD;
  }, [getViewCount]);

  const clearHistory = useCallback(() => {
    setRecentProducts([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <RecentlyViewedContext.Provider value={{
      recentProducts,
      addProduct,
      getViewCount,
      isHighIntent,
      clearHistory,
    }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = (): RecentlyViewedContextType => {
  const context = useContext(RecentlyViewedContext);
  if (!context) {
    throw new Error('useRecentlyViewed must be used within a RecentlyViewedProvider');
  }
  return context;
};

export default RecentlyViewedProvider;

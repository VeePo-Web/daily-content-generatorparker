import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart, CartItem } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'loj-saved-for-later';
const MAX_SAVED_ITEMS = 20;

export interface SavedItem {
  id: string;
  productId: string;
  savedAt: string;
  savedSize?: string;
  savedColor?: string;
  savedQuantity: number;
  product: {
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    image_url: string;
    category_slug?: string;
  };
}

interface LocalStorageSavedItem {
  productId: string;
  savedAt: string;
  size?: string;
  color?: string;
  quantity: number;
  productName: string;
  productImage: string;
  productPrice: number;
  productSalePrice: number | null;
  productSlug: string;
  categorySlug?: string;
}

interface UseSavedForLaterReturn {
  savedItems: SavedItem[];
  savedCount: number;
  totalSavedValue: number;
  isLoading: boolean;
  saveForLater: (cartItem: CartItem) => Promise<void>;
  removeFromSaved: (productId: string) => Promise<void>;
  moveToCart: (item: SavedItem) => void;
  moveAllToCart: () => void;
  isSaved: (productId: string) => boolean;
  waitingMessage: string | null;
}

// Helper to get waiting message
const getWaitingMessage = (count: number): string | null => {
  if (count === 0) return null;
  if (count === 1) return "1 item waiting for you";
  if (count <= 3) return `${count} items waiting for you`;
  return `${count} items waiting—complete your collection?`;
};

// LocalStorage helpers
const getLocalStorageItems = (): LocalStorageSavedItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setLocalStorageItems = (items: LocalStorageSavedItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

const clearLocalStorageItems = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear localStorage:', e);
  }
};

// Transform localStorage item to SavedItem
const transformLocalItem = (item: LocalStorageSavedItem): SavedItem => ({
  id: `local-${item.productId}`,
  productId: item.productId,
  savedAt: item.savedAt,
  savedSize: item.size,
  savedColor: item.color,
  savedQuantity: item.quantity,
  product: {
    name: item.productName,
    slug: item.productSlug,
    price: item.productPrice,
    sale_price: item.productSalePrice,
    image_url: item.productImage,
    category_slug: item.categorySlug,
  },
});

export function useSavedForLater(): UseSavedForLaterReturn {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Local state for guest users
  const [localItems, setLocalItems] = useState<LocalStorageSavedItem[]>([]);
  const [isLocalLoading, setIsLocalLoading] = useState(true);

  // Initialize localStorage items
  useEffect(() => {
    setLocalItems(getLocalStorageItems());
    setIsLocalLoading(false);
  }, []);

  // Fetch saved items from database for authenticated users
  const { data: dbItems = [], isLoading: isDbLoading } = useQuery({
    queryKey: ['saved-for-later', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          product_id,
          created_at,
          saved_from_cart,
          cart_context,
          product:products (
            id,
            name,
            slug,
            price,
            sale_price,
            category:categories (
              slug
            ),
            images:product_images (
              image_url,
              is_primary
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('saved_from_cart', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching saved items:', error);
        throw error;
      }

      return (data || []).map(item => {
        const product = item.product as any;
        const cartContext = (item.cart_context || {}) as { size?: string; color?: string; quantity?: number };
        const primaryImage = product?.images?.find((img: any) => img.is_primary)?.image_url 
          || product?.images?.[0]?.image_url 
          || '/placeholder.svg';
        
        return {
          id: item.id,
          productId: item.product_id,
          savedAt: item.created_at,
          savedSize: cartContext.size,
          savedColor: cartContext.color,
          savedQuantity: cartContext.quantity || 1,
          product: {
            name: product?.name || 'Unknown Product',
            slug: product?.slug || '',
            price: product?.price || 0,
            sale_price: product?.sale_price,
            image_url: primaryImage,
            category_slug: product?.category?.slug,
          },
        } as SavedItem;
      });
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // Migrate localStorage items to database on auth
  useEffect(() => {
    if (!user) return;
    
    const localSaved = getLocalStorageItems();
    if (localSaved.length === 0) return;

    const migrateItems = async () => {
      try {
        for (const item of localSaved) {
          await supabase
            .from('favorites')
            .upsert({
              user_id: user.id,
              product_id: item.productId,
              saved_from_cart: true,
              cart_context: {
                size: item.size,
                color: item.color,
                quantity: item.quantity,
              },
            }, {
              onConflict: 'user_id,product_id',
            });
        }
        
        clearLocalStorageItems();
        setLocalItems([]);
        queryClient.invalidateQueries({ queryKey: ['saved-for-later', user.id] });
        
        toast({
          title: "Saved items synced",
          description: `${localSaved.length} item${localSaved.length > 1 ? 's' : ''} synced to your account`,
        });
      } catch (error) {
        console.error('Failed to migrate saved items:', error);
      }
    };

    migrateItems();
  }, [user, queryClient, toast]);

  // Combined saved items
  const savedItems = useMemo((): SavedItem[] => {
    if (user) {
      return dbItems;
    }
    return localItems.map(transformLocalItem);
  }, [user, dbItems, localItems]);

  const savedCount = savedItems.length;
  const waitingMessage = getWaitingMessage(savedCount);

  // Compute total value of saved items for display
  const totalSavedValue = useMemo(() => {
    return savedItems.reduce((sum, item) => {
      const price = item.product.sale_price ?? item.product.price;
      return sum + (price * item.savedQuantity);
    }, 0);
  }, [savedItems]);

  // Check if product is saved
  const isSaved = useCallback((productId: string): boolean => {
    return savedItems.some(item => item.productId === productId);
  }, [savedItems]);

  // Save for later mutation (authenticated)
  const saveMutation = useMutation({
    mutationFn: async (cartItem: CartItem) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('favorites')
        .upsert({
          user_id: user.id,
          product_id: String(cartItem.id),
          saved_from_cart: true,
          cart_context: {
            size: cartItem.size,
            color: cartItem.color,
            quantity: cartItem.quantity,
          },
        }, {
          onConflict: 'user_id,product_id',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-for-later', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  // Remove from saved mutation (authenticated)
  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-for-later', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  // Save for later action
  const saveForLater = useCallback(async (cartItem: CartItem) => {
    // Trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    if (user) {
      // Authenticated: save to database
      await saveMutation.mutateAsync(cartItem);
    } else {
      // Guest: save to localStorage
      const newItem: LocalStorageSavedItem = {
        productId: String(cartItem.id),
        savedAt: new Date().toISOString(),
        size: cartItem.size,
        color: cartItem.color,
        quantity: cartItem.quantity,
        productName: cartItem.name,
        productImage: cartItem.image,
        productPrice: cartItem.price,
        productSalePrice: null,
        productSlug: cartItem.name.toLowerCase().replace(/\s+/g, '-'),
        categorySlug: cartItem.category?.toLowerCase().replace(/\s+/g, '-'),
      };

      setLocalItems(prev => {
        // Remove if already exists
        const filtered = prev.filter(item => item.productId !== newItem.productId);
        // Add to front, enforce max limit
        const updated = [newItem, ...filtered].slice(0, MAX_SAVED_ITEMS);
        setLocalStorageItems(updated);
        return updated;
      });
    }

    toast({
      title: "Saved for later",
      description: "Item moved to your saved items",
    });
  }, [user, saveMutation, toast]);

  // Remove from saved action
  const removeFromSaved = useCallback(async (productId: string) => {
    if (user) {
      await removeMutation.mutateAsync(productId);
    } else {
      setLocalItems(prev => {
        const updated = prev.filter(item => item.productId !== productId);
        setLocalStorageItems(updated);
        return updated;
      });
    }

    toast({
      title: "Removed",
      description: "Item removed from saved items",
    });
  }, [user, removeMutation, toast]);

  // Move to cart action
  const moveToCart = useCallback((item: SavedItem) => {
    // Add to cart with saved variant
    addItem({
      id: Number(item.productId) || Math.random(),
      name: item.product.name,
      price: item.product.sale_price ?? item.product.price,
      priceFormatted: `$${(item.product.sale_price ?? item.product.price).toFixed(2)}`,
      image: item.product.image_url,
      category: item.product.category_slug || 'Shop',
      size: item.savedSize,
      color: item.savedColor,
      quantity: item.savedQuantity,
    });

    // Remove from saved
    removeFromSaved(item.productId);

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10]);
    }

    toast({
      title: "Added to bag",
      description: `${item.product.name} moved to your cart`,
    });
  }, [addItem, removeFromSaved, toast]);

  // Move all to cart
  const moveAllToCart = useCallback(() => {
    savedItems.forEach(item => {
      addItem({
        id: Number(item.productId) || Math.random(),
        name: item.product.name,
        price: item.product.sale_price ?? item.product.price,
        priceFormatted: `$${(item.product.sale_price ?? item.product.price).toFixed(2)}`,
        image: item.product.image_url,
        category: item.product.category_slug || 'Shop',
        size: item.savedSize,
        color: item.savedColor,
        quantity: item.savedQuantity,
      });
    });

    // Clear all saved items
    if (user) {
      savedItems.forEach(item => removeMutation.mutate(item.productId));
    } else {
      clearLocalStorageItems();
      setLocalItems([]);
    }

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([10, 50, 10, 50, 10]);
    }

    toast({
      title: "All items added",
      description: `${savedItems.length} items moved to your cart`,
    });
  }, [savedItems, addItem, user, removeMutation, toast]);

  return {
    savedItems,
    savedCount,
    totalSavedValue,
    isLoading: user ? isDbLoading : isLocalLoading,
    saveForLater,
    removeFromSaved,
    moveToCart,
    moveAllToCart,
    isSaved,
    waitingMessage,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMemo, useCallback } from 'react';

export interface FavoriteProduct {
  id: string;
  product_id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    sale_price: number | null;
    is_on_sale: boolean;
    category: {
      name: string;
      slug: string;
    } | null;
    images: {
      image_url: string;
      alt_text: string | null;
      is_primary: boolean;
    }[];
  };
}

interface UseFavoritesReturn {
  favorites: FavoriteProduct[];
  favoriteIds: Set<string>;
  isLoading: boolean;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  addFavorite: (productId: string) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  favoritesCount: number;
}

export function useFavorites(): UseFavoritesReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all favorites with product details
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          product_id,
          created_at,
          product:products (
            id,
            name,
            slug,
            price,
            sale_price,
            is_on_sale,
            category:categories (
              name,
              slug
            ),
            images:product_images (
              image_url,
              alt_text,
              is_primary
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching favorites:', error);
        throw error;
      }

      // Transform to ensure proper typing
      return (data || []).map(item => ({
        id: item.id,
        product_id: item.product_id,
        created_at: item.created_at,
        product: item.product as FavoriteProduct['product']
      }));
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Create a Set of favorite product IDs for O(1) lookup
  const favoriteIds = useMemo(() => {
    return new Set(favorites.map(f => f.product_id));
  }, [favorites]);

  // Check if a product is favorited
  const isFavorite = useCallback((productId: string): boolean => {
    return favoriteIds.has(productId);
  }, [favoriteIds]);

  // Add favorite mutation
  const addMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: productId });

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation - already favorited
          return;
        }
        throw error;
      }
    },
    onMutate: async (productId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] });

      // Snapshot previous value
      const previousFavorites = queryClient.getQueryData(['favorites', user?.id]);

      // Optimistically update
      queryClient.setQueryData(['favorites', user?.id], (old: FavoriteProduct[] = []) => {
        // Create optimistic entry (will be replaced on refetch)
        const optimisticFavorite: FavoriteProduct = {
          id: `temp-${productId}`,
          product_id: productId,
          created_at: new Date().toISOString(),
          product: {
            id: productId,
            name: 'Loading...',
            slug: '',
            price: 0,
            sale_price: null,
            is_on_sale: false,
            category: null,
            images: []
          }
        };
        return [optimisticFavorite, ...old];
      });

      return { previousFavorites };
    },
    onError: (err, productId, context) => {
      // Rollback on error
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites', user?.id], context.previousFavorites);
      }
      toast({
        title: "Error",
        description: "Failed to add to favorites. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Added to favorites",
        description: "Item saved to your wishlist",
      });
    },
    onSettled: () => {
      // Refetch to get full product data
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  // Remove favorite mutation
  const removeMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error('Must be logged in');
      
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['favorites', user?.id] });
      const previousFavorites = queryClient.getQueryData(['favorites', user?.id]);

      // Optimistically remove
      queryClient.setQueryData(['favorites', user?.id], (old: FavoriteProduct[] = []) => {
        return old.filter(f => f.product_id !== productId);
      });

      return { previousFavorites };
    },
    onError: (err, productId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites', user?.id], context.previousFavorites);
      }
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Removed from favorites",
        description: "Item removed from your wishlist",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
  });

  // Toggle favorite
  const toggleFavorite = useCallback(async (productId: string) => {
    if (isFavorite(productId)) {
      await removeMutation.mutateAsync(productId);
    } else {
      await addMutation.mutateAsync(productId);
    }
  }, [isFavorite, addMutation, removeMutation]);

  // Add favorite
  const addFavorite = useCallback(async (productId: string) => {
    if (!isFavorite(productId)) {
      await addMutation.mutateAsync(productId);
    }
  }, [isFavorite, addMutation]);

  // Remove favorite
  const removeFavorite = useCallback(async (productId: string) => {
    if (isFavorite(productId)) {
      await removeMutation.mutateAsync(productId);
    }
  }, [isFavorite, removeMutation]);

  return {
    favorites,
    favoriteIds,
    isLoading,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    favoritesCount: favorites.length,
  };
}

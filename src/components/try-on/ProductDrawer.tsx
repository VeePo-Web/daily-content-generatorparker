import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useTryOnState, EquippedItem } from '@/hooks/useTryOnState';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { getTextureImageUrl } from '@/components/try-on/hooks/useGarmentTexture';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  slot: 'head' | 'top' | 'outerwear' | 'bottom' | 'footwear' | null;
}

const slotToCategoryMap: Record<string, string[]> = {
  head: ['caps', 'hats', 'headwear', 'beanies'],
  top: ['t-shirts', 'shirts', 'tops', 'tees'],
  outerwear: ['hoodies', 'jackets', 'sweaters', 'outerwear'],
  bottom: ['pants', 'jeans', 'shorts', 'bottoms'],
  footwear: ['shoes', 'sneakers', 'boots', 'footwear'],
};

export const ProductDrawer = ({ isOpen, onClose, slot }: ProductDrawerProps) => {
  const { equipItem, equippedItems } = useTryOnState();
  const [selectedSize, setSelectedSize] = useState<string>('M');

  const { data: products, isLoading } = useQuery({
    queryKey: ['try-on-products', slot],
    queryFn: async () => {
      if (!slot) return [];
      
      // Get categories for this slot
      const categoryMatches = slotToCategoryMap[slot] || [];
      
      // First, get matching category IDs
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id, slug')
        .or(categoryMatches.map(c => `slug.ilike.%${c}%`).join(','));
      
      if (catError) {
        console.error('Error fetching categories:', catError);
      }
      
      const categoryIds = categories?.map(c => c.id) || [];
      
      // If we have matching categories, filter by them; otherwise get all active products
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          slug,
          category_id,
          product_images (
            image_url,
            is_primary
          ),
          product_variants (
            id,
            size,
            color,
            stock_quantity
          )
        `)
        .eq('status', 'active');
      
      // Filter by category if we have matches
      if (categoryIds.length > 0) {
        query = query.in('category_id', categoryIds);
      }
      
      const { data, error } = await query.limit(12);

      if (error) throw error;
      return data || [];
    },
    enabled: isOpen && !!slot,
  });

  const handleSelectProduct = (product: any) => {
    if (!slot) return;

    const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.image_url 
      || product.product_images?.[0]?.image_url;
    
    // Get texture-optimized image (flat-front) for 3D rendering
    const textureImage = getTextureImageUrl(product.product_images, product.name);

    const item: EquippedItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      color: 'Default',
      imageUrl: primaryImage,
      textureUrl: textureImage,  // Use flat-front image for 3D textures
      productImages: product.product_images,
    };

    equipItem(slot, item);
    onClose();
  };

  const isEquipped = (productId: string) => {
    return slot && equippedItems[slot]?.productId === productId;
  };

  const slotLabels: Record<string, string> = {
    head: 'Select Headwear',
    top: 'Select a Top',
    outerwear: 'Select a Layer',
    bottom: 'Select Bottoms',
    footwear: 'Select Footwear',
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-lg font-light">
            {slot ? slotLabels[slot] : 'Select Item'}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Browse and select products to add to your outfit
          </SheetDescription>
        </SheetHeader>

        {/* Size Quick Select */}
        <div className="mb-6" role="radiogroup" aria-label="Select size">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Size
          </div>
          <div className="flex gap-2">
            {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                role="radio"
                aria-checked={selectedSize === size}
                className={cn(
                  "px-4 py-2 min-h-[44px] min-w-[44px] text-sm border transition-all duration-200",
                  selectedSize === size
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4" role="listbox" aria-label="Available products">
            <AnimatePresence mode="popLayout">
              {products?.map((product: any, index: number) => {
                const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.image_url 
                  || product.product_images?.[0]?.image_url;
                const equipped = isEquipped(product.id);

                return (
                  <motion.button
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => handleSelectProduct(product)}
                    role="option"
                    aria-selected={equipped}
                    className={cn(
                      "group relative text-left transition-all duration-200",
                      equipped && "ring-2 ring-foreground"
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="aspect-[3/4] bg-muted overflow-hidden mb-2 relative">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          No image
                        </div>
                      )}
                      
                      <AnimatePresence>
                        {equipped && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-foreground/20 flex items-center justify-center"
                          >
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center"
                            >
                              <Check className="w-5 h-5 text-background" />
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="text-sm font-light truncate">{product.name}</div>
                    <div className="text-sm font-medium">${product.price?.toLocaleString()}</div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && products?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No products available for this category</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

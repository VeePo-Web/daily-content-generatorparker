import { useEffect } from 'react';
import { lockScroll, unlockScroll } from '@/lib/scrollLock';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Trash2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { useQuickAdd, ProductForQuickAdd } from '@/hooks/useQuickAdd';
import InlineQuickSizePicker from '@/components/ui/InlineQuickSizePicker';
import { formatPrice } from '@/lib/cartUtils';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthRequired: () => void;
}

// Individual favorite item with quick add functionality
function FavoriteItem({ 
  favorite, 
  onRemove, 
  onClose, 
  index 
}: { 
  favorite: ReturnType<typeof useFavorites>['favorites'][0];
  onRemove: (id: string) => void;
  onClose: () => void;
  index: number;
}) {
  const quickAddProduct: ProductForQuickAdd = {
    id: favorite.product.id,
    name: favorite.product.name,
    slug: favorite.product.slug,
    price: favorite.product.price,
    sale_price: favorite.product.sale_price,
    is_on_sale: favorite.product.is_on_sale,
    category_slug: favorite.product.category?.slug,
    product_images: favorite.product.images?.map(img => ({
      image_url: img.image_url,
      is_primary: img.is_primary,
    })),
    // Note: favorites don't have variant data loaded, so quick add will use defaults
    product_variants: [],
  };

  const quickAdd = useQuickAdd(quickAddProduct, { showToast: true });
  
  const primaryImage = favorite.product.images?.find(img => img.is_primary) || favorite.product.images?.[0];
  const displayPrice = favorite.product.is_on_sale && favorite.product.sale_price
    ? favorite.product.sale_price
    : favorite.product.price;

  return (
    <motion.div
      className="flex gap-4 p-2 rounded-lg hover:bg-muted/30 transition-colors group relative"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      {/* Image */}
      <Link
        to={`/product/${favorite.product.slug}`}
        onClick={onClose}
        className="w-20 h-24 bg-muted flex-shrink-0 overflow-hidden relative"
      >
        <img
          src={primaryImage?.image_url || '/placeholder.svg'}
          alt={primaryImage?.alt_text || favorite.product.name}
          className="w-full h-full object-cover"
        />
        
        {/* Success Overlay */}
        <AnimatePresence>
          {quickAdd.isAdded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-foreground/90 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Check className="w-6 h-6 text-white" strokeWidth={2.5} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/product/${favorite.product.slug}`}
          onClick={onClose}
          className="block"
        >
          <h3 className="text-sm font-medium text-foreground truncate hover:underline">
            {favorite.product.name}
          </h3>
        </Link>
        
        {favorite.product.category && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {favorite.product.category.name}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-medium text-foreground">
            {formatPrice(displayPrice)}
          </span>
          {favorite.product.is_on_sale && favorite.product.sale_price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(favorite.product.price)}
            </span>
          )}
          {/* Size memory indicator */}
          {quickAdd.rememberedSize && (
            <span className="text-[10px] uppercase tracking-wide text-champagne-600 font-medium">
              {quickAdd.rememberedSize}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 relative">
          {!quickAdd.isPickerOpen ? (
            <button
              onClick={quickAdd.handleQuickAdd}
              disabled={quickAdd.isAdding || quickAdd.isAdded}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {quickAdd.isAdding ? (
                <span className="animate-pulse">Adding...</span>
              ) : quickAdd.isAdded ? (
                <>
                  <Check size={12} />
                  Added
                </>
              ) : (
                <>
                  <ShoppingBag size={12} />
                  {quickAdd.canOneTap ? `Add in ${quickAdd.rememberedSize}` : 'Add to Bag'}
                </>
              )}
            </button>
          ) : null}
          
          <button
            onClick={() => onRemove(favorite.product_id)}
            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Remove from favorites"
          >
            <Trash2 size={14} />
          </button>
        </div>
        
        {/* Inline Size Picker */}
        <AnimatePresence>
          {quickAdd.isPickerOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden"
            >
              <div className="bg-muted/50 p-2 rounded">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                  Select Size
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickAdd.availableSizes.map(size => {
                    const isRemembered = size === quickAdd.rememberedSize;
                    return (
                      <button
                        key={size}
                        onClick={(e) => quickAdd.handleSizeSelect(size, e)}
                        className={`
                          relative min-w-[32px] h-8 px-2 text-xs rounded transition-colors
                          ${isRemembered
                            ? 'bg-champagne-500 text-white font-medium'
                            : 'bg-background hover:bg-muted text-foreground border border-border'
                          }
                        `}
                      >
                        {size}
                        {isRemembered && (
                          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[7px] uppercase tracking-wide text-champagne-600 bg-muted/50 px-1 rounded whitespace-nowrap">
                            yours
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={quickAdd.hideSizePicker}
                  className="mt-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function FavoritesDrawer({ isOpen, onClose, onAuthRequired }: FavoritesDrawerProps) {
  const { user } = useAuth();
  const { favorites, isLoading, removeFavorite, favoritesCount } = useFavorites();

  // Scroll lock + Escape key handler
  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      unlockScroll();
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 touch-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-[100dvh] w-full max-w-md bg-background border-l border-border z-50 flex flex-col shadow-2xl overscroll-contain"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-light text-foreground">Your Favorites</h2>
                {favoritesCount > 0 && (
                  <span className="text-sm text-muted-foreground">({favoritesCount})</span>
                )}
              </div>
              <motion.button
                onClick={onClose}
                className="p-2 text-foreground hover:text-muted-foreground transition-colors relative group"
                aria-label="Close"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.span
                  className="absolute inset-0 rounded-full bg-muted scale-0 group-hover:scale-100 transition-transform duration-200"
                  initial={false}
                />
                <X size={20} className="relative z-10" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {!user ? (
                // Not logged in state
                <div className="flex-1 flex flex-col items-center justify-center p-6 h-full">
                  <motion.div
                    className="w-16 h-16 mb-4 rounded-full bg-muted/50 flex items-center justify-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Heart className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
                  </motion.div>
                  <motion.p
                    className="text-muted-foreground text-sm text-center mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Sign in to save your favorite items
                  </motion.p>
                  <motion.button
                    className="px-6 py-2 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
                    onClick={() => {
                      onClose();
                      onAuthRequired();
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Sign In
                  </motion.button>
                </div>
              ) : isLoading ? (
                // Loading state
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-20 h-24 bg-muted rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                        <div className="h-8 bg-muted rounded w-24 mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : favorites.length === 0 ? (
                // Empty state
                <div className="flex-1 flex flex-col items-center justify-center p-6 h-full">
                  <motion.div
                    className="w-16 h-16 mb-4 rounded-full bg-muted/50 flex items-center justify-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Heart className="w-8 h-8 text-muted-foreground" strokeWidth={1} />
                  </motion.div>
                  <motion.p
                    className="text-muted-foreground text-sm text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Save your favorite items to view them later.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link
                      to="/category/all"
                      onClick={onClose}
                      className="mt-4 inline-block text-sm text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
                    >
                      Start shopping
                    </Link>
                  </motion.div>
                </div>
              ) : (
                // Favorites list
                <div className="p-4 space-y-4">
                  <AnimatePresence initial={false}>
                    {favorites.map((favorite, index) => (
                      <FavoriteItem
                        key={favorite.id}
                        favorite={favorite}
                        onRemove={removeFavorite}
                        onClose={onClose}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {user && favorites.length > 0 && (
              <div className="p-4 border-t border-border">
                <Link
                  to="/account/favorites"
                  onClick={onClose}
                  className="block w-full py-3 text-center text-sm font-medium border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
                >
                  View All Favorites
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

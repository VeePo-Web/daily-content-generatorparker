import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';

export default function AccountFavorites() {
  const { favorites, isLoading, removeFavorite } = useFavorites();
  const { addItem } = useCart();

  const handleAddToBag = (favorite: typeof favorites[0]) => {
    const primaryImage = favorite.product.images?.find(img => img.is_primary) || favorite.product.images?.[0];
    
    addItem({
      id: parseInt(favorite.product.id.slice(0, 8), 16),
      name: favorite.product.name,
      price: favorite.product.is_on_sale && favorite.product.sale_price 
        ? favorite.product.sale_price 
        : favorite.product.price,
      priceFormatted: `$${(favorite.product.is_on_sale && favorite.product.sale_price 
        ? favorite.product.sale_price 
        : favorite.product.price).toFixed(2)}`,
      image: primaryImage?.image_url || '/placeholder.svg',
      category: favorite.product.category?.name || 'Apparel',
    });
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-light text-foreground mb-8">Your Favorites</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-muted mb-3" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-light text-foreground mb-8">Your Favorites</h1>
        <motion.div
          className="flex flex-col items-center justify-center py-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 mb-6 rounded-full bg-muted/50 flex items-center justify-center">
            <Heart className="w-10 h-10 text-muted-foreground" strokeWidth={1} />
          </div>
          <h2 className="text-lg font-medium text-foreground mb-2">No favorites yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm mb-6">
            Start saving pieces you love by clicking the heart icon on any product.
          </p>
          <Link
            to="/category/all"
            className="px-6 py-3 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light text-foreground">
          Your Favorites
          <span className="text-muted-foreground text-lg ml-2">({favorites.length})</span>
        </h1>
      </div>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {favorites.map((favorite) => {
          const primaryImage = favorite.product.images?.find(img => img.is_primary) || favorite.product.images?.[0];
          const displayPrice = favorite.product.is_on_sale && favorite.product.sale_price
            ? favorite.product.sale_price
            : favorite.product.price;

          return (
            <motion.div
              key={favorite.id}
              className="group relative"
              variants={itemVariants}
              layout
            >
              {/* Image */}
              <Link to={`/product/${favorite.product.slug}`} className="block">
                <div className="aspect-[3/4] bg-muted overflow-hidden mb-3 relative">
                  <img
                    src={primaryImage?.image_url || '/placeholder.svg'}
                    alt={primaryImage?.alt_text || favorite.product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Sale badge */}
                  {favorite.product.is_on_sale && (
                    <span className="absolute top-3 left-3 px-2 py-1 bg-foreground text-background text-xs font-medium">
                      SALE
                    </span>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeFavorite(favorite.product_id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-background/90 backdrop-blur-sm text-foreground hover:bg-background hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove from favorites"
                  >
                    <Heart size={16} className="fill-current" />
                  </button>

                  {/* Quick add overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToBag(favorite);
                      }}
                      className="w-full py-2 bg-background text-foreground text-sm font-medium hover:bg-background/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={14} />
                      Add to Bag
                    </button>
                  </div>
                </div>
              </Link>

              {/* Details */}
              <Link to={`/product/${favorite.product.slug}`} className="block">
                {favorite.product.category && (
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {favorite.product.category.name}
                  </p>
                )}
                <h3 className="text-sm font-medium text-foreground mb-1 group-hover:underline">
                  {favorite.product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {formatPrice(displayPrice)}
                  </span>
                  {favorite.product.is_on_sale && favorite.product.sale_price && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(favorite.product.price)}
                    </span>
                  )}
                </div>
              </Link>

              {/* Mobile remove button */}
              <button
                onClick={() => removeFavorite(favorite.product_id)}
                className="md:hidden mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 size={12} />
                Remove
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

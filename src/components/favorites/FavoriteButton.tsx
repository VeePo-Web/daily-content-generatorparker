import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  variant?: 'icon' | 'icon-with-text';
  onAuthRequired?: () => void;
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
};

export default function FavoriteButton({
  productId,
  className,
  size = 'md',
  showTooltip = false,
  variant = 'icon',
  onAuthRequired,
}: FavoriteButtonProps) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const favorited = isFavorite(productId);
  const iconSize = sizeMap[size];

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      onAuthRequired?.();
      return;
    }

    setIsAnimating(true);
    try {
      await toggleFavorite(productId);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  if (variant === 'icon-with-text') {
    return (
      <motion.button
        onClick={handleClick}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 border transition-all duration-200',
          favorited
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border hover:border-foreground text-muted-foreground hover:text-foreground',
          className
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
        aria-pressed={favorited}
      >
        <motion.div
          animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Heart
            size={iconSize}
            strokeWidth={1.5}
            className={cn(
              'transition-colors duration-200',
              favorited ? 'fill-primary stroke-primary' : ''
            )}
          />
        </motion.div>
        <span className="text-sm font-medium">
          {favorited ? 'Saved' : 'Save'}
        </span>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        'relative p-2 transition-colors duration-200 group',
        favorited
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground',
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={favorited}
    >
      {/* Background circle on hover */}
      <motion.span
        className="absolute inset-0 rounded-full bg-muted/80 scale-0 group-hover:scale-100 transition-transform duration-200"
        initial={false}
      />
      
      {/* Heart icon with animation */}
      <motion.div
        className="relative z-10"
        animate={isAnimating ? { scale: [1, 1.4, 1] } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      >
        <Heart
          size={iconSize}
          strokeWidth={1.5}
          className={cn(
            'transition-all duration-200',
            favorited ? 'fill-primary stroke-primary' : ''
          )}
        />
      </motion.div>

      {/* Burst effect on favorite */}
      <AnimatePresence>
        {isAnimating && favorited && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Heart
              size={iconSize}
              className="fill-primary stroke-primary"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      {showTooltip && (
        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {favorited ? 'Remove from wishlist' : 'Add to wishlist'}
        </span>
      )}
    </motion.button>
  );
}

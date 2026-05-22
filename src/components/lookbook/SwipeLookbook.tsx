import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, RotateCcw, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import SwipeCard from './SwipeCard';
import SwipeActions from './SwipeActions';
import SwipeProgress from './SwipeProgress';
import { useSwipeSession, SwipeLookProduct } from '@/hooks/useSwipeSession';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useCart } from '@/hooks/useCart';
import { triggerHapticFeedback, formatPrice } from '@/lib/cartUtils';
import { DrawCheckIcon } from '@/components/ui/draw-check-icon';

interface SwipeLookbookProps {
  isOpen: boolean;
  onClose: () => void;
  onViewBag: () => void;
  lookId: string;
  lookName: string;
  products: SwipeLookProduct[];
}

export default function SwipeLookbook({
  isOpen,
  onClose,
  onViewBag,
  lookId,
  lookName,
  products,
}: SwipeLookbookProps) {
  const prefersReducedMotion = useReducedMotion();
  const { openCart } = useCart();
  
  const session = useSwipeSession(lookId, lookName, products);
  
  // Calculate bundle discount (10% for 2+, 15% for 4+)
  const bundleDiscountPercent = session.itemCount >= 4 ? 15 : session.itemCount >= 2 ? 10 : 0;
  
  // Reset session when drawer opens
  useEffect(() => {
    if (isOpen) {
      session.reset();
    }
  }, [isOpen]);
  
  // Handle view bag - close drawer and open cart
  const handleViewBag = useCallback(() => {
    onClose();
    setTimeout(() => {
      openCart();
    }, 300);
  }, [onClose, openCart]);
  
  // Completion celebration haptic
  useEffect(() => {
    if (session.isComplete && session.itemCount > 0) {
      // Celebration haptic pattern
      triggerHapticFeedback();
      setTimeout(() => triggerHapticFeedback(), 150);
      setTimeout(() => triggerHapticFeedback(), 300);
    }
  }, [session.isComplete, session.itemCount]);
  
  // Get visible cards (current + next 2)
  const visibleCards = products.slice(session.currentIndex, session.currentIndex + 3);
  
  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="h-[95vh] bg-stone-900 border-t-0 [&>[data-vaul-drawer-handle-wrapper]]:hidden">
        {/* Custom sharp drawer handle */}
        <div className="w-12 h-0.5 bg-white/20 mx-auto mt-3" />
        {/* Header */}
        <DrawerHeader className="relative border-b border-white/10 pb-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              autoFocus
              aria-label="Close swipe lookbook"
              className="text-white/70 hover:text-white hover:bg-white/10 min-w-[48px] min-h-[48px]"
            >
              <X className="w-5 h-5" />
            </Button>
            
            <DrawerTitle className="text-white font-light tracking-wide text-center flex-1">
              {lookName}
            </DrawerTitle>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10 min-w-[48px] min-h-[48px]"
              aria-label="Share look"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
          
          <DrawerDescription className="sr-only">
            Swipe through products to add them to your bag
          </DrawerDescription>
          {/* Swipe Instructions */}
          {!session.isComplete && (
            <p className="text-center text-white/30 text-xs mt-2">
              Swipe or tap below
            </p>
          )}
        </DrawerHeader>
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Card Stack Area */}
          <div className="flex-1 relative p-4 pb-0">
            <AnimatePresence mode="popLayout">
              {!session.isComplete ? (
                <div className="relative w-full h-full max-w-sm mx-auto">
                  {/* Render cards in reverse order so top card renders last (on top) */}
                  {visibleCards.slice().reverse().map((product, reversedIndex) => {
                    const actualIndex = visibleCards.length - 1 - reversedIndex;
                    const isTop = actualIndex === 0;
                    
                    return (
                      <SwipeCard
                        key={product.id}
                        product={product}
                        onSwipeRight={session.handleSwipeRight}
                        onSwipeLeft={session.handleSwipeLeft}
                        isTop={isTop}
                        stackIndex={actualIndex}
                        rememberedSize={session.quickAdd?.rememberedSize}
                        canOneTap={session.quickAdd?.canOneTap || false}
                        availableSizes={session.quickAdd?.availableSizes || ['XS', 'S', 'M', 'L', 'XL']}
                        getStockForSize={session.quickAdd?.getStockForVariant || (() => 10)}
                        isFirstCard={isTop && session.currentIndex === 0}
                      />
                    );
                  })}
                </div>
              ) : (
                /* Completion Screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center px-6"
                >
                  {session.itemCount > 0 ? (
                    <>
                       <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }}
                        className="w-20 h-20 bg-green-500/20 flex items-center justify-center mb-6"
                      >
                        <DrawCheckIcon size="xl" color="green" animate delay={0.3} />
                      </motion.div>
                      
                      <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl text-white font-light mb-2"
                      >
                        All Done!
                      </motion.h2>
                      
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-white/60 mb-6"
                      >
                        {session.itemCount} {session.itemCount === 1 ? 'item' : 'items'} added • {formatPrice(session.totalValue)}
                      </motion.p>
                      
                      {bundleDiscountPercent > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="flex items-center gap-2 bg-champagne-500/20 text-champagne-400 px-4 py-2 mb-8"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span className="text-sm font-medium">{bundleDiscountPercent}% bundle discount applied!</span>
                        </motion.div>
                      )}
                      
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="flex flex-col gap-3 w-full max-w-xs"
                      >
                        <Button
                          onClick={handleViewBag}
                          className="bg-champagne-500 hover:bg-champagne-400 text-white h-12 rounded-none font-medium"
                        >
                          <ShoppingBag className="w-5 h-5 mr-2" />
                          View Bag
                        </Button>
                        
                        <Button
                          variant="ghost"
                          onClick={onClose}
                           className="text-white/60 hover:text-white hover:bg-white/10 h-12 rounded-none"
                        >
                          Continue Browsing
                        </Button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="w-20 h-20 bg-stone-800 flex items-center justify-center mb-6"
                      >
                        <RotateCcw className="w-10 h-10 text-white/40" />
                      </motion.div>
                      
                      <h2 className="text-2xl text-white font-light mb-2">
                        Nothing Added
                      </h2>
                      
                      <p className="text-white/60 mb-8">
                        Want to take another look?
                      </p>
                      
                      <div className="flex flex-col gap-3 w-full max-w-xs">
                        <Button
                          onClick={session.reset}
                          className="bg-white/10 hover:bg-white/20 text-white h-12 rounded-none font-medium"
                        >
                          <RotateCcw className="w-5 h-5 mr-2" />
                          Start Over
                        </Button>
                        
                        <Button
                          variant="ghost"
                          onClick={onClose}
                          className="text-white/60 hover:text-white hover:bg-white/10 h-12 rounded-none"
                        >
                          Close
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Action Buttons (only when swiping) */}
          {!session.isComplete && (
            <SwipeActions
              onSkip={session.handleSwipeLeft}
              onAdd={() => session.handleSwipeRight()}
              onUndo={session.undoLastSwipe}
              canUndo={session.history.length > 0}
              canOneTap={session.quickAdd?.canOneTap || false}
              rememberedSize={session.quickAdd?.rememberedSize}
            />
          )}
          
          {/* Progress Bar (only when swiping) */}
          {!session.isComplete && (
            <SwipeProgress
              addedCount={session.itemCount}
              totalValue={session.totalValue}
              currentIndex={session.currentIndex}
              totalProducts={products.length}
              bundleDiscountPercent={bundleDiscountPercent}
              onViewBag={handleViewBag}
              onClose={onClose}
            />
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

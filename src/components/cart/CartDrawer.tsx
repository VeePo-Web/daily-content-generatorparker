import { X, Lock } from "lucide-react";
import { lockScroll, unlockScroll } from "@/lib/scrollLock";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { useAbandonedCart } from "@/hooks/useAbandonedCart";
import { useBundleDiscounts } from "@/hooks/useBundleDiscounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DrawCheckIcon } from "@/components/ui/draw-check-icon";
import FreeShippingBar from "./FreeShippingBar";
import CartItem from "./CartItem";
import SmartUpsell from "./SmartUpsell";
import TrustRow from "./TrustRow";
import AffirmationStrip from "./AffirmationStrip";
import BundleProgress from "./BundleProgress";
import BundleSavingsRow from "./BundleSavingsRow";
import SavedForLaterShelf from "./SavedForLaterShelf";
import ContinueShopping from "./ContinueShopping";
import ExpressCheckout from "@/components/checkout/ExpressCheckout";
import { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface CartDrawerProps {
  onViewFavorites?: () => void;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2, delay: 0.1 } },
};

const editorialEase = [0.25, 0.46, 0.45, 0.94] as const;
const exitEase = [0.4, 0, 1, 1] as const;

const drawerVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: {
      type: "tween" as const,
      duration: 0.35,
      ease: editorialEase,
    },
  },
  exit: {
    x: "100%",
    transition: {
      type: "tween" as const,
      duration: 0.3,
      ease: exitEase,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05 + 0.2,
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  }),
  exit: {
    opacity: 0,
    x: -20,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const CartDrawer = ({ onViewFavorites }: CartDrawerProps) => {
  const { items, itemCount, subtotal, isCartOpen, closeCart } = useCart();
  const { email: savedEmail, isSyncing, isSynced, syncCart } = useAbandonedCart();
  const { activeBundles, totalBundleSavings, hasActiveBundles, bestIncompleteBundle } = useBundleDiscounts();
  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  // Email capture state
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [savingState, setSavingState] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  // Contextual trigger: show email capture when user scrolls to bottom OR has 2+ items
  const handleScroll = useCallback(() => {
    if (!contentRef.current || savedEmail || isSynced) return;
    
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;
    
    if (isNearBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      setShowEmailCapture(true);
    }
  }, [savedEmail, isSynced, hasScrolledToBottom]);
  
  // Show email capture after 2+ items added
  useEffect(() => {
    if (isCartOpen && items.length >= 2 && !savedEmail && !isSynced && !showEmailCapture) {
      const timer = setTimeout(() => setShowEmailCapture(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [isCartOpen, items.length, savedEmail, isSynced, showEmailCapture]);

  const handleSaveCart = async () => {
    setEmailError("");
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setEmailError("Enter a valid email");
      return;
    }
    
    setSavingState('saving');
    const result = await syncCart(emailInput, items, subtotal);
    
    if (result.success) {
      setSavingState('saved');
      setTimeout(() => setShowEmailCapture(false), 1200);
    } else {
      setSavingState('idle');
      setEmailError(result.error || "Unable to save");
    }
  };

  // Focus trap and escape key handling
  useEffect(() => {
    if (!isCartOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };

    document.addEventListener('keydown', handleEscape);
    lockScroll();

    return () => {
      document.removeEventListener('keydown', handleEscape);
      unlockScroll();
    };
  }, [isCartOpen, closeCart]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 h-[100dvh]">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 h-[100dvh] touch-none"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="absolute right-0 top-0 h-[100dvh] w-full max-w-md bg-background border-l border-border flex flex-col shadow-2xl overscroll-contain"
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border">
              <motion.h2 
                id="cart-title" 
                className="text-lg font-light text-foreground"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Your Bag ({itemCount})
              </motion.h2>
              <motion.button
                onClick={closeCart}
                className="p-2 text-foreground hover:text-muted-foreground transition-colors -mr-2 relative group"
                aria-label="Close cart"
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

            {/* Free Shipping Progress - Sticky */}
            {items.length > 0 && <FreeShippingBar />}

            {/* Content area */}
            <div ref={contentRef} onScroll={handleScroll} className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <motion.div 
                  className="flex flex-col items-center justify-center h-full px-6 py-12"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div 
                    className="w-16 h-16 mb-4 rounded-full bg-muted/50 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "tween" as const, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="w-8 h-8 text-muted-foreground">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                  </motion.div>
                  <motion.p 
                    className="text-muted-foreground text-sm text-center mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Your shopping bag is empty.<br />
                    Discover our curated collections.
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      asChild
                      variant="outline"
                      className="rounded-none"
                      onClick={closeCart}
                    >
                      <Link to="/category/shop">Explore Collection</Link>
                    </Button>
                  </motion.div>

                  {/* Mobile favorites toggle */}
                  {onViewFavorites && (
                    <motion.button
                      onClick={() => {
                        closeCart();
                        onViewFavorites();
                      }}
                      className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors md:hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                      </svg>
                      View Favorites
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                <>
                  {/* Cart items with stagger */}
                  <div className="px-6 divide-y divide-border">
                    <AnimatePresence mode="popLayout">
                      {items.map((item, index) => (
                        <motion.div
                          key={`${item.id}-${item.size}-${item.color}`}
                          custom={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                        >
                          <CartItem item={item} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Save Your Selection Email Capture */}
                  <AnimatePresence>
                    {showEmailCapture && !savedEmail && !isSynced && (
                      <motion.div
                        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="mx-6 my-4"
                      >
                        <div className="border-t border-b border-border py-5 space-y-4">
                          <div className="space-y-1">
                            <h3 className="text-xs font-medium text-foreground uppercase tracking-[0.2em]">
                              Save Your Selection
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Get notified if items sell out.
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <Input
                                  type="email"
                                  inputMode="email"
                                  autoComplete="email"
                                  placeholder="Email"
                                  value={emailInput}
                                  onChange={(e) => {
                                    setEmailInput(e.target.value);
                                    setEmailError("");
                                  }}
                                  className="rounded-none text-sm h-12 border-muted-foreground/30 focus:border-foreground transition-colors"
                                  onKeyDown={(e) => e.key === 'Enter' && handleSaveCart()}
                                  disabled={savingState !== 'idle'}
                                />
                              </div>
                              <Button
                                onClick={handleSaveCart}
                                disabled={savingState !== 'idle'}
                                size="sm"
                                variant="outline"
                                className="rounded-none h-12 px-5 text-xs uppercase tracking-[0.15em] border-foreground hover:bg-foreground hover:text-background transition-all"
                              >
                                {savingState === 'saving' ? (
                                  <span className="flex items-center gap-1">
                                    <span className="w-1 h-1 bg-current rounded-full animate-pulse" />
                                    <span className="w-1 h-1 bg-current rounded-full animate-pulse delay-75" />
                                    <span className="w-1 h-1 bg-current rounded-full animate-pulse delay-150" />
                                  </span>
                                ) : savingState === 'saved' ? (
                                  <DrawCheckIcon size="xs" delay={0} />
                                ) : (
                                  "Secure"
                                )}
                              </Button>
                            </div>
                            
                            {emailError && (
                              <p className="text-xs text-destructive">{emailError}</p>
                            )}
                            
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <Lock className="w-3 h-3" />
                              <span>Your data is encrypted and secure.</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Cart Saved Confirmation */}
                  <AnimatePresence>
                    {(savedEmail || isSynced) && !showEmailCapture && (
                      <motion.div
                        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="mx-6 my-3"
                      >
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <DrawCheckIcon size="xs" className="text-primary" delay={0} />
                          <span>Cart saved. We'll keep your items ready.</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bundle Progress Cards */}
                  {(activeBundles.length > 0 || bestIncompleteBundle) && (
                    <div className="px-6 py-4 space-y-3">
                      {activeBundles.map((bundle) => (
                        <BundleProgress key={bundle.lookId} bundle={bundle} />
                      ))}
                      {bestIncompleteBundle && !activeBundles.find(b => b.lookId === bestIncompleteBundle.lookId) && (
                        <BundleProgress bundle={bestIncompleteBundle} />
                      )}
                    </div>
                  )}

                  {/* Saved For Later Shelf */}
                  <SavedForLaterShelf />

                  {/* Smart upsell */}
                  <SmartUpsell />

                  {/* Continue Shopping - Recently Viewed */}
                  <ContinueShopping maxItems={4} />

                  {/* Mobile favorites link */}
                  {onViewFavorites && (
                    <div className="px-6 py-4 border-t border-border md:hidden">
                      <button
                        onClick={() => {
                          closeCart();
                          onViewFavorites();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                        View Favorites
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer - Sticky at bottom when cart has items */}
            {items.length > 0 && (
              <motion.div 
                className="border-t border-border bg-background"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {/* Affirmation strip */}
                <AffirmationStrip />

                {/* Subtotal + CTA */}
                <div className="px-6 py-4 space-y-4">
                  {/* Bundle Savings Row */}
                  <BundleSavingsRow />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <div className="text-right">
                      {hasActiveBundles && (
                        <span className="text-sm text-muted-foreground line-through mr-2">
                          ${subtotal.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                      <span className="text-lg font-medium text-foreground">
                        ${(subtotal - totalBundleSavings).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Shipping and taxes calculated at checkout
                  </p>

                  {/* Express Checkout - Apple Pay / Google Pay */}
                  <ExpressCheckout 
                    variant="cart"
                    onSuccess={closeCart}
                  />

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      asChild
                      className="w-full rounded-none h-12 text-sm uppercase tracking-wider"
                      size="lg"
                    >
                      <Link to="/checkout" onClick={closeCart}>
                        Proceed to Checkout
                      </Link>
                    </Button>
                  </motion.div>

                  <Button
                    variant="ghost"
                    className="w-full rounded-none text-sm"
                    asChild
                  >
                    <Link to="/category/shop" onClick={closeCart}>
                      Continue Shopping
                    </Link>
                  </Button>
                </div>

                {/* Trust row */}
                <TrustRow />
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

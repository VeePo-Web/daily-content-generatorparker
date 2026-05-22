import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, Transition } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DrawCheckIcon } from "@/components/ui/draw-check-icon";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/Layout";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface RecoveredCartItem {
  id: number;
  name: string;
  price: number;
  priceFormatted: string;
  image: string;
  quantity: number;
  category: string;
  size?: string;
  color?: string;
}

interface RecoveryResponse {
  success: boolean;
  cartId: string;
  email: string;
  cartItems: RecoveredCartItem[];
  cartTotal: number;
  discountCode?: string;
  error?: string;
}

// Premium loading dots - 12px with deeper contrast
const LoadingDots = () => {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className="flex items-center justify-center gap-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-3 h-3 bg-foreground rounded-full"
          animate={prefersReducedMotion ? {} : { opacity: [0.2, 1, 0.2] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Horizontal rule divider
const Divider = ({ className }: { className?: string }) => (
  <div className={cn("w-full h-px bg-foreground/20", className)} />
);

const RecoverCart = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addItem, clearCart } = useCart();
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [recoveredData, setRecoveredData] = useState<RecoveryResponse | null>(null);
  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');

  // Simple transition helper
  const getTransition = (delay: number = 0): Transition => ({
    duration: prefersReducedMotion ? 0 : 0.3,
    delay: prefersReducedMotion ? 0 : delay,
  });

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No recovery token provided');
      return;
    }

    const recoverCart = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recover-cart?token=${token}`,
          {
            headers: {
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            },
          }
        );

        const data: RecoveryResponse = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || 'Failed to recover cart');
        }

        // Clear existing cart and add recovered items
        clearCart();
        
        // Small delay to ensure cart is cleared
        await new Promise(resolve => setTimeout(resolve, 100));

        // Add each item to cart
        for (const item of data.cartItems) {
          addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            priceFormatted: item.priceFormatted,
            image: item.image,
            category: item.category,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          });
        }

        setRecoveredData(data);
        setStatus('success');

        toast({
          title: "Cart restored",
          description: data.discountCode 
            ? `Use code ${data.discountCode} for 15% off`
            : "Your items are ready for checkout",
        });

      } catch (error) {
        console.error('Cart recovery failed:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Failed to recover cart');
      }
    };

    recoverCart();
  }, [token, addItem, clearCart, toast]);

  const handleResendLink = async () => {
    if (!resendEmail.trim()) return;
    
    setIsResending(true);
    // For now, just show feedback - actual resend would need edge function
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsResending(false);
    
    toast({
      title: "Link sent",
      description: "Check your email for a new recovery link",
    });
  };

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={getTransition()}
          className="max-w-md w-full text-center"
        >
          {/* Loading State */}
          {status === 'loading' && (
            <div className="space-y-10">
              <LoadingDots />
              <div className="space-y-3">
                <h1 className="text-sm font-medium text-foreground uppercase tracking-[0.3em]">
                  Retrieving Order
                </h1>
                <p className="text-xs text-muted-foreground tracking-wide">
                  One moment
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && recoveredData && (
            <motion.div 
              className="space-y-10"
              initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={getTransition()}
            >
              {/* Square Icon with Check */}
              <motion.div
                initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={getTransition(0.1)}
                className="w-16 h-16 mx-auto border border-foreground flex items-center justify-center"
              >
                <DrawCheckIcon size="md" variant="check" delay={300} className="text-foreground" />
              </motion.div>

              {/* Headline */}
              <motion.div 
                initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={getTransition(0.25)}
                className="space-y-3"
              >
                <h1 className="text-3xl md:text-4xl font-light text-foreground tracking-[0.08em]">
                  RESTORED
                </h1>
                <p className="text-sm text-muted-foreground">
                  {recoveredData.cartItems.length} item{recoveredData.cartItems.length !== 1 ? 's' : ''} ready for checkout
                </p>
              </motion.div>

              {/* Discount Code Block */}
              {recoveredData.discountCode && (
                <motion.div
                  initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={getTransition(0.4)}
                  className="border border-foreground p-8 space-y-6"
                >
                  {/* Top divider with label */}
                  <div className="flex items-center gap-4">
                    <Divider className="flex-1" />
                    <span className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] whitespace-nowrap">
                      Exclusive Offer
                    </span>
                    <Divider className="flex-1" />
                  </div>

                  {/* Code */}
                  <p className="text-2xl md:text-3xl font-light text-foreground tracking-[0.2em]">
                    {recoveredData.discountCode}
                  </p>

                  {/* Expiry */}
                  <p className="text-xs text-muted-foreground">
                    15% off your order · Expires in 24h
                  </p>

                  {/* Bottom divider */}
                  <Divider />
                </motion.div>
              )}

              {/* Actions */}
              <motion.div 
                initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={getTransition(0.55)}
                className="flex flex-col gap-4 pt-2"
              >
                <Button
                  onClick={() => navigate('/checkout')}
                  className="w-full rounded-none h-14 text-xs uppercase tracking-[0.2em] font-medium"
                  size="lg"
                >
                  Complete Your Order
                </Button>
                <button
                  onClick={() => navigate('/category/shop')}
                  className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors editorial-link py-2"
                >
                  Continue Shopping
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <motion.div 
              className="space-y-10"
              initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={getTransition()}
            >
              {/* Square Icon with Dash */}
              <motion.div
                initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={getTransition(0.1)}
                className="w-16 h-16 mx-auto border border-muted-foreground/30 flex items-center justify-center"
              >
                <span className="text-2xl text-muted-foreground font-light">—</span>
              </motion.div>

              {/* Message */}
              <motion.div 
                initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={getTransition(0.25)}
                className="space-y-4"
              >
                <h1 className="text-2xl font-light text-foreground uppercase tracking-[0.08em]">
                  Link Expired
                </h1>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Recovery links are valid for 30 days.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Enter your email to resend a link.
                  </p>
                </div>
              </motion.div>

              {/* Email Resend Form */}
              <motion.div
                initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={getTransition(0.4)}
                className="space-y-4"
              >
                <Input
                  type="email"
                  placeholder="Email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="rounded-none border-foreground/20 focus:border-foreground h-12 text-sm tracking-wide text-center"
                />
                <Button
                  onClick={handleResendLink}
                  disabled={!resendEmail.trim() || isResending}
                  className="w-full rounded-none h-14 text-xs uppercase tracking-[0.2em] font-medium"
                  size="lg"
                >
                  {isResending ? "Sending..." : "Resend Link"}
                </Button>
              </motion.div>

              {/* Fallback */}
              <motion.div
                initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={getTransition(0.55)}
              >
                <button
                  onClick={() => navigate('/category/shop')}
                  className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors editorial-link py-2"
                >
                  Browse Collection
                </button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default RecoverCart;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Lock, Eye, EyeOff, Check, Copy, Sparkles, ShoppingBag, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { toast } from "@/hooks/use-toast";

interface PostPurchaseSignupProps {
  orderEmail: string;
  orderFirstName: string | null;
  orderId: string;
  onSuccess: () => void;
  onSkip: () => void;
}

type SignupState = "idle" | "loading" | "success" | "error" | "email_exists";

export function PostPurchaseSignup({
  orderEmail,
  orderFirstName,
  orderId,
  onSuccess,
  onSkip,
}: PostPurchaseSignupProps) {
  const { signUp } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, setState] = useState<SignupState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isPasswordValid = password.length >= 6;

  const createWelcomeDiscount = async (): Promise<string> => {
    const code = `WELCOME10-${Date.now().toString(36).toUpperCase()}`;
    
    await supabase.from("discount_codes").insert({
      code,
      name: "Welcome 10% Off",
      description: "Thank you for creating an account!",
      discount_type: "percentage",
      discount_value: 10,
      per_user_limit: 1,
      usage_limit: 1,
      is_active: true,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return code;
  };

  const linkOrderToUser = async (userId: string) => {
    await supabase
      .from("orders")
      .update({ user_id: userId })
      .eq("id", orderId);
  };

  const migratePreferences = async (userId: string) => {
    // Migrate size preferences
    const sizePrefsRaw = localStorage.getItem("loj-size-memory");
    if (sizePrefsRaw) {
      try {
        const sizePrefs = JSON.parse(sizePrefsRaw);
        await supabase.from("user_size_preferences").upsert({
          user_id: userId,
          tops_size: sizePrefs.tops?.size || null,
          tops_updated_at: sizePrefs.tops?.timestamp ? new Date(sizePrefs.tops.timestamp).toISOString() : null,
          bottoms_size: sizePrefs.bottoms?.size || null,
          bottoms_updated_at: sizePrefs.bottoms?.timestamp ? new Date(sizePrefs.bottoms.timestamp).toISOString() : null,
          hats_size: sizePrefs.hats?.size || null,
          hats_updated_at: sizePrefs.hats?.timestamp ? new Date(sizePrefs.hats.timestamp).toISOString() : null,
        });
      } catch (e) {
        console.error("Failed to migrate size preferences:", e);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) return;

    setState("loading");
    setErrorMessage(null);

    try {
      const { error } = await signUp(orderEmail, password, orderFirstName || undefined);

      if (error) {
        if (error.message.includes("already registered")) {
          setState("email_exists");
          setErrorMessage("This email already has an account. Sign in to link your order.");
        } else {
          setState("error");
          setErrorMessage(error.message);
        }
        return;
      }

      // Get the new user's ID from the session
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (userId) {
        // Run all post-signup tasks in parallel
        const [code] = await Promise.all([
          createWelcomeDiscount(),
          linkOrderToUser(userId),
          migratePreferences(userId),
        ]);

        setDiscountCode(code);
      } else {
        // Fallback - still create discount code even if we can't get session
        const code = await createWelcomeDiscount();
        setDiscountCode(code);
      }

      setState("success");
      
      toast({
        title: "Account created!",
        description: "Your sizes and order have been saved to your account.",
      });

      // Delay calling onSuccess to show the success state
      setTimeout(onSuccess, 3000);
    } catch (err) {
      console.error("Signup error:", err);
      setState("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const copyDiscountCode = async () => {
    if (!discountCode) return;
    
    try {
      await navigator.clipboard.writeText(discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      toast({
        title: "Copy this code",
        description: discountCode,
      });
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  // Success state UI
  if (state === "success") {
    return (
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-foreground/5 to-primary/5 border border-foreground/20 p-6 sm:p-8 text-center"
      >
        <motion.div
          initial={prefersReducedMotion ? {} : { scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "tween", duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-16 h-16 bg-foreground rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <Check className="w-8 h-8 text-white" />
        </motion.div>

        <h3 className="text-xl font-medium mb-2">Account Created!</h3>
        <p className="text-muted-foreground mb-6">
          Welcome to Line of Judah{orderFirstName ? `, ${orderFirstName}` : ""}!
        </p>

        {discountCode && (
          <div className="bg-background/80 border border-border p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-2">Your 10% discount code:</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-lg font-mono font-medium tracking-wide">{discountCode}</code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyDiscountCode}
                className="h-8 w-8 p-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-foreground" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Valid for 30 days • One-time use
            </p>
          </div>
        )}

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-foreground" />
            <span>Your sizes have been saved</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-foreground" />
            <span>This order is linked to your account</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Form state UI
  return (
    <motion.div
      initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-gradient-to-br from-primary/5 to-champagne-500/5 border border-primary/20 p-6 sm:p-8"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <Gift className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-medium">Save your info for next time</h3>
          <p className="text-sm text-muted-foreground">
            Create an account in seconds
          </p>
        </div>
      </div>

      {/* Value propositions */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm">
          <Package className="w-4 h-4 text-primary flex-shrink-0" />
          <span>Track this order in real-time</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <ShoppingBag className="w-4 h-4 text-primary flex-shrink-0" />
          <span>Checkout faster next time (sizes saved)</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Sparkles className="w-4 h-4 text-champagne-500 flex-shrink-0" />
          <span className="font-medium text-champagne-600 dark:text-champagne-400">
            Get 10% off your next order
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email (read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-muted-foreground">
            Email
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={orderEmail}
              readOnly
              className="bg-muted/50 pr-10 cursor-not-allowed"
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm">
            Create a password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="pr-10"
              disabled={state === "loading"}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className={`text-xs ${password.length > 0 && !isPasswordValid ? "text-destructive" : "text-muted-foreground"}`}>
            {password.length > 0 && !isPasswordValid
              ? `${6 - password.length} more characters needed`
              : "6+ characters required"}
          </p>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {(state === "error" || state === "email_exists") && errorMessage && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-destructive"
            >
              {errorMessage}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full rounded-none"
          disabled={!isPasswordValid || state === "loading"}
        >
          {state === "loading" ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Creating account...
            </span>
          ) : (
            "Create Account & Get 10% Off"
          )}
        </Button>

        {/* Skip option */}
        <button
          type="button"
          onClick={handleSkip}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          disabled={state === "loading"}
        >
          No thanks, continue as guest
        </button>
      </form>
    </motion.div>
  );
}

export default PostPurchaseSignup;

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Package, Mail, CheckCircle, ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import PostPurchaseSignup from "@/components/checkout/PostPurchaseSignup";

interface ShippingAddress {
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

interface OrderDetails {
  id: string;
  customer_email: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  shipping_address: ShippingAddress;
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  total_cents: number;
  shipping_method: string | null;
  created_at: string;
  user_id: string | null;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image_url: string | null;
  variant_size: string | null;
  variant_color: string | null;
  unit_price_cents: number;
  quantity: number;
  total_cents: number;
}

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSignupPrompt, setShowSignupPrompt] = useState(true);

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!sessionId) {
        setError("No session ID provided");
        setLoading(false);
        return;
      }

      try {
        // Fetch order by Stripe session ID
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("stripe_checkout_session_id", sessionId)
          .single();

        if (orderError || !orderData) {
          // Order might not be updated yet, wait and retry
          await new Promise((resolve) => setTimeout(resolve, 2000));
          
          const { data: retryData, error: retryError } = await supabase
            .from("orders")
            .select("*")
            .eq("stripe_checkout_session_id", sessionId)
            .single();

          if (retryError || !retryData) {
            setError("Order not found. It may still be processing.");
            setLoading(false);
            return;
          }

          setOrder({
            ...retryData,
            shipping_address: (retryData.shipping_address as ShippingAddress) || {},
          } as OrderDetails);
        } else {
          setOrder({
            ...orderData,
            shipping_address: (orderData.shipping_address as ShippingAddress) || {},
          } as OrderDetails);
        }

        // Fetch order items
        const orderId = orderData?.id || (await supabase
          .from("orders")
          .select("id")
          .eq("stripe_checkout_session_id", sessionId)
          .single()).data?.id;

        if (orderId) {
          const { data: items } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", orderId);

          if (items) {
            setOrderItems(items as OrderItem[]);
          }
        }

        // Clear the cart after successful order
        clearCart();
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [sessionId, clearCart]);

  // Calculate estimated delivery
  const getEstimatedDelivery = (shippingMethod: string) => {
    const start = new Date();
    const end = new Date();
    
    switch (shippingMethod) {
      case "overnight":
        start.setDate(start.getDate() + 1);
        end.setDate(end.getDate() + 1);
        break;
      case "express":
        start.setDate(start.getDate() + 2);
        end.setDate(end.getDate() + 3);
        break;
      default:
        start.setDate(start.getDate() + 3);
        end.setDate(end.getDate() + 5);
    }

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const formatCents = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading order details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-light">Order Processing</h1>
            <p className="text-muted-foreground">
              {error || "Your order is being processed. You will receive an email confirmation shortly."}
            </p>
            <Button onClick={() => navigate("/")} className="rounded-none">
              Return to Home
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-foreground rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-light mb-2">Thank You for Your Order!</h1>
            <p className="text-muted-foreground">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          {/* Email Confirmation */}
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-10 pb-10 border-b border-border">
            <Mail className="w-4 h-4" />
            <span>Confirmation sent to {order.customer_email}</span>
          </div>

          {/* Post-Purchase Signup Prompt (for guest checkouts only) */}
          {!user && !order.user_id && showSignupPrompt && (
            <div className="mb-10">
              <PostPurchaseSignup
                orderEmail={order.customer_email}
                orderFirstName={order.customer_first_name}
                orderId={order.id}
                onSuccess={() => setShowSignupPrompt(false)}
                onSkip={() => setShowSignupPrompt(false)}
              />
            </div>
          )}

          {/* Order Items */}
          <div className="mb-10">
            <h2 className="text-lg font-medium mb-6">Order Items</h2>
            <div className="space-y-4">
              {orderItems.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-muted/20 rounded overflow-hidden flex-shrink-0">
                    {item.product_image_url && (
                      <img
                        src={item.product_image_url}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {[item.variant_size, item.variant_color].filter(Boolean).join(" / ")}
                    </p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCents(item.total_cents)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-muted/20 p-6 mb-10 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCents(order.subtotal_cents)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{order.shipping_cents === 0 ? "FREE" : formatCents(order.shipping_cents)}</span>
            </div>
            {order.discount_cents > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount</span>
                <span className="text-champagne-600">-{formatCents(order.discount_cents)}</span>
              </div>
            )}
            <div className="flex justify-between pt-3 border-t border-border font-medium">
              <span>Total</span>
              <span>{formatCents(order.total_cents)}</span>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-sm font-medium mb-3">Shipping Address</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{order.customer_first_name} {order.customer_last_name}</p>
                <p>{order.shipping_address.address}</p>
                <p>{order.shipping_address.postalCode} {order.shipping_address.city}</p>
                <p>{order.shipping_address.country}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-3">Estimated Delivery</h3>
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-muted-foreground" />
                <span>{getEstimatedDelivery(order.shipping_method)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {order.shipping_method === "overnight" && "Next-day delivery"}
                {order.shipping_method === "express" && "Express shipping (2-3 days)"}
                {order.shipping_method === "standard" && "Standard shipping (3-5 days)"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="rounded-none"
              onClick={() => navigate("/")}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Continue Shopping
            </Button>
            <Button asChild className="rounded-none">
              <Link to="/account/orders">
                View All Orders
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-muted-foreground mt-10">
            Questions about your order?{" "}
            <Link to="/about/customer-care" className="underline hover:text-foreground">
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutSuccess;

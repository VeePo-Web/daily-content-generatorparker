-- Orders table: Core order tracking
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Stripe references
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded', 'partially_refunded')),
  fulfillment_status TEXT DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'processing', 'shipped', 'delivered')),
  
  -- Customer info (denormalized for order history)
  customer_email TEXT NOT NULL,
  customer_first_name TEXT,
  customer_last_name TEXT,
  customer_phone TEXT,
  
  -- Addresses (JSONB for flexibility)
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  
  -- Financials (stored in cents for precision)
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER NOT NULL DEFAULT 0,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents INTEGER NOT NULL DEFAULT 0,
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  
  -- Discount tracking
  discount_code TEXT,
  discount_id UUID,
  
  -- Shipping
  shipping_method TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Order items table: Line items per order
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  
  -- Product reference (nullable if product deleted)
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  
  -- Snapshot at time of purchase (products can change)
  product_name TEXT NOT NULL,
  product_image_url TEXT,
  variant_size TEXT,
  variant_color TEXT,
  sku TEXT,
  
  -- Pricing (in cents)
  unit_price_cents INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_cents INTEGER NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_orders_stripe_session ON public.orders(stripe_checkout_session_id);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);

-- Updated_at trigger
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Admins can manage all orders
CREATE POLICY "Admins can manage orders" ON public.orders
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Service role can insert orders (from edge functions)
CREATE POLICY "Service can insert orders" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Service role can update orders (from webhook)
CREATE POLICY "Service can update orders" ON public.orders
  FOR UPDATE USING (true);

-- Order items follow order visibility
CREATE POLICY "Order items viewable with order" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND (orders.user_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

-- Service can manage order items
CREATE POLICY "Service can manage order items" ON public.order_items
  FOR ALL USING (true);
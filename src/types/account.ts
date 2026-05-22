export interface Address {
  id: string;
  user_id: string;
  label: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'partially_refunded';
export type FulfillmentStatus = 'unfulfilled' | 'fulfilled' | 'partially_fulfilled';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  product_name: string;
  product_image_url?: string;
  variant_size?: string;
  variant_color?: string;
  sku?: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
  created_at: string;
}

export interface Order {
  id: string;
  user_id?: string;
  customer_email: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_phone?: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_status?: FulfillmentStatus;
  shipping_address: Address | Record<string, unknown>;
  billing_address?: Address | Record<string, unknown>;
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  discount_code?: string;
  shipping_method?: string;
  tracking_number?: string;
  tracking_url?: string;
  shipped_at?: string;
  delivered_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

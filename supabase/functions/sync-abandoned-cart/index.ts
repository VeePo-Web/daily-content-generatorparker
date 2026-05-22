import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CartItem {
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

interface SyncRequest {
  email: string;
  cartItems: CartItem[];
  cartTotal: number;
  existingCartId?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { email, cartItems, cartTotal, existingCartId }: SyncRequest = await req.json();

    // Validate input
    if (!email || !cartItems || cartItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Email and cart items are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let cartId: string;

    if (existingCartId) {
      // Update existing cart
      const { data, error } = await supabase
        .from('abandoned_carts')
        .update({
          email,
          cart_items: cartItems,
          cart_total: cartTotal,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingCartId)
        .select('id')
        .single();

      if (error) {
        // If update fails (cart doesn't exist), create new one
        console.log('Cart not found, creating new one:', error.message);
        const { data: newCart, error: insertError } = await supabase
          .from('abandoned_carts')
          .insert({
            email,
            cart_items: cartItems,
            cart_total: cartTotal,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        cartId = newCart.id;
      } else {
        cartId = data.id;
      }
    } else {
      // Check if there's an existing pending cart for this email
      const { data: existingCart } = await supabase
        .from('abandoned_carts')
        .select('id')
        .eq('email', email)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingCart) {
        // Update existing cart
        const { error: updateError } = await supabase
          .from('abandoned_carts')
          .update({
            cart_items: cartItems,
            cart_total: cartTotal,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingCart.id);

        if (updateError) throw updateError;
        cartId = existingCart.id;
      } else {
        // Create new cart
        const { data: newCart, error: insertError } = await supabase
          .from('abandoned_carts')
          .insert({
            email,
            cart_items: cartItems,
            cart_total: cartTotal,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        cartId = newCart.id;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        cartId,
        message: 'Cart synced successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Error syncing abandoned cart:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

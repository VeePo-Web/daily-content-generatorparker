import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get token from query params or body
    let token: string | null = null;
    
    if (req.method === 'GET') {
      const url = new URL(req.url);
      token = url.searchParams.get('token');
    } else {
      const body = await req.json();
      token = body.token;
    }

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Recovery token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find cart by recovery token
    const { data: cart, error } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('recovery_token', token)
      .single();

    if (error || !cart) {
      return new Response(
        JSON.stringify({ error: 'Cart not found or expired' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if cart is already converted
    if (cart.status === 'converted') {
      return new Response(
        JSON.stringify({ error: 'This cart has already been converted to an order' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if cart is too old (30 days)
    const cartAge = Date.now() - new Date(cart.created_at).getTime();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    if (cartAge > thirtyDaysMs) {
      // Mark as expired
      await supabase
        .from('abandoned_carts')
        .update({ status: 'expired' })
        .eq('id', cart.id);

      return new Response(
        JSON.stringify({ error: 'This cart has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark cart as recovered
    await supabase
      .from('abandoned_carts')
      .update({ 
        status: 'recovered',
        recovered_at: new Date().toISOString()
      })
      .eq('id', cart.id);

    return new Response(
      JSON.stringify({ 
        success: true,
        cartId: cart.id,
        email: cart.email,
        cartItems: cart.cart_items,
        cartTotal: cart.cart_total,
        discountCode: cart.discount_code,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('Error recovering cart:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

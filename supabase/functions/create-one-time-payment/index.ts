
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://cdn.skypack.dev/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const productConfigs = {
  'natal-chart': {
    name: '🔮 Personalized Natal Chart Reading',
    amount: 999, // €9.99
    type: 'natal_chart'
  },
  'lunar-cycle': {
    name: '🌕 Lunar Cycle & Moon Ritual Guide',
    amount: 777, // €7.77
    type: 'lunar_cycle'
  },
  'synastry-compatibility': {
    name: '💞 Synastry & Compatibility Report',
    amount: 1222, // €12.22
    type: 'synastry'
  },
  'transit-forecast': {
    name: '🪐 2025 Year-Ahead Transit Forecast',
    amount: 1444, // €14.44
    type: 'transit_forecast'
  },
  'celestial-collection': {
    name: '💫 Celestial Collection - All 4 Reports',
    amount: 2999, // €29.99
    type: 'bundle'
  }
} as const;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { productId } = await req.json();
    
    if (!productId || !productConfigs[productId as keyof typeof productConfigs]) {
      throw new Error("Invalid product ID");
    }

    const product = productConfigs[productId as keyof typeof productConfigs];
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { 
      apiVersion: "2023-10-16" 
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: product.name },
            unit_amount: product.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard?payment=success&product=${productId}`,
      cancel_url: `${req.headers.get("origin")}/dashboard?payment=canceled`,
      metadata: {
        user_id: user.id,
        product_type: product.type,
        product_id: productId,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Create one-time payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

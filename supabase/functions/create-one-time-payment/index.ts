
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    
    // Get user directly from Supabase Auth API
    const userResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "apikey": Deno.env.get("SUPABASE_ANON_KEY") || "",
      },
    });

    if (!userResponse.ok) throw new Error("Authentication failed");
    const userData = await userResponse.json();
    const user = userData;
    if (!user?.email) throw new Error("User not authenticated");

    const { productId } = await req.json();
    
    if (!productId || !productConfigs[productId as keyof typeof productConfigs]) {
      throw new Error("Invalid product ID");
    }

    const product = productConfigs[productId as keyof typeof productConfigs];
    
    // Get existing customer from Stripe
    const customersResponse = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(user.email)}&limit=1`, {
      headers: {
        "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
      },
    });

    const customersData = await customersResponse.json();
    const customers = customersData.data || [];
    let customerId;
    if (customers.length > 0) {
      customerId = customers[0].id;
    }

    // Create Stripe checkout session
    const sessionData = {
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard?payment=success&product=${productId}`,
      cancel_url: `${req.headers.get("origin")}/dashboard?payment=canceled`,
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
      metadata: {
        user_id: user.id,
        product_type: product.type,
        product_id: productId,
      },
    };

    if (customerId) {
      sessionData.customer = customerId;
    } else {
      sessionData.customer_email = user.email;
    }

    const sessionResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(sessionData).toString(),
    });

    const session = await sessionResponse.json();

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

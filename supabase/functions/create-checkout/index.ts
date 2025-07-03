
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { tier } = await req.json();
    
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

    let priceAmount, planName;
    
    switch (tier) {
      case 'written':
        priceAmount = 999; // €9.99
        planName = 'Written Readings';
        break;
      case 'spoken':
        priceAmount = 1999; // €19.99
        planName = 'Spoken Readings';
        break;
      case 'lunar':
        priceAmount = 1444; // €14.44
        planName = 'Lunar Cycle Monthly';
        break;
      default:
        throw new Error('Invalid subscription tier');
    }

    // Create Stripe checkout session
    const sessionData = {
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?payment=success`,
      cancel_url: `${req.headers.get("origin")}/dashboard?payment=canceled`,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: planName },
            unit_amount: priceAmount,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        tier: tier,
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
    console.error("Create checkout error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

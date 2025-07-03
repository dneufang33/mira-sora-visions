
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

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

    // Use Stripe directly without Supabase client
    const stripeResponse = await fetch("https://api.stripe.com/v1/customers", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `email=${encodeURIComponent(user.email)}&limit=1`,
    });

    const stripeData = await stripeResponse.json();
    const customers = stripeData.data || [];
    
    if (customers.length === 0) {
      // Update subscribers table directly via REST API
      await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/subscribers`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
          "Content-Type": "application/json",
          "Prefer": "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          email: user.email,
          user_id: user.id,
          stripe_customer_id: null,
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
          readings_remaining: 0,
          updated_at: new Date().toISOString(),
        }),
      });
      
      return new Response(JSON.stringify({ subscribed: false, readings_remaining: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers[0].id;
    
    // Get subscriptions from Stripe
    const subscriptionsResponse = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${customerId}&status=active&limit=1`, {
      headers: {
        "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
      },
    });

    const subscriptionsData = await subscriptionsResponse.json();
    const subscriptions = subscriptionsData.data || [];
    const hasActiveSub = subscriptions.length > 0;
    
    let subscriptionTier = null;
    let subscriptionEnd = null;
    let readingsRemaining = 0;

    if (hasActiveSub) {
      const subscription = subscriptions[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      
      const priceResponse = await fetch(`https://api.stripe.com/v1/prices/${subscription.items.data[0].price.id}`, {
        headers: {
          "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
        },
      });
      
      const price = await priceResponse.json();
      const amount = price.unit_amount || 0;
      
      subscriptionTier = amount <= 999 ? "written" : "spoken";
      
      // Get subscriber data
      const subscriberResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/subscribers?email=eq.${encodeURIComponent(user.email)}&select=last_reset_date,readings_remaining`, {
        headers: {
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
        },
      });
      
      const subscriberData = await subscriberResponse.json();
      const subscriber = subscriberData[0];
      
      const currentPeriodStart = new Date(subscription.current_period_start * 1000);
      const lastResetDate = subscriber?.last_reset_date ? new Date(subscriber.last_reset_date) : null;
      
      if (!lastResetDate || currentPeriodStart > lastResetDate) {
        readingsRemaining = 4;
        
        // Update with reset
        await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/subscribers`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            email: user.email,
            user_id: user.id,
            stripe_customer_id: customerId,
            subscribed: hasActiveSub,
            subscription_tier: subscriptionTier,
            subscription_end: subscriptionEnd,
            readings_remaining: readingsRemaining,
            last_reset_date: currentPeriodStart.toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });
      } else {
        readingsRemaining = subscriber?.readings_remaining || 0;
      }
    }

    // Update subscriber record
    await fetch(`${Deno.env.get("SUPABASE_URL")}/rest/v1/subscribers`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: customerId,
        subscribed: hasActiveSub,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        readings_remaining: readingsRemaining,
        updated_at: new Date().toISOString(),
      }),
    });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      readings_remaining: readingsRemaining
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in check-subscription:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

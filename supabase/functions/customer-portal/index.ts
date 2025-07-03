
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

    // Find the Stripe customer
    const customersResponse = await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(user.email)}&limit=1`, {
      headers: {
        "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
      },
    });

    const customersData = await customersResponse.json();
    const customers = customersData.data || [];
    if (customers.length === 0) {
      throw new Error("No Stripe customer found for this user");
    }

    const customerId = customers[0].id;

    // Create a portal session
    const portalData = {
      customer: customerId,
      return_url: `${req.headers.get("origin")}/dashboard`,
    };

    const portalResponse = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("STRIPE_SECRET_KEY")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(portalData).toString(),
    });

    const portalSession = await portalResponse.json();

    // Log the cancellation access for notification purposes
    console.log(`User ${user.email} accessed subscription cancellation portal`);

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Customer portal error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

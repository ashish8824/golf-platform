// supabase/functions/create-checkout/index.ts
import Stripe from "https://esm.sh/stripe@14.0.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-04-10",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, priceId, plan } = await req.json();
    console.log("Creating checkout for:", { userId, email, priceId, plan });

    if (!priceId || !userId || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const customer = await stripe.customers.create({
      email: email,
      metadata: { supabase_user_id: userId },
    });

    console.log("Created Stripe customer:", customer.id);

    const origin =
      req.headers.get("origin") ??
      Deno.env.get("SITE_URL") ??
      "https://golf-platform-zeta.vercel.app";

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/signup?payment=cancelled`,
      metadata: {
        supabase_user_id: userId,
        plan: plan ?? "monthly",
      },
      subscription_data: {
        metadata: { supabase_user_id: userId },
      },
    });

    console.log("Created session:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Function error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

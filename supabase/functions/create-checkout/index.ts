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
    const body = await req.json();
    const { userId, email, priceId, plan } = body;

    console.log("Request received:", { userId, email, priceId, plan });

    if (!priceId || !userId || !email) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          received: { userId, email, priceId },
        }),
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

    const origin =
      req.headers.get("origin") ??
      Deno.env.get("SITE_URL") ??
      "https://golf-platform-zeta.vercel.app";

    console.log("Using origin:", origin);

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

    console.log("Session created:", session.id, session.url);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

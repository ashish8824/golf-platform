// supabase/functions/stripe-webhook/index.ts
// Stripe calls this URL when subscription events happen.
// We verify the request is genuinely from Stripe (using the webhook secret),
// then update our database accordingly.

import Stripe from "https://esm.sh/stripe@14.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-04-10",
});

// Service role key bypasses RLS — safe here because this runs server-side
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    // Verify the event actually came from Stripe (not a fake request)
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  // Helper: find our user by Stripe customer ID
  async function getUserByCustomerId(customerId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("customer_id", customerId)
      .single();
    return data;
  }

  // Handle each event type
  switch (event.type) {
    case "checkout.session.completed": {
      // Payment went through — activate the subscription
      const session = event.data.object as Stripe.CheckoutSession;
      const userId = session.metadata?.supabase_user_id;
      const plan = session.metadata?.plan;

      if (!userId) break;

      await supabase
        .from("profiles")
        .update({
          subscription_status: "active",
          subscription_plan: plan,
          subscription_id: session.subscription as string,
          customer_id: session.customer as string,
        })
        .eq("id", userId);

      // Log the event
      await supabase.from("subscription_events").insert({
        user_id: userId,
        event_type: "created",
        stripe_event_id: event.id,
        amount: (session.amount_total ?? 0) / 100, // Stripe uses pence — convert to pounds
      });
      break;
    }

    case "invoice.paid": {
      // Subscription renewed successfully
      const invoice = event.data.object as Stripe.Invoice;
      const user = await getUserByCustomerId(invoice.customer as string);
      if (!user) break;

      await supabase
        .from("profiles")
        .update({
          subscription_status: "active", // In case it was lapsed
        })
        .eq("id", user.id);

      await supabase.from("subscription_events").insert({
        user_id: user.id,
        event_type: "renewed",
        stripe_event_id: event.id,
        amount: invoice.amount_paid / 100,
      });
      break;
    }

    case "invoice.payment_failed": {
      // Payment failed — mark as lapsed (restricted access)
      const invoice = event.data.object as Stripe.Invoice;
      const user = await getUserByCustomerId(invoice.customer as string);
      if (!user) break;

      await supabase
        .from("profiles")
        .update({
          subscription_status: "lapsed",
        })
        .eq("id", user.id);

      await supabase.from("subscription_events").insert({
        user_id: user.id,
        event_type: "lapsed",
        stripe_event_id: event.id,
      });
      break;
    }

    case "customer.subscription.deleted": {
      // Subscription cancelled — mark as cancelled
      const subscription = event.data.object as Stripe.Subscription;
      const user = await getUserByCustomerId(subscription.customer as string);
      if (!user) break;

      await supabase
        .from("profiles")
        .update({
          subscription_status: "cancelled",
          subscription_id: null,
        })
        .eq("id", user.id);

      await supabase.from("subscription_events").insert({
        user_id: user.id,
        event_type: "cancelled",
        stripe_event_id: event.id,
      });
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

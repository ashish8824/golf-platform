// src/lib/stripe.ts
// Loads the Stripe.js library.
// We use this on the frontend only for redirecting to Stripe Checkout.
// The actual checkout session is CREATED on the backend (for security).

import { loadStripe } from "@stripe/stripe-js";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Missing Stripe publishable key. Check your .env.local file.",
  );
}

// loadStripe is async and loads Stripe's JS SDK from their CDN
// We export the promise — components can await it when needed
export const stripePromise = loadStripe(publishableKey);

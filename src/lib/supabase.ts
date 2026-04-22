// src/lib/supabase.ts
// This file creates a single Supabase client instance.
// We import this wherever we need to talk to the database or handle auth.

import { createClient } from "@supabase/supabase-js";

// These come from your .env.local file
// VITE_ prefix is required for Vite to expose them to the browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that env vars are set — helpful during development
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Check your .env.local file.",
  );
}

// createClient sets up the connection to your Supabase project
// The anon key is safe to use in the browser — RLS policies protect the data
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

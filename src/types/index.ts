// src/types/index.ts
// TypeScript types that match our Supabase database tables.
// Using these everywhere prevents bugs and gives us autocomplete.

export type SubscriptionStatus = "active" | "inactive" | "cancelled" | "lapsed";
export type SubscriptionPlan = "monthly" | "yearly";
export type UserRole = "user" | "admin";
export type DrawStatus = "pending" | "simulated" | "published";
export type DrawType = "random" | "algorithmic";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type PayoutStatus = "pending" | "paid";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  subscription_status: SubscriptionStatus;
  subscription_plan?: SubscriptionPlan;
  subscription_id?: string; // Stripe subscription ID
  customer_id?: string; // Stripe customer ID
  charity_id?: string;
  charity_percentage: number;
  role: UserRole;
  created_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  website?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export interface CharityEvent {
  id: string;
  charity_id: string;
  title: string;
  event_date: string;
  description?: string;
  created_at: string;
}

export interface Score {
  id: string;
  user_id: string;
  score: number; // 1–45 Stableford
  played_on: string; // Date string e.g. "2025-04-15"
  created_at: string;
}

export interface Draw {
  id: string;
  month: string; // e.g. "2025-04-01"
  status: DrawStatus;
  draw_type: DrawType;
  drawn_numbers?: number[]; // 5 numbers
  jackpot_amount: number;
  pool_4match: number;
  pool_3match: number;
  total_subscribers: number;
  total_pool: number;
  jackpot_rolled_over: boolean;
  published_at?: string;
  created_at: string;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  score_snapshot?: number[];
  match_count: number;
  is_winner: boolean;
  prize_amount: number;
  created_at: string;
}

export interface WinnerVerification {
  id: string;
  draw_entry_id: string;
  user_id: string;
  proof_url?: string;
  status: VerificationStatus;
  payout_status: PayoutStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

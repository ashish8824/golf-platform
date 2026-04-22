// src/pages/admin/ReportsPage.tsx
// Summary statistics for the admin — total users, prize pools, charity totals.

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface Stats {
  totalUsers: number;
  activeSubscribers: number;
  totalPrizePool: number;
  totalCharityContributions: number;
  totalDraws: number;
  totalWinners: number;
  totalPaidOut: number;
}

export default function ReportsPage() {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  async function loadStats() {
    setFetching(true);
    const token =
      accessToken ?? sessionStorage.getItem("golf_access") ?? ANON_KEY;

    try {
      // Fetch all data in parallel for speed
      const [profilesRes, drawsRes, winnersRes] = await Promise.all([
        fetch(
          `${SUPABASE_URL}/rest/v1/profiles?select=subscription_status,charity_percentage,subscription_plan`,
          {
            headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
          },
        ),
        fetch(`${SUPABASE_URL}/rest/v1/draws?select=total_pool,status`, {
          headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
        }),
        fetch(
          `${SUPABASE_URL}/rest/v1/winner_verifications?select=payout_status,status`,
          {
            headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
          },
        ),
      ]);

      const profiles = await profilesRes.json();
      const draws = await drawsRes.json();
      const winners = await winnersRes.json();

      const activeProfiles = Array.isArray(profiles)
        ? profiles.filter(
            (p: { subscription_status: string }) =>
              p.subscription_status === "active",
          )
        : [];

      // Estimate charity contributions (avg charity % × monthly fee × active users)
      const avgCharityPct =
        activeProfiles.length > 0
          ? activeProfiles.reduce(
              (sum: number, p: { charity_percentage: number }) =>
                sum + (p.charity_percentage ?? 10),
              0,
            ) / activeProfiles.length
          : 10;
      const charityTotal = activeProfiles.length * 9.99 * (avgCharityPct / 100);

      setStats({
        totalUsers: Array.isArray(profiles) ? profiles.length : 0,
        activeSubscribers: activeProfiles.length,
        totalPrizePool: Array.isArray(draws)
          ? draws.reduce(
              (sum: number, d: { total_pool: number }) =>
                sum + (d.total_pool ?? 0),
              0,
            )
          : 0,
        totalCharityContributions: charityTotal,
        totalDraws: Array.isArray(draws)
          ? draws.filter((d: { status: string }) => d.status === "published")
              .length
          : 0,
        totalWinners: Array.isArray(winners) ? winners.length : 0,
        totalPaidOut: Array.isArray(winners)
          ? winners.filter(
              (w: { payout_status: string }) => w.payout_status === "paid",
            ).length
          : 0,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setFetching(false);
    }
  }

  if (fetching) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { label: "Total users", value: stats.totalUsers, icon: "👥" },
    { label: "Active subscribers", value: stats.activeSubscribers, icon: "✅" },
    {
      label: "Total prize pool (all time)",
      value: `£${stats.totalPrizePool.toFixed(2)}`,
      icon: "💰",
    },
    {
      label: "Charity contributions (est.)",
      value: `£${stats.totalCharityContributions.toFixed(2)}`,
      icon: "💚",
    },
    { label: "Draws published", value: stats.totalDraws, icon: "🎰" },
    { label: "Total winners", value: stats.totalWinners, icon: "🏆" },
    { label: "Payouts completed", value: stats.totalPaidOut, icon: "💸" },
    {
      label: "Monthly revenue (est.)",
      value: `£${(stats.activeSubscribers * 9.99).toFixed(2)}`,
      icon: "📈",
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-bold text-stone-800 text-lg">Platform Reports</h2>
        <p className="text-stone-500 text-sm">
          Overview of key platform metrics.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-stone-200 p-4"
          >
            <p className="text-2xl mb-1">{card.icon}</p>
            <p className="text-2xl font-bold text-stone-800">{card.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

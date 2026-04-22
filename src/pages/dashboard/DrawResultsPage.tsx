// src/pages/dashboard/DrawResultsPage.tsx
// Shows users all published draws and their personal results for each.
// Users can see which numbers were drawn, how many they matched, and prize amounts.

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import type { Draw, DrawEntry } from "../../types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function DrawResultsPage() {
  const { userId, accessToken } = useAuth();

  const [draws, setDraws] = useState<Draw[]>([]);
  const [myEntries, setMyEntries] = useState<Record<string, DrawEntry>>({});
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (userId && accessToken) loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, accessToken]);

  async function loadData() {
    setFetching(true);
    const token =
      accessToken ?? sessionStorage.getItem("golf_access") ?? ANON_KEY;

    try {
      // Load all published draws (most recent first)
      const drawsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/draws?status=eq.published&order=month.desc`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` } },
      );
      const drawsData = await drawsRes.json();

      // Load this user's draw entries
      const entriesRes = await fetch(
        `${SUPABASE_URL}/rest/v1/draw_entries?user_id=eq.${userId}&select=*`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` } },
      );
      const entriesData = await entriesRes.json();

      if (Array.isArray(drawsData)) setDraws(drawsData);

      // Convert entries array to a map keyed by draw_id for quick lookup
      if (Array.isArray(entriesData)) {
        const map: Record<string, DrawEntry> = {};
        for (const entry of entriesData) {
          map[entry.draw_id] = entry;
        }
        setMyEntries(map);
      }
    } catch (err) {
      console.error("Failed to load draw data:", err);
    } finally {
      setFetching(false);
    }
  }

  // Format date e.g. "April 2026"
  function formatMonth(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  }

  // Show match result badge with colour coding
  function matchBadge(matchCount: number) {
    if (matchCount === 5)
      return (
        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-bold">
          🏆 5 Match — Jackpot!
        </span>
      );
    if (matchCount === 4)
      return (
        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">
          🥈 4 Match
        </span>
      );
    if (matchCount === 3)
      return (
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
          🥉 3 Match
        </span>
      );
    return (
      <span className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
        No match
      </span>
    );
  }

  if (fetching) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Draw Results</h1>
        <p className="text-stone-500 text-sm mt-1">
          See the results of each monthly draw and how your scores performed.
        </p>
      </div>

      {draws.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
          <p className="text-4xl mb-3">🎰</p>
          <p className="text-stone-600 font-medium">No draws published yet</p>
          <p className="text-stone-400 text-sm mt-1">
            Check back after the monthly draw is run.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map((draw) => {
            const myEntry = myEntries[draw.id];

            return (
              <div
                key={draw.id}
                className="bg-white rounded-2xl border border-stone-200 p-5"
              >
                {/* Draw header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-bold text-stone-800 text-lg">
                      {formatMonth(draw.month)} Draw
                    </h2>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {draw.total_subscribers} subscribers · Total pool: £
                      {draw.total_pool.toFixed(2)}
                    </p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    Published
                  </span>
                </div>

                {/* Drawn numbers */}
                <div className="mb-4">
                  <p className="text-xs text-stone-500 font-medium mb-2 uppercase tracking-wide">
                    Numbers Drawn
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {draw.drawn_numbers?.map((num) => (
                      <div
                        key={num}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                          ${
                            myEntry?.score_snapshot?.includes(num)
                              ? "bg-green-600 text-white" // Highlight matched numbers
                              : "bg-stone-100 text-stone-700"
                          }`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prize tiers */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    {
                      label: "Jackpot (5)",
                      amount: draw.jackpot_amount,
                      rolled: draw.jackpot_rolled_over,
                    },
                    {
                      label: "4 Match",
                      amount: draw.pool_4match,
                      rolled: false,
                    },
                    {
                      label: "3 Match",
                      amount: draw.pool_3match,
                      rolled: false,
                    },
                  ].map((tier) => (
                    <div
                      key={tier.label}
                      className="bg-stone-50 rounded-xl p-3 text-center"
                    >
                      <p className="text-xs text-stone-500">{tier.label}</p>
                      <p className="font-bold text-stone-800 text-sm mt-0.5">
                        £{tier.amount.toFixed(2)}
                      </p>
                      {tier.rolled && (
                        <p className="text-xs text-purple-500 mt-0.5">
                          Rolled over
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* My result */}
                <div className="border-t border-stone-100 pt-3">
                  <p className="text-xs text-stone-500 font-medium mb-2 uppercase tracking-wide">
                    My Result
                  </p>
                  {myEntry ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {matchBadge(myEntry.match_count)}
                        <span className="text-xs text-stone-500">
                          My scores: [{myEntry.score_snapshot?.join(", ")}]
                        </span>
                      </div>
                      {myEntry.is_winner && (
                        <span className="text-sm font-bold text-green-700">
                          +£{myEntry.prize_amount.toFixed(2)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-stone-400">
                      You had no scores entered for this draw.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

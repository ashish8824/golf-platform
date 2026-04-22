// src/pages/admin/DrawManager.tsx
// Admin tool to create, simulate, and publish monthly draws.
// Draw logic: 5 numbers are drawn. Users' scores are compared.
// Match 3 = small prize, Match 4 = medium prize, Match 5 = jackpot.

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import type { Draw } from "../../types";
import Button from "../../components/ui/Button";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function DrawManager() {
  const { accessToken } = useAuth();

  const [draws, setDraws] = useState<Draw[]>([]);
  const [fetching, setFetching] = useState(true);
  const [creating, setCreating] = useState(false);
  const [simulating, setSimulating] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // "YYYY-MM"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDraws();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  async function loadDraws() {
    setFetching(true);
    const token = accessToken ?? sessionStorage.getItem("golf_access") ?? ANON_KEY;
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/draws?order=month.desc&limit=12`,
        {
          headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (Array.isArray(data)) setDraws(data);
    } catch (err) {
      console.error("Failed to load draws:", err);
    } finally {
      setFetching(false);
    }
  }

  // Generate 5 random numbers from 1-45 (Stableford range)
  function generateDrawNumbers(): number[] {
    const numbers: number[] = [];
    while (numbers.length < 5) {
      const n = Math.floor(Math.random() * 45) + 1;
      if (!numbers.includes(n)) numbers.push(n);
    }
    return numbers.sort((a, b) => a - b);
  }

  async function createDraw() {
    setCreating(true);
    setMessage("");
    const token = accessToken ?? sessionStorage.getItem("golf_access") ?? ANON_KEY;

    try {
      // Check if draw already exists for this month
      const checkRes = await fetch(
        `${SUPABASE_URL}/rest/v1/draws?month=eq.${selectedMonth}-01`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` } }
      );
      const existing = await checkRes.json();
      if (Array.isArray(existing) && existing.length > 0) {
        setMessage("❌ A draw already exists for this month.");
        return;
      }

      // Get total active subscribers count
      const subsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?subscription_status=eq.active&select=id`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` } }
      );
      const subs = await subsRes.json();
      const totalSubscribers = Array.isArray(subs) ? subs.length : 0;

      // Calculate prize pool (£9.99 per subscriber, 80% to prizes)
      const totalPool = totalSubscribers * 9.99;
      const prizePool = totalPool * 0.8;
      const jackpot = prizePool * 0.6;
      const pool4match = prizePool * 0.25;
      const pool3match = prizePool * 0.15;

      const res = await fetch(`${SUPABASE_URL}/rest/v1/draws`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
          Authorization: `Bearer ${token}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          month: `${selectedMonth}-01`,
          status: "pending",
          draw_type: "random",
          total_subscribers: totalSubscribers,
          total_pool: totalPool,
          jackpot_amount: jackpot,
          pool_4match: pool4match,
          pool_3match: pool3match,
          jackpot_rolled_over: false,
        }),
      });

      if (!res.ok) {
        setMessage("❌ Failed to create draw.");
        return;
      }

      setMessage(`✅ Draw created for ${selectedMonth} with ${totalSubscribers} subscribers.`);
      await loadDraws();
    } catch (err) {
      console.error("Create draw error:", err);
      setMessage("❌ Something went wrong.");
    } finally {
      setCreating(false);
    }
  }

  async function simulateDraw(draw: Draw) {
    setSimulating(draw.id);
    setMessage("");
    const token = accessToken ?? sessionStorage.getItem("golf_access") ?? ANON_KEY;

    try {
      // Generate 5 winning numbers
      const drawnNumbers = generateDrawNumbers();

      // Get all active subscribers with their scores
      const scoresRes = await fetch(
        `${SUPABASE_URL}/rest/v1/scores?select=user_id,score,played_on&order=played_on.desc`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` } }
      );
      const allScores = await scoresRes.json();

      // Group scores by user (keep last 5 per user)
      const userScoresMap: Record<string, number[]> = {};
      if (Array.isArray(allScores)) {
        for (const s of allScores) {
          if (!userScoresMap[s.user_id]) userScoresMap[s.user_id] = [];
          if (userScoresMap[s.user_id].length < 5) {
            userScoresMap[s.user_id].push(s.score);
          }
        }
      }

      // Calculate matches for each user
      const entries = Object.entries(userScoresMap).map(([userId, scores]) => {
        const matchCount = scores.filter((s) => drawnNumbers.includes(s)).length;
        const isWinner = matchCount >= 3;
        let prizeAmount = 0;
        if (matchCount === 5) prizeAmount = draw.jackpot_amount;
        else if (matchCount === 4) prizeAmount = draw.pool_4match / Math.max(1, Object.values(userScoresMap).filter(sc => sc.filter(s => drawnNumbers.includes(s)).length === 4).length);
        else if (matchCount === 3) prizeAmount = draw.pool_3match / Math.max(1, Object.values(userScoresMap).filter(sc => sc.filter(s => drawnNumbers.includes(s)).length === 3).length);

        return { user_id: userId, score_snapshot: scores, match_count: matchCount, is_winner: isWinner, prize_amount: prizeAmount, draw_id: draw.id };
      });

      // Check if jackpot was won
      const jackpotWon = entries.some((e) => e.match_count === 5);

      // Delete old entries for this draw if re-simulating
      await fetch(`${SUPABASE_URL}/rest/v1/draw_entries?draw_id=eq.${draw.id}`, {
        method: "DELETE",
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
      });

      // Insert draw entries
      if (entries.length > 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/draw_entries`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: ANON_KEY,
            Authorization: `Bearer ${token}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify(entries),
        });
      }

      // Update draw with results
      await fetch(`${SUPABASE_URL}/rest/v1/draws?id=eq.${draw.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          drawn_numbers: drawnNumbers,
          status: "simulated",
          jackpot_rolled_over: !jackpotWon,
        }),
      });

      const winners = entries.filter((e) => e.is_winner);
      setMessage(`✅ Draw simulated! Numbers: [${drawnNumbers.join(", ")}]. Winners: ${winners.length}. Jackpot ${jackpotWon ? "WON! 🎉" : "rolled over."}`);
      await loadDraws();
    } catch (err) {
      console.error("Simulate draw error:", err);
      setMessage("❌ Simulation failed.");
    } finally {
      setSimulating(null);
    }
  }

  async function publishDraw(drawId: string) {
    setPublishing(drawId);
    setMessage("");
    const token = accessToken ?? sessionStorage.getItem("golf_access") ?? ANON_KEY;

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/draws?id=eq.${drawId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "published",
          published_at: new Date().toISOString(),
        }),
      });

      setMessage("✅ Draw published! Users can now see the results.");
      await loadDraws();
    } catch (err) {
      console.error("Publish error:", err);
      setMessage("❌ Failed to publish.");
    } finally {
      setPublishing(null);
    }
  }

  function formatMonth(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  }

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700",
      simulated: "bg-blue-100 text-blue-700",
      published: "bg-green-100 text-green-700",
    };
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] ?? "bg-stone-100 text-stone-600"}`}>
        {status}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create new draw */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-800 mb-4">Create Monthly Draw</h2>
        <div className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1.5">
              Draw month
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>
          <Button onClick={createDraw} isLoading={creating}>
            Create Draw
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-xl text-sm ${
          message.startsWith("✅")
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-600"
        }`}>
          {message}
        </div>
      )}

      {/* Draws list */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-800 mb-4">All Draws</h2>

        {fetching ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : draws.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🎰</p>
            <p className="text-stone-500 text-sm">No draws yet. Create one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {draws.map((draw) => (
              <div
                key={draw.id}
                className="border border-stone-200 rounded-xl p-4"
              >
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-stone-800">
                        {formatMonth(draw.month)}
                      </span>
                      {statusBadge(draw.status)}
                      {draw.jackpot_rolled_over && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          Jackpot rolled over
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-500 space-y-0.5">
                      <p>{draw.total_subscribers} subscribers · Pool: £{draw.total_pool.toFixed(2)}</p>
                      <p>Jackpot: £{draw.jackpot_amount.toFixed(2)} · 4-match: £{draw.pool_4match.toFixed(2)} · 3-match: £{draw.pool_3match.toFixed(2)}</p>
                      {draw.drawn_numbers && (
                        <p className="font-medium text-stone-700 mt-1">
                          Numbers drawn: [{draw.drawn_numbers.join(", ")}]
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {draw.status === "pending" && (
                      <Button
                        variant="secondary"
                        onClick={() => simulateDraw(draw)}
                        isLoading={simulating === draw.id}
                      >
                        Run Draw
                      </Button>
                    )}
                    {draw.status === "simulated" && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => simulateDraw(draw)}
                          isLoading={simulating === draw.id}
                        >
                          Re-run
                        </Button>
                        <Button
                          onClick={() => publishDraw(draw.id)}
                          isLoading={publishing === draw.id}
                        >
                          Publish
                        </Button>
                      </>
                    )}
                    {draw.status === "published" && (
                      <span className="text-xs text-green-600 font-medium self-center">
                        ✓ Live
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
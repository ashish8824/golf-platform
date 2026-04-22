import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface WinnerRecord {
  id: string;
  draw_entry_id: string;
  user_id: string;
  proof_url?: string;
  status: string;
  payout_status: string;
  created_at: string;
  match_count?: number;
  prize_amount?: number;
  full_name?: string;
  email?: string;
  draw_month?: string;
}

export default function WinnersManager() {
  const { accessToken } = useAuth();

  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadWinners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  async function loadWinners() {
    setFetching(true);
    const token =
      accessToken ?? sessionStorage.getItem("golf_access") ?? ANON_KEY;

    try {
      const verRes = await fetch(
        `${SUPABASE_URL}/rest/v1/winner_verifications?order=created_at.desc`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` } },
      );
      const verifications = await verRes.json();

      if (!Array.isArray(verifications) || verifications.length === 0) {
        setWinners([]);
        setFetching(false);
        return;
      }

      const entryIds = verifications
        .map((v: WinnerRecord) => v.draw_entry_id)
        .join(",");
      const entriesRes = await fetch(
        `${SUPABASE_URL}/rest/v1/draw_entries?id=in.(${entryIds})&select=id,match_count,prize_amount,draw_id,user_id`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` } },
      );
      const entries = await entriesRes.json();

      const userIds = [
        ...new Set(verifications.map((v: WinnerRecord) => v.user_id)),
      ].join(",");
      const profilesRes = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=in.(${userIds})&select=id,full_name,email`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` } },
      );
      const profiles = await profilesRes.json();

      const drawIds = Array.isArray(entries)
        ? [...new Set(entries.map((e: { draw_id: string }) => e.draw_id))].join(
            ",",
          )
        : "";

      let drawMap: Record<string, string> = {};
      if (drawIds) {
        const drawsRes = await fetch(
          `${SUPABASE_URL}/rest/v1/draws?id=in.(${drawIds})&select=id,month`,
          { headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` } },
        );
        const draws = await drawsRes.json();
        if (Array.isArray(draws)) {
          for (const d of draws) drawMap[d.id] = d.month;
        }
      }

      const merged: WinnerRecord[] = verifications.map((ver: WinnerRecord) => {
        const entry = Array.isArray(entries)
          ? entries.find((e: { id: string }) => e.id === ver.draw_entry_id)
          : null;
        const profile = Array.isArray(profiles)
          ? profiles.find((p: { id: string }) => p.id === ver.user_id)
          : null;
        return {
          ...ver,
          match_count: entry?.match_count,
          prize_amount: entry?.prize_amount,
          full_name: profile?.full_name,
          email: profile?.email,
          draw_month: entry?.draw_id ? drawMap[entry.draw_id] : undefined,
        };
      });

      setWinners(merged);
    } catch (err) {
      console.error("Failed to load winners:", err);
    } finally {
      setFetching(false);
    }
  }

  async function updateVerification(
    id: string,
    status: "approved" | "rejected",
  ) {
    setActionLoading(id);
    setMessage("");
    const token =
      accessToken ?? sessionStorage.getItem("golf_access") ?? ANON_KEY;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/winner_verifications?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, reviewed_at: new Date().toISOString() }),
      });
      setMessage(`✅ Verification ${status}.`);
      await loadWinners();
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update.");
    } finally {
      setActionLoading(null);
    }
  }

  async function markAsPaid(id: string) {
    setActionLoading(id + "-pay");
    const token =
      accessToken ?? sessionStorage.getItem("golf_access") ?? ANON_KEY;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/winner_verifications?id=eq.${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ payout_status: "paid" }),
      });
      setMessage("✅ Marked as paid.");
      await loadWinners();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  function formatMonth(dateStr?: string) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  }

  // Render proof link as a separate named function to avoid JSX parsing issues
  function ProofLink({ url }: { url?: string }) {
    if (!url) {
      return (
        <p className="text-xs text-stone-400 mb-3">No proof uploaded yet.</p>
      );
    }
    return (
      <div className="mb-3">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-green-600 hover:underline"
        >
          📎 View proof screenshot →
        </a>
      </div>
    );
  }

  const filtered =
    filter === "all" ? winners : winners.filter((w) => w.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-stone-800 text-lg">
            Winner Verifications
          </h2>
          <p className="text-stone-500 text-sm">
            Review proof submissions and manage payouts.
          </p>
        </div>
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                filter === f
                  ? "bg-white text-green-900 shadow-sm"
                  : "text-stone-500"
              }`}
            >
              {f}
              {f !== "all" && (
                <span className="ml-1 text-stone-400">
                  ({winners.filter((w) => w.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-sm ${
            message.startsWith("✅")
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-600"
          }`}
        >
          {message}
        </div>
      )}

      {fetching ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-stone-500 text-sm">
            No {filter === "all" ? "" : filter} verifications found.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((winner) => (
            <div
              key={winner.id}
              className="bg-white rounded-2xl border border-stone-200 p-5"
            >
              <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                <div>
                  <p className="font-semibold text-stone-800">
                    {winner.full_name ?? "Unknown user"}
                  </p>
                  <p className="text-xs text-stone-400">{winner.email}</p>
                  <p className="text-xs text-stone-500 mt-1">
                    {formatMonth(winner.draw_month)} · {winner.match_count}
                    -match ·{" "}
                    <span className="font-medium text-green-700">
                      £{(winner.prize_amount ?? 0).toFixed(2)}
                    </span>
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      winner.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : winner.status === "rejected"
                          ? "bg-red-100 text-red-600"
                          : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {winner.status}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      winner.payout_status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {winner.payout_status === "paid" ? "💰 Paid" : "Unpaid"}
                  </span>
                </div>
              </div>

              <ProofLink url={winner.proof_url} />

              <div className="flex gap-2 flex-wrap">
                {winner.status === "pending" && winner.proof_url && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() => updateVerification(winner.id, "approved")}
                      isLoading={actionLoading === winner.id}
                      className="text-sm"
                    >
                      ✓ Approve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => updateVerification(winner.id, "rejected")}
                      isLoading={actionLoading === winner.id}
                      className="text-sm"
                    >
                      ✗ Reject
                    </Button>
                  </>
                )}
                {winner.status === "approved" &&
                  winner.payout_status !== "paid" && (
                    <Button
                      variant="secondary"
                      onClick={() => markAsPaid(winner.id)}
                      isLoading={actionLoading === winner.id + "-pay"}
                      className="text-sm"
                    >
                      💰 Mark as Paid
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

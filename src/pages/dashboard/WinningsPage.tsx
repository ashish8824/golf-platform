import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface WinRecord {
  id: string;
  draw_id: string;
  match_count: number;
  prize_amount: number;
  is_winner: boolean;
  score_snapshot: number[];
  verification_id?: string;
  proof_url?: string;
  verification_status?: string;
  payout_status?: string;
  draw_month?: string;
}

export default function WinningsPage() {
  const { userId, accessToken } = useAuth();
  const [wins, setWins] = useState<WinRecord[]>([]);
  const [fetching, setFetching] = useState(true);
  const [totalWon, setTotalWon] = useState(0);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    if (userId && accessToken) loadWinnings();
  }, [userId, accessToken]);

  async function loadWinnings() {
    setFetching(true);
    const token = accessToken ?? ANON_KEY;
    try {
      const r1 = await fetch(
        `${SUPABASE_URL}/rest/v1/draw_entries?user_id=eq.${userId}&is_winner=eq.true&order=created_at.desc`,
        { headers: { apikey: ANON_KEY, Authorization: "Bearer " + token } },
      );
      const entries = await r1.json();
      if (!Array.isArray(entries) || entries.length === 0) {
        setWins([]);
        setFetching(false);
        return;
      }
      const ids = entries.map((e: WinRecord) => e.id).join(",");
      const r2 = await fetch(
        `${SUPABASE_URL}/rest/v1/winner_verifications?draw_entry_id=in.(${ids})`,
        { headers: { apikey: ANON_KEY, Authorization: "Bearer " + token } },
      );
      const vers = await r2.json();
      const dids = [...new Set(entries.map((e: WinRecord) => e.draw_id))];
      const r3 = await fetch(
        `${SUPABASE_URL}/rest/v1/draws?id=in.(${dids.join(",")})&select=id,month`,
        { headers: { apikey: ANON_KEY, Authorization: "Bearer " + token } },
      );
      const draws = await r3.json();
      const dm: Record<string, string> = {};
      if (Array.isArray(draws)) {
        for (const d of draws) dm[d.id] = d.month;
      }
      const merged: WinRecord[] = entries.map((entry: WinRecord) => {
        const ver = Array.isArray(vers)
          ? vers.find(
              (v: { draw_entry_id: string }) => v.draw_entry_id === entry.id,
            )
          : null;
        return {
          ...entry,
          proof_url: ver?.proof_url,
          verification_status: ver?.status ?? "pending",
          payout_status: ver?.payout_status ?? "pending",
          draw_month: dm[entry.draw_id],
        };
      });
      setWins(merged);
      setTotalWon(merged.reduce((s, w) => s + (w.prize_amount ?? 0), 0));
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }

  async function handleUpload(entryId: string, file: File) {
    setUploadingFor(entryId);
    const token = accessToken ?? ANON_KEY;
    try {
      const name = `proofs/${userId}/${entryId}-${Date.now()}.${file.name.split(".").pop()}`;
      const up = await fetch(
        `${SUPABASE_URL}/storage/v1/object/winner-proofs/${name}`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": file.type,
          },
          body: file,
        },
      );
      if (!up.ok) {
        setUploadMessage("Upload failed.");
        return;
      }
      const url = `${SUPABASE_URL}/storage/v1/object/public/winner-proofs/${name}`;
      await fetch(`${SUPABASE_URL}/rest/v1/winner_verifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
          Authorization: "Bearer " + token,
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify({
          draw_entry_id: entryId,
          user_id: userId,
          proof_url: url,
          status: "pending",
          payout_status: "pending",
        }),
      });
      setUploadMessage("Proof uploaded! Admin will review shortly.");
      await loadWinnings();
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingFor(null);
    }
  }

  function fmt(d?: string) {
    if (!d) return "Unknown";
    return new Date(d).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
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
        <h1 className="text-2xl font-bold text-stone-900">My Winnings</h1>
        <p className="text-stone-500 text-sm mt-1">
          Your prize history and payout status.
        </p>
      </div>

      <div className="bg-green-800 rounded-2xl p-5 text-white">
        <p className="text-green-300 text-sm">Total prize money won</p>
        <p className="text-4xl font-bold mt-1">£{totalWon.toFixed(2)}</p>
        <p className="text-green-300 text-sm mt-1">
          Across {wins.length} prize{wins.length !== 1 ? "s" : ""}
        </p>
      </div>

      {uploadMessage && (
        <div
          className={`p-3 rounded-xl text-sm ${
            uploadMessage.toLowerCase().includes("fail") ||
            uploadMessage.toLowerCase().includes("wrong")
              ? "bg-red-50 border border-red-200 text-red-600"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}
        >
          {uploadMessage}
        </div>
      )}

      {wins.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center">
          <p className="text-4xl mb-3">🏆</p>
          <p className="text-stone-600 font-medium">No winnings yet</p>
          <p className="text-stone-400 text-sm mt-1">
            Keep entering scores to join monthly draws!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {wins.map((win) => (
            <div
              key={win.id}
              className="bg-white rounded-2xl border border-stone-200 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-stone-800">
                    {fmt(win.draw_month)} Draw
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {win.match_count}-number match
                  </p>
                </div>
                <p className="text-xl font-bold text-green-700">
                  £{win.prize_amount.toFixed(2)}
                </p>
              </div>

              <div className="flex gap-2 flex-wrap mb-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    win.verification_status === "approved"
                      ? "bg-green-100 text-green-700"
                      : win.verification_status === "rejected"
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {win.verification_status === "approved"
                    ? "Approved"
                    : win.verification_status === "rejected"
                      ? "Rejected"
                      : "Pending review"}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    win.payout_status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {win.payout_status === "paid" ? "Paid" : "Awaiting payment"}
                </span>
              </div>

              {win.proof_url && (
                <div className="mt-2 p-2 bg-stone-50 rounded-xl flex items-center gap-2">
                  <span className="text-green-600 text-sm">✓</span>
                  <span className="text-xs text-stone-600">
                    Proof submitted
                  </span>
                  <button
                    onClick={() => window.open(win.proof_url, "_blank")}
                    className="text-xs text-green-600 hover:underline ml-auto"
                  >
                    View
                  </button>
                </div>
              )}

              {!win.proof_url && win.verification_status === "pending" && (
                <div className="border border-dashed border-stone-300 rounded-xl p-3 mt-2">
                  <p className="text-sm text-stone-600 mb-2">
                    Upload a screenshot to verify your scores.
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(win.id, f);
                      }}
                    />
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium border transition-all ${uploadingFor === win.id ? "bg-stone-100 text-stone-400" : "bg-white border-stone-300 hover:bg-stone-50 text-stone-700"}`}
                    >
                      {uploadingFor === win.id
                        ? "Uploading..."
                        : "Upload proof"}
                    </span>
                  </label>
                </div>
              )}

              {win.verification_status === "rejected" && (
                <div className="mt-2 p-2 bg-red-50 rounded-xl">
                  <p className="text-xs text-red-600 mb-1">
                    Proof rejected. Please re-upload a clearer screenshot.
                  </p>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(win.id, f);
                      }}
                    />
                    <span className="text-xs text-red-600 hover:underline cursor-pointer">
                      Re-upload proof
                    </span>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

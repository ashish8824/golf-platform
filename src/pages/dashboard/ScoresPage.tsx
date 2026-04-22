// src/pages/dashboard/ScoresPage.tsx
// Users enter their Stableford golf scores here.
// Rules: max 5 scores, newest score pushes out the oldest,
// score must be between 1 and 45.

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import type { Score } from "../../types";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function ScoresPage() {
  const { userId, accessToken } = useAuth();

  const [scores, setScores] = useState<Score[]>([]);
  const [newScore, setNewScore] = useState("");
  const [playedOn, setPlayedOn] = useState(
    new Date().toISOString().split("T")[0], // Today's date as default
  );
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load user's existing scores on mount
  useEffect(() => {
    if (userId && accessToken) loadScores();
  }, [userId, accessToken]);

  async function loadScores() {
    setFetching(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/scores?user_id=eq.${userId}&order=played_on.desc`,
        {
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const data = await res.json();
      if (Array.isArray(data)) setScores(data);
    } catch (err) {
      console.error("Failed to load scores:", err);
    } finally {
      setFetching(false);
    }
  }

  async function handleAddScore(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const scoreNum = parseInt(newScore);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError("Score must be between 1 and 45.");
      return;
    }

    if (!playedOn) {
      setError("Please select the date you played.");
      return;
    }

    setLoading(true);

    try {
      // If user already has 5 scores, delete the oldest before inserting
      // This implements the "rolling 5" rule
      if (scores.length >= 5) {
        const oldest = scores[scores.length - 1]; // scores are ordered desc
        await fetch(`${SUPABASE_URL}/rest/v1/scores?id=eq.${oldest.id}`, {
          method: "DELETE",
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }

      // Insert the new score
      const res = await fetch(`${SUPABASE_URL}/rest/v1/scores`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          user_id: userId,
          score: scoreNum,
          played_on: playedOn,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        // Handle duplicate date error
        if (err.code === "23505") {
          setError("You already have a score for this date.");
        } else {
          setError("Failed to save score. Please try again.");
        }
        return;
      }

      setSuccess("Score added successfully!");
      setNewScore("");
      setPlayedOn(new Date().toISOString().split("T")[0]);
      await loadScores(); // Refresh the list
    } catch (err) {
      console.error("Add score error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteScore(scoreId: string) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/scores?id=eq.${scoreId}`, {
        method: "DELETE",
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
        },
      });
      await loadScores();
    } catch (err) {
      console.error("Delete score error:", err);
    }
  }

  // Format date for display e.g. "21 Apr 2026"
  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">My Scores</h1>
        <p className="text-stone-500 text-sm mt-1">
          Enter your Stableford scores. Your last 5 scores are used in the
          monthly draw.
        </p>
      </div>

      {/* Add Score Form */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-800 mb-4">Add a Score</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            {success}
          </div>
        )}

        <form
          onSubmit={handleAddScore}
          className="flex gap-3 items-end flex-wrap"
        >
          <div className="flex-1 min-w-32">
            <Input
              label="Stableford score"
              type="number"
              min={1}
              max={45}
              placeholder="e.g. 36"
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-40">
            <Input
              label="Date played"
              type="date"
              value={playedOn}
              onChange={(e) => setPlayedOn(e.target.value)}
              max={new Date().toISOString().split("T")[0]} // Can't enter future dates
            />
          </div>
          <Button type="submit" isLoading={loading}>
            Add Score
          </Button>
        </form>
      </div>

      {/* Scores List */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-stone-800">
            Your Last {scores.length} Score{scores.length !== 1 ? "s" : ""}
          </h2>
          <span className="text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
            {scores.length}/5 slots used
          </span>
        </div>

        {fetching ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-4xl mb-2">⛳</p>
            <p className="text-stone-500 text-sm">
              No scores yet. Add your first score above!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {scores.map((score, index) => (
              <div
                key={score.id}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Position badge */}
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-semibold text-stone-900 text-lg">
                      {score.score}
                    </span>
                    <span className="text-stone-400 text-xs ml-1">pts</span>
                  </div>
                  <span className="text-stone-500 text-sm">
                    {formatDate(score.played_on)}
                  </span>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDeleteScore(score.id)}
                  className="text-stone-300 hover:text-red-400 transition-colors text-lg leading-none"
                  title="Remove score"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info about rolling system */}
        {scores.length === 5 && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2 mt-3">
            ⚠️ You have 5 scores. Adding a new one will remove your oldest score
            ({formatDate(scores[scores.length - 1].played_on)}).
          </p>
        )}
      </div>
    </div>
  );
}

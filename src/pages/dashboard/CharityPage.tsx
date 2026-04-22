// src/pages/dashboard/CharityPage.tsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import type { Charity } from "../../types";
import Button from "../../components/ui/Button";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function CharityPage() {
  const { userId, accessToken, profile } = useAuth();

  const [charities, setCharities] = useState<Charity[]>([]);
  const [selectedCharityId, setSelectedCharityId] = useState(
    profile?.charity_id ?? "",
  );
  const [charityPercentage, setCharityPercentage] = useState(
    profile?.charity_percentage ?? 10,
  );
  const [currentCharity, setCurrentCharity] = useState<Charity | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCharities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Replace the loadCharities function in CharityPage.tsx

  async function loadCharities() {
    setFetching(true);
    try {
      // Get token from sessionStorage directly as fallback
      const token =
        accessToken ?? sessionStorage.getItem("golf_access") ?? ANON_KEY;

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/charities?is_active=eq.true&order=name.asc`,
        {
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();
      console.log("Charities loaded:", data); // ← check this in console
      if (Array.isArray(data)) {
        setCharities(data);
        const current = data.find((c: Charity) => c.id === profile?.charity_id);
        if (current) setCurrentCharity(current);
        // Auto-select current charity
        if (profile?.charity_id) setSelectedCharityId(profile.charity_id);
      }
    } catch (err) {
      console.error("Failed to load charities:", err);
    } finally {
      setFetching(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedCharityId) {
      setError("Please select a charity.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            charity_id: selectedCharityId,
            charity_percentage: charityPercentage,
          }),
        },
      );

      if (!res.ok) {
        setError("Failed to save. Please try again.");
        return;
      }

      const newCharity = charities.find((c) => c.id === selectedCharityId);
      if (newCharity) setCurrentCharity(newCharity);
      setSuccess("Charity preferences saved successfully!");
    } catch (err) {
      console.error("Save charity error:", err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-2xl font-bold text-stone-900">My Charity</h1>
        <p className="text-stone-500 text-sm mt-1">
          Choose which charity receives a portion of your subscription. Minimum
          10%.
        </p>
      </div>

      {currentCharity && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-green-800 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white text-lg">💚</span>
          </div>
          <div>
            <p className="text-xs text-green-600 font-medium uppercase tracking-wide mb-0.5">
              Currently supporting
            </p>
            <p className="font-bold text-green-900 text-lg">
              {currentCharity.name}
            </p>
            {currentCharity.description && (
              <p className="text-green-700 text-sm mt-1">
                {currentCharity.description}
              </p>
            )}
            <p className="text-green-600 text-sm mt-2 font-medium">
              {profile?.charity_percentage ?? charityPercentage}% of your
              subscription goes here
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-800 mb-4">
          Update Preferences
        </h2>

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

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-stone-700 block mb-3">
              Select a charity
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {charities.map((charity) => (
                <label
                  key={charity.id}
                  className={[
                    "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    selectedCharityId === charity.id
                      ? "border-green-600 bg-green-50"
                      : "border-stone-200 hover:border-stone-300",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="charity"
                    value={charity.id}
                    checked={selectedCharityId === charity.id}
                    onChange={() => setSelectedCharityId(charity.id)}
                    className="mt-0.5 accent-green-700"
                  />
                  <div>
                    <p className="font-medium text-stone-800 text-sm">
                      {charity.name}
                    </p>
                    {charity.description && (
                      <p className="text-stone-500 text-xs mt-0.5">
                        {charity.description}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700 block mb-2">
              Donation percentage:{" "}
              <span className="text-green-700 font-bold">
                {charityPercentage}%
              </span>
            </label>
            <input
              type="range"
              min={10}
              max={100}
              step={5}
              value={charityPercentage}
              onChange={(e) => setCharityPercentage(Number(e.target.value))}
              className="w-full accent-green-700"
            />
            <div className="flex justify-between text-xs text-stone-400 mt-1">
              <span>10% (minimum)</span>
              <span>100%</span>
            </div>
          </div>

          <Button type="submit" isLoading={loading}>
            Save Changes
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6">
        <h2 className="font-semibold text-stone-800 mb-3">
          About Our Charities
        </h2>
        <div className="space-y-3">
          {charities.map((charity) => {
            const website = charity.website;
            return (
              <div key={charity.id} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-sm">💚</span>
                </div>
                <div>
                  <p className="font-medium text-stone-800 text-sm">
                    {charity.name}
                  </p>
                  {charity.description && (
                    <p className="text-stone-500 text-xs">
                      {charity.description}
                    </p>
                  )}
                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 text-xs hover:underline"
                    >
                      Visit website
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

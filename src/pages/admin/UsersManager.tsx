// src/pages/admin/UsersManager.tsx
// Admin view of all users with subscription status, scores, and ability to edit.

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import type { Profile } from "../../types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function UsersManager() {
  const { accessToken } = useAuth();

  const [users, setUsers] = useState<Profile[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<
    "all" | "active" | "inactive" | "lapsed"
  >("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  async function loadUsers() {
    setFetching(true);
    const token =
      accessToken ?? sessionStorage.getItem("golf_access") ?? ANON_KEY;

    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?order=created_at.desc`,
        { headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setFetching(false);
    }
  }

  async function updateSubscriptionStatus(userId: string, status: string) {
    const token =
      accessToken ?? sessionStorage.getItem("golf_access") ?? ANON_KEY;

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription_status: status }),
      });
      setMessage(`✅ Subscription status updated to ${status}.`);
      await loadUsers();
    } catch (err) {
      console.error("Update error:", err);
      setMessage("❌ Failed to update.");
    }
  }

  // Filter and search users
  const filtered = users.filter((u) => {
    const matchesSearch =
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || u.subscription_status === filter;
    return matchesSearch && matchesFilter;
  });

  function statusBadge(status: string) {
    const styles: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-stone-100 text-stone-500",
      lapsed: "bg-red-100 text-red-600",
      cancelled: "bg-orange-100 text-orange-600",
    };
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[status] ?? styles.inactive}`}
      >
        {status}
      </span>
    );
  }

  return (
    <div className="space-y-5">
      {/* Search and filter */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
        />
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
          {(["all", "active", "inactive", "lapsed"] as const).map((f) => (
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

      {/* Summary stat */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["active", "inactive", "lapsed", "cancelled"] as const).map((s) => (
          <div
            key={s}
            className="bg-white rounded-xl border border-stone-200 p-3 text-center"
          >
            <p className="text-2xl font-bold text-stone-800">
              {users.filter((u) => u.subscription_status === s).length}
            </p>
            <p className="text-xs text-stone-500 capitalize">{s}</p>
          </div>
        ))}
      </div>

      {fetching ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left p-4 text-xs text-stone-500 font-medium">
                  User
                </th>
                <th className="text-left p-4 text-xs text-stone-500 font-medium">
                  Status
                </th>
                <th className="text-left p-4 text-xs text-stone-500 font-medium">
                  Plan
                </th>
                <th className="text-left p-4 text-xs text-stone-500 font-medium">
                  Role
                </th>
                <th className="text-left p-4 text-xs text-stone-500 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-stone-400 text-sm"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-stone-50 hover:bg-stone-50"
                  >
                    <td className="p-4">
                      <p className="font-medium text-stone-800">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-stone-400">{user.email}</p>
                    </td>
                    <td className="p-4">
                      {statusBadge(user.subscription_status)}
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-stone-600 capitalize">
                        {user.subscription_plan ?? "—"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.subscription_status}
                        onChange={(e) =>
                          updateSubscriptionStatus(user.id, e.target.value)
                        }
                        className="text-xs px-2 py-1.5 rounded-lg border border-stone-200 focus:outline-none focus:ring-1 focus:ring-green-700"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="lapsed">Lapsed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

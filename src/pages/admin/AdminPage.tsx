// src/pages/admin/AdminPage.tsx
// Main admin panel with tab navigation across all admin modules.

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import DrawManager from "./DrawManager";
import WinnersManager from "./WinnersManager";
import UsersManager from "./UsersManager";
import ReportsPage from "./ReportsPage";

type AdminTab = "draws" | "winners" | "users" | "reports";

export default function AdminPage() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("draws");

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: "draws", label: "Draw Manager", icon: "🎰" },
    { id: "winners", label: "Winners", icon: "🏆" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "reports", label: "Reports", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Admin navbar — dark green to differentiate from user dashboard */}
      <nav className="bg-green-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white text-lg font-bold">⛳ Golf Platform</span>
          <span className="bg-green-700 text-green-100 text-xs px-2 py-0.5 rounded-full font-medium">
            Admin
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-green-200 text-sm">{profile?.full_name}</span>
          <Button
            variant="ghost"
            onClick={signOut}
            className="text-stone-300 text-sm hover:text-black"
          >
            Sign out
          </Button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900">Admin Panel</h1>
          <p className="text-stone-500 text-sm mt-1">
            Manage draws, verify winners, and view platform reports.
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 bg-stone-100 p-1 rounded-xl mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white text-green-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "draws" && <DrawManager />}
        {activeTab === "winners" && <WinnersManager />}
        {activeTab === "users" && <UsersManager />}
        {activeTab === "reports" && <ReportsPage />}
      </div>
    </div>
  );
}

// src/pages/dashboard/DashboardPage.tsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import ScoresPage from "./ScoresPage";
import CharityPage from "./CharityPage";
import DrawResultsPage from "./DrawResultsPage";
import WinningsPage from "./WinningsPage";

type Tab = "overview" | "scores" | "draws" | "winnings" | "charity";

export default function DashboardPage() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  if (profile?.subscription_status !== "active") {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">⏳</span>
          </div>
          <h1 className="text-xl font-bold text-stone-900 mb-2">
            Activating your subscription...
          </h1>
          <p className="text-stone-500 text-sm mb-2">
            Your payment was received. Your account is being activated — this
            usually takes under a minute.
          </p>
          <p className="text-stone-400 text-xs mb-6">
            If this persists after a few minutes, please contact support.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-green-800 text-white rounded-xl text-sm font-medium hover:bg-green-900 transition-all"
            >
              Refresh page
            </button>
            <button
              onClick={signOut}
              className="px-5 py-2.5 text-stone-500 hover:text-stone-700 rounded-xl text-sm transition-all border border-stone-200 hover:bg-stone-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "scores", label: "My Scores", icon: "⛳" },
    { id: "draws", label: "Draw Results", icon: "🎰" },
    { id: "winnings", label: "My Winnings", icon: "🏆" },
    { id: "charity", label: "My Charity", icon: "💚" },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-green-900 text-lg">
          ⛳ Golf Platform
        </span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-500">{profile?.full_name}</span>
          <Button variant="ghost" onClick={signOut} className="text-sm">
            Sign out
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {/* Welcome header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900">
            Welcome back, {profile?.full_name?.split(" ")[0]} 👋
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Subscription:{" "}
            <span className="text-green-700 font-medium capitalize">
              {profile?.subscription_status}
            </span>{" "}
            · Plan:{" "}
            <span className="font-medium capitalize">
              {profile?.subscription_plan}
            </span>
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
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tabs.slice(1).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="bg-white rounded-2xl border border-stone-200 p-5 text-left hover:border-green-300 hover:shadow-sm transition-all"
              >
                <div className="text-2xl mb-2">{tab.icon}</div>
                <h2 className="font-semibold text-stone-700">{tab.label}</h2>
                <p className="text-sm text-stone-400 mt-1">Click to view →</p>
              </button>
            ))}
          </div>
        )}

        {activeTab === "scores" && <ScoresPage />}
        {activeTab === "charity" && <CharityPage />}
        {activeTab === "draws" && <DrawResultsPage />}
        {activeTab === "winnings" && <WinningsPage />}
      </div>
    </div>
  );
}

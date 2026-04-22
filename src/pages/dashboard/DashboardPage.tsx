// src/pages/dashboard/DashboardPage.tsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import ScoresPage from "./ScoresPage";
import CharityPage from "./CharityPage";
import DrawResultsPage from "./DrawResultsPage";
import WinningsPage from "./WinningsPage";

type Tab = "overview" | "scores" | "draws" | "winnings" | "charity";

export default function DashboardPage() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (profile?.subscription_status !== "active") {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm w-full">
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
          <div className="flex gap-3 justify-center flex-wrap">
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

  const activeTabLabel = tabs.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-stone-200 px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <span className="font-bold text-green-900 text-base md:text-lg">
            ⛳ Golf Platform
          </span>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-xs md:text-sm text-stone-500 hidden sm:block">
              {profile?.full_name}
            </span>
            <button
              onClick={signOut}
              className="text-stone-500 hover:text-stone-800 text-xs md:text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-stone-50 border border-stone-200 transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Welcome header */}
        <div className="mb-5 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-stone-900">
            Welcome back, {profile?.full_name?.split(" ")[0]} 👋
          </h1>
          <p className="text-stone-500 text-xs md:text-sm mt-1">
            Subscription:{" "}
            <span className="text-green-700 font-medium capitalize">
              {profile?.subscription_status}
            </span>{" "}
            · Plan:{" "}
            <span className="font-medium capitalize">
              {profile?.subscription_plan ?? "—"}
            </span>
          </p>
        </div>

        {/* Mobile tab selector — dropdown */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium text-stone-800 shadow-sm"
          >
            <span className="flex items-center gap-2">
              <span>{activeTabLabel?.icon}</span>
              <span>{activeTabLabel?.label}</span>
            </span>
            <span className="text-stone-400">{mobileMenuOpen ? "▲" : "▼"}</span>
          </button>
          {mobileMenuOpen && (
            <div className="mt-1 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-lg z-10 relative">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm text-left transition-colors border-b border-stone-100 last:border-0 ${
                    activeTab === tab.id
                      ? "bg-green-50 text-green-900 font-semibold"
                      : "text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop tab navigation */}
        <div className="hidden md:flex gap-1 bg-stone-100 p-1 rounded-xl mb-6">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {tabs.slice(1).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="bg-white rounded-2xl border border-stone-200 p-4 md:p-5 text-left hover:border-green-300 hover:shadow-sm transition-all"
              >
                <div className="text-xl md:text-2xl mb-2">{tab.icon}</div>
                <h2 className="font-semibold text-stone-700 text-xs md:text-sm">
                  {tab.label}
                </h2>
                <p className="text-xs text-stone-400 mt-1 hidden md:block">
                  Click to view
                </p>
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

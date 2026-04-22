// src/pages/admin/AdminPage.tsx
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DrawManager from "./DrawManager";
import WinnersManager from "./WinnersManager";
import UsersManager from "./UsersManager";
import ReportsPage from "./ReportsPage";

type AdminTab = "draws" | "winners" | "users" | "reports";

export default function AdminPage() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("draws");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: { id: AdminTab; label: string; icon: string }[] = [
    { id: "draws", label: "Draw Manager", icon: "🎰" },
    { id: "winners", label: "Winners", icon: "🏆" },
    { id: "users", label: "Users", icon: "👥" },
    { id: "reports", label: "Reports", icon: "📊" },
  ];

  const activeTabLabel = tabs.find((t) => t.id === activeTab);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Admin navbar */}
      <nav className="bg-green-900 px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-white text-base md:text-lg font-bold">
              ⛳ Golf Platform
            </span>
            <span className="bg-green-700 text-green-100 text-xs px-2 py-0.5 rounded-full font-medium">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-green-200 text-xs md:text-sm hidden sm:block">
              {profile?.full_name}
            </span>
            <button
              onClick={signOut}
              className="text-green-200 hover:text-white text-xs md:text-sm font-medium transition-colors px-2 py-1 rounded-lg hover:bg-green-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="mb-5 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-stone-900">
            Admin Panel
          </h1>
          <p className="text-stone-500 text-xs md:text-sm mt-1">
            Manage draws, verify winners, and view platform reports.
          </p>
        </div>

        {/* Mobile tab selector — dropdown style */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-full flex items-center justify-between bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm font-medium text-stone-800"
          >
            <span className="flex items-center gap-2">
              <span>{activeTabLabel?.icon}</span>
              <span>{activeTabLabel?.label}</span>
            </span>
            <span className="text-stone-400">{mobileMenuOpen ? "▲" : "▼"}</span>
          </button>
          {mobileMenuOpen && (
            <div className="mt-1 bg-white border border-stone-200 rounded-xl overflow-hidden shadow-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors border-b border-stone-100 last:border-0 ${
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
        {activeTab === "draws" && <DrawManager />}
        {activeTab === "winners" && <WinnersManager />}
        {activeTab === "users" && <UsersManager />}
        {activeTab === "reports" && <ReportsPage />}
      </div>
    </div>
  );
}

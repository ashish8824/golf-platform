// src/pages/public/LandingPage.tsx
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const features = [
    {
      icon: "⛳",
      title: "Track Your Scores",
      desc: "Enter your last 5 Stableford scores. Each new score automatically replaces the oldest one — keeping your draw entries fresh.",
    },
    {
      icon: "🎰",
      title: "Monthly Prize Draw",
      desc: "Your scores become your lottery numbers. Match 3, 4, or 5 to win. Jackpot rolls over and grows until someone wins.",
    },
    {
      icon: "💚",
      title: "Support a Charity",
      desc: "At least 10% of every subscription goes directly to your chosen charity. Increase it to 100% if you want.",
    },
  ];

  const howItWorks = [
    {
      step: "01",
      icon: "👤",
      title: "Sign Up",
      desc: "Create your account and choose a monthly or yearly subscription plan.",
    },
    {
      step: "02",
      icon: "💚",
      title: "Pick a Charity",
      desc: "Choose which charity receives your contribution and set your percentage.",
    },
    {
      step: "03",
      icon: "⛳",
      title: "Enter Scores",
      desc: "After each round, enter your Stableford score. Your last 5 are used in draws.",
    },
    {
      step: "04",
      icon: "🏆",
      title: "Win Prizes",
      desc: "Every month a draw runs. Match your scores to win cash prizes.",
    },
  ];

  const prizes = [
    {
      match: "5",
      label: "Jackpot",
      pct: "60%",
      bg: "bg-amber-400",
      shadow: "shadow-amber-200",
      desc: "of the prize pool",
    },
    {
      match: "4",
      label: "Second Prize",
      pct: "25%",
      bg: "bg-emerald-500",
      shadow: "shadow-emerald-200",
      desc: "of the prize pool",
    },
    {
      match: "3",
      label: "Third Prize",
      pct: "15%",
      bg: "bg-sky-500",
      shadow: "shadow-sky-200",
      desc: "of the prize pool",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ── */}
      <nav className="border-b border-stone-100 px-4 md:px-10 py-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => scrollTo("hero")}
        >
          <div className="w-9 h-9 bg-green-800 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white text-base">⛳</span>
          </div>
          <span className="font-bold text-green-900 text-lg tracking-tight">
            Golf Platform
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm">
          <button
            onClick={() => scrollTo("how-it-works")}
            className="text-stone-500 hover:text-green-800 font-medium transition-colors"
          >
            How it works
          </button>
          <button
            onClick={() => scrollTo("pricing")}
            className="text-stone-500 hover:text-green-800 font-medium transition-colors"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollTo("charities")}
            className="text-stone-500 hover:text-green-800 font-medium transition-colors"
          >
            Charities
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/login")}
            className="hidden sm:block text-sm text-stone-600 hover:text-stone-900 px-4 py-2.5 rounded-xl hover:bg-stone-50 transition-all font-medium"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="text-sm bg-green-800 text-white px-5 py-2.5 rounded-xl hover:bg-green-900 transition-all font-semibold shadow-sm"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        id="hero"
        className="max-w-5xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-16 text-center"
      >
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-4 py-2 rounded-full mb-8 border border-green-200 uppercase tracking-wide">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Next draw coming soon
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-900 leading-tight mb-6 tracking-tight">
          Golf scores that
          <br />
          <span className="text-green-700">win prizes</span> and fund
          <br className="hidden sm:block" /> charities
        </h1>

        <p className="text-stone-500 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Track your Stableford scores, enter monthly prize draws, and support a
          charity you care about — all in one subscription.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate("/signup")}
            className="w-full sm:w-auto bg-green-800 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-900 transition-all text-sm shadow-md"
          >
            Start for £9.99/month
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full sm:w-auto text-stone-600 px-8 py-4 rounded-xl font-medium hover:bg-stone-50 border border-stone-200 transition-all text-sm"
          >
            Sign in to dashboard
          </button>
        </div>
        <p className="text-xs text-stone-400 mt-4">
          Or £89.99/year — save 25% · Cancel anytime
        </p>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y border-stone-100 py-10 bg-stone-50">
        <div className="max-w-3xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
          {[
            { value: "£9.99", label: "Per month" },
            { value: "10%+", label: "Goes to charity" },
            { value: "3 tiers", label: "Of prizes monthly" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl md:text-3xl font-bold text-green-800">
                {s.value}
              </p>
              <p className="text-stone-500 text-xs md:text-sm mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-3 tracking-tight">
            Everything in one place
          </h2>
          <p className="text-stone-500 max-w-md mx-auto">
            Score tracking, prize draws, and charity giving — combined.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`rounded-2xl p-7 border transition-all hover:shadow-md ${i === 1 ? "bg-green-800 border-green-700 text-white" : "bg-white border-stone-200 hover:border-green-200"}`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 ${i === 1 ? "bg-green-700" : "bg-green-50"}`}
              >
                {f.icon}
              </div>
              <h3
                className={`font-bold text-lg mb-2 ${i === 1 ? "text-white" : "text-stone-900"}`}
              >
                {f.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${i === 1 ? "text-green-200" : "text-stone-500"}`}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        id="how-it-works"
        className="bg-stone-50 border-y border-stone-100 py-20"
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-3 tracking-tight">
              How it works
            </h2>
            <p className="text-stone-500">Get started in under 5 minutes.</p>
          </div>

          <div className="relative">
            {/* Horizontal connector line — desktop */}
            <div
              className="hidden md:block absolute left-0 right-0 h-0.5 bg-green-200"
              style={{ top: "3rem", left: "10%", right: "10%" }}
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6">
              {howItWorks.map((step, i) => (
                <div
                  key={step.step}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Mobile vertical connector */}
                  {i < howItWorks.length - 1 && (
                    <div className="md:hidden absolute left-1/2 -translate-x-1/2 top-24 w-0.5 h-10 bg-green-200" />
                  )}

                  {/* Circle */}
                  <div className="relative z-10 w-24 h-24 rounded-full bg-white border-4 border-green-700 flex flex-col items-center justify-center shadow-md mb-6 hover:scale-105 transition-transform hover:shadow-lg hover:border-green-600">
                    <span className="text-2xl mb-0.5">{step.icon}</span>
                    <span className="text-xs font-black text-green-700 tracking-widest">
                      {step.step}
                    </span>
                  </div>

                  <h3 className="font-bold text-stone-900 mb-2 text-base">
                    {step.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed max-w-44">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Prize structure ── */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-3 tracking-tight">
            Prize structure
          </h2>
          <p className="text-stone-500">
            80% of subscriptions go to the prize pool every month.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {prizes.map((p) => (
            <div
              key={p.label}
              className="bg-white border border-stone-200 rounded-2xl p-8 text-center hover:shadow-md transition-all"
            >
              <div
                className={`w-24 h-24 rounded-full ${p.bg} shadow-lg ${p.shadow} flex flex-col items-center justify-center mx-auto mb-5`}
              >
                <span className="text-3xl font-black text-white leading-none">
                  {p.match}
                </span>
                <span className="text-white text-xs font-bold opacity-90 mt-0.5">
                  matches
                </span>
              </div>
              <h3 className="font-bold text-stone-900 text-xl mb-2">
                {p.label}
              </h3>
              <span className="text-3xl font-black text-stone-900">
                {p.pct}
              </span>
              <p className="text-stone-400 text-sm mt-1">{p.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 text-center">
          <p className="text-purple-800 font-semibold">
            🎯 Jackpot rolls over each month until someone matches all 5 numbers
          </p>
          <p className="text-purple-500 text-sm mt-1">
            The longer it goes unclaimed, the bigger the prize pool grows
          </p>
        </div>
      </section>

      {/* ── Charity section ── */}
      <section id="charities" className="bg-green-800 py-20">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <div className="w-16 h-16 bg-green-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">💚</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight">
            Play golf. Win prizes.
            <br />
            Fund real causes.
          </h2>
          <p className="text-green-200 mb-10 leading-relaxed max-w-lg mx-auto">
            A minimum of 10% of every subscription goes directly to your chosen
            charity. You can increase this up to 100%. Every round you play
            makes a difference.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {[
              "British Red Cross",
              "Cancer Research UK",
              "Macmillan Cancer Support",
            ].map((c) => (
              <span
                key={c}
                className="bg-green-700 text-green-100 text-sm px-4 py-2 rounded-xl border border-green-600 font-medium"
              >
                {c}
              </span>
            ))}
          </div>
          <p className="text-green-400 text-xs">
            More charities added regularly
          </p>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="max-w-3xl mx-auto px-4 md:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-3 tracking-tight">
            Simple pricing
          </h2>
          <p className="text-stone-500">No hidden fees. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-stone-200 rounded-2xl p-7 hover:border-stone-300 transition-all hover:shadow-sm">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
              Monthly
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-black text-stone-900">£9.99</span>
              <span className="text-stone-400 text-sm">/month</span>
            </div>
            <p className="text-stone-400 text-xs mb-6">Billed monthly</p>
            <ul className="space-y-3 mb-8">
              {[
                "5 score slots",
                "Monthly draw entry",
                "Choose your charity",
                "Full dashboard access",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-stone-600"
                >
                  <span className="w-5 h-5 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/signup")}
              className="w-full py-3.5 border-2 border-green-800 text-green-800 rounded-xl font-semibold text-sm hover:bg-green-50 transition-all"
            >
              Get started
            </button>
          </div>

          <div className="border-2 border-green-700 rounded-2xl p-7 relative bg-green-50/30 shadow-sm">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-green-700 text-white text-xs px-4 py-1.5 rounded-full font-bold tracking-wide uppercase whitespace-nowrap">
              Best value — Save 25%
            </div>
            <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-3">
              Yearly
            </p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-black text-stone-900">£89.99</span>
              <span className="text-stone-400 text-sm">/year</span>
            </div>
            <p className="text-green-600 text-xs font-semibold mb-6">
              Just £7.50/month · Save £30 vs monthly
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Everything in Monthly",
                "25% discount",
                "12 draw entries",
                "Priority support",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm text-stone-600"
                >
                  <span className="w-5 h-5 bg-green-200 text-green-800 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              onClick={() => navigate("/signup")}
              className="w-full py-3.5 bg-green-800 text-white rounded-xl font-semibold text-sm hover:bg-green-900 transition-all shadow-md"
            >
              Get started
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-stone-900 py-16 md:py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-4">
            Ready to play?
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Join today and enter
            <br />
            your first monthly draw
          </h2>
          <p className="text-stone-400 mb-8 text-sm">
            Setup takes under 5 minutes. Your scores start working immediately.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="bg-green-600 text-white px-10 py-4 rounded-xl font-semibold hover:bg-green-500 transition-all text-sm shadow-lg"
          >
            Create your account
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-stone-100">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand col */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-green-800 rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm">⛳</span>
                </div>
                <span className="font-bold text-stone-900 text-lg">
                  Golf Platform
                </span>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
                A subscription platform that combines golf score tracking,
                monthly prize draws, and charity giving into one seamless
                experience.
              </p>
              <div className="flex items-center gap-3 mt-5">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center hover:bg-green-100 transition-colors cursor-pointer">
                  <span className="text-xs">𝕏</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center hover:bg-green-100 transition-colors cursor-pointer">
                  <span className="text-xs">in</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center hover:bg-green-100 transition-colors cursor-pointer">
                  <span className="text-xs">fb</span>
                </div>
              </div>
            </div>

            {/* Platform links */}
            <div>
              <p className="text-xs font-bold text-stone-900 uppercase tracking-widest mb-4">
                Platform
              </p>
              <ul className="space-y-3">
                {[
                  {
                    label: "How it works",
                    action: () => scrollTo("how-it-works"),
                  },
                  { label: "Pricing", action: () => scrollTo("pricing") },
                  { label: "Charities", action: () => scrollTo("charities") },
                  {
                    label: "Prize draws",
                    action: () => scrollTo("how-it-works"),
                  },
                ].map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={l.action}
                      className="text-stone-500 hover:text-green-800 text-sm transition-colors text-left"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account links */}
            <div>
              <p className="text-xs font-bold text-stone-900 uppercase tracking-widest mb-4">
                Account
              </p>
              <ul className="space-y-3">
                {[
                  {
                    label: "Create account",
                    action: () => navigate("/signup"),
                  },
                  { label: "Sign in", action: () => navigate("/login") },
                  { label: "Dashboard", action: () => navigate("/dashboard") },
                  { label: "Admin panel", action: () => navigate("/admin") },
                ].map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={l.action}
                      className="text-stone-500 hover:text-green-800 text-sm transition-colors text-left"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-stone-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-stone-400 text-xs">
              © {new Date().getFullYear()} Golf Platform Ltd. All rights
              reserved.
            </p>
            <div className="flex items-center gap-6 text-xs text-stone-400">
              <button className="hover:text-stone-600 transition-colors">
                Privacy Policy
              </button>
              <button className="hover:text-stone-600 transition-colors">
                Terms of Service
              </button>
              <button className="hover:text-stone-600 transition-colors">
                Cookie Policy
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

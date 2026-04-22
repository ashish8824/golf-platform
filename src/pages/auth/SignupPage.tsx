// src/pages/auth/SignupPage.tsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Charity } from "../../types";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const PLANS = {
  monthly: {
    label: "Monthly",
    price: "£9.99/month",
    priceId: "price_1TOLjNFurUtO65glTZuGHMyB",
  },
  yearly: {
    label: "Yearly",
    price: "£89.99/year — save 25%",
    priceId: "price_1TOLkYFurUtO65gl2dOZOyrA",
  },
};

export default function SignupPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [selectedCharityId, setSelectedCharityId] = useState("");
  const [charityPercentage, setCharityPercentage] = useState(10);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  useEffect(() => {
    async function loadCharities() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/charities?is_active=eq.true&order=name.asc`,
          {
            headers: {
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          },
        );
        const data = await res.json();
        console.log("charities:", data);
        if (Array.isArray(data)) {
          setCharities(data);
        } else {
          console.error("Unexpected charities response:", data);
        }
      } catch (err) {
        console.error("Failed to fetch charities:", err);
      }
    }
    loadCharities();
  }, []);

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Please enter a valid email";
    if (password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (!selectedCharityId) newErrors.charity = "Please select a charity";
    if (charityPercentage < 10 || charityPercentage > 100) {
      newErrors.charityPercentage = "Percentage must be between 10 and 100";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("1 - handleSubmit called");
    setGeneralError("");
    if (!validate()) return;
    setLoading(true);

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // ── STEP 1: Sign up via direct REST ───────────────────────────────────
      console.log("2 - calling signup REST directly");
      const signUpRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
        },
        body: JSON.stringify({
          email,
          password,
          data: { full_name: fullName },
        }),
      });

      const signUpData = await signUpRes.json();
      console.log(
        "3 - full signup response:",
        JSON.stringify(signUpData).substring(0, 200),
      );

      // Supabase returns user ID at top level or nested under .user
      const userId = signUpData.id ?? signUpData.user?.id;
      const signupError = signUpData.error?.message ?? signUpData.msg;

      console.log("3b - userId:", userId, "error:", signupError);

      if (signupError || !userId) {
        setGeneralError(signupError ?? "Signup failed. Please try again.");
        return;
      }

      // ── STEP 2: Sign in via REST to get tokens ────────────────────────────
      console.log("4 - signing in via REST");
      const signInRes = await fetch(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: ANON_KEY,
          },
          body: JSON.stringify({ email, password }),
        },
      );

      const signInData = await signInRes.json();
      console.log(
        "5 - signin result:",
        !!signInData.access_token,
        !!signInData.refresh_token,
        signInData.error,
      );

      if (!signInData.access_token) {
        setGeneralError("Could not sign in after signup. Please go to login.");
        navigate("/login?message=signup-success-payment-pending");
        return;
      }
      const accessToken = signInData.access_token;
      const refreshToken = signInData.refresh_token;

      // Save tokens to sessionStorage — AuthContext will pick them up on redirect
      sessionStorage.setItem("golf_access", accessToken);
      sessionStorage.setItem("golf_refresh", refreshToken);
      console.log("5b - tokens saved to sessionStorage");

      // ── STEP 4: Update profile ────────────────────────────────────────────
      console.log("6 - updating profile");
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            charity_id: selectedCharityId,
            charity_percentage: charityPercentage,
            subscription_plan: selectedPlan,
          }),
        },
      );

      // ── STEP 5: Call Stripe checkout ──────────────────────────────────────
      console.log("7 - calling create-checkout");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      let checkoutUrl: string | null = null;

      try {
        const checkoutRes = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
          {
            method: "POST",
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              userId,
              email,
              priceId: PLANS[selectedPlan].priceId,
              plan: selectedPlan,
            }),
          },
        );
        clearTimeout(timeoutId);
        const checkoutData = await checkoutRes.json();
        console.log("8 - checkout result:", checkoutData);
        if (checkoutData.url) checkoutUrl = checkoutData.url;
      } catch (fetchErr: unknown) {
        clearTimeout(timeoutId);
        console.error("checkout error:", fetchErr);
      }

      // ── STEP 6: Redirect ──────────────────────────────────────────────────
      if (checkoutUrl) {
        console.log("9 - redirecting to Stripe");
        window.location.href = checkoutUrl;
      } else {
        // Store tokens in localStorage so AuthContext can pick them up
        localStorage.setItem("sb-access-token", accessToken);
        localStorage.setItem("sb-refresh-token", refreshToken);
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setGeneralError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-800 rounded-2xl mx-auto mb-3 flex items-center justify-center">
            <span className="text-white text-xl">⛳</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">
            Create your account
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Join the platform — play, win, give back
          </p>
        </div>

        {generalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {generalError}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4"
        >
          <Input
            label="Full name"
            type="text"
            placeholder="John Smith"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
            autoComplete="name"
          />

          <Input
            label="Email address"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="new-password"
          />

          <div>
            <label className="text-sm font-medium text-stone-700 block mb-2">
              Choose your plan
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((plan) => (
                <button
                  key={plan}
                  type="button"
                  onClick={() => setSelectedPlan(plan)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedPlan === plan
                      ? "border-green-700 bg-green-50 text-green-900"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <div className="font-semibold text-sm">
                    {PLANS[plan].label}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {PLANS[plan].price}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1.5">
              Your charity
            </label>
            <select
              value={selectedCharityId}
              onChange={(e) => setSelectedCharityId(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-white text-stone-900
                focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent
                ${errors.charity ? "border-red-400" : "border-stone-200"}`}
            >
              <option value="">Select a charity...</option>
              {charities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.charity && (
              <p className="text-xs text-red-500 mt-1">{errors.charity}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700 block mb-1.5">
              Charity contribution:{" "}
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
            <p className="text-xs text-stone-400 mt-1">
              Minimum 10% of your subscription goes to your chosen charity
            </p>
          </div>

          <Button type="submit" isLoading={loading} className="w-full mt-2">
            Continue to Payment
          </Button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-4">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-green-700 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

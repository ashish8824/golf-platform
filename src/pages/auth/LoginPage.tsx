// src/pages/auth/LoginPage.tsx
// Existing users log in here.
// On success → redirect to /dashboard

import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function LoginPage() {
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  // Check if we were redirected here after signup (show info message)
  const signupMessage =
    searchParams.get("message") === "signup-success-payment-pending";

  // Replace the handleLogin function in LoginPage.tsx
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ email, password }),
        },
      );
      const data = await res.json();

      if (!data.access_token) {
        setError("Incorrect email or password. Please try again.");
        return;
      }

      // Save tokens to sessionStorage
      sessionStorage.setItem("golf_access", data.access_token);
      sessionStorage.setItem("golf_refresh", data.refresh_token);

      // Navigate to dashboard — AuthContext will pick up tokens on load
      window.location.href = "/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Supabase sends a password reset email automatically
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`, // We'll build this later
    });

    setLoading(false);
    if (error) {
      setError("Could not send reset email. Check the address and try again.");
    } else {
      setForgotSent(true);
    }
  }

  // Show forgot password form
  if (showForgot) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-stone-900 text-center mb-2">
            Reset password
          </h1>
          <p className="text-stone-500 text-sm text-center mb-6">
            We'll send a reset link to your email
          </p>

          {forgotSent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-800 font-medium">Check your email!</p>
              <p className="text-green-600 text-sm mt-1">
                A reset link has been sent to {forgotEmail}
              </p>
              <Button
                variant="ghost"
                className="mt-4"
                onClick={() => setShowForgot(false)}
              >
                Back to login
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleForgotPassword}
              className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4"
            >
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Input
                label="Email address"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="john@example.com"
              />
              <Button type="submit" isLoading={loading} className="w-full">
                Send reset link
              </Button>
              <button
                type="button"
                className="w-full text-sm text-stone-500 hover:text-stone-700"
                onClick={() => setShowForgot(false)}
              >
                Back to login
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-green-800 rounded-2xl mx-auto mb-3 flex items-center justify-center">
            <span className="text-white text-xl">⛳</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Welcome back</h1>
          <p className="text-stone-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Post-signup info message */}
        {signupMessage && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            Account created! Please log in — your subscription will be activated
            once payment completes.
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4"
        >
          <Input
            label="Email address"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          {/* Forgot password link */}
          <div className="text-right">
            <button
              type="button"
              className="text-xs text-green-700 hover:underline"
              onClick={() => setShowForgot(true)}
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" isLoading={loading} className="w-full">
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-4">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-green-700 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

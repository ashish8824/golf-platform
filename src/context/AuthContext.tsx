// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Profile } from "../types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface AuthContextType {
  userId: string | null;
  profile: Profile | null;
  accessToken: string | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Store tokens in memory (not localStorage for security)
// But use sessionStorage so they survive page refreshes
function saveTokens(access: string, refresh: string) {
  sessionStorage.setItem("golf_access", access);
  sessionStorage.setItem("golf_refresh", refresh);
}

function clearTokens() {
  sessionStorage.removeItem("golf_access");
  sessionStorage.removeItem("golf_refresh");
  // Also clear the localStorage fallback from signup
  localStorage.removeItem("sb-access-token");
  localStorage.removeItem("sb-refresh-token");
}

function getSavedTokens() {
  // Check sessionStorage first, then localStorage fallback from signup
  const access =
    sessionStorage.getItem("golf_access") ??
    localStorage.getItem("sb-access-token");
  const refresh =
    sessionStorage.getItem("golf_refresh") ??
    localStorage.getItem("sb-refresh-token");
  return { access, refresh };
}

async function fetchProfileDirect(
  userId: string,
  token: string,
): Promise<Profile | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`,
      {
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${token}`,
        },
      },
    );
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) return data[0] as Profile;
    return null;
  } catch {
    return null;
  }
}

function parseJwt(token: string) {
  try {
    const base64 = token.split(".")[1];
    const decoded = JSON.parse(atob(base64));
    return decoded;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function initAuth() {
    const { access, refresh } = getSavedTokens();

    if (!access || !refresh) {
      setLoading(false);
      return;
    }

    // Parse JWT to check expiry and get userId
    const payload = parseJwt(access);
    if (!payload) {
      clearTokens();
      setLoading(false);
      return;
    }

    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired) {
      // Try to refresh the token
      try {
        const res = await fetch(
          `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: ANON_KEY,
            },
            body: JSON.stringify({ refresh_token: refresh }),
          },
        );
        const data = await res.json();
        if (data.access_token) {
          saveTokens(data.access_token, data.refresh_token);
          const newPayload = parseJwt(data.access_token);
          setUserId(newPayload?.sub ?? null);
          setAccessToken(data.access_token);
          const p = await fetchProfileDirect(newPayload.sub, data.access_token);
          setProfile(p);
        } else {
          clearTokens();
        }
      } catch {
        clearTokens();
      }
    } else {
      // Token still valid
      setUserId(payload.sub);
      setAccessToken(access);
      // Move from localStorage to sessionStorage if needed
      saveTokens(access, refresh);
      localStorage.removeItem("sb-access-token");
      localStorage.removeItem("sb-refresh-token");
      const p = await fetchProfileDirect(payload.sub, access);
      setProfile(p);
    }

    setLoading(false);
  }

  useEffect(() => {
    initAuth();
  }, []);

  function signOut() {
    clearTokens();
    setUserId(null);
    setProfile(null);
    setAccessToken(null);
    window.location.href = "/login";
  }

  return (
    <AuthContext.Provider
      value={{ userId, profile, accessToken, loading, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

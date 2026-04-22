// src/components/layout/ProtectedRoute.tsx
// This component guards pages that require authentication.
// If the user is not logged in → redirect to /login
// If the page requires admin role and user is not admin → redirect to /dashboard
// While loading → show a spinner so we don't flash the wrong page
// src/components/layout/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface Props {
  children: React.ReactNode;
  requiredRole: "user" | "admin";
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { userId, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!userId) return <Navigate to="/login" replace />;

  if (requiredRole === "admin" && profile?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

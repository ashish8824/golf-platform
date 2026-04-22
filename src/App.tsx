// src/App.tsx
// This is the root of our app. React Router reads the URL
// and decides which page component to render.

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// We will create these page components in Phase 2 onwards
// For now we create placeholder pages so routing works
import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AdminPage from "./pages/admin/AdminPage";

// Auth context gives us the logged-in user anywhere in the app
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";

function App() {
  return (
    // AuthProvider wraps everything so all pages can access auth state
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes — anyone can visit these */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes — must be logged in AND subscribed */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes — must be logged in AND have admin role */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all: redirect unknown URLs to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

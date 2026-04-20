import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthCard, AuthShell } from "./AuthShell";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <AuthShell>
        <AuthCard>
          <div className="p-10 flex flex-col items-center text-center">
            <div
              className="h-9 w-9 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mb-4"
              aria-hidden
            />
            <p className="text-slate-800 font-medium text-sm">Loading your session…</p>
            <p className="text-slate-500 text-xs mt-2">Checking authentication.</p>
          </div>
        </AuthCard>
      </AuthShell>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

export default ProtectedRoute;


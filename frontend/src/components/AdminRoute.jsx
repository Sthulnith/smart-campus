import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthCard, AuthShell } from "./AuthShell";
import { useAuth } from "../contexts/AuthContext";

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <AuthShell>
        <AuthCard>
          <div className="p-8 text-center text-sm text-slate-700">Checking admin access…</div>
        </AuthCard>
      </AuthShell>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;


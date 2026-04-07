import React from "react";

/**
 * Shared layout for login, signup, and OAuth callback screens.
 */
export function AuthShell({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-4 sm:p-6">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

export function AuthCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/80 overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

export function AuthAlert({ variant, children }) {
  const styles =
    variant === "success"
      ? "bg-emerald-50 text-emerald-900 border-emerald-200/80"
      : variant === "error"
        ? "bg-red-50 text-red-900 border-red-200/80"
        : "bg-amber-50 text-amber-900 border-amber-200/80";

  return (
    <div
      role="alert"
      className={`rounded-xl px-4 py-3 text-sm border leading-snug ${styles}`}
    >
      {children}
    </div>
  );
}

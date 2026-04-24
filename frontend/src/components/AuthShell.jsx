import React from "react";

/**
 * Shared layout for login, signup, and OAuth callback screens.
 */
export function AuthShell({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 relative overflow-hidden font-['Outfit']">
      {/* Decorative Blur Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200/40 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-100/40 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">{children}</div>
    </div>
  );
}

export function AuthCard({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-[40px] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden transition-all duration-500 hover:shadow-indigo-100/50 ${className}`}
    >
      {children}
    </div>
  );
}

export function AuthAlert({ variant, children }) {
  const styles =
    variant === "success"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : variant === "error"
        ? "bg-rose-50 text-rose-700 border-rose-100"
        : "bg-amber-50 text-amber-700 border-amber-100";

  return (
    <div
      role="alert"
      className={`rounded-2xl px-5 py-4 text-xs font-bold uppercase tracking-wider border leading-snug animate-in slide-in-from-top-2 duration-300 ${styles}`}
    >
      {children}
    </div>
  );
}

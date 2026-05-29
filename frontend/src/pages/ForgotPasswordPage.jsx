import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { AuthAlert, AuthCard, AuthShell } from "../components/AuthShell";
import { getApiErrorMessage } from "../utils/authApi";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { data } = await API.post("/auth/forgot-password", { email: email.trim() });
      setDone(true);
      setDemoMode(Boolean(data?.demo));
      setResetLink(typeof data?.resetLink === "string" ? data.resetLink : "");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not send reset request. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard>
        <div className="px-8 pt-8 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">Smart Campus</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot password</h1>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            Enter your email. If an account exists, reset instructions will be sent.
          </p>
        </div>

        <div className="px-8 pb-8 pt-4 space-y-4">
          {done ? (
            <>
              <AuthAlert variant="success">
                If an account exists with that email, reset instructions were sent.
              </AuthAlert>
              {demoMode && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                  Email delivery is unavailable right now. Use the fallback reset link below.
                </div>
              )}
              {resetLink && (
                <a
                  href={resetLink}
                  className="block w-full break-all rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
                >
                  {resetLink}
                </a>
              )}
              <Link
                to="/login"
                className="inline-flex justify-center w-full py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition text-center"
              >
                Back to sign in
              </Link>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && <AuthAlert variant="error">{error}</AuthAlert>}
              <div>
                <label htmlFor="fp-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition disabled:bg-slate-50"
                  placeholder="you@university.edu"
                  required
                  disabled={submitting}
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/25 disabled:opacity-55 disabled:cursor-not-allowed transition"
              >
                {submitting ? "Sending reset instructions…" : "Send reset instructions"}
              </button>
              <p className="text-center text-sm text-slate-600">
                <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </AuthCard>
    </AuthShell>
  );
}

export default ForgotPasswordPage;

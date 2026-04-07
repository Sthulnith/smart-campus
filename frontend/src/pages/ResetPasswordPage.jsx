import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import API from "../services/api";
import { AuthAlert, AuthCard, AuthShell } from "../components/AuthShell";
import { getApiErrorMessage } from "../utils/authApi";

const PWD_HINT = "8+ characters with upper, lower, and a number.";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const { token: routeToken } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const q = searchParams.get("token");
    const finalToken = q || routeToken || "";
    if (finalToken) setToken(finalToken);
  }, [searchParams, routeToken]);

  const clientValidate = () => {
    if (!token.trim()) return "Missing reset token. Open the link from your email.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return `Password needs upper, lower, and a number. (${PWD_HINT})`;
    }
    if (password !== confirm) return "Passwords don’t match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const v = clientValidate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      await API.post("/auth/reset-password", {
        token: token.trim(),
        newPassword: password,
        confirmPassword: confirm,
      });
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true, state: { passwordReset: true } }), 1800);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not reset password."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard>
        <div className="px-8 pt-8 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">Smart Campus</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Set a new password</h1>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            Choose a strong password for your campus account.
          </p>
        </div>

        <div className="px-8 pb-8 pt-4 space-y-4">
          {done ? (
            <AuthAlert variant="success">Password updated. Redirecting to sign in…</AuthAlert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && <AuthAlert variant="error">{error}</AuthAlert>}

              <div>
                <label htmlFor="reset-token" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Reset token
                </label>
                <input
                  id="reset-token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 text-sm font-mono focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition disabled:bg-slate-50"
                  placeholder="Pasted from your reset link"
                  disabled={submitting}
                />
                <p className="text-xs text-slate-500 mt-1">Usually prefilled from your reset link.</p>
              </div>

              <div>
                <label htmlFor="new-pass" className="block text-sm font-medium text-slate-700 mb-1.5">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="new-pass"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pr-16 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition disabled:bg-slate-50"
                    disabled={submitting}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 px-2"
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">{PWD_HINT}</p>
              </div>

              <div>
                <label htmlFor="confirm-pass" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm password
                </label>
                <input
                  id="confirm-pass"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition disabled:bg-slate-50"
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/25 disabled:opacity-55 disabled:cursor-not-allowed transition"
              >
                {submitting ? "Updating password…" : "Update password"}
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

export default ResetPasswordPage;

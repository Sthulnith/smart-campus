import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AuthAlert, AuthCard, AuthShell } from "../components/AuthShell";
import { useAuth } from "../contexts/AuthContext";
import { getApiErrorMessage } from "../utils/authApi";

const AUTH_RETURN_KEY = "authReturnTo";

function storeReturnPath(from) {
  if (from?.pathname && from.pathname !== "/login" && from.pathname !== "/signup") {
    sessionStorage.setItem(AUTH_RETURN_KEY, from.pathname + (from.search || ""));
  }
}

function safeOAuthMessage(raw) {
  if (!raw) return "Google sign-in did not work. Try again.";
  try {
    const decoded = decodeURIComponent(raw).trim();
    if (!decoded || decoded.length > 220) return "Google sign-in did not work. Try again.";
    if (/exception|stacktrace|nullpointer|oauth2|authorization_request|invalid_request/i.test(decoded)) {
      return "Google sign-in did not work. Try again.";
    }
    return decoded;
  } catch {
    return "Google sign-in did not work. Try again.";
  }
}

function LoginPage() {
  const backendBaseUrl = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8080";
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { signInWithPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const from = location.state?.from;
  const signupSuccess = location.state?.signupSuccess;
  const passwordResetDone = location.state?.passwordReset;

  useEffect(() => {
    if (from) {
      storeReturnPath(from);
    } else if (!signupSuccess && !passwordResetDone) {
      sessionStorage.removeItem(AUTH_RETURN_KEY);
    }
  }, [from, signupSuccess, passwordResetDone]);

  const oauthError = useMemo(() => {
    const error = searchParams.get("error");
    if (!error) return null;
    if (error === "oauth") {
      return safeOAuthMessage(searchParams.get("message"));
    }
    return "Sign-in failed. Try again.";
  }, [searchParams]);

  const navigateAfterAuth = () => {
    let target = sessionStorage.getItem(AUTH_RETURN_KEY);
    sessionStorage.removeItem(AUTH_RETURN_KEY);
    if (!target || target === "/login" || target === "/signup") target = "/";
    if (!target.startsWith("/") || target.startsWith("//")) target = "/";
    navigate(target, { replace: true });
  };

  const handleGoogleLogin = () => {
    storeReturnPath(from);
    window.location.href = `${backendBaseUrl}/oauth2/authorization/google`;
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await signInWithPassword(email.trim(), password);
      navigateAfterAuth();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Could not sign in. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard>
        <div className="px-8 pt-8 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">Smart Campus</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            Sign in to use resources, bookings, and tickets.
          </p>
        </div>

        <div className="px-8 space-y-6 pb-8 pt-4">
          {passwordResetDone && (
            <AuthAlert variant="success">Password updated. Sign in with your new password.</AuthAlert>
          )}

          {signupSuccess && (
            <AuthAlert variant="success">Account created. Sign in with your email and password.</AuthAlert>
          )}

          {oauthError && <AuthAlert variant="error">{oauthError}</AuthAlert>}

          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Continue with Google</p>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 border border-slate-200 bg-white text-slate-800 py-3 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs font-medium text-slate-400 uppercase tracking-wide">
                Or email
              </span>
            </div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4" noValidate aria-busy={submitting}>
            {formError && <AuthAlert variant="error">{formError}</AuthAlert>}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition disabled:bg-slate-50"
                placeholder="you@university.edu"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pr-16 text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition disabled:bg-slate-50"
                  placeholder="Your password"
                  required
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg"
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              <Link to="/forgot-password" className="font-semibold text-blue-600 hover:text-blue-700">
                Forgot password?
              </Link>{" "}
              <span className="text-slate-500">— for campus email/password accounts.</span>
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/25 disabled:opacity-55 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Signing in…" : "Sign in with email"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 pt-1">
            New here?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Register
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthShell>
  );
}

export default LoginPage;

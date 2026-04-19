import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthAlert, AuthCard, AuthShell } from "../components/AuthShell";
import { useAuth } from "../contexts/AuthContext";
import { getApiErrorMessage } from "../utils/authApi";

const PWD_HINT = "8+ characters with upper, lower, and a number.";

function firstFieldMessages(data) {
  if (!data?.fields || typeof data.fields !== "object") return null;
  const msgs = Object.values(data.fields).filter((v) => typeof v === "string");
  if (msgs.length === 0) return null;
  return msgs.slice(0, 2).join(" ");
}

function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const clientValidate = () => {
    if (!fullName.trim()) return "Enter your name.";
    if (!email.trim()) return "Enter your email.";
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
    const localErr = clientValidate();
    if (localErr) {
      setError(localErr);
      return;
    }
    setSubmitting(true);
    try {
      await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      navigate("/login", { replace: true, state: { signupSuccess: true } });
    } catch (err) {
      const data = err.response?.data;
      const fromFields = firstFieldMessages(data);
      setError(fromFields || getApiErrorMessage(err, "Could not create your account."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard>
        <div className="px-8 pt-8 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">Smart Campus</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create your account</h1>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            Use your campus email and a strong password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-4" noValidate aria-busy={submitting}>
          {error && <AuthAlert variant="error">{error}</AuthAlert>}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1.5">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none disabled:bg-slate-50"
              placeholder="Alex Student"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none disabled:bg-slate-50"
              placeholder="you@university.edu"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pr-16 text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none disabled:bg-slate-50"
                placeholder="Create a password"
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
            <p className="text-xs text-slate-500 mt-1.5">{PWD_HINT}</p>
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm password
            </label>
            <input
              id="confirm"
              name="confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none disabled:bg-slate-50"
              placeholder="Repeat password"
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/25 disabled:opacity-55 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Creating your account…" : "Sign up"}
          </button>

          <p className="text-center text-sm text-slate-600 pt-1">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </form>
      </AuthCard>
    </AuthShell>
  );
}

export default SignupPage;

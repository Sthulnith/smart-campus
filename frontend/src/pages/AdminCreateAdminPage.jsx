import React, { useState } from "react";
import API from "../services/api";
import { AuthAlert, AuthCard, AuthShell } from "../components/AuthShell";
import { getApiErrorMessage } from "../utils/authApi";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PWD_HINT = "At least 8 characters with one letter and one number.";

function AdminCreateAdminPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!name.trim()) return "Enter a name.";
    if (!email.trim()) return "Enter an email.";
    if (!EMAIL_REGEX.test(email.trim())) return "Enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) return "Password must include at least one letter and one number.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await API.post("/admin/users", {
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setSuccessMessage(data?.message || "Admin account created successfully");
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not create admin account."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard>
        <div className="px-8 pt-8 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">Smart Campus</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create admin account</h1>
          <p className="text-slate-600 mt-2 text-sm leading-relaxed">
            Admin-only form for creating a new administrator user.
          </p>
        </div>

        <form onSubmit={onSubmit} className="px-8 pb-8 pt-4 space-y-4" noValidate aria-busy={submitting}>
          {successMessage && <AuthAlert variant="success">{successMessage}</AuthAlert>}
          {error && <AuthAlert variant="error">{error}</AuthAlert>}

          <div>
            <label htmlFor="admin-name" className="block text-sm font-medium text-slate-700 mb-1.5">
              Name
            </label>
            <input
              id="admin-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none disabled:bg-slate-50"
              placeholder="Admin Name"
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none disabled:bg-slate-50"
              placeholder="admin@university.edu"
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pr-16 text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none disabled:bg-slate-50"
                placeholder="Create a password"
                disabled={submitting}
                required
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
            <label htmlFor="admin-confirm-password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm password
            </label>
            <input
              id="admin-confirm-password"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none disabled:bg-slate-50"
              placeholder="Repeat password"
              disabled={submitting}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/25 disabled:opacity-55 disabled:cursor-not-allowed transition"
          >
            {submitting ? "Creating admin…" : "Create admin"}
          </button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}

export default AdminCreateAdminPage;


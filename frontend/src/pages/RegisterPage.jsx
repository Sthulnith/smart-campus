import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthAlert, AuthCard, AuthShell } from "../components/AuthShell";
import { getApiErrorMessage } from "../utils/authApi";
import { User, Mail, Lock, Eye, EyeOff, GraduationCap, ArrowRight } from "lucide-react";

const PWD_HINT = "Use 8+ characters with letters & numbers.";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const clientValidate = () => {
    if (!name.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter your email.";
    if (!EMAIL_REGEX.test(email.trim())) return "Invalid email format.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
      return "Include at least one letter and one number.";
    }
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const v = clientValidate();
    if (v) {
      setError(v);
      return;
    }
    setSubmitting(true);
    try {
      await API.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login", { replace: true, state: { signupSuccess: true } });
      }, 1500);
    } catch (err) {
      setError(getApiErrorMessage(err, "Registration failed. Try again."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard>
        <div className="p-10 pt-12 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-[20px] shadow-xl shadow-indigo-200 mb-6 animate-in zoom-in-50 duration-500">
            <GraduationCap className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Join EduNexus</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Create your campus account</p>
        </div>

        <form onSubmit={handleSubmit} className="px-10 pb-12 space-y-6" noValidate>
          {success && <AuthAlert variant="success">Account created! Redirecting to sign in...</AuthAlert>}
          {error && <AuthAlert variant="error">{error}</AuthAlert>}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                 <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 outline-none transition text-sm font-bold"
                  placeholder="e.g. Alex Johnson"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                 <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 outline-none transition text-sm font-bold"
                  placeholder="name@university.edu"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Password</label>
              <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                 <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 outline-none transition text-sm font-bold"
                  placeholder="At least 8 characters"
                  required
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight ml-1">{PWD_HINT}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                 <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 outline-none transition text-sm font-bold"
                  placeholder="Repeat your password"
                  required
                  disabled={submitting}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {submitting ? "Creating..." : "Create Account"}
            <ArrowRight size={16} />
          </button>

          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Already a member? <Link to="/login" className="text-indigo-500 hover:text-indigo-600">Sign In</Link>
          </p>
        </form>
      </AuthCard>
    </AuthShell>
  );
}

export default RegisterPage;

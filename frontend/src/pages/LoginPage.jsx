import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { AuthAlert, AuthCard, AuthShell } from "../components/AuthShell";
import { useAuth } from "../contexts/AuthContext";
import { getApiErrorMessage } from "../utils/authApi";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

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
        <div className="p-10 pt-12 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-[20px] shadow-xl shadow-indigo-200 mb-6 animate-in zoom-in-50 duration-500">
            <GraduationCap className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">EduNexus</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">EduNexus Hub</p>
        </div>

        <div className="px-10 pb-12 space-y-8">
          {passwordResetDone && (
            <AuthAlert variant="success">Password updated. Sign in now.</AuthAlert>
          )}
          {signupSuccess && (
            <AuthAlert variant="success">Account created. Please sign in.</AuthAlert>
          )}
          {oauthError && <AuthAlert variant="error">{oauthError}</AuthAlert>}
          {formError && <AuthAlert variant="error">{formError}</AuthAlert>}

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-100 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition shadow-sm active:scale-95 disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-50"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-300 bg-white px-4">Or use email</div>
            </div>

            <form onSubmit={handleEmailSignIn} className="space-y-6">
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
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                   <Link to="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition">Forgot?</Link>
                </div>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                   <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-indigo-100 outline-none transition text-sm font-bold"
                    placeholder="Your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {submitting ? "Signing in..." : "Sign In"}
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Don't have an account? <Link to="/register" className="text-indigo-500 hover:text-indigo-600">Register</Link>
          </p>
        </div>
      </AuthCard>
    </AuthShell>
  );
}

export default LoginPage;

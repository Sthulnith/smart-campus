import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthAlert, AuthCard, AuthShell } from "../components/AuthShell";
import { useAuth } from "../contexts/AuthContext";

const AUTH_RETURN_KEY = "authReturnTo";

function consumeReturnPath() {
  let target = sessionStorage.getItem(AUTH_RETURN_KEY);
  sessionStorage.removeItem(AUTH_RETURN_KEY);
  if (!target || target === "/login" || target === "/signup") target = "/";
  if (!target.startsWith("/") || target.startsWith("//")) target = "/";
  return target;
}

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { fetchCurrentUser } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetchCurrentUser()
      .then((currentUser) => {
        if (!isMounted) return;
        if (currentUser) {
          navigate(consumeReturnPath(), { replace: true });
        } else {
          setError("We could not finish sign-in. Try again.");
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("We could not finish sign-in. Try again.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fetchCurrentUser, navigate]);

  if (error) {
    return (
      <AuthShell>
        <AuthCard>
          <div className="p-8 space-y-4">
            <AuthAlert variant="error">{error}</AuthAlert>
            <p className="text-sm text-slate-600">
              If the problem continues, sign in with email or contact support.
            </p>
            <Link
              to="/login"
              className="inline-flex justify-center w-full py-3 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition text-center"
            >
              Back to sign in
            </Link>
          </div>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthCard>
        <div className="p-10 flex flex-col items-center text-center">
          <div
            className="h-10 w-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mb-5"
            aria-hidden
          />
          <p className="text-slate-800 font-medium">Finishing Google sign-in…</p>
          <p className="text-slate-500 text-sm mt-2 max-w-xs">This usually takes just a moment.</p>
        </div>
      </AuthCard>
    </AuthShell>
  );
}

export default AuthCallbackPage;

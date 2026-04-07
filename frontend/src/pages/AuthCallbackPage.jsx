import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { user, fetchCurrentUser } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetchCurrentUser()
      .then((currentUser) => {
        if (!isMounted) return;
        if (currentUser) {
          navigate("/", { replace: true });
        } else {
          setError("Authentication failed.");
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Authentication failed.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fetchCurrentUser, navigate]);

  if (user) {
    return <Navigate to="/" replace />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
          <div className="text-red-600 font-semibold mb-2">Sign-in failed</div>
          <div className="text-gray-700 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-xl shadow p-6 text-gray-700">
        Completing sign-in...
      </div>
    </div>
  );
}

export default AuthCallbackPage;


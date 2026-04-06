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
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return <div className="p-6">Completing sign-in...</div>;
}

export default AuthCallbackPage;


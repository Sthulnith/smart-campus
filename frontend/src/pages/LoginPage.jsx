import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

function LoginPage() {
  const backendBaseUrl = process.env.REACT_APP_BACKEND_BASE_URL || "http://localhost:8080";
  const [searchParams] = useSearchParams();

  const errorMessage = useMemo(() => {
    const error = searchParams.get("error");
    if (!error) return null;
    if (error === "oauth") {
      return decodeURIComponent(searchParams.get("message") || "OAuth login failed.");
    }
    return "Login failed.";
  }, [searchParams]);

  const handleGoogleLogin = () => {
    window.location.href = `${backendBaseUrl}/oauth2/authorization/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Smart Campus</h1>
        <p className="text-gray-600 mb-6">Sign in to continue</p>

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm text-left">
            {errorMessage}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default LoginPage;


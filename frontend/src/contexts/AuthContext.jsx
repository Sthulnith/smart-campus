import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await API.get("/auth/me");
      setUser(response.data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null);
        return null;
      }
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser().catch(() => setLoading(false));
  }, [fetchCurrentUser]);

  const logout = useCallback(async () => {
    await API.post("/auth/logout");
    setUser(null);
  }, []);

  const isAdmin = user?.role === "ROLE_ADMIN";

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      loading,
      fetchCurrentUser,
      logout,
      setUser,
    }),
    [user, isAdmin, loading, fetchCurrentUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}


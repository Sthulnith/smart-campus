import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";

const AuthContext = createContext(null);
const AUTH_RETURN_KEY = "authReturnTo";

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
    try {
      await API.post("/auth/logout");
    } finally {
      try {
        sessionStorage.removeItem(AUTH_RETURN_KEY);
      } catch {
        /* ignore */
      }
      setUser(null);
    }
  }, []);

  const signInWithPassword = useCallback(async (email, password) => {
    await API.post("/auth/signin", { email, password });
    return fetchCurrentUser();
  }, [fetchCurrentUser]);

  const signUp = useCallback(async (payload) => {
    await API.post("/auth/signup", payload);
  }, []);

  const hasRole = useCallback(
    (role) => user?.role === role,
    [user]
  );

  const isAdmin = hasRole("ROLE_ADMIN");
  const isStudent = hasRole("ROLE_STUDENT");
  const isStaff = hasRole("ROLE_STAFF");
  const isTechnician = hasRole("ROLE_TECHNICIAN");

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      isStudent,
      isStaff,
      isTechnician,
      hasRole,
      loading,
      fetchCurrentUser,
      logout,
      signInWithPassword,
      signUp,
      setUser,
    }),
    [user, isAdmin, isStudent, isStaff, isTechnician, hasRole, loading, fetchCurrentUser, logout, signInWithPassword, signUp]
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


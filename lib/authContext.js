"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "./api";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = async () => {
    try {
      const data = await apiFetch("/api/auth/me");
      if (data && data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Safety timeout: Never stay stuck in loading state for more than 1 second
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 1000);

    fetchCurrentUser().finally(() => {
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const login = async (email, password) => {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.success && data.user) {
      if (data.token && typeof window !== "undefined") {
        try {
          localStorage.setItem("token", data.token);
        } catch (e) {}
      }
      setUser(data.user);
      return data;
    }
    throw new Error(data.message || "Login failed");
  };

  const logout = async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // ignore error
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("token");
      } catch (e) {}
    }
    setUser(null);
    router.push("/swar-media-admin/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

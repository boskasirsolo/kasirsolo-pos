"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  login as loginFn,
  logout as logoutFn,
  getSession,
  getCurrentUser,
  onAuthStateChange,
  type AuthUser,
} from "@/lib/auth";
import type { Session } from "@supabase/supabase-js";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [currentSession, currentUser] = await Promise.all([
          getSession(),
          getCurrentUser(),
        ]);
        setSession(currentSession);
        setUser(currentUser);
      } catch {
        // Not authenticated
      } finally {
        setLoading(false);
      }
    }

    init();

    const { unsubscribe } = onAuthStateChange(async (newSession) => {
      setSession(newSession);
      if (newSession) {
        const u = await getCurrentUser();
        setUser(u);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoginLoading(true);
    setError(null);

    try {
      const result = await loginFn(email, password);
      setUser(result.user);
      setSession(result.session);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login gagal";
      setError(message);
      throw err;
    } finally {
      setLoginLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutFn();
      setUser(null);
      setSession(null);
      router.replace("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Logout gagal";
      setError(message);
    }
  }, [router]);

  return {
    user,
    session,
    loading,
    error,
    loginLoading,
    login,
    logout,
    isAuthenticated: !!session,
  };
}

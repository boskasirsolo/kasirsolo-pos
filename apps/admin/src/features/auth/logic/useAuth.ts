"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase";
import type { AuthState, LoginCredentials } from "../data/types";

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: false,
    error: null,
  });

  const login = async ({ email, password }: LoginCredentials) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message === "Invalid login credentials"
            ? "Email atau password salah"
            : error.message,
        }));
        return false;
      }

      if (data.user) {
        setState({
          user: {
            id: data.user.id,
            email: data.user.email ?? "",
            displayName: data.user.user_metadata?.display_name ?? null,
            role: data.user.user_metadata?.role ?? "admin",
          },
          loading: false,
          error: null,
        });
        router.replace("/");
        return true;
      }

      return false;
    } catch {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: "Terjadi kesalahan. Silakan coba lagi.",
      }));
      return false;
    }
  };

  const logout = async () => {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return { ...state, login, logout };
}

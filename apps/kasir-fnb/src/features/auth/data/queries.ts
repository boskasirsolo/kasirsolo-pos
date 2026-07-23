"use client";

// Re-export for convenience. The queries layer depends on Supabase
// and can be extended for FnB-specific auth needs.

export { login, logout, getSession, getCurrentUser, onAuthStateChange } from "@/lib/auth";
export type { AuthUser } from "@/lib/auth";

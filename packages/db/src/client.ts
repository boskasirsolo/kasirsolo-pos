import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type SupabaseClientInstance = SupabaseClient;

/**
 * Check whether the required Supabase environment variables are set.
 * Useful for conditional rendering (e.g. show a setup page instead of crashing).
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Create a Supabase client for browser-side usage.
 * Uses the public anon key - safe to expose in the browser.
 * Returns null when the required environment variables are not set.
 */
export function createBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn(
      "[kasirsolo-db] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY \u2013 Supabase client not created."
    );
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Create a Supabase client for server-side usage.
 * Uses the service role key - never expose in the browser.
 * Returns null when the required environment variables are not set.
 */
export function createServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.warn(
      "[kasirsolo-db] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY \u2013 Supabase client not created."
    );
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Factory that creates the appropriate Supabase client based on context.
 * Pass "browser" for client-side or "server" for server-side.
 * Returns null when the required environment variables are not set.
 */
export function createSupabaseClient(
  context: "browser" | "server" = "server"
): SupabaseClient | null {
  return context === "browser" ? createBrowserClient() : createServerClient();
}

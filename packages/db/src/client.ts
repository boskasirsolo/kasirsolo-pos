import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type SupabaseClientInstance = SupabaseClient;

/**
 * Create a Supabase client for browser-side usage.
 * Uses the public anon key - safe to expose in the browser.
 */
export function createBrowserClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables"
    );
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
 */
export function createServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
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
 */
export function createSupabaseClient(
  context: "browser" | "server" = "server"
): SupabaseClient {
  return context === "browser" ? createBrowserClient() : createServerClient();
}

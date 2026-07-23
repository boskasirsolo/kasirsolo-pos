import { createBrowserClient } from "@kasirsolo/db";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create a singleton Supabase browser client.
 * Used only for auth, license, and device management.
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient();
  }
  return supabaseInstance;
}

export default getSupabase;

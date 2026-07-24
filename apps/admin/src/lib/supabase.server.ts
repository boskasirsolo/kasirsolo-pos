import "server-only";

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let serverClient: SupabaseClient | null = null;

/**
 * Server-side Supabase client using service role key.
 * This file MUST NOT be imported from client-side code.
 * The "server-only" import enforces this at build time.
 */
export function getSupabaseServer(): SupabaseClient {
  if (serverClient) return serverClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  serverClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverClient;
}

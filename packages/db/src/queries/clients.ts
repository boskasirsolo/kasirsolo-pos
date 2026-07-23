import type { SupabaseClient } from "@supabase/supabase-js";
import type { KspClient, KspClientInsert, KspClientUpdate, KspClientStatus } from "../types/client";

/**
 * Fetch all clients with optional filtering and pagination.
 */
export async function getClients(
  supabase: SupabaseClient,
  options?: {
    status?: KspClientStatus;
    search?: string;
    limit?: number;
    offset?: number;
    orderBy?: keyof KspClient;
    ascending?: boolean;
  }
): Promise<{ data: KspClient[]; count: number }> {
  const {
    status,
    search,
    limit = 50,
    offset = 0,
    orderBy = "created_at",
    ascending = false,
  } = options ?? {};

  let query = supabase
    .from("ksp_clients")
    .select("*", { count: "exact" });

  if (status) {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,app_code.ilike.%${search}%`
    );
  }

  query = query
    .order(orderBy, { ascending })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;
  return { data: (data ?? []) as KspClient[], count: count ?? 0 };
}

/**
 * Fetch a single client by ID.
 */
export async function getClientById(
  supabase: SupabaseClient,
  clientId: string
): Promise<KspClient | null> {
  const { data, error } = await supabase
    .from("ksp_clients")
    .select("*")
    .eq("id", clientId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as KspClient) ?? null;
}

/**
 * Create a new client record.
 */
export async function createClient(
  supabase: SupabaseClient,
  client: KspClientInsert
): Promise<KspClient> {
  const { data, error } = await supabase
    .from("ksp_clients")
    .insert(client)
    .select()
    .single();

  if (error) throw error;
  return data as KspClient;
}

/**
 * Update an existing client record.
 */
export async function updateClient(
  supabase: SupabaseClient,
  clientId: string,
  updates: KspClientUpdate
): Promise<KspClient> {
  const { data, error } = await supabase
    .from("ksp_clients")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", clientId)
    .select()
    .single();

  if (error) throw error;
  return data as KspClient;
}

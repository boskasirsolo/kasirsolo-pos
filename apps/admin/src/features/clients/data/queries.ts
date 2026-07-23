import { SupabaseClient } from "@supabase/supabase-js";
import type { ClientFilter, ClientListResponse, ClientWithRelations } from "./types";
import type { KspClient, KspClientInsert, KspClientUpdate } from "@kasirsolo/db/types";

export async function getClients(
  supabase: SupabaseClient,
  filter: ClientFilter
): Promise<ClientListResponse> {
  let query = supabase
    .from("ksp_clients")
    .select("*", { count: "exact" });

  // Search
  if (filter.search) {
    query = query.or(
      `name.ilike.%${filter.search}%,phone.ilike.%${filter.search}%,email.ilike.%${filter.search}%,app_code.ilike.%${filter.search}%`
    );
  }

  // Status filter
  if (filter.status !== "all") {
    query = query.eq("status", filter.status);
  }

  // Source filter
  if (filter.source !== "all") {
    query = query.eq("source", filter.source);
  }

  // Sorting
  query = query.order(filter.sortBy, { ascending: filter.sortOrder === "asc" });

  // Pagination
  const from = (filter.page - 1) * filter.perPage;
  const to = from + filter.perPage - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  const total = count ?? 0;

  return {
    data: (data as ClientWithRelations[]) ?? [],
    total,
    page: filter.page,
    perPage: filter.perPage,
    totalPages: Math.ceil(total / filter.perPage),
  };
}

export async function getClientById(
  supabase: SupabaseClient,
  id: string
): Promise<KspClient | null> {
  const { data, error } = await supabase
    .from("ksp_clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as KspClient;
}

export async function createClient(
  supabase: SupabaseClient,
  client: KspClientInsert
): Promise<KspClient> {
  const { data, error } = await supabase
    .from("ksp_clients")
    .insert(client)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as KspClient;
}

export async function updateClient(
  supabase: SupabaseClient,
  id: string,
  updates: KspClientUpdate
): Promise<KspClient> {
  const { data, error } = await supabase
    .from("ksp_clients")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as KspClient;
}

export async function deleteClient(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("ksp_clients").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

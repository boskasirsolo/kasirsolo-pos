import type { SupabaseClient } from "@supabase/supabase-js";
import type { KspApp, KspAppInsert, KspAppUpdate, KspAppStatus } from "../types/app";

/**
 * Fetch all apps with optional filtering.
 */
export async function getApps(
  supabase: SupabaseClient,
  options?: {
    status?: KspAppStatus;
    category?: string;
  }
): Promise<KspApp[]> {
  let query = supabase
    .from("ksp_apps")
    .select("*")
    .order("name", { ascending: true });

  if (options?.status) query = query.eq("status", options.status);
  if (options?.category) query = query.eq("category", options.category);

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as KspApp[];
}

/**
 * Fetch a single app by its unique code.
 */
export async function getAppByCode(
  supabase: SupabaseClient,
  code: string
): Promise<KspApp | null> {
  const { data, error } = await supabase
    .from("ksp_apps")
    .select("*")
    .eq("code", code)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as KspApp) ?? null;
}

/**
 * Fetch a single app by ID.
 */
export async function getAppById(
  supabase: SupabaseClient,
  appId: string
): Promise<KspApp | null> {
  const { data, error } = await supabase
    .from("ksp_apps")
    .select("*")
    .eq("id", appId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as KspApp) ?? null;
}

/**
 * Create a new app entry.
 */
export async function createApp(
  supabase: SupabaseClient,
  app: KspAppInsert
): Promise<KspApp> {
  const { data, error } = await supabase
    .from("ksp_apps")
    .insert(app)
    .select()
    .single();

  if (error) throw error;
  return data as KspApp;
}

/**
 * Update an existing app.
 */
export async function updateApp(
  supabase: SupabaseClient,
  appId: string,
  updates: KspAppUpdate
): Promise<KspApp> {
  const { data, error } = await supabase
    .from("ksp_apps")
    .update(updates)
    .eq("id", appId)
    .select()
    .single();

  if (error) throw error;
  return data as KspApp;
}

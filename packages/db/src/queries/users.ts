import type { SupabaseClient } from "@supabase/supabase-js";
import type { KspUser, KspUserInsert, KspUserUpdate, KspUserRole } from "../types/user";

/**
 * Fetch users with optional filtering.
 */
export async function getUsers(
  supabase: SupabaseClient,
  options?: {
    licenseId?: string;
    role?: KspUserRole;
    activeOnly?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: KspUser[]; count: number }> {
  const { licenseId, role, activeOnly, limit = 50, offset = 0 } = options ?? {};

  let query = supabase
    .from("ksp_users")
    .select("*", { count: "exact" });

  if (licenseId) query = query.eq("license_id", licenseId);
  if (role) query = query.eq("role", role);
  if (activeOnly) query = query.eq("is_active", true);

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;
  return { data: (data ?? []) as KspUser[], count: count ?? 0 };
}

/**
 * Get a user by ID.
 */
export async function getUserById(
  supabase: SupabaseClient,
  userId: string
): Promise<KspUser | null> {
  const { data, error } = await supabase
    .from("ksp_users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as KspUser) ?? null;
}

/**
 * Get a user by email address.
 */
export async function getUserByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<KspUser | null> {
  const { data, error } = await supabase
    .from("ksp_users")
    .select("*")
    .eq("email", email)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as KspUser) ?? null;
}

/**
 * Create a new user.
 */
export async function createUser(
  supabase: SupabaseClient,
  user: KspUserInsert
): Promise<KspUser> {
  const { data, error } = await supabase
    .from("ksp_users")
    .insert(user)
    .select()
    .single();

  if (error) throw error;
  return data as KspUser;
}

/**
 * Update a user.
 */
export async function updateUser(
  supabase: SupabaseClient,
  userId: string,
  updates: KspUserUpdate
): Promise<KspUser> {
  const { data, error } = await supabase
    .from("ksp_users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data as KspUser;
}

/**
 * Record a user login by updating last_login_at.
 */
export async function recordUserLogin(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("ksp_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw error;
}

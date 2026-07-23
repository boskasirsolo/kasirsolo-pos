import type { SupabaseClient } from "@supabase/supabase-js";
import type { KspLicense, KspLicenseInsert, KspLicenseUpdate, KspLicenseStatus } from "../types/license";

/**
 * Fetch licenses with optional filtering.
 */
export async function getLicenses(
  supabase: SupabaseClient,
  options?: {
    clientId?: string;
    appId?: string;
    status?: KspLicenseStatus;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: KspLicense[]; count: number }> {
  const { clientId, appId, status, limit = 50, offset = 0 } = options ?? {};

  let query = supabase
    .from("ksp_licenses")
    .select("*", { count: "exact" });

  if (clientId) query = query.eq("client_id", clientId);
  if (appId) query = query.eq("app_id", appId);
  if (status) query = query.eq("status", status);

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;
  return { data: (data ?? []) as KspLicense[], count: count ?? 0 };
}

/**
 * Fetch a single license by ID.
 */
export async function getLicenseById(
  supabase: SupabaseClient,
  licenseId: string
): Promise<KspLicense | null> {
  const { data, error } = await supabase
    .from("ksp_licenses")
    .select("*")
    .eq("id", licenseId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as KspLicense) ?? null;
}

/**
 * Fetch a license by its license key string.
 */
export async function getLicenseByKey(
  supabase: SupabaseClient,
  licenseKey: string
): Promise<KspLicense | null> {
  const { data, error } = await supabase
    .from("ksp_licenses")
    .select("*")
    .eq("license_key", licenseKey)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as KspLicense) ?? null;
}

/**
 * Create a new license.
 */
export async function createLicense(
  supabase: SupabaseClient,
  license: KspLicenseInsert
): Promise<KspLicense> {
  const { data, error } = await supabase
    .from("ksp_licenses")
    .insert(license)
    .select()
    .single();

  if (error) throw error;
  return data as KspLicense;
}

/**
 * Update an existing license.
 */
export async function updateLicense(
  supabase: SupabaseClient,
  licenseId: string,
  updates: KspLicenseUpdate
): Promise<KspLicense> {
  const { data, error } = await supabase
    .from("ksp_licenses")
    .update(updates)
    .eq("id", licenseId)
    .select()
    .single();

  if (error) throw error;
  return data as KspLicense;
}

/**
 * Revoke (deactivate) a license.
 */
export async function revokeLicense(
  supabase: SupabaseClient,
  licenseId: string
): Promise<KspLicense> {
  return updateLicense(supabase, licenseId, { status: "revoked" });
}

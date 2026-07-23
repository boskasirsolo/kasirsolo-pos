import { SupabaseClient } from "@supabase/supabase-js";
import type { LicenseFilter, LicenseWithClient, KspLicenseStatus, KspPlanType, LicenseClientAppRaw } from "./types";

export async function getLicenses(
  supabase: SupabaseClient,
  filter: LicenseFilter
): Promise<{ data: LicenseWithClient[]; total: number }> {
  let query = supabase
    .from("ksp_licenses")
    .select("*, ksp_clients(name, phone), ksp_apps(name)", { count: "exact" });

  if (filter.search) {
    query = query.or(`license_key.ilike.%${filter.search}%`);
  }

  if (filter.status !== "all") {
    query = query.eq("status", filter.status);
  }

  if (filter.planType !== "all") {
    query = query.eq("plan_type", filter.planType);
  }

  const from = (filter.page - 1) * filter.perPage;
  query = query
    .order("created_at", { ascending: false })
    .range(from, from + filter.perPage - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  const licenses: LicenseWithClient[] = (data ?? []).map((l: LicenseClientAppRaw) => ({
    ...l,
    client_name: l.ksp_clients?.name,
    client_phone: l.ksp_clients?.phone,
    app_name: l.ksp_apps?.name,
  }));

  return { data: licenses, total: count ?? 0 };
}

export async function generateActivationKey(
  supabase: SupabaseClient,
  params: {
    clientId: string;
    appId: string;
    planType: string;
    maxDevices: number;
    amountPaid: number;
    expiresAt: string | null;
  }
): Promise<{ license_key: string; license_id: string }> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const licenseKey = `KSP-${segment()}-${segment()}-${segment()}`;

  const { data, error } = await supabase
    .from("ksp_licenses")
    .insert({
      client_id: params.clientId,
      app_id: params.appId,
      license_key: licenseKey,
      plan_type: params.planType,
      status: "active",
      max_devices: params.maxDevices,
      purchased_at: new Date().toISOString(),
      expires_at: params.expiresAt,
      amount_paid: params.amountPaid,
      auto_renew: false,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  // Update client status to active
  await supabase
    .from("ksp_clients")
    .update({ status: "active", activation_key: licenseKey, updated_at: new Date().toISOString() })
    .eq("id", params.clientId);

  // Log activity
  await supabase.from("ksp_activity_logs").insert({
    action: "key_generated",
    entity_type: "license",
    entity_id: data.id,
    details: { license_key: licenseKey, client_id: params.clientId, plan_type: params.planType },
  });

  return { license_key: licenseKey, license_id: data.id };
}

export async function revokeLicense(
  supabase: SupabaseClient,
  licenseId: string
): Promise<void> {
  const { error } = await supabase
    .from("ksp_licenses")
    .update({ status: "revoked" })
    .eq("id", licenseId);

  if (error) throw new Error(error.message);
}

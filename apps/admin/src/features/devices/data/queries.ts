import { SupabaseClient } from "@supabase/supabase-js";
import type { DeviceFilter, DeviceWithRelations } from "./types";

export async function getDevices(
  supabase: SupabaseClient,
  filter: DeviceFilter
): Promise<{ data: DeviceWithRelations[]; total: number }> {
  let query = supabase
    .from("ksp_devices")
    .select("*, ksp_licenses(license_key, ksp_clients(name), ksp_apps(name))", { count: "exact" });

  if (filter.search) {
    query = query.or(`device_name.ilike.%${filter.search}%,fingerprint.ilike.%${filter.search}%`);
  }

  if (filter.activeOnly) {
    query = query.eq("is_active", true);
  }

  const from = (filter.page - 1) * filter.perPage;
  query = query
    .order("activated_at", { ascending: false })
    .range(from, from + filter.perPage - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const devices: DeviceWithRelations[] = (data ?? []).map((d) => {
    const rec = d as Record<string, unknown>;
    const license = rec.ksp_licenses as Record<string, unknown> | null;
    return {
      ...d,
      license_key: license?.license_key as string | undefined,
      client_name: license?.ksp_clients
        ? (license.ksp_clients as { name: string }).name
        : undefined,
      app_name: license?.ksp_apps
        ? (license.ksp_apps as { name: string }).name
        : undefined,
    };
  });

  return { data: devices, total: count ?? 0 };
}

export async function deactivateDevice(
  supabase: SupabaseClient,
  deviceId: string
): Promise<void> {
  const { error } = await supabase
    .from("ksp_devices")
    .update({ is_active: false })
    .eq("id", deviceId);
  if (error) throw new Error(error.message);
}

export async function removeDevice(
  supabase: SupabaseClient,
  deviceId: string
): Promise<void> {
  const { error } = await supabase
    .from("ksp_devices")
    .delete()
    .eq("id", deviceId);
  if (error) throw new Error(error.message);
}

import { SupabaseClient } from "@supabase/supabase-js";
import type { DeviceFilter, DeviceWithRelations, KspDevice, DeviceWithRelationsRaw } from "./types";

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

  const devices: DeviceWithRelations[] = (data ?? []).map((d: DeviceWithRelationsRaw) => {
    const license = d.ksp_licenses;
    return {
      ...d,
      license_key: license?.license_key,
      client_name: license?.ksp_clients?.name,
      app_name: license?.ksp_apps?.name,
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

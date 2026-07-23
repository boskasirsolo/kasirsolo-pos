import type { SupabaseClient } from "@supabase/supabase-js";
import type { KspDevice, KspDeviceInsert, KspDeviceUpdate } from "../types/device";

/**
 * Fetch all devices for a given license.
 */
export async function getDevices(
  supabase: SupabaseClient,
  licenseId: string,
  options?: { activeOnly?: boolean }
): Promise<KspDevice[]> {
  let query = supabase
    .from("ksp_devices")
    .select("*")
    .eq("license_id", licenseId)
    .order("device_number", { ascending: true });

  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as KspDevice[];
}

/**
 * Get a device by its fingerprint within a license scope.
 */
export async function getDeviceByFingerprint(
  supabase: SupabaseClient,
  licenseId: string,
  fingerprint: string
): Promise<KspDevice | null> {
  const { data, error } = await supabase
    .from("ksp_devices")
    .select("*")
    .eq("license_id", licenseId)
    .eq("fingerprint", fingerprint)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as KspDevice) ?? null;
}

/**
 * Bind (register) a new device to a license.
 * Automatically assigns the next available device_number.
 */
export async function bindDevice(
  supabase: SupabaseClient,
  device: KspDeviceInsert
): Promise<KspDevice> {
  // Determine next device number
  const existing = await getDevices(supabase, device.license_id);
  const usedNumbers = new Set(existing.map((d) => d.device_number));
  let nextNumber = 1;
  while (usedNumbers.has(nextNumber)) {
    nextNumber++;
  }

  const { data, error } = await supabase
    .from("ksp_devices")
    .insert({
      ...device,
      device_number: device.device_number ?? nextNumber,
      is_active: device.is_active ?? true,
    })
    .select()
    .single();

  if (error) throw error;
  return data as KspDevice;
}

/**
 * Unbind (deactivate) a device by setting is_active to false.
 */
export async function unbindDevice(
  supabase: SupabaseClient,
  deviceId: string
): Promise<KspDevice> {
  const { data, error } = await supabase
    .from("ksp_devices")
    .update({ is_active: false })
    .eq("id", deviceId)
    .select()
    .single();

  if (error) throw error;
  return data as KspDevice;
}

/**
 * Update device information.
 */
export async function updateDevice(
  supabase: SupabaseClient,
  deviceId: string,
  updates: KspDeviceUpdate
): Promise<KspDevice> {
  const { data, error } = await supabase
    .from("ksp_devices")
    .update(updates)
    .eq("id", deviceId)
    .select()
    .single();

  if (error) throw error;
  return data as KspDevice;
}

/**
 * Update the last_seen_at timestamp for a device (heartbeat).
 */
export async function touchDevice(
  supabase: SupabaseClient,
  deviceId: string
): Promise<void> {
  const { error } = await supabase
    .from("ksp_devices")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", deviceId);

  if (error) throw error;
}

/**
 * Count active devices for a license.
 */
export async function countActiveDevices(
  supabase: SupabaseClient,
  licenseId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("ksp_devices")
    .select("*", { count: "exact", head: true })
    .eq("license_id", licenseId)
    .eq("is_active", true);

  if (error) throw error;
  return count ?? 0;
}

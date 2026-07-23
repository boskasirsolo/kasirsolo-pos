import type { SupabaseClient } from "@supabase/supabase-js";
import type { KspSetting, KspSettingUpdate } from "../types/setting";

/**
 * Fetch all settings, optionally filtered by group.
 */
export async function getSettings(
  supabase: SupabaseClient,
  group?: string
): Promise<KspSetting[]> {
  let query = supabase
    .from("ksp_settings")
    .select("*")
    .order("group", { ascending: true })
    .order("key", { ascending: true });

  if (group) {
    query = query.eq("group", group);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data ?? []) as KspSetting[];
}

/**
 * Get a single setting by group and key.
 */
export async function getSetting(
  supabase: SupabaseClient,
  group: string,
  key: string
): Promise<KspSetting | null> {
  const { data, error } = await supabase
    .from("ksp_settings")
    .select("*")
    .eq("group", group)
    .eq("key", key)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return (data as KspSetting) ?? null;
}

/**
 * Get just the value of a setting by group and key.
 */
export async function getSettingValue<T = unknown>(
  supabase: SupabaseClient,
  group: string,
  key: string,
  defaultValue?: T
): Promise<T> {
  const setting = await getSetting(supabase, group, key);
  if (!setting) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Setting not found: ${group}.${key}`);
  }
  return setting.value as T;
}

/**
 * Update a setting value by its ID.
 */
export async function updateSettings(
  supabase: SupabaseClient,
  settingId: string,
  update: KspSettingUpdate
): Promise<KspSetting> {
  const { data, error } = await supabase
    .from("ksp_settings")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", settingId)
    .select()
    .single();

  if (error) throw error;
  return data as KspSetting;
}

/**
 * Update a setting value by group and key.
 */
export async function updateSettingByKey(
  supabase: SupabaseClient,
  group: string,
  key: string,
  value: unknown
): Promise<KspSetting> {
  const { data, error } = await supabase
    .from("ksp_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("group", group)
    .eq("key", key)
    .select()
    .single();

  if (error) throw error;
  return data as KspSetting;
}

/**
 * Bulk update multiple settings at once.
 */
export async function bulkUpdateSettings(
  supabase: SupabaseClient,
  updates: Array<{ id: string; value: unknown }>
): Promise<KspSetting[]> {
  const results: KspSetting[] = [];
  for (const { id, value } of updates) {
    const result = await updateSettings(supabase, id, { value });
    results.push(result);
  }
  return results;
}

import { SupabaseClient } from "@supabase/supabase-js";
import type { AppWithStats } from "./types";

export async function getApps(supabase: SupabaseClient): Promise<AppWithStats[]> {
  const { data, error } = await supabase
    .from("ksp_apps")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  // Fetch license counts
  const { data: licenseCounts } = await supabase
    .from("ksp_licenses")
    .select("app_id, status");

  const stats: Record<string, { total: number; active: number }> = {};
  for (const l of licenseCounts ?? []) {
    if (!stats[l.app_id]) stats[l.app_id] = { total: 0, active: 0 };
    stats[l.app_id].total++;
    if (l.status === "active") stats[l.app_id].active++;
  }

  return (data ?? []).map((app) => ({
    ...app,
    pricing: app.pricing ?? { basic: 0, pro: 0, enterprise: 0, lifetime: 0 },
    features: app.features ?? [],
    total_licenses: stats[app.id]?.total ?? 0,
    active_licenses: stats[app.id]?.active ?? 0,
  }));
}

export async function toggleAppStatus(
  supabase: SupabaseClient,
  appId: string,
  isActive: boolean
): Promise<void> {
  const { error } = await supabase
    .from("ksp_apps")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", appId);
  if (error) throw new Error(error.message);
}

import { SupabaseClient } from "@supabase/supabase-js";
import type { TrialClient, TrialStats, TrialTab } from "./types";

export async function getTrialStats(supabase: SupabaseClient): Promise<TrialStats> {
  const now = new Date().toISOString();
  const threeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: active },
    { count: expiring },
    { count: expired },
    { count: extended },
    { count: locked },
  ] = await Promise.all([
    supabase.from("ksp_clients").select("*", { count: "exact", head: true })
      .eq("status", "trial").gt("trial_expires", now),
    supabase.from("ksp_clients").select("*", { count: "exact", head: true })
      .eq("status", "trial").lte("trial_expires", threeDays).gt("trial_expires", now),
    supabase.from("ksp_clients").select("*", { count: "exact", head: true })
      .eq("status", "trial").lte("trial_expires", now),
    supabase.from("ksp_clients").select("*", { count: "exact", head: true })
      .eq("trial_extended", true),
    supabase.from("ksp_clients").select("*", { count: "exact", head: true })
      .eq("status", "locked"),
  ]);

  return {
    active: active ?? 0,
    expiring: expiring ?? 0,
    expired: expired ?? 0,
    extended: extended ?? 0,
    locked: locked ?? 0,
  };
}

export async function getTrialClients(
  supabase: SupabaseClient,
  tab: TrialTab
): Promise<TrialClient[]> {
  const now = new Date().toISOString();
  const threeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from("ksp_clients")
    .select("*");

  switch (tab) {
    case "active":
      query = query.eq("status", "trial").gt("trial_expires", threeDays);
      break;
    case "expiring":
      query = query.eq("status", "trial").lte("trial_expires", threeDays).gt("trial_expires", now);
      break;
    case "expired":
      query = query.eq("status", "trial").lte("trial_expires", now);
      break;
    case "extended":
      query = query.eq("trial_extended", true);
      break;
    case "locked":
      query = query.eq("status", "locked");
      break;
  }

  query = query.order("trial_expires", { ascending: true }).limit(50);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const nowMs = Date.now();
  return (data ?? []).map((c) => ({
    ...c,
    days_left: c.trial_expires
      ? Math.ceil((new Date(c.trial_expires).getTime() - nowMs) / (1000 * 60 * 60 * 24))
      : null,
  }));
}

export async function extendTrial(
  supabase: SupabaseClient,
  clientId: string,
  extraDays: number = 7
): Promise<void> {
  const { data: client } = await supabase
    .from("ksp_clients")
    .select("trial_expires")
    .eq("id", clientId)
    .single();

  if (!client) throw new Error("Client not found");

  const currentExpiry = new Date(client.trial_expires ?? Date.now());
  const newExpiry = new Date(Math.max(currentExpiry.getTime(), Date.now()) + extraDays * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from("ksp_clients")
    .update({
      trial_expires: newExpiry.toISOString(),
      trial_extended: true,
      status: "trial",
      updated_at: new Date().toISOString(),
    })
    .eq("id", clientId);

  if (error) throw new Error(error.message);

  await supabase.from("ksp_activity_logs").insert({
    action: "trial_extended",
    entity_type: "client",
    entity_id: clientId,
    details: { extra_days: extraDays, new_expires: newExpiry.toISOString() },
  });
}

export async function lockClient(
  supabase: SupabaseClient,
  clientId: string
): Promise<void> {
  const { error } = await supabase
    .from("ksp_clients")
    .update({ status: "locked", updated_at: new Date().toISOString() })
    .eq("id", clientId);

  if (error) throw new Error(error.message);
}

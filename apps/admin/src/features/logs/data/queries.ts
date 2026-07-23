import { SupabaseClient } from "@supabase/supabase-js";
import type { LogFilter, ActivityLog } from "./types";

export async function getActivityLogs(
  supabase: SupabaseClient,
  filter: LogFilter
): Promise<{ data: ActivityLog[]; total: number }> {
  let query = supabase
    .from("ksp_activity_logs")
    .select("*", { count: "exact" });

  if (filter.action !== "all") {
    query = query.eq("action", filter.action);
  }

  if (filter.entityType !== "all") {
    query = query.eq("entity_type", filter.entityType);
  }

  if (filter.dateFrom) {
    query = query.gte("created_at", filter.dateFrom);
  }

  if (filter.dateTo) {
    query = query.lte("created_at", filter.dateTo);
  }

  if (filter.search) {
    query = query.or(`action.ilike.%${filter.search}%,entity_id.ilike.%${filter.search}%`);
  }

  const from = (filter.page - 1) * filter.perPage;
  query = query
    .order("created_at", { ascending: false })
    .range(from, from + filter.perPage - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return { data: (data as ActivityLog[]) ?? [], total: count ?? 0 };
}

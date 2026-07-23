import type { SupabaseClient } from "@supabase/supabase-js";
import type { KspLog, KspLogInsert, KspLogAction, KspLogLevel } from "../types/log";

/**
 * Fetch logs with optional filtering and pagination.
 */
export async function getLogs(
  supabase: SupabaseClient,
  options?: {
    clientId?: string;
    userId?: string;
    action?: KspLogAction;
    level?: KspLogLevel;
    entityType?: string;
    entityId?: string;
    limit?: number;
    offset?: number;
    since?: string;
  }
): Promise<{ data: KspLog[]; count: number }> {
  const {
    clientId,
    userId,
    action,
    level,
    entityType,
    entityId,
    limit = 100,
    offset = 0,
    since,
  } = options ?? {};

  let query = supabase
    .from("ksp_logs")
    .select("*", { count: "exact" });

  if (clientId) query = query.eq("client_id", clientId);
  if (userId) query = query.eq("user_id", userId);
  if (action) query = query.eq("action", action);
  if (level) query = query.eq("level", level);
  if (entityType) query = query.eq("entity_type", entityType);
  if (entityId) query = query.eq("entity_id", entityId);
  if (since) query = query.gte("created_at", since);

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;
  return { data: (data ?? []) as KspLog[], count: count ?? 0 };
}

/**
 * Create a new log entry.
 */
export async function createLog(
  supabase: SupabaseClient,
  log: KspLogInsert
): Promise<KspLog> {
  const { data, error } = await supabase
    .from("ksp_logs")
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data as KspLog;
}

/**
 * Convenience: create an info-level log entry.
 */
export async function logInfo(
  supabase: SupabaseClient,
  params: {
    clientId?: string;
    userId?: string;
    action: KspLogAction;
    entityType: string;
    entityId?: string;
    message: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<KspLog> {
  return createLog(supabase, {
    client_id: params.clientId ?? null,
    user_id: params.userId ?? null,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    message: params.message,
    details: params.details ?? null,
    ip_address: params.ipAddress ?? null,
    user_agent: params.userAgent ?? null,
    level: "info",
  });
}

/**
 * Convenience: create an error-level log entry.
 */
export async function logError(
  supabase: SupabaseClient,
  params: {
    clientId?: string;
    userId?: string;
    entityType: string;
    entityId?: string;
    message: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<KspLog> {
  return createLog(supabase, {
    client_id: params.clientId ?? null,
    user_id: params.userId ?? null,
    action: "error",
    entity_type: params.entityType,
    entity_id: params.entityId ?? null,
    message: params.message,
    details: params.details ?? null,
    ip_address: params.ipAddress ?? null,
    user_agent: params.userAgent ?? null,
    level: "error",
  });
}

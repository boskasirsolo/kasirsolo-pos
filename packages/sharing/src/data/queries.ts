import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ShareMission,
  ShareLog,
  ShareMissionType,
  ShareMethod,
  MissionEligibility,
} from "./types";
import { SHARE_CONFIG } from "./config";

// ============================================================================
// Mappers: Convert snake_case DB rows to camelCase domain types
// ============================================================================

function mapMission(row: Record<string, unknown>): ShareMission {
  return {
    id: row.id as string,
    licenseId: row.license_id as string,
    clientId: row.client_id as string,
    missionType: row.mission_type as ShareMissionType,
    missionNumber: row.mission_number as number,
    requiredShares: row.required_shares as number,
    completedShares: row.completed_shares as number,
    status: row.status as ShareMission["status"],
    rewardDays: row.reward_days as number,
    startedAt: row.started_at as string,
    completedAt: (row.completed_at as string) ?? null,
  };
}

function mapShareLog(row: Record<string, unknown>): ShareLog {
  return {
    id: row.id as string,
    missionId: row.mission_id as string,
    licenseId: row.license_id as string,
    clientId: row.client_id as string,
    shareMethod: row.share_method as ShareMethod,
    shareTarget: (row.share_target as string) ?? null,
    sharedAt: row.shared_at as string,
    verified: row.verified as boolean,
  };
}

// ============================================================================
// Mission Queries
// ============================================================================

/**
 * Fetch all share missions for a license, optionally filtered by type.
 */
export async function fetchMissions(
  supabase: SupabaseClient,
  licenseId: string,
  missionType?: ShareMissionType
): Promise<ShareMission[]> {
  let query = supabase
    .from("ksp_share_missions")
    .select("*")
    .eq("license_id", licenseId)
    .order("mission_number", { ascending: true });

  if (missionType) {
    query = query.eq("mission_type", missionType);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapMission);
}

/**
 * Fetch the currently active mission for a license and type.
 */
export async function fetchActiveMission(
  supabase: SupabaseClient,
  licenseId: string,
  missionType: ShareMissionType
): Promise<ShareMission | null> {
  const { data, error } = await supabase
    .from("ksp_share_missions")
    .select("*")
    .eq("license_id", licenseId)
    .eq("mission_type", missionType)
    .eq("status", "active")
    .order("mission_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? mapMission(data) : null;
}

/**
 * Check if user can start a new mission of the given type.
 */
export async function checkMissionEligibility(
  supabase: SupabaseClient,
  licenseId: string,
  missionType: ShareMissionType
): Promise<MissionEligibility> {
  const missions = await fetchMissions(supabase, licenseId, missionType);
  const config = SHARE_CONFIG.missions[missionType];

  // Check for active (in-progress) mission
  const activeMission = missions.find((m) => m.status === "active");
  if (activeMission) {
    return {
      canStart: false,
      nextMissionNumber: activeMission.missionNumber,
      reason: "Ada misi sharing yang belum selesai",
    };
  }

  // Count completed missions
  const completedCount = missions.filter((m) => m.status === "completed").length;

  if (completedCount >= config.maxMissions) {
    const reason =
      missionType === "backup_unlock"
        ? "Fitur backup sudah dibuka"
        : `Sudah mencapai batas maksimal ${config.maxMissions} misi sharing`;
    return {
      canStart: false,
      nextMissionNumber: completedCount + 1,
      reason,
    };
  }

  return {
    canStart: true,
    nextMissionNumber: completedCount + 1,
  };
}

/**
 * Start a new share mission.
 */
export async function startMission(
  supabase: SupabaseClient,
  licenseId: string,
  clientId: string,
  missionType: ShareMissionType
): Promise<ShareMission> {
  const eligibility = await checkMissionEligibility(supabase, licenseId, missionType);

  if (!eligibility.canStart) {
    throw new Error(eligibility.reason ?? "Tidak bisa memulai misi baru");
  }

  const config = SHARE_CONFIG.missions[missionType];

  const { data, error } = await supabase
    .from("ksp_share_missions")
    .insert({
      license_id: licenseId,
      client_id: clientId,
      mission_type: missionType,
      mission_number: eligibility.nextMissionNumber,
      required_shares: config.requiredShares,
      completed_shares: 0,
      status: "active",
      reward_days: 0,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return mapMission(data);
}

/**
 * Get the number of completed missions for a license and type.
 */
export async function fetchCompletedMissionCount(
  supabase: SupabaseClient,
  licenseId: string,
  missionType: ShareMissionType
): Promise<number> {
  const { count, error } = await supabase
    .from("ksp_share_missions")
    .select("*", { count: "exact", head: true })
    .eq("license_id", licenseId)
    .eq("mission_type", missionType)
    .eq("status", "completed");

  if (error) throw error;
  return count ?? 0;
}

// ============================================================================
// Share Log Queries
// ============================================================================

/**
 * Record a share action for a mission.
 */
export async function recordShare(
  supabase: SupabaseClient,
  params: {
    missionId: string;
    licenseId: string;
    clientId: string;
    shareMethod: ShareMethod;
    shareTarget?: string;
  }
): Promise<ShareLog> {
  const { data, error } = await supabase
    .from("ksp_share_logs")
    .insert({
      mission_id: params.missionId,
      license_id: params.licenseId,
      client_id: params.clientId,
      share_method: params.shareMethod,
      share_target: params.shareTarget ?? null,
      shared_at: new Date().toISOString(),
      verified: false,
    })
    .select()
    .single();

  if (error) throw error;
  return mapShareLog(data);
}

/**
 * Get share logs for a mission.
 */
export async function fetchShareLogs(
  supabase: SupabaseClient,
  missionId: string
): Promise<ShareLog[]> {
  const { data, error } = await supabase
    .from("ksp_share_logs")
    .select("*")
    .eq("mission_id", missionId)
    .order("shared_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapShareLog);
}

/**
 * Get share count for a mission.
 */
export async function fetchShareCount(
  supabase: SupabaseClient,
  missionId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("ksp_share_logs")
    .select("*", { count: "exact", head: true })
    .eq("mission_id", missionId);

  if (error) throw error;
  return count ?? 0;
}

// ============================================================================
// Backup Access
// ============================================================================

/**
 * Check if the backup feature is unlocked for a license.
 */
export async function checkBackupUnlocked(
  supabase: SupabaseClient,
  licenseId: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from("ksp_share_missions")
    .select("*", { count: "exact", head: true })
    .eq("license_id", licenseId)
    .eq("mission_type", "backup_unlock")
    .eq("status", "completed");

  if (error) throw error;
  return (count ?? 0) > 0;
}

/**
 * Get the total bonus trial days earned by a license through sharing.
 */
export async function fetchTotalBonusDays(
  supabase: SupabaseClient,
  licenseId: string
): Promise<number> {
  const { data, error } = await supabase
    .from("ksp_share_missions")
    .select("reward_days")
    .eq("license_id", licenseId)
    .eq("mission_type", "trial_extension")
    .eq("status", "completed");

  if (error) throw error;
  return (data ?? []).reduce((sum, row) => sum + ((row as Record<string, unknown>).reward_days as number), 0);
}

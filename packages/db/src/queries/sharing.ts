import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  KspShareMission,
  KspShareMissionInsert,
  KspShareMissionUpdate,
  KspShareMissionType,
  KspShareMissionStatus,
  KspShareLog,
  KspShareLogInsert,
} from "../types/sharing";

/**
 * Fetch share missions with optional filtering.
 */
export async function getShareMissions(
  supabase: SupabaseClient,
  options?: {
    licenseId?: string;
    clientId?: string;
    missionType?: KspShareMissionType;
    status?: KspShareMissionStatus;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: KspShareMission[]; count: number }> {
  const { licenseId, clientId, missionType, status, limit = 50, offset = 0 } = options ?? {};

  let query = supabase
    .from("ksp_share_missions")
    .select("*", { count: "exact" });

  if (licenseId) query = query.eq("license_id", licenseId);
  if (clientId) query = query.eq("client_id", clientId);
  if (missionType) query = query.eq("mission_type", missionType);
  if (status) query = query.eq("status", status);

  query = query
    .order("mission_number", { ascending: true })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw error;
  return { data: (data ?? []) as KspShareMission[], count: count ?? 0 };
}

/**
 * Fetch share missions filtered by mission type for a license.
 */
export async function getShareMissionsByType(
  supabase: SupabaseClient,
  licenseId: string,
  missionType: KspShareMissionType
): Promise<KspShareMission[]> {
  const { data, error } = await supabase
    .from("ksp_share_missions")
    .select("*")
    .eq("license_id", licenseId)
    .eq("mission_type", missionType)
    .order("mission_number", { ascending: true });

  if (error) throw error;
  return (data ?? []) as KspShareMission[];
}

/**
 * Create a new share mission.
 */
export async function createShareMission(
  supabase: SupabaseClient,
  mission: KspShareMissionInsert
): Promise<KspShareMission> {
  const { data, error } = await supabase
    .from("ksp_share_missions")
    .insert(mission)
    .select()
    .single();

  if (error) throw error;
  return data as KspShareMission;
}

/**
 * Update an existing share mission.
 */
export async function updateShareMission(
  supabase: SupabaseClient,
  missionId: string,
  updates: KspShareMissionUpdate
): Promise<KspShareMission> {
  const { data, error } = await supabase
    .from("ksp_share_missions")
    .update(updates)
    .eq("id", missionId)
    .select()
    .single();

  if (error) throw error;
  return data as KspShareMission;
}

/**
 * Log a share action within a mission.
 */
export async function logShare(
  supabase: SupabaseClient,
  shareLog: KspShareLogInsert
): Promise<KspShareLog> {
  const { data, error } = await supabase
    .from("ksp_share_logs")
    .insert(shareLog)
    .select()
    .single();

  if (error) throw error;
  return data as KspShareLog;
}

/**
 * Get the share count for a specific mission.
 */
export async function getShareCount(
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

/**
 * Get share logs for a specific mission.
 */
export async function getShareLogs(
  supabase: SupabaseClient,
  missionId: string
): Promise<KspShareLog[]> {
  const { data, error } = await supabase
    .from("ksp_share_logs")
    .select("*")
    .eq("mission_id", missionId)
    .order("shared_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as KspShareLog[];
}

/**
 * Check if the user can start a new trial extension mission.
 * Max 3 trial extension missions allowed.
 */
export async function canStartNewMission(
  supabase: SupabaseClient,
  licenseId: string,
  missionType: KspShareMissionType
): Promise<{ canStart: boolean; nextMissionNumber: number; reason?: string }> {
  const missions = await getShareMissionsByType(supabase, licenseId, missionType);

  if (missionType === "trial_extension") {
    // Check if there is an active (incomplete) mission
    const activeMission = missions.find((m) => m.status === "active");
    if (activeMission) {
      return {
        canStart: false,
        nextMissionNumber: activeMission.mission_number,
        reason: "Ada misi sharing yang belum selesai",
      };
    }

    // Check max missions
    const completedCount = missions.filter((m) => m.status === "completed").length;
    if (completedCount >= 3) {
      return {
        canStart: false,
        nextMissionNumber: completedCount + 1,
        reason: "Sudah mencapai batas maksimal 3 misi sharing",
      };
    }

    return { canStart: true, nextMissionNumber: completedCount + 1 };
  }

  if (missionType === "backup_unlock") {
    // Backup unlock is a single mission
    if (missions.length > 0) {
      return {
        canStart: false,
        nextMissionNumber: 1,
        reason: missions[0].status === "completed"
          ? "Fitur backup sudah dibuka"
          : "Misi unlock backup sudah berjalan",
      };
    }
    return { canStart: true, nextMissionNumber: 1 };
  }

  return { canStart: false, nextMissionNumber: 1, reason: "Tipe misi tidak dikenal" };
}

/**
 * Get the number of completed missions for a license and type.
 */
export async function getCompletedMissionCount(
  supabase: SupabaseClient,
  licenseId: string,
  missionType: KspShareMissionType
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

/**
 * Check if backup is unlocked for a license (completed backup_unlock mission).
 */
export async function isBackupUnlocked(
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
 * Get the currently active mission for a license and type.
 */
export async function getActiveMission(
  supabase: SupabaseClient,
  licenseId: string,
  missionType: KspShareMissionType
): Promise<KspShareMission | null> {
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
  return (data as KspShareMission) ?? null;
}

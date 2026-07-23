import { useState, useEffect, useCallback } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ShareMission, ShareMissionType, ShareMethod, MissionEligibility } from "../data/types";
import { SHARE_CONFIG } from "../data/config";
import {
  fetchActiveMission,
  fetchMissions,
  checkMissionEligibility,
  startMission,
  recordShare,
  fetchCompletedMissionCount,
} from "../data/queries";

export interface UseShareMissionOptions {
  supabase: SupabaseClient;
  licenseId: string;
  clientId: string;
  missionType: ShareMissionType;
  /** Auto-load mission data on mount. Defaults to true. */
  autoLoad?: boolean;
}

export interface UseShareMissionReturn {
  /** The currently active mission (null if none) */
  activeMission: ShareMission | null;
  /** All missions for this type (active + completed) */
  allMissions: ShareMission[];
  /** Number of completed missions */
  completedCount: number;
  /** Whether a new mission can be started */
  eligibility: MissionEligibility | null;
  /** Whether data is loading */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Start a new mission */
  start: () => Promise<ShareMission | null>;
  /** Record a share for the active mission */
  share: (method: ShareMethod, target?: string) => Promise<boolean>;
  /** Refresh all mission data */
  refresh: () => Promise<void>;
  /** Mission config for the current type */
  config: typeof SHARE_CONFIG.missions[ShareMissionType];
  /** Progress percentage (0-100) */
  progress: number;
  /** Whether the active mission is completed */
  isCompleted: boolean;
  /** Whether max missions have been reached */
  isMaxed: boolean;
}

/**
 * React hook for managing share mission lifecycle.
 *
 * Handles loading, starting, tracking, and completing share missions
 * for either trial extension or backup unlocking.
 */
export function useShareMission(options: UseShareMissionOptions): UseShareMissionReturn {
  const { supabase, licenseId, clientId, missionType, autoLoad = true } = options;

  const config = SHARE_CONFIG.missions[missionType];

  const [activeMission, setActiveMission] = useState<ShareMission | null>(null);
  const [allMissions, setAllMissions] = useState<ShareMission[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [eligibility, setEligibility] = useState<MissionEligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!licenseId || !clientId) return;

    setLoading(true);
    setError(null);

    try {
      const [active, missions, completed, eligible] = await Promise.all([
        fetchActiveMission(supabase, licenseId, missionType),
        fetchMissions(supabase, licenseId, missionType),
        fetchCompletedMissionCount(supabase, licenseId, missionType),
        checkMissionEligibility(supabase, licenseId, missionType),
      ]);

      setActiveMission(active);
      setAllMissions(missions);
      setCompletedCount(completed);
      setEligibility(eligible);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memuat data misi sharing";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase, licenseId, clientId, missionType]);

  useEffect(() => {
    if (autoLoad) {
      refresh();
    }
  }, [autoLoad, refresh]);

  const start = useCallback(async (): Promise<ShareMission | null> => {
    setError(null);
    try {
      const mission = await startMission(supabase, licenseId, clientId, missionType);
      setActiveMission(mission);
      await refresh();
      return mission;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memulai misi sharing";
      setError(message);
      return null;
    }
  }, [supabase, licenseId, clientId, missionType, refresh]);

  const share = useCallback(
    async (method: ShareMethod, target?: string): Promise<boolean> => {
      if (!activeMission) {
        setError("Tidak ada misi aktif");
        return false;
      }

      setError(null);
      try {
        await recordShare(supabase, {
          missionId: activeMission.id,
          licenseId,
          clientId,
          shareMethod: method,
          shareTarget: target,
        });

        // Re-fetch the mission to get updated counts (trigger updates them server-side)
        await refresh();
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Gagal mencatat share";
        setError(message);
        return false;
      }
    },
    [supabase, activeMission, licenseId, clientId, refresh]
  );

  const progress = activeMission
    ? Math.min(100, Math.round((activeMission.completedShares / activeMission.requiredShares) * 100))
    : 0;

  const isCompleted = activeMission?.status === "completed";
  const isMaxed = completedCount >= config.maxMissions;

  return {
    activeMission,
    allMissions,
    completedCount,
    eligibility,
    loading,
    error,
    start,
    share,
    refresh,
    config,
    progress,
    isCompleted,
    isMaxed,
  };
}

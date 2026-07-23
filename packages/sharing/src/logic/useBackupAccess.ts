import { useState, useEffect, useCallback } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { checkBackupUnlocked, fetchActiveMission, startMission } from "../data/queries";
import type { ShareMission } from "../data/types";
import { BACKUP_UNLOCK_CONFIG } from "../data/config";

export interface UseBackupAccessOptions {
  supabase: SupabaseClient;
  licenseId: string;
  clientId: string;
  /** Auto-check backup access on mount. Defaults to true. */
  autoCheck?: boolean;
}

export interface UseBackupAccessReturn {
  /** Whether the backup feature is unlocked */
  isUnlocked: boolean;
  /** The active backup unlock mission (null if none or already completed) */
  activeMission: ShareMission | null;
  /** Whether we are loading */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Start the backup unlock mission */
  startUnlockMission: () => Promise<ShareMission | null>;
  /** Refresh backup access status */
  refresh: () => Promise<void>;
  /** Number of shares required to unlock */
  requiredShares: number;
  /** Number of shares completed (if mission is active) */
  completedShares: number;
  /** Progress percentage (0-100) */
  progress: number;
}

/**
 * React hook for checking and managing backup feature access via sharing.
 *
 * The backup feature is locked behind a sharing gate: users must share
 * the app to 5 contacts to permanently unlock database backup.
 */
export function useBackupAccess(options: UseBackupAccessOptions): UseBackupAccessReturn {
  const { supabase, licenseId, clientId, autoCheck = true } = options;

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeMission, setActiveMission] = useState<ShareMission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!licenseId) return;

    setLoading(true);
    setError(null);

    try {
      const [unlocked, active] = await Promise.all([
        checkBackupUnlocked(supabase, licenseId),
        fetchActiveMission(supabase, licenseId, "backup_unlock"),
      ]);

      setIsUnlocked(unlocked);
      setActiveMission(unlocked ? null : active);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memeriksa akses backup";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [supabase, licenseId]);

  useEffect(() => {
    if (autoCheck) {
      refresh();
    }
  }, [autoCheck, refresh]);

  const startUnlockMission = useCallback(async (): Promise<ShareMission | null> => {
    setError(null);
    try {
      const mission = await startMission(supabase, licenseId, clientId, "backup_unlock");
      setActiveMission(mission);
      return mission;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memulai misi unlock backup";
      setError(message);
      return null;
    }
  }, [supabase, licenseId, clientId]);

  const requiredShares = BACKUP_UNLOCK_CONFIG.requiredShares;
  const completedShares = activeMission?.completedShares ?? 0;
  const progress = activeMission
    ? Math.min(100, Math.round((completedShares / requiredShares) * 100))
    : isUnlocked
      ? 100
      : 0;

  return {
    isUnlocked,
    activeMission,
    loading,
    error,
    startUnlockMission,
    refresh,
    requiredShares,
    completedShares,
    progress,
  };
}

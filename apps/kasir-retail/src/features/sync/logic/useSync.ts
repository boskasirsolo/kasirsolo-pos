"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { SyncState, SyncResult, SyncEvent, SyncConflict } from "@kasirsolo/sync";
import { SyncEngine } from "@kasirsolo/sync";
import { createBrowserClient } from "@kasirsolo/db";
import { getPendingCounts, getLastSyncAt } from "@kasirsolo/local-db";
import { getLicenseId } from "@/lib/device";
import type { SyncDisplayStatus, SyncHistoryEntry } from "../data/types";
import { isCloudPlan } from "../data/types";

// ---------------------------------------------------------------------------
// useSync — Main sync hook
// ---------------------------------------------------------------------------

interface UseSyncOptions {
  /** The user's plan type (from license) */
  planType: string | null;
  /** The device ID (from ksp_devices) */
  deviceId: string | null;
  /** Whether to auto-start sync when conditions are met */
  autoStart?: boolean;
}

interface UseSyncReturn {
  /** Trigger a manual full sync */
  syncNow: () => Promise<SyncResult | null>;
  /** Current sync state from the engine */
  syncState: SyncState | null;
  /** Computed display status for UI */
  displayStatus: SyncDisplayStatus;
  /** Number of pending records */
  pendingCount: number;
  /** Last sync timestamp */
  lastSyncAt: string | null;
  /** Whether the device is online */
  isOnline: boolean;
  /** Whether this user has a cloud plan */
  isCloudUser: boolean;
  /** Sync history */
  history: SyncHistoryEntry[];
  /** Active conflicts */
  conflicts: SyncConflict[];
  /** Any sync errors */
  errors: string[];
  /** Whether the engine is currently running */
  isRunning: boolean;
  /** Start the sync engine */
  start: () => void;
  /** Stop the sync engine */
  stop: () => void;
}

export function useSync(options: UseSyncOptions): UseSyncReturn {
  const { planType, deviceId, autoStart = true } = options;

  const engineRef = useRef<SyncEngine | null>(null);
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [history, setHistory] = useState<SyncHistoryEntry[]>([]);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const isCloudUser = isCloudPlan(planType);
  const licenseId = getLicenseId();

  // Determine display status
  const displayStatus: SyncDisplayStatus = (() => {
    if (!isCloudUser) return "disabled";
    if (!isOnline) return "offline";
    if (syncState?.status === "syncing") return "syncing";
    if (syncState?.status === "error" || errors.length > 0) return "error";
    if (pendingCount > 0) return "pending";
    return "synced";
  })();

  // -------------------------------------------------------------------------
  // Online/Offline tracking
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync on reconnect
      if (engineRef.current && !engineRef.current.isRunning()) {
        engineRef.current.start();
      } else if (engineRef.current) {
        engineRef.current.fullSync().catch(() => {});
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // -------------------------------------------------------------------------
  // Visibility tracking — pause sync when app is hidden
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibility = () => {
      if (!engineRef.current) return;

      if (document.hidden) {
        // App went to background: stop periodic sync
        if (engineRef.current.isRunning()) {
          engineRef.current.stop();
        }
      } else {
        // App came to foreground: restart if auto-start
        if (autoStart && isCloudUser && isOnline && licenseId && deviceId) {
          engineRef.current.start();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [autoStart, isCloudUser, isOnline, licenseId, deviceId]);

  // -------------------------------------------------------------------------
  // Initialize sync engine
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!isCloudUser || !licenseId || !deviceId) return;

    const supabase = createBrowserClient();

    const engine = new SyncEngine({
      supabase,
      licenseId,
      deviceId,
      intervalMs: 5 * 60 * 1000, // 5 minutes
      maxRetries: 3,
      enableRealtime: true,
      batchSize: 50,
    });

    // Register event handlers
    engine.on("sync:state-change", (state) => {
      setSyncState(state as SyncState);
    });

    engine.on("sync:complete", (result) => {
      const r = result as SyncResult;
      setLastSyncAt(r.completedAt);
      setErrors(r.errors);

      // Add to history (keep last 20)
      setHistory((prev) => {
        const entry: SyncHistoryEntry = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          direction: r.direction,
          pushed: r.pushed,
          pulled: r.pulled,
          conflicts: r.conflicts,
          success: r.success,
          durationMs: r.durationMs,
          completedAt: r.completedAt,
        };
        return [entry, ...prev].slice(0, 20);
      });
    });

    engine.on("sync:conflict", (conflict) => {
      setConflicts((prev) => [...prev, conflict as SyncConflict].slice(0, 50));
    });

    engine.on("sync:error", (errorData) => {
      const e = errorData as { error: string };
      setErrors((prev) => [...prev, e.error].slice(0, 10));
    });

    engineRef.current = engine;

    // Auto-start if conditions are met
    if (autoStart && isOnline) {
      engine.start();
      setIsRunning(true);
    }

    // Load initial pending counts
    getPendingCounts().then((counts) => {
      const total = Object.values(counts).reduce((s, c) => s + c, 0);
      setPendingCount(total);
    });

    // Load initial last sync time
    getLastSyncAt().then(setLastSyncAt);

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [isCloudUser, licenseId, deviceId, autoStart, isOnline]);

  // -------------------------------------------------------------------------
  // Update pending count periodically
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!isCloudUser) return;

    const interval = setInterval(async () => {
      try {
        const counts = await getPendingCounts();
        const total = Object.values(counts).reduce((s, c) => s + c, 0);
        setPendingCount(total);
      } catch {
        // Ignore
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isCloudUser]);

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  const syncNow = useCallback(async (): Promise<SyncResult | null> => {
    if (!engineRef.current) return null;
    try {
      return await engineRef.current.fullSync();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sync failed";
      setErrors((prev) => [...prev, msg]);
      return null;
    }
  }, []);

  const start = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.start();
      setIsRunning(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stop();
      setIsRunning(false);
    }
  }, []);

  return {
    syncNow,
    syncState,
    displayStatus,
    pendingCount,
    lastSyncAt,
    isOnline,
    isCloudUser,
    history,
    conflicts,
    errors,
    isRunning,
    start,
    stop,
  };
}

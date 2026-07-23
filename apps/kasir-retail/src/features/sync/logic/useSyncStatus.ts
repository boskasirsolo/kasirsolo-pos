"use client";

import { useState, useEffect } from "react";
import { getPendingCounts, getLastSyncAt } from "@kasirsolo/local-db";
import type { SyncDisplayStatus } from "../data/types";
import { isCloudPlan } from "../data/types";

// ---------------------------------------------------------------------------
// useSyncStatus — Lightweight hook for the status bar
// ---------------------------------------------------------------------------

interface UseSyncStatusOptions {
  planType: string | null;
}

interface UseSyncStatusReturn {
  /** Current display status */
  status: SyncDisplayStatus;
  /** Number of pending records */
  pendingCount: number;
  /** Last sync time formatted for display */
  lastSyncLabel: string;
  /** Whether the device is online */
  isOnline: boolean;
  /** Whether this is a cloud plan user */
  isCloudUser: boolean;
}

export function useSyncStatus(options: UseSyncStatusOptions): UseSyncStatusReturn {
  const { planType } = options;

  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  const isCloudUser = isCloudPlan(planType);

  // Online/offline tracking
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Periodic pending count check
  useEffect(() => {
    if (!isCloudUser) return;

    const checkPending = async () => {
      try {
        const counts = await getPendingCounts();
        const total = Object.values(counts).reduce((s, c) => s + c, 0);
        setPendingCount(total);
      } catch {
        // Ignore
      }
    };

    checkPending();
    const interval = setInterval(checkPending, 60000); // Every minute

    return () => clearInterval(interval);
  }, [isCloudUser]);

  // Load last sync time
  useEffect(() => {
    if (!isCloudUser) return;
    getLastSyncAt().then(setLastSyncAt);
  }, [isCloudUser]);

  // Compute status
  const status: SyncDisplayStatus = (() => {
    if (!isCloudUser) return "disabled";
    if (!isOnline) return "offline";
    if (pendingCount > 0) return "pending";
    return "synced";
  })();

  // Format last sync label
  const lastSyncLabel = (() => {
    if (!lastSyncAt) return "Belum pernah sinkron";
    try {
      const date = new Date(lastSyncAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);

      if (diffMin < 1) return "Baru saja";
      if (diffMin < 60) return `${diffMin} menit lalu`;

      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours} jam lalu`;

      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Tidak diketahui";
    }
  })();

  return {
    status,
    pendingCount,
    lastSyncLabel,
    isOnline,
    isCloudUser,
  };
}

"use client";

import { useState, useEffect } from "react";
import type { LicenseStatus } from "@/lib/license";
import { SyncStatusBar } from "@/features/sync/ui/SyncStatusBar";
import { useSyncStatus } from "@/features/sync/logic/useSyncStatus";

interface TopBarProps {
  storeName: string;
  licenseStatus: LicenseStatus | null;
  /** User's plan type for determining sync capability */
  planType?: string | null;
  /** Callback when sync status bar is tapped */
  onSyncTap?: () => void;
}

export function TopBar({ storeName, licenseStatus, planType, onSyncTap }: TopBarProps) {
  const [time, setTime] = useState("");
  const [online, setOnline] = useState(true);

  const syncStatus = useSyncStatus({ planType: planType ?? null });

  useEffect(() => {
    function updateTime() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const trialBadge =
    licenseStatus?.type === "trial" && licenseStatus.trialDaysLeft > 0 ? (
      <span className="text-[10px] bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded-full font-medium">
        Trial {licenseStatus.trialDaysLeft}h
      </span>
    ) : null;

  return (
    <header className="sticky top-0 z-30 bg-brand-dark text-white flex items-center justify-between px-4"
      style={{ height: "var(--top-bar-height)", paddingTop: "var(--safe-top)" }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-heading font-bold truncate">
          <span className="text-brand-primary">K</span>
          {storeName}
        </span>
        {trialBadge}
      </div>

      <div className="flex items-center gap-3">
        {/* Sync status indicator */}
        <SyncStatusBar
          status={syncStatus.status}
          pendingCount={syncStatus.pendingCount}
          onTap={onSyncTap}
        />

        {/* Connection status */}
        <div className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full ${online ? "bg-green-400" : "bg-red-400"}`}
          />
          <span className="text-[10px] text-gray-400">
            {online ? "Online" : "Offline"}
          </span>
        </div>

        {/* Clock */}
        <span className="text-xs text-gray-300 font-mono tabular-nums">
          {time}
        </span>
      </div>
    </header>
  );
}

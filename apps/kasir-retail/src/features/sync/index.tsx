"use client";

import { useState } from "react";
import { SyncStatusBar } from "./ui/SyncStatusBar";
import { SyncPanel } from "./ui/SyncPanel";
import { SyncConflictModal } from "./ui/SyncConflictModal";
import { UpgradePrompt } from "./ui/UpgradePrompt";
import { useSync } from "./logic/useSync";
import { useSyncStatus } from "./logic/useSyncStatus";

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export { SyncStatusBar } from "./ui/SyncStatusBar";
export { SyncPanel } from "./ui/SyncPanel";
export { SyncConflictModal } from "./ui/SyncConflictModal";
export { UpgradePrompt } from "./ui/UpgradePrompt";
export { useSync } from "./logic/useSync";
export { useSyncStatus } from "./logic/useSyncStatus";
export { isCloudPlan } from "./data/types";
export type { SyncDisplayStatus, SyncHistoryEntry } from "./data/types";

// ---------------------------------------------------------------------------
// SyncFeature — Composed sync UI
// ---------------------------------------------------------------------------

interface SyncFeatureProps {
  /** User's plan type */
  planType: string | null;
  /** Device ID from ksp_devices */
  deviceId: string | null;
}

export function SyncFeature({ planType, deviceId }: SyncFeatureProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  const sync = useSync({
    planType,
    deviceId,
    autoStart: true,
  });

  const pendingByStore = sync.syncState?.pendingByStore ?? {
    products: 0,
    transactions: 0,
    categories: 0,
    stockAdjustments: 0,
    receipts: 0,
    dailyReports: 0,
  };

  const handleSyncNow = async () => {
    await sync.syncNow();
  };

  const handleDismissConflict = (index: number) => {
    // This is informational only; conflicts are auto-resolved
  };

  return (
    <>
      {/* Status Bar (rendered in TopBar) */}
      <SyncStatusBar
        status={sync.displayStatus}
        pendingCount={sync.pendingCount}
        onTap={() => setIsPanelOpen(true)}
      />

      {/* Sync Panel (bottom sheet) */}
      <SyncPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        status={sync.displayStatus}
        lastSyncLabel={formatLastSync(sync.lastSyncAt)}
        pendingByStore={pendingByStore}
        pendingCount={sync.pendingCount}
        onSyncNow={handleSyncNow}
        history={sync.history}
        conflicts={sync.conflicts}
        errors={sync.errors}
        isRunning={sync.isRunning}
        isCloudUser={sync.isCloudUser}
      />

      {/* Conflict Modal */}
      <SyncConflictModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        conflicts={sync.conflicts}
        onDismiss={handleDismissConflict}
      />

      {/* Upgrade Prompt for non-cloud users */}
      {!sync.isCloudUser && (
        <UpgradePrompt show={!sync.isCloudUser} />
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatLastSync(lastSyncAt: string | null): string {
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
}

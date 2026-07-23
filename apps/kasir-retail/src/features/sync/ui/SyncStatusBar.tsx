"use client";

import type { SyncDisplayStatus } from "../data/types";
import {
  SYNC_STATUS_LABELS,
  SYNC_STATUS_COLORS,
  SYNC_STATUS_TEXT_COLORS,
} from "../data/types";

// ---------------------------------------------------------------------------
// SyncStatusBar — Small indicator in the TopBar
// ---------------------------------------------------------------------------

interface SyncStatusBarProps {
  /** Current display status */
  status: SyncDisplayStatus;
  /** Number of pending records */
  pendingCount: number;
  /** Callback when tapped (opens SyncPanel) */
  onTap?: () => void;
}

export function SyncStatusBar({ status, pendingCount, onTap }: SyncStatusBarProps) {
  // Don't render for offline-plan users
  if (status === "disabled") return null;

  const dotColor = SYNC_STATUS_COLORS[status];
  const textColor = SYNC_STATUS_TEXT_COLORS[status];
  const isSyncing = status === "syncing";

  const label = (() => {
    if (status === "pending" && pendingCount > 0) {
      return `${pendingCount} menunggu`;
    }
    return SYNC_STATUS_LABELS[status];
  })();

  return (
    <button
      type="button"
      onClick={onTap}
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
      aria-label={`Status sinkronisasi: ${label}`}
    >
      {/* Status dot / spinner */}
      <div className="relative">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        {isSyncing && (
          <div className={`absolute inset-0 w-2 h-2 rounded-full ${dotColor} animate-ping opacity-75`} />
        )}
      </div>

      {/* Label */}
      <span className={`text-[10px] font-medium ${textColor}`}>
        {label}
      </span>
    </button>
  );
}

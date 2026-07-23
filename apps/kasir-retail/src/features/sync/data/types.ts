import type {
  SyncState,
  SyncResult,
  SyncConflict,
  SyncPendingByStore,
  SyncEvent,
} from "@kasirsolo/sync";

// ---------------------------------------------------------------------------
// UI-facing sync types
// ---------------------------------------------------------------------------

/** Display status for the sync status bar */
export type SyncDisplayStatus =
  | "synced"      // All data up to date (green)
  | "pending"     // Has unsynced records (yellow)
  | "syncing"     // Currently syncing (blue)
  | "offline"     // No network connection (gray)
  | "error"       // Sync failed (red)
  | "disabled";   // Not a cloud plan (hidden)

/** Localized status labels in Indonesian */
export const SYNC_STATUS_LABELS: Record<SyncDisplayStatus, string> = {
  synced: "Tersinkron",
  pending: "menunggu sinkronisasi",
  syncing: "Menyinkronkan...",
  offline: "Offline",
  error: "Gagal sinkronisasi",
  disabled: "Sinkronisasi tidak aktif",
};

/** Colors for each status */
export const SYNC_STATUS_COLORS: Record<SyncDisplayStatus, string> = {
  synced: "bg-green-400",
  pending: "bg-yellow-400",
  syncing: "bg-blue-400",
  offline: "bg-gray-400",
  error: "bg-red-400",
  disabled: "bg-gray-300",
};

/** Text colors for each status */
export const SYNC_STATUS_TEXT_COLORS: Record<SyncDisplayStatus, string> = {
  synced: "text-green-400",
  pending: "text-yellow-400",
  syncing: "text-blue-400",
  offline: "text-gray-400",
  error: "text-red-400",
  disabled: "text-gray-300",
};

/** Sync history entry for display */
export interface SyncHistoryEntry {
  id: string;
  direction: string;
  pushed: number;
  pulled: number;
  conflicts: number;
  success: boolean;
  durationMs: number;
  completedAt: string;
}

/** Plan type that supports sync */
export type CloudPlanType = "cloud_monthly" | "cloud_yearly";

/** Check if a plan type supports cloud sync */
export function isCloudPlan(planType: string | null | undefined): boolean {
  return planType === "cloud_monthly" || planType === "cloud_yearly";
}

/** Store display names in Indonesian */
export const STORE_DISPLAY_NAMES: Record<string, string> = {
  products: "Produk",
  transactions: "Transaksi",
  categories: "Kategori",
  stockAdjustments: "Stok",
  receipts: "Struk",
  dailyReports: "Laporan Harian",
};

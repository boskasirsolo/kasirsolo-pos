import type { SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Sync Direction & Status
// ---------------------------------------------------------------------------

export type SyncDirection = "push" | "pull" | "full";

export type SyncStatus = "idle" | "syncing" | "error" | "offline";

export type SyncLogStatus = "started" | "completed" | "failed" | "partial";

// ---------------------------------------------------------------------------
// Sync Config
// ---------------------------------------------------------------------------

export interface SyncConfig {
  /** Supabase browser client */
  supabase: SupabaseClient;
  /** The license this device is bound to */
  licenseId: string;
  /** The device identifier (ksp_devices.id) */
  deviceId: string;
  /** Sync interval in milliseconds (default: 300_000 = 5 minutes) */
  intervalMs?: number;
  /** Max retries per failed record batch (default: 3) */
  maxRetries?: number;
  /** Enable Supabase Realtime subscriptions (default: true) */
  enableRealtime?: boolean;
  /** Batch size for push/pull operations (default: 50) */
  batchSize?: number;
}

// ---------------------------------------------------------------------------
// Sync State (exposed to UI)
// ---------------------------------------------------------------------------

export interface SyncState {
  /** Current sync status */
  status: SyncStatus;
  /** Whether the periodic sync loop is active */
  isRunning: boolean;
  /** Last successful full sync timestamp (ISO) */
  lastSyncAt: string | null;
  /** Number of pending records across all stores */
  pendingCount: number;
  /** Pending counts per store */
  pendingByStore: SyncPendingByStore;
  /** Current operation in progress, if any */
  currentOperation: SyncDirection | null;
  /** Active conflicts */
  conflicts: SyncConflict[];
  /** Recent errors */
  errors: string[];
}

export interface SyncPendingByStore {
  products: number;
  transactions: number;
  categories: number;
  stockAdjustments: number;
  receipts: number;
  dailyReports: number;
}

// ---------------------------------------------------------------------------
// Sync Result (returned from push/pull/full)
// ---------------------------------------------------------------------------

export interface SyncResult {
  /** Direction of the sync operation */
  direction: SyncDirection;
  /** Number of records pushed to cloud */
  pushed: number;
  /** Number of records pulled from cloud */
  pulled: number;
  /** Number of conflicts detected */
  conflicts: number;
  /** Conflict details */
  conflictDetails: SyncConflict[];
  /** Errors encountered */
  errors: string[];
  /** Whether the sync completed successfully */
  success: boolean;
  /** Timestamp when sync started */
  startedAt: string;
  /** Timestamp when sync finished */
  completedAt: string;
  /** Duration in milliseconds */
  durationMs: number;
}

// ---------------------------------------------------------------------------
// Sync Conflict
// ---------------------------------------------------------------------------

export interface SyncConflict {
  /** Which store the conflict is in */
  store: SyncableStore;
  /** Record ID */
  recordId: string;
  /** Local version timestamp */
  localUpdatedAt: string;
  /** Cloud version timestamp */
  cloudUpdatedAt: string;
  /** Which version won */
  resolution: "local" | "cloud";
  /** Human-readable description */
  description: string;
  /** Timestamp when conflict was detected */
  detectedAt: string;
}

// ---------------------------------------------------------------------------
// Sync Events
// ---------------------------------------------------------------------------

export type SyncEvent =
  | "sync:start"
  | "sync:complete"
  | "sync:error"
  | "sync:conflict"
  | "sync:push:start"
  | "sync:push:complete"
  | "sync:pull:start"
  | "sync:pull:complete"
  | "sync:state-change"
  | "sync:realtime-update";

export type SyncEventHandler<T = unknown> = (data: T) => void;

// ---------------------------------------------------------------------------
// Sync Log Entry (matches ksp_sync_log)
// ---------------------------------------------------------------------------

export interface SyncLogEntry {
  id?: string;
  license_id: string;
  device_id: string;
  direction: SyncDirection;
  records_pushed: number;
  records_pulled: number;
  conflicts: number;
  error_message: string | null;
  metadata: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
  status: SyncLogStatus;
}

// ---------------------------------------------------------------------------
// Syncable Stores (the 6 IndexedDB stores that sync to cloud)
// ---------------------------------------------------------------------------

export type SyncableStore =
  | "products"
  | "transactions"
  | "categories"
  | "stock_adjustments"
  | "receipts"
  | "daily_reports";

/** Map from local store name to Supabase table name */
export const STORE_TO_TABLE: Record<SyncableStore, string> = {
  products: "ksp_synced_products",
  transactions: "ksp_synced_transactions",
  categories: "ksp_synced_categories",
  stock_adjustments: "ksp_synced_stock_adjustments",
  receipts: "ksp_synced_receipts",
  daily_reports: "ksp_synced_daily_reports",
};

export const ALL_SYNCABLE_STORES: SyncableStore[] = [
  "categories",
  "products",
  "transactions",
  "stock_adjustments",
  "receipts",
  "daily_reports",
];

// ---------------------------------------------------------------------------
// Dead Letter (permanently failed records)
// ---------------------------------------------------------------------------

export interface DeadLetterRecord {
  store: SyncableStore;
  recordId: string;
  error: string;
  attempts: number;
  firstFailedAt: string;
  lastFailedAt: string;
}

// ---------------------------------------------------------------------------
// Queue Item
// ---------------------------------------------------------------------------

export interface QueueItem {
  id: string;
  operation: SyncDirection;
  priority: number;
  attempts: number;
  maxAttempts: number;
  lastAttemptAt: string | null;
  nextRetryAt: string | null;
  createdAt: string;
  status: "pending" | "in_progress" | "failed" | "dead";
  error: string | null;
}

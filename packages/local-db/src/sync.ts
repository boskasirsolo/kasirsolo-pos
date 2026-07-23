import { getAll, put, get } from "./engine";
import type { PosProduct } from "./types/product";
import type { PosTransaction } from "./types/transaction";
import type { PosCategory } from "./types/category";
import type { PosStockAdjustment } from "./types/stock";
import type { PosReceipt } from "./types/receipt";
import type { PosDailyReport } from "./types/report";
import type { PosSettings } from "./types/settings";
import type { SyncStatus } from "./types/product";

/**
 * Sync module for local-db.
 *
 * Provides local-side sync utilities and delegates full sync operations
 * to the @kasirsolo/sync engine when available. The functions here focus
 * on IndexedDB-side operations: querying pending records, marking records
 * as synced, and reading sync state from local settings.
 */

// ---------------------------------------------------------------------------
// Re-export SyncResult type (kept for backward compat)
// ---------------------------------------------------------------------------

export interface SyncResult {
  /** Number of records pushed to server */
  pushed: number;
  /** Number of records pulled from server */
  pulled: number;
  /** Number of conflicts detected */
  conflicts: number;
  /** Error messages, if any */
  errors: string[];
  /** Sync timestamp */
  synced_at: string;
}

// ---------------------------------------------------------------------------
// Pending record collection
// ---------------------------------------------------------------------------

export interface PendingRecords {
  products: PosProduct[];
  transactions: PosTransaction[];
  categories: PosCategory[];
  stockAdjustments: PosStockAdjustment[];
  receipts: PosReceipt[];
  dailyReports: PosDailyReport[];
}

/**
 * Get all records that need to be synced to the server.
 */
export async function getPendingRecords(): Promise<PendingRecords> {
  const filterPending = <T extends { sync_status?: SyncStatus }>(items: T[]): T[] =>
    items.filter((item) => item.sync_status === "pending");

  const [products, transactions, categories, stockAdjustments, receipts, dailyReports] =
    await Promise.all([
      getAll("products").then(filterPending),
      getAll("transactions").then(filterPending),
      getAll("categories").then(filterPending),
      getAll("stock_adjustments").then(filterPending),
      getAll("receipts"),
      getAll("daily_reports"),
    ]);

  return {
    products: products as PosProduct[],
    transactions: transactions as PosTransaction[],
    categories: categories as PosCategory[],
    stockAdjustments: stockAdjustments as PosStockAdjustment[],
    receipts: receipts as PosReceipt[],
    dailyReports: dailyReports as PosDailyReport[],
  };
}

/**
 * Get pending record counts per store.
 */
export async function getPendingCounts(): Promise<Record<string, number>> {
  const pending = await getPendingRecords();
  return {
    products: pending.products.length,
    transactions: pending.transactions.length,
    categories: pending.categories.length,
    stockAdjustments: pending.stockAdjustments.length,
    receipts: pending.receipts.length,
    dailyReports: pending.dailyReports.length,
  };
}

/**
 * Mark records as synced after successful server push.
 */
export async function markAsSynced<T extends { id: string; sync_status?: SyncStatus }>(
  storeName: "products" | "transactions" | "categories" | "stock_adjustments",
  records: T[]
): Promise<void> {
  for (const record of records) {
    await put(storeName, { ...record, sync_status: "synced" } as never);
  }
}

/**
 * Mark a single record as synced.
 */
export async function markRecordSynced(
  storeName: "products" | "transactions" | "categories" | "stock_adjustments",
  recordId: string
): Promise<void> {
  const record = await get(storeName, recordId);
  if (record) {
    await put(storeName, { ...record, sync_status: "synced" } as never);
  }
}

/**
 * Mark a single record as having a conflict.
 */
export async function markRecordConflict(
  storeName: "products" | "transactions" | "categories" | "stock_adjustments",
  recordId: string
): Promise<void> {
  const record = await get(storeName, recordId);
  if (record) {
    await put(storeName, { ...record, sync_status: "conflict" } as never);
  }
}

// ---------------------------------------------------------------------------
// Sync status checks
// ---------------------------------------------------------------------------

/**
 * Perform a full sync cycle.
 * This is a convenience wrapper. For production use, prefer the SyncEngine
 * from @kasirsolo/sync which provides queuing, retries, and conflict resolution.
 */
export async function syncAll(): Promise<SyncResult> {
  const pending = await getPendingRecords();
  const totalPending =
    pending.products.length +
    pending.transactions.length +
    pending.categories.length +
    pending.stockAdjustments.length;

  // This function now serves as a local-only check.
  // Actual sync is handled by @kasirsolo/sync SyncEngine.
  // If no SyncEngine is available (offline plan), return stub result.
  console.info(
    `[sync] Found ${totalPending} pending records. Use SyncEngine from @kasirsolo/sync for actual sync.`
  );

  return {
    pushed: 0,
    pulled: 0,
    conflicts: 0,
    errors: totalPending > 0 ? ["Gunakan SyncEngine untuk sinkronisasi"] : [],
    synced_at: new Date().toISOString(),
  };
}

/**
 * Check if there are any pending records that need syncing.
 */
export async function hasPendingSync(): Promise<boolean> {
  const pending = await getPendingRecords();
  return (
    pending.products.length > 0 ||
    pending.transactions.length > 0 ||
    pending.categories.length > 0 ||
    pending.stockAdjustments.length > 0
  );
}

// ---------------------------------------------------------------------------
// Last sync timestamp
// ---------------------------------------------------------------------------

/**
 * Get the last sync timestamp from local settings.
 */
export async function getLastSyncAt(): Promise<string | null> {
  try {
    const settings = await get("settings", "settings");
    if (settings && typeof settings === "object" && "last_synced_at" in settings) {
      return (settings as PosSettings).last_synced_at;
    }
  } catch {
    // Settings may not exist
  }
  return null;
}

/**
 * Update the last sync timestamp in local settings.
 */
export async function setLastSyncAt(timestamp: string): Promise<void> {
  try {
    const settings = await get("settings", "settings");
    if (settings && typeof settings === "object") {
      await put("settings", {
        ...(settings as PosSettings),
        last_synced_at: timestamp,
        updated_at: new Date().toISOString(),
      } as never);
    }
  } catch (err) {
    console.warn("[sync] Failed to update last_synced_at", err);
  }
}

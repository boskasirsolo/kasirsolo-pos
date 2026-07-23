import type { SupabaseClient } from "@supabase/supabase-js";
import { getAll, put } from "@kasirsolo/local-db";
import type {
  PosProduct,
  PosTransaction,
  PosCategory,
  PosStockAdjustment,
  PosReceipt,
  PosDailyReport,
  SyncStatus,
} from "@kasirsolo/local-db";
import type { SyncConfig, SyncResult, SyncableStore, SyncConflict, SyncLogEntry } from "./types";
import { STORE_TO_TABLE, ALL_SYNCABLE_STORES } from "./types";
import {
  mapLocalToCloud,
  toBatches,
  getCloudTable,
  now,
  getErrorMessage,
  logInfo,
  logWarn,
  logError,
} from "./utils";

// ---------------------------------------------------------------------------
// Types for pending record collection
// ---------------------------------------------------------------------------

interface PendingRecords {
  products: PosProduct[];
  transactions: PosTransaction[];
  categories: PosCategory[];
  stock_adjustments: PosStockAdjustment[];
  receipts: PosReceipt[];
  daily_reports: PosDailyReport[];
}

type SyncableRecord = PosProduct | PosTransaction | PosCategory | PosStockAdjustment | PosReceipt | PosDailyReport;

// ---------------------------------------------------------------------------
// Push: Local → Cloud
// ---------------------------------------------------------------------------

/**
 * Push all pending local records to Supabase cloud tables.
 * Returns a SyncResult with counts and any errors.
 */
export async function pushToCloud(config: SyncConfig): Promise<SyncResult> {
  const startedAt = now();
  const startTime = Date.now();
  const errors: string[] = [];
  let totalPushed = 0;

  logInfo("Push started", { licenseId: config.licenseId, deviceId: config.deviceId });

  // Log sync start
  const logId = await writeSyncLog(config, {
    direction: "push",
    started_at: startedAt,
    status: "started",
  });

  try {
    // 1. Collect all pending records from IndexedDB
    const pending = await collectPendingRecords();
    const totalPending = countPendingRecords(pending);

    if (totalPending === 0) {
      logInfo("Push: no pending records");
      await updateSyncLog(config, logId, {
        status: "completed",
        records_pushed: 0,
        completed_at: now(),
      });
      return buildResult("push", 0, 0, 0, [], errors, startedAt);
    }

    logInfo(`Push: found ${totalPending} pending records`);

    // 2. Push each store's pending records
    const batchSize = config.batchSize ?? 50;

    // Push categories first (products may reference them)
    totalPushed += await pushStore(config, "categories", pending.categories, batchSize, errors);
    totalPushed += await pushStore(config, "products", pending.products, batchSize, errors);
    totalPushed += await pushStore(config, "transactions", pending.transactions, batchSize, errors);
    totalPushed += await pushStore(config, "stock_adjustments", pending.stock_adjustments, batchSize, errors);
    totalPushed += await pushStore(config, "receipts", pending.receipts, batchSize, errors);
    totalPushed += await pushStore(config, "daily_reports", pending.daily_reports, batchSize, errors);

    // 3. Update sync log
    const finalStatus = errors.length > 0 ? "partial" : "completed";
    await updateSyncLog(config, logId, {
      status: finalStatus as "completed" | "partial",
      records_pushed: totalPushed,
      completed_at: now(),
      error_message: errors.length > 0 ? errors.join("; ") : null,
    });

    logInfo(`Push completed: ${totalPushed} records pushed, ${errors.length} errors`);
  } catch (error) {
    const msg = getErrorMessage(error);
    errors.push(msg);
    logError("Push failed", msg);

    await updateSyncLog(config, logId, {
      status: "failed",
      records_pushed: totalPushed,
      completed_at: now(),
      error_message: msg,
    });
  }

  return buildResult("push", totalPushed, 0, 0, [], errors, startedAt);
}

// ---------------------------------------------------------------------------
// Push a single store's records
// ---------------------------------------------------------------------------

async function pushStore(
  config: SyncConfig,
  store: SyncableStore,
  records: SyncableRecord[],
  batchSize: number,
  errors: string[]
): Promise<number> {
  if (records.length === 0) return 0;

  const tableName = getCloudTable(store);
  let pushed = 0;

  const batches = toBatches(records, batchSize);

  for (const batch of batches) {
    try {
      // Map records to cloud format (add license_id, remove sync_status)
      const cloudRecords = batch.map((r) => mapLocalToCloud(r, config.licenseId));

      // Upsert to Supabase
      const { error } = await config.supabase
        .from(tableName)
        .upsert(cloudRecords, { onConflict: "id" });

      if (error) {
        const msg = `Push ${store}: ${error.message}`;
        logError(msg);
        errors.push(msg);
        continue;
      }

      // Mark local records as synced
      for (const record of batch) {
        try {
          const synced = { ...record, sync_status: "synced" as const };
          // We need to write back to the correct local store
          await put(store as never, synced as never);
        } catch (markErr) {
          const msg = `Failed to mark ${store}/${(record as { id: string }).id} as synced: ${getErrorMessage(markErr)}`;
          logWarn(msg);
          // Don't add to errors array since the cloud write succeeded
        }
      }

      pushed += batch.length;
      logInfo(`Pushed ${batch.length} ${store} records`);
    } catch (batchError) {
      const msg = `Push batch ${store}: ${getErrorMessage(batchError)}`;
      logError(msg);
      errors.push(msg);
    }
  }

  return pushed;
}

// ---------------------------------------------------------------------------
// Collect pending records from all stores
// ---------------------------------------------------------------------------

async function collectPendingRecords(): Promise<PendingRecords> {
  const filterPending = <T extends { sync_status?: string }>(items: T[]): T[] =>
    items.filter((item) => item.sync_status === "pending");

  const [products, transactions, categories, stockAdj, receipts, reports] =
    await Promise.all([
      getAll("products").then(filterPending),
      getAll("transactions").then(filterPending),
      getAll("categories").then(filterPending),
      getAll("stock_adjustments").then(filterPending),
      getAll("receipts").then((items) => {
        // Receipts don't have sync_status in original type, treat all as pending
        // Actually, we'll check if they've already been synced via a marker
        return items;
      }),
      getAll("daily_reports").then((items) => items),
    ]);

  return {
    products: products as PosProduct[],
    transactions: transactions as PosTransaction[],
    categories: categories as PosCategory[],
    stock_adjustments: stockAdj as PosStockAdjustment[],
    receipts: receipts as PosReceipt[],
    daily_reports: reports as PosDailyReport[],
  };
}

function countPendingRecords(pending: PendingRecords): number {
  return (
    pending.products.length +
    pending.transactions.length +
    pending.categories.length +
    pending.stock_adjustments.length +
    pending.receipts.length +
    pending.daily_reports.length
  );
}

// ---------------------------------------------------------------------------
// Sync log helpers
// ---------------------------------------------------------------------------

async function writeSyncLog(
  config: SyncConfig,
  entry: Partial<SyncLogEntry>
): Promise<string | null> {
  try {
    const { data, error } = await config.supabase
      .from("ksp_sync_log")
      .insert({
        license_id: config.licenseId,
        device_id: config.deviceId,
        direction: entry.direction ?? "push",
        records_pushed: entry.records_pushed ?? 0,
        records_pulled: entry.records_pulled ?? 0,
        conflicts: entry.conflicts ?? 0,
        error_message: entry.error_message ?? null,
        metadata: entry.metadata ?? {},
        started_at: entry.started_at ?? now(),
        completed_at: entry.completed_at ?? null,
        status: entry.status ?? "started",
      })
      .select("id")
      .single();

    if (error) {
      logWarn("Failed to write sync log", error.message);
      return null;
    }
    return data?.id ?? null;
  } catch (err) {
    logWarn("Failed to write sync log", getErrorMessage(err));
    return null;
  }
}

async function updateSyncLog(
  config: SyncConfig,
  logId: string | null,
  updates: Partial<SyncLogEntry>
): Promise<void> {
  if (!logId) return;
  try {
    await config.supabase
      .from("ksp_sync_log")
      .update(updates)
      .eq("id", logId);
  } catch (err) {
    logWarn("Failed to update sync log", getErrorMessage(err));
  }
}

// ---------------------------------------------------------------------------
// Result builder
// ---------------------------------------------------------------------------

function buildResult(
  direction: "push" | "pull" | "full",
  pushed: number,
  pulled: number,
  conflicts: number,
  conflictDetails: SyncConflict[],
  errors: string[],
  startedAt: string
): SyncResult {
  const completedAt = now();
  return {
    direction,
    pushed,
    pulled,
    conflicts,
    conflictDetails,
    errors,
    success: errors.length === 0,
    startedAt,
    completedAt,
    durationMs: new Date(completedAt).getTime() - new Date(startedAt).getTime(),
  };
}

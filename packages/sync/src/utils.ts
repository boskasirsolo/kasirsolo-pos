import type { SyncStatus } from '@kasirsolo/local-db';
import type { SyncableStore } from './types';
import { STORE_TO_TABLE } from './types';

// ---------------------------------------------------------------------------
// Local → Cloud mapping
// ---------------------------------------------------------------------------

/**
 * Strip local-only fields and add license_id for cloud storage.
 */
export function mapLocalToCloud<T>(
  record: T,
  licenseId: string,
): Omit<T, 'sync_status'> & { license_id: string } {
  const { sync_status, ...rest } = record as Record<string, unknown>;
  return { ...rest, license_id: licenseId } as unknown as Omit<T, 'sync_status'> & {
    license_id: string;
  };
}

/**
 * Strip cloud-only fields and set sync_status for local storage.
 */
export function mapCloudToLocal<T extends { license_id?: string; deleted_at?: string | null }>(
  record: T,
  syncStatus: SyncStatus = 'synced',
): Omit<T, 'license_id' | 'deleted_at'> & { sync_status: SyncStatus } {
  const { license_id, deleted_at, ...rest } = record;
  return { ...rest, sync_status: syncStatus };
}

// ---------------------------------------------------------------------------
// Timestamp comparison
// ---------------------------------------------------------------------------

/**
 * Returns true if `a` is strictly newer than `b` based on timestamp strings.
 * Handles both ISO strings and date objects.
 */
export function isNewerThan(
  a: string | Date | null | undefined,
  b: string | Date | null | undefined,
): boolean {
  if (!a) return false;
  if (!b) return true;
  const timeA = typeof a === 'string' ? new Date(a).getTime() : a.getTime();
  const timeB = typeof b === 'string' ? new Date(b).getTime() : b.getTime();
  return timeA > timeB;
}

/**
 * Returns the newer of two timestamps. Handles null values.
 */
export function newerTimestamp(
  a: string | null | undefined,
  b: string | null | undefined,
): string | null {
  if (!a && !b) return null;
  if (!a) return b!;
  if (!b) return a;
  return isNewerThan(a, b) ? a : b;
}

// ---------------------------------------------------------------------------
// Record diffing
// ---------------------------------------------------------------------------

/**
 * Compare two records and return an object with only the changed fields.
 * Useful for debugging and conflict display.
 */
export function diffRecords<T extends Record<string, unknown>>(
  local: T,
  cloud: T,
): Partial<Record<keyof T, { local: unknown; cloud: unknown }>> {
  const diff: Partial<Record<keyof T, { local: unknown; cloud: unknown }>> = {};

  const allKeys = new Set([...Object.keys(local), ...Object.keys(cloud)]) as Set<keyof T>;

  for (const key of allKeys) {
    const localVal = local[key];
    const cloudVal = cloud[key];

    // Skip internal fields
    if (key === 'sync_status' || key === 'license_id' || key === 'deleted_at') {
      continue;
    }

    // Deep comparison for objects/arrays
    if (typeof localVal === 'object' || typeof cloudVal === 'object') {
      if (JSON.stringify(localVal) !== JSON.stringify(cloudVal)) {
        diff[key] = { local: localVal, cloud: cloudVal };
      }
    } else if (localVal !== cloudVal) {
      diff[key] = { local: localVal, cloud: cloudVal };
    }
  }

  return diff;
}

// ---------------------------------------------------------------------------
// Batching
// ---------------------------------------------------------------------------

/**
 * Split an array into batches of a given size.
 */
export function toBatches<T>(items: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }
  return batches;
}

// ---------------------------------------------------------------------------
// Supabase table name lookup
// ---------------------------------------------------------------------------

/**
 * Get the Supabase table name for a given syncable store.
 */
export function getCloudTable(store: SyncableStore): string {
  return STORE_TO_TABLE[store];
}

// ---------------------------------------------------------------------------
// Timestamp helpers
// ---------------------------------------------------------------------------

/**
 * Return current ISO timestamp.
 */
export function now(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------

/**
 * Extract a human-readable error message from any thrown value.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return 'Unknown error';
  }
}

// ---------------------------------------------------------------------------
// Logging helpers
// ---------------------------------------------------------------------------

const LOG_PREFIX = '[sync]';

export function logInfo(message: string, data?: unknown): void {
  console.info(`${LOG_PREFIX} ${message}`, data ?? '');
}

export function logWarn(message: string, data?: unknown): void {
  console.warn(`${LOG_PREFIX} ${message}`, data ?? '');
}

export function logError(message: string, data?: unknown): void {
  console.error(`${LOG_PREFIX} ${message}`, data ?? '');
}

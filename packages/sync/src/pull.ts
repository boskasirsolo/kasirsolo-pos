import { get, put } from '@kasirsolo/local-db';
import type { PosSettings, SyncStatus } from '@kasirsolo/local-db';
import type { SyncConfig, SyncResult, SyncableStore, SyncConflict } from './types';
import { ALL_SYNCABLE_STORES } from './types';
import {
  mapCloudToLocal,
  getCloudTable,
  now,
  getErrorMessage,
  logInfo,
  logWarn,
  logError,
} from './utils';
import { resolveConflict } from './conflict';

// ---------------------------------------------------------------------------
// Pull: Cloud → Local
// ---------------------------------------------------------------------------

/**
 * Pull updated records from Supabase cloud tables into local IndexedDB.
 * Only fetches records updated since last sync.
 */
export async function pullFromCloud(config: SyncConfig): Promise<SyncResult> {
  const startedAt = now();
  const errors: string[] = [];
  const allConflicts: SyncConflict[] = [];
  let totalPulled = 0;

  logInfo('Pull started', { licenseId: config.licenseId });

  // Get the last sync timestamp from local settings
  const lastSyncAt = await getLastSyncTimestamp();

  try {
    // Pull each store
    for (const store of ALL_SYNCABLE_STORES) {
      try {
        const result = await pullStore(config, store, lastSyncAt);
        totalPulled += result.pulled;
        allConflicts.push(...result.conflicts);
        errors.push(...result.errors);
      } catch (storeError) {
        const msg = `Pull ${store}: ${getErrorMessage(storeError)}`;
        logError(msg);
        errors.push(msg);
      }
    }

    // Update last sync timestamp in local settings
    await updateLastSyncTimestamp(now());

    logInfo(
      `Pull completed: ${totalPulled} records pulled, ${allConflicts.length} conflicts, ${errors.length} errors`,
    );
  } catch (error) {
    const msg = getErrorMessage(error);
    errors.push(msg);
    logError('Pull failed', msg);
  }

  const completedAt = now();
  return {
    direction: 'pull',
    pushed: 0,
    pulled: totalPulled,
    conflicts: allConflicts.length,
    conflictDetails: allConflicts,
    errors,
    success: errors.length === 0,
    startedAt,
    completedAt,
    durationMs: new Date(completedAt).getTime() - new Date(startedAt).getTime(),
  };
}

// ---------------------------------------------------------------------------
// Pull a single store
// ---------------------------------------------------------------------------

interface PullStoreResult {
  pulled: number;
  conflicts: SyncConflict[];
  errors: string[];
}

async function pullStore(
  config: SyncConfig,
  store: SyncableStore,
  lastSyncAt: string | null,
): Promise<PullStoreResult> {
  const tableName = getCloudTable(store);
  const errors: string[] = [];
  const conflicts: SyncConflict[] = [];
  let pulled = 0;

  // Build query: fetch records for this license updated since last sync
  let query = config.supabase
    .from(tableName)
    .select('*')
    .eq('license_id', config.licenseId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: true });

  if (lastSyncAt) {
    query = query.gt('updated_at', lastSyncAt);
  }

  // Paginate through results
  const pageSize = config.batchSize ?? 50;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await query.range(offset, offset + pageSize - 1);

    if (error) {
      errors.push(`Pull ${store}: ${error.message}`);
      logError(`Pull ${store} query failed`, error.message);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
      break;
    }

    // Process each cloud record
    for (const cloudRecord of data) {
      try {
        const result = await mergeCloudRecord(config, store, cloudRecord);
        if (result.pulled) pulled++;
        if (result.conflict) conflicts.push(result.conflict);
      } catch (mergeError) {
        const msg = `Pull ${store}/${cloudRecord.id}: ${getErrorMessage(mergeError)}`;
        logWarn(msg);
        errors.push(msg);
      }
    }

    if (data.length < pageSize) {
      hasMore = false;
    } else {
      offset += pageSize;
    }
  }

  // Also check for deleted records
  if (lastSyncAt) {
    await pullDeletedRecords(config, store, lastSyncAt, errors);
  }

  if (pulled > 0) {
    logInfo(`Pulled ${pulled} ${store} records`);
  }

  return { pulled, conflicts, errors };
}

// ---------------------------------------------------------------------------
// Merge a single cloud record into local
// ---------------------------------------------------------------------------

interface MergeResult {
  pulled: boolean;
  conflict: SyncConflict | null;
}

async function mergeCloudRecord(
  _config: SyncConfig,
  store: SyncableStore,
  cloudRecord: Record<string, unknown>,
): Promise<MergeResult> {
  const recordId = cloudRecord.id as string;

  // Check if a local version exists
  let localRecord: Record<string, unknown> | undefined;
  try {
    localRecord = (await get(store as never, recordId)) as Record<string, unknown> | undefined;
  } catch {
    // Store may not exist or record not found
    localRecord = undefined;
  }

  if (!localRecord) {
    // No local record: insert cloud version as "synced"
    const localVersion = mapCloudToLocal(cloudRecord, 'synced');
    await put(store as never, localVersion as never);
    return { pulled: true, conflict: null };
  }

  const localSyncStatus = localRecord.sync_status as SyncStatus | undefined;

  if (localSyncStatus === 'synced') {
    // Local record is already synced: safe to overwrite with cloud version
    const localVersion = mapCloudToLocal(cloudRecord, 'synced');
    await put(store as never, localVersion as never);
    return { pulled: true, conflict: null };
  }

  if (localSyncStatus === 'pending') {
    // CONFLICT: local has unsaved changes AND cloud has a newer version
    const localUpdatedAt =
      (localRecord.updated_at as string) ?? (localRecord.created_at as string) ?? '';
    const cloudUpdatedAt =
      (cloudRecord.updated_at as string) ?? (cloudRecord.created_at as string) ?? '';

    const resolution = resolveConflict({
      store,
      recordId,
      localRecord,
      cloudRecord,
      localUpdatedAt,
      cloudUpdatedAt,
    });

    if (resolution.winner === 'cloud') {
      // Cloud wins: overwrite local
      const localVersion = mapCloudToLocal(cloudRecord, 'synced');
      await put(store as never, localVersion as never);
      return { pulled: true, conflict: resolution.conflict };
    } else {
      // Local wins: keep local version as "pending" (will be pushed later)
      // Mark the conflict but don't change the local record
      return { pulled: false, conflict: resolution.conflict };
    }
  }

  if (localSyncStatus === 'conflict') {
    // Already in conflict state: resolve with last-write-wins
    const localUpdatedAt = (localRecord.updated_at as string) ?? '';
    const cloudUpdatedAt = (cloudRecord.updated_at as string) ?? '';

    const resolution = resolveConflict({
      store,
      recordId,
      localRecord,
      cloudRecord,
      localUpdatedAt,
      cloudUpdatedAt,
    });

    const localVersion = mapCloudToLocal(
      resolution.winningRecord,
      resolution.winner === 'cloud' ? 'synced' : 'pending',
    );
    await put(store as never, localVersion as never);
    return { pulled: true, conflict: resolution.conflict };
  }

  // Unknown status: treat as safe to overwrite
  const localVersion = mapCloudToLocal(cloudRecord, 'synced');
  await put(store as never, localVersion as never);
  return { pulled: true, conflict: null };
}

// ---------------------------------------------------------------------------
// Pull deleted records (soft-delete)
// ---------------------------------------------------------------------------

async function pullDeletedRecords(
  config: SyncConfig,
  store: SyncableStore,
  lastSyncAt: string,
  errors: string[],
): Promise<void> {
  const tableName = getCloudTable(store);

  try {
    const { data, error } = await config.supabase
      .from(tableName)
      .select('id')
      .eq('license_id', config.licenseId)
      .not('deleted_at', 'is', null)
      .gt('deleted_at', lastSyncAt);

    if (error) {
      errors.push(`Pull deleted ${store}: ${error.message}`);
      return;
    }

    if (!data || data.length === 0) return;

    // For each deleted cloud record, we could delete locally
    // For now, we don't delete from IndexedDB but could mark them
    for (const deletedRecord of data) {
      try {
        const local = await get(store as never, deletedRecord.id as string);
        if (local) {
          // We could either delete or mark as deleted locally
          // For safety, we'll just log it - actual deletion should be explicit
          logInfo(`Cloud record deleted: ${store}/${deletedRecord.id}`);
        }
      } catch (err) {
        const msg = `Failed to check local record for deleted ${store}/${(deletedRecord as { id?: string }).id}: ${getErrorMessage(err)}`;
        logWarn(msg);
      }
    }
  } catch (err) {
    errors.push(`Pull deleted ${store}: ${getErrorMessage(err)}`);
  }
}

// ---------------------------------------------------------------------------
// Last sync timestamp management
// ---------------------------------------------------------------------------

async function getLastSyncTimestamp(): Promise<string | null> {
  try {
    const settings = await get('settings', 'settings');
    if (settings && typeof settings === 'object' && 'last_synced_at' in settings) {
      return (settings as PosSettings).last_synced_at;
    }
  } catch {
    // Settings may not exist
  }
  return null;
}

async function updateLastSyncTimestamp(timestamp: string): Promise<void> {
  try {
    const settings = await get('settings', 'settings');
    if (settings && typeof settings === 'object') {
      await put('settings', {
        ...(settings as PosSettings),
        last_synced_at: timestamp,
        updated_at: timestamp,
      } as never);
    }
  } catch (err) {
    logWarn('Failed to update last_synced_at', getErrorMessage(err));
  }
}

/**
 * Pull a single record by ID from a specific cloud table.
 * Used by realtime subscriptions.
 */
export async function pullSingleRecord(
  config: SyncConfig,
  store: SyncableStore,
  recordId: string,
): Promise<MergeResult> {
  const tableName = getCloudTable(store);

  const { data, error } = await config.supabase
    .from(tableName)
    .select('*')
    .eq('id', recordId)
    .eq('license_id', config.licenseId)
    .single();

  if (error) {
    logWarn(`Failed to pull single record ${store}/${recordId}`, error.message);
    return { pulled: false, conflict: null };
  }

  if (!data) {
    return { pulled: false, conflict: null };
  }

  // Check if it was deleted
  if (data.deleted_at) {
    logInfo(`Realtime: record deleted ${store}/${recordId}`);
    return { pulled: false, conflict: null };
  }

  return mergeCloudRecord(config, store, data as Record<string, unknown>);
}

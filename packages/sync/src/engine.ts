import { getAll } from '@kasirsolo/local-db';

import type {
  SyncConfig,
  SyncState,
  SyncResult,
  SyncEvent,
  SyncEventHandler,
  SyncConflict,
  SyncPendingByStore,
} from './types';
import { pushToCloud } from './push';
import { pullFromCloud } from './pull';
import { SyncQueue } from './queue';
import { RealtimeManager } from './realtime';
import { logInfo, logWarn, logError, now, getErrorMessage } from './utils';

// ---------------------------------------------------------------------------
// Retry helpers
// ---------------------------------------------------------------------------

/**
 * Execute an async function with exponential backoff retry.
 * Default: max 3 retries with delays of 1s, 2s, 4s.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt); // 1s, 2s, 4s
        logWarn(
          `Sync operation failed, retrying in ${delay / 1000}s (attempt ${attempt + 1}/${maxRetries})`,
          getErrorMessage(err),
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// ---------------------------------------------------------------------------
// Default configuration values
// ---------------------------------------------------------------------------

const DEFAULT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BATCH_SIZE = 50;

// ---------------------------------------------------------------------------
// SyncEngine
// ---------------------------------------------------------------------------

/**
 * The main sync engine that orchestrates bidirectional synchronization
 * between local IndexedDB and Supabase cloud.
 *
 * Usage:
 * ```ts
 * const engine = new SyncEngine({
 *   supabase: createBrowserClient(),
 *   licenseId: "uuid",
 *   deviceId: "uuid",
 * });
 *
 * engine.on("sync:complete", (result) => console.log(result));
 * engine.start(); // begins periodic sync
 *
 * // Manual sync
 * const result = await engine.fullSync();
 * ```
 */
export class SyncEngine {
  private config: SyncConfig;
  private state: SyncState;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private eventHandlers: Map<SyncEvent, Set<SyncEventHandler>> = new Map();
  private queue: SyncQueue;
  private realtime: RealtimeManager;
  private disposed = false;

  constructor(config: SyncConfig) {
    this.config = {
      ...config,
      intervalMs: config.intervalMs ?? DEFAULT_INTERVAL_MS,
      maxRetries: config.maxRetries ?? DEFAULT_MAX_RETRIES,
      enableRealtime: config.enableRealtime ?? true,
      batchSize: config.batchSize ?? DEFAULT_BATCH_SIZE,
    };

    this.state = {
      status: 'idle',
      isRunning: false,
      lastSyncAt: null,
      pendingCount: 0,
      pendingByStore: {
        products: 0,
        transactions: 0,
        categories: 0,
        stockAdjustments: 0,
        receipts: 0,
        dailyReports: 0,
      },
      currentOperation: null,
      conflicts: [],
      errors: [],
    };

    // Initialize the sync queue
    this.queue = new SyncQueue({
      maxRetries: this.config.maxRetries,
      onProcess: async (item) => {
        switch (item.operation) {
          case 'push':
            await this.executePush();
            break;
          case 'pull':
            await this.executePull();
            break;
          case 'full':
            await this.executeFullSync();
            break;
        }
      },
    });

    // Initialize realtime manager
    this.realtime = new RealtimeManager(this.config, (event, data) => {
      this.emit(event, data);
    });

    logInfo('SyncEngine initialized', {
      licenseId: this.config.licenseId,
      deviceId: this.config.deviceId,
      interval: this.config.intervalMs,
    });
  }

  // =========================================================================
  // Core Sync Operations
  // =========================================================================

  /**
   * Push all pending local records to the cloud.
   */
  async push(): Promise<SyncResult> {
    if (this.disposed) throw new Error('SyncEngine is disposed');

    return new Promise<SyncResult>((resolve, reject) => {
      // If already syncing, queue it
      if (this.state.currentOperation) {
        this.queue.enqueue('push');
        // Return a pending result
        resolve({
          direction: 'push',
          pushed: 0,
          pulled: 0,
          conflicts: 0,
          conflictDetails: [],
          errors: ['Queued: another sync is in progress'],
          success: true,
          startedAt: now(),
          completedAt: now(),
          durationMs: 0,
        });
        return;
      }

      this.executePush().then(resolve).catch(reject);
    });
  }

  /**
   * Pull updated records from the cloud to local.
   */
  async pull(): Promise<SyncResult> {
    if (this.disposed) throw new Error('SyncEngine is disposed');

    return new Promise<SyncResult>((resolve, reject) => {
      if (this.state.currentOperation) {
        this.queue.enqueue('pull');
        resolve({
          direction: 'pull',
          pushed: 0,
          pulled: 0,
          conflicts: 0,
          conflictDetails: [],
          errors: ['Queued: another sync is in progress'],
          success: true,
          startedAt: now(),
          completedAt: now(),
          durationMs: 0,
        });
        return;
      }

      this.executePull().then(resolve).catch(reject);
    });
  }

  /**
   * Perform a full sync: push first, then pull.
   */
  async fullSync(): Promise<SyncResult> {
    if (this.disposed) throw new Error('SyncEngine is disposed');

    return new Promise<SyncResult>((resolve, reject) => {
      if (this.state.currentOperation) {
        this.queue.enqueue('full');
        resolve({
          direction: 'full',
          pushed: 0,
          pulled: 0,
          conflicts: 0,
          conflictDetails: [],
          errors: ['Queued: another sync is in progress'],
          success: true,
          startedAt: now(),
          completedAt: now(),
          durationMs: 0,
        });
        return;
      }

      this.executeFullSync().then(resolve).catch(reject);
    });
  }

  // =========================================================================
  // Lifecycle
  // =========================================================================

  /**
   * Start periodic sync. Also subscribes to realtime if enabled.
   */
  start(): void {
    if (this.disposed) throw new Error('SyncEngine is disposed');
    if (this.state.isRunning) {
      logWarn('SyncEngine is already running');
      return;
    }

    logInfo('SyncEngine starting periodic sync');

    this.state.isRunning = true;
    this.updateState({ isRunning: true });

    // Start periodic sync
    this.intervalId = setInterval(() => {
      if (!this.state.currentOperation) {
        retryWithBackoff(() => this.fullSync(), this.config.maxRetries ?? 3).catch((err) => {
          logError('Periodic sync failed after retries', getErrorMessage(err));
        });
      }
    }, this.config.intervalMs!);

    // Subscribe to realtime if enabled
    if (this.config.enableRealtime) {
      this.realtime.subscribe();
    }

    // Do an initial sync with retry
    retryWithBackoff(() => this.fullSync(), this.config.maxRetries ?? 3).catch((err) => {
      logError('Initial sync failed after retries', getErrorMessage(err));
    });
  }

  /**
   * Stop periodic sync and unsubscribe from realtime.
   */
  stop(): void {
    logInfo('SyncEngine stopping');

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.realtime.unsubscribe();
    this.queue.clear();

    this.state.isRunning = false;
    this.updateState({ isRunning: false, status: 'idle', currentOperation: null });
  }

  /**
   * Check if the engine is running periodic sync.
   */
  isRunning(): boolean {
    return this.state.isRunning;
  }

  /**
   * Dispose the engine entirely. Cannot be reused after this.
   */
  dispose(): void {
    this.stop();
    this.eventHandlers.clear();
    this.disposed = true;
    logInfo('SyncEngine disposed');
  }

  // =========================================================================
  // State
  // =========================================================================

  /**
   * Get the current sync state.
   */
  getState(): SyncState {
    return { ...this.state };
  }

  /**
   * Get the timestamp of the last successful sync.
   */
  getLastSync(): Date | null {
    return this.state.lastSyncAt ? new Date(this.state.lastSyncAt) : null;
  }

  /**
   * Get the count of pending (unsynced) records across all stores.
   */
  async getPendingCount(): Promise<number> {
    const counts = await this.getPendingByStore();
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    this.updateState({ pendingCount: total, pendingByStore: counts });
    return total;
  }

  /**
   * Get pending counts per store.
   */
  async getPendingByStore(): Promise<SyncPendingByStore> {
    const filterPending = <T extends { sync_status?: string }>(items: T[]): number =>
      items.filter((item) => item.sync_status === 'pending').length;

    try {
      const [products, transactions, categories, stockAdj, receipts, reports] = await Promise.all([
        getAll('products').then(filterPending),
        getAll('transactions').then(filterPending),
        getAll('categories').then(filterPending),
        getAll('stock_adjustments').then(filterPending),
        getAll('receipts').then(() => 0), // Receipts may not have sync_status
        getAll('daily_reports').then(() => 0), // Reports may not have sync_status
      ]);

      return {
        products,
        transactions,
        categories,
        stockAdjustments: stockAdj,
        receipts,
        dailyReports: reports,
      };
    } catch (err) {
      logWarn('Failed to count pending records', getErrorMessage(err));
      return {
        products: 0,
        transactions: 0,
        categories: 0,
        stockAdjustments: 0,
        receipts: 0,
        dailyReports: 0,
      };
    }
  }

  // =========================================================================
  // Events
  // =========================================================================

  /**
   * Register an event handler.
   */
  on(event: SyncEvent, handler: SyncEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  /**
   * Remove an event handler.
   */
  off(event: SyncEvent, handler: SyncEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  // =========================================================================
  // Internal: Execute sync operations
  // =========================================================================

  private async executePush(): Promise<SyncResult> {
    this.updateState({ status: 'syncing', currentOperation: 'push' });
    this.emit('sync:push:start');

    try {
      const result = await pushToCloud(this.config);

      this.emit('sync:push:complete', result);

      if (result.errors.length > 0) {
        this.updateState({
          errors: result.errors,
        });
      }

      return result;
    } catch (error) {
      const msg = getErrorMessage(error);
      this.updateState({ status: 'error', errors: [msg] });
      this.emit('sync:error', { error: msg, operation: 'push' });
      throw error;
    } finally {
      this.updateState({ currentOperation: null });
    }
  }

  private async executePull(): Promise<SyncResult> {
    this.updateState({ status: 'syncing', currentOperation: 'pull' });
    this.emit('sync:pull:start');

    try {
      const result = await pullFromCloud(this.config);

      this.emit('sync:pull:complete', result);

      if (result.conflictDetails.length > 0) {
        this.updateState({
          conflicts: [...this.state.conflicts, ...result.conflictDetails],
        });
        for (const conflict of result.conflictDetails) {
          this.emit('sync:conflict', conflict);
        }
      }

      if (result.errors.length > 0) {
        this.updateState({ errors: result.errors });
      }

      return result;
    } catch (error) {
      const msg = getErrorMessage(error);
      this.updateState({ status: 'error', errors: [msg] });
      this.emit('sync:error', { error: msg, operation: 'pull' });
      throw error;
    } finally {
      this.updateState({ currentOperation: null });
    }
  }

  private async executeFullSync(): Promise<SyncResult> {
    const startedAt = now();
    const startTime = Date.now();

    this.updateState({ status: 'syncing', currentOperation: 'full' });
    this.emit('sync:start', { direction: 'full' });

    const allErrors: string[] = [];
    const allConflicts: SyncConflict[] = [];
    let totalPushed = 0;
    let totalPulled = 0;

    try {
      // Push first, then pull
      try {
        const pushResult = await pushToCloud(this.config);
        totalPushed = pushResult.pushed;
        allErrors.push(...pushResult.errors);
        this.emit('sync:push:complete', pushResult);
      } catch (pushErr) {
        allErrors.push(`Push: ${getErrorMessage(pushErr)}`);
        logError('Full sync push phase failed', getErrorMessage(pushErr));
      }

      try {
        const pullResult = await pullFromCloud(this.config);
        totalPulled = pullResult.pulled;
        allConflicts.push(...pullResult.conflictDetails);
        allErrors.push(...pullResult.errors);
        this.emit('sync:pull:complete', pullResult);
      } catch (pullErr) {
        allErrors.push(`Pull: ${getErrorMessage(pullErr)}`);
        logError('Full sync pull phase failed', getErrorMessage(pullErr));
      }

      // Update pending counts
      await this.getPendingCount();

      const completedAt = now();
      const result: SyncResult = {
        direction: 'full',
        pushed: totalPushed,
        pulled: totalPulled,
        conflicts: allConflicts.length,
        conflictDetails: allConflicts,
        errors: allErrors,
        success: allErrors.length === 0,
        startedAt,
        completedAt,
        durationMs: Date.now() - startTime,
      };

      this.updateState({
        status: allErrors.length > 0 ? 'error' : 'idle',
        lastSyncAt: completedAt,
        conflicts:
          allConflicts.length > 0
            ? [...this.state.conflicts, ...allConflicts]
            : this.state.conflicts,
        errors: allErrors,
      });

      this.emit('sync:complete', result);
      return result;
    } catch (error) {
      const msg = getErrorMessage(error);
      this.updateState({ status: 'error', errors: [msg], currentOperation: null });
      this.emit('sync:error', { error: msg, operation: 'full' });
      throw error;
    } finally {
      this.updateState({ currentOperation: null });
    }
  }

  // =========================================================================
  // Internal helpers
  // =========================================================================

  private updateState(partial: Partial<SyncState>): void {
    this.state = { ...this.state, ...partial };
    this.emit('sync:state-change', this.state);
  }

  private emit(event: SyncEvent, data?: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (err) {
          logError(`Event handler error for ${event}`, getErrorMessage(err));
        }
      }
    }
  }
}

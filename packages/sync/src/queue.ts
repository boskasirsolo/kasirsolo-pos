import type { QueueItem, SyncDirection } from "./types";
import { logInfo, logWarn, logError, now, getErrorMessage } from "./utils";

// ---------------------------------------------------------------------------
// Sync Queue Manager
// ---------------------------------------------------------------------------

/**
 * Manages sync operations to prevent concurrent syncs and provides
 * retry logic with exponential backoff.
 */
export class SyncQueue {
  private queue: QueueItem[] = [];
  private processing = false;
  private deadLetterQueue: QueueItem[] = [];
  private maxRetries: number;
  private onProcess: (item: QueueItem) => Promise<void>;

  /** Base delay for exponential backoff in ms */
  private baseDelayMs = 1000;
  /** Maximum delay cap in ms */
  private maxDelayMs = 30000;

  constructor(options: {
    maxRetries?: number;
    onProcess: (item: QueueItem) => Promise<void>;
  }) {
    this.maxRetries = options.maxRetries ?? 3;
    this.onProcess = options.onProcess;
  }

  /**
   * Add a sync operation to the queue.
   * Returns the queue item ID.
   */
  enqueue(operation: SyncDirection, priority: number = 0): string {
    // Don't add duplicate operations that are already pending
    const existing = this.queue.find(
      (item) =>
        item.operation === operation &&
        (item.status === "pending" || item.status === "in_progress")
    );
    if (existing) {
      logInfo(`Operation '${operation}' already queued, skipping duplicate`);
      return existing.id;
    }

    const id = `sync_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const item: QueueItem = {
      id,
      operation,
      priority,
      attempts: 0,
      maxAttempts: this.maxRetries,
      lastAttemptAt: null,
      nextRetryAt: null,
      createdAt: now(),
      status: "pending",
      error: null,
    };

    this.queue.push(item);
    // Sort by priority (higher first), then by creation time
    this.queue.sort((a, b) => b.priority - a.priority || a.createdAt.localeCompare(b.createdAt));

    logInfo(`Enqueued operation: ${operation} (id: ${id})`);
    this.processNext();

    return id;
  }

  /**
   * Process the next item in the queue.
   */
  private async processNext(): Promise<void> {
    if (this.processing) return;

    const nextItem = this.queue.find((item) => {
      if (item.status !== "pending") return false;
      // Check if retry delay has passed
      if (item.nextRetryAt && new Date(item.nextRetryAt).getTime() > Date.now()) {
        return false;
      }
      return true;
    });

    if (!nextItem) return;

    this.processing = true;
    nextItem.status = "in_progress";
    nextItem.attempts += 1;
    nextItem.lastAttemptAt = now();

    try {
      await this.onProcess(nextItem);
      // Success: remove from queue
      this.queue = this.queue.filter((i) => i.id !== nextItem.id);
      logInfo(`Operation completed: ${nextItem.operation} (id: ${nextItem.id})`);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      nextItem.error = errorMsg;

      if (nextItem.attempts >= nextItem.maxAttempts) {
        // Move to dead letter queue
        nextItem.status = "dead";
        this.deadLetterQueue.push(nextItem);
        this.queue = this.queue.filter((i) => i.id !== nextItem.id);
        logError(
          `Operation permanently failed after ${nextItem.attempts} attempts: ${nextItem.operation}`,
          errorMsg
        );
      } else {
        // Schedule retry with exponential backoff
        const delayMs = Math.min(
          this.baseDelayMs * Math.pow(2, nextItem.attempts - 1),
          this.maxDelayMs
        );
        nextItem.status = "pending";
        nextItem.nextRetryAt = new Date(Date.now() + delayMs).toISOString();
        logWarn(
          `Operation failed (attempt ${nextItem.attempts}/${nextItem.maxAttempts}), ` +
          `retrying in ${delayMs}ms: ${nextItem.operation}`,
          errorMsg
        );

        // Schedule the retry
        setTimeout(() => this.processNext(), delayMs);
      }
    } finally {
      this.processing = false;
      // Process next item if any
      this.processNext();
    }
  }

  /**
   * Check if the queue is currently processing.
   */
  isProcessing(): boolean {
    return this.processing;
  }

  /**
   * Check if there are items in the queue.
   */
  hasPending(): boolean {
    return this.queue.some((item) => item.status === "pending" || item.status === "in_progress");
  }

  /**
   * Get the current queue state.
   */
  getQueue(): Readonly<QueueItem[]> {
    return [...this.queue];
  }

  /**
   * Get permanently failed items.
   */
  getDeadLetterQueue(): Readonly<QueueItem[]> {
    return [...this.deadLetterQueue];
  }

  /**
   * Retry all dead letter items (reset them back to the queue).
   */
  retryDeadLetters(): void {
    for (const item of this.deadLetterQueue) {
      item.status = "pending";
      item.attempts = 0;
      item.error = null;
      item.nextRetryAt = null;
      this.queue.push(item);
    }
    this.deadLetterQueue = [];
    logInfo("Dead letter queue flushed back to main queue");
    this.processNext();
  }

  /**
   * Clear all dead letter items.
   */
  clearDeadLetters(): void {
    const count = this.deadLetterQueue.length;
    this.deadLetterQueue = [];
    logInfo(`Cleared ${count} dead letter items`);
  }

  /**
   * Cancel all pending items and stop processing.
   */
  clear(): void {
    this.queue = [];
    this.processing = false;
    logInfo("Queue cleared");
  }

  /**
   * Get the number of pending items.
   */
  get size(): number {
    return this.queue.filter((i) => i.status === "pending" || i.status === "in_progress").length;
  }

  /**
   * Get the number of dead letter items.
   */
  get deadLetterSize(): number {
    return this.deadLetterQueue.length;
  }
}

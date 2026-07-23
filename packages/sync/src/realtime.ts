import type { SupabaseClient, RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import type { SyncConfig, SyncableStore, SyncEvent, SyncEventHandler } from "./types";
import { STORE_TO_TABLE, ALL_SYNCABLE_STORES } from "./types";
import { pullSingleRecord } from "./pull";
import { logInfo, logWarn, logError, getErrorMessage } from "./utils";

// ---------------------------------------------------------------------------
// Realtime Subscription Manager
// ---------------------------------------------------------------------------

/**
 * Manages Supabase Realtime subscriptions for synced tables.
 * Listens for INSERT, UPDATE, DELETE on ksp_synced_* tables
 * filtered by license_id, and pulls changes into local IndexedDB.
 */
export class RealtimeManager {
  private config: SyncConfig;
  private channels: Map<SyncableStore, RealtimeChannel> = new Map();
  private active = false;
  private emitEvent: (event: SyncEvent, data?: unknown) => void;

  constructor(
    config: SyncConfig,
    emitEvent: (event: SyncEvent, data?: unknown) => void
  ) {
    this.config = config;
    this.emitEvent = emitEvent;
  }

  /**
   * Subscribe to all synced tables for the current license.
   */
  subscribe(): void {
    if (this.active) {
      logWarn("Realtime already subscribed");
      return;
    }

    logInfo("Subscribing to realtime updates");

    for (const store of ALL_SYNCABLE_STORES) {
      this.subscribeToStore(store);
    }

    this.active = true;
  }

  /**
   * Unsubscribe from all channels.
   */
  unsubscribe(): void {
    if (!this.active) return;

    logInfo("Unsubscribing from realtime updates");

    for (const [store, channel] of this.channels.entries()) {
      try {
        this.config.supabase.removeChannel(channel);
      } catch (err) {
        logWarn(`Failed to remove channel for ${store}`, getErrorMessage(err));
      }
    }

    this.channels.clear();
    this.active = false;
  }

  /**
   * Check if realtime is currently active.
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Reconnect all subscriptions (e.g., after network recovery).
   */
  reconnect(): void {
    this.unsubscribe();
    this.subscribe();
  }

  // -------------------------------------------------------------------------
  // Private: Subscribe to a single store
  // -------------------------------------------------------------------------

  private subscribeToStore(store: SyncableStore): void {
    const tableName = STORE_TO_TABLE[store];

    const channel = this.config.supabase
      .channel(`sync_${store}_${this.config.licenseId}`)
      .on(
        "postgres_changes" as never,
        {
          event: "*",
          schema: "public",
          table: tableName,
          filter: `license_id=eq.${this.config.licenseId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          this.handleChange(store, payload);
        }
      )
      .subscribe((status: string) => {
        if (status === "SUBSCRIBED") {
          logInfo(`Realtime subscribed: ${store}`);
        } else if (status === "CHANNEL_ERROR") {
          logError(`Realtime channel error: ${store}`);
        } else if (status === "TIMED_OUT") {
          logWarn(`Realtime timed out: ${store}, will retry`);
          // Remove and re-subscribe after a delay
          setTimeout(() => {
            if (this.active) {
              this.channels.delete(store);
              this.subscribeToStore(store);
            }
          }, 5000);
        }
      });

    this.channels.set(store, channel);
  }

  // -------------------------------------------------------------------------
  // Private: Handle a realtime change event
  // -------------------------------------------------------------------------

  private async handleChange(
    store: SyncableStore,
    payload: RealtimePostgresChangesPayload<Record<string, unknown>>
  ): Promise<void> {
    const eventType = payload.eventType;

    try {
      if (eventType === "INSERT" || eventType === "UPDATE") {
        const record = payload.new;
        if (!record || !record.id) return;

        logInfo(`Realtime ${eventType}: ${store}/${record.id}`);

        // Pull this specific record into local
        const result = await pullSingleRecord(this.config, store, record.id as string);

        this.emitEvent("sync:realtime-update", {
          store,
          eventType,
          recordId: record.id,
          pulled: result.pulled,
          conflict: result.conflict,
        });
      } else if (eventType === "DELETE") {
        const record = payload.old;
        if (!record || !record.id) return;

        logInfo(`Realtime DELETE: ${store}/${record.id}`);

        this.emitEvent("sync:realtime-update", {
          store,
          eventType,
          recordId: record.id,
          deleted: true,
        });
      }
    } catch (err) {
      logError(`Realtime handler error for ${store}`, getErrorMessage(err));
    }
  }
}

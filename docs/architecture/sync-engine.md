# Sync Engine Architecture

## Overview

The KASIRSOLO sync engine provides bidirectional synchronization between local IndexedDB (offline POS data) and Supabase PostgreSQL (cloud storage). It is designed for cloud-plan subscribers only and follows an offline-first architecture.

## Package: `@kasirsolo/sync`

Located at `packages/sync/`, this is a framework-agnostic sync orchestrator with no React dependencies. React hooks that consume it live in `apps/kasir-retail/src/features/sync/`.

## Architecture Diagram

```
+---------------------------+        +---------------------------+
|     IndexedDB (Local)     |        |    Supabase (Cloud)       |
|                           |        |                           |
| products                  |  push  | ksp_synced_products       |
| transactions              | -----> | ksp_synced_transactions   |
| categories                |        | ksp_synced_categories     |
| stock_adjustments         |  pull  | ksp_synced_stock_adj      |
| receipts                  | <----- | ksp_synced_receipts       |
| daily_reports             |        | ksp_synced_daily_reports  |
+---------------------------+        +---------------------------+
             |                                    |
             |         SyncEngine                 |
             |   +---------------------+          |
             +---| push.ts             |----------+
             +---| pull.ts             |----------+
             |   | conflict.ts         |          |
             |   | queue.ts            |          |
             |   | realtime.ts         |          |
             |   | utils.ts            |          |
             |   +---------------------+          |
             |                                    |
             +--- ksp_sync_log (audit) -----------+
```

## Data Flow

### Push (Local -> Cloud)

1. Collect all records with `sync_status = "pending"` from IndexedDB
2. Map local records to cloud format (add `license_id`, remove `sync_status`)
3. Batch upsert to Supabase `ksp_synced_*` tables (50 records per batch)
4. On success: mark local records as `sync_status = "synced"`
5. On failure: leave records as "pending" for retry
6. Log to `ksp_sync_log`

### Pull (Cloud -> Local)

1. Query `ksp_synced_*` tables WHERE `license_id = X` AND `updated_at > last_sync_at`
2. For each cloud record:
   - No local record: insert as "synced"
   - Local exists, `sync_status = "synced"`: overwrite with cloud version
   - Local exists, `sync_status = "pending"`: **CONFLICT** -- resolve with last-write-wins
3. Update `last_synced_at` in local settings

### Conflict Resolution

Strategy: **Last-Write-Wins** based on `updated_at` timestamps.

- Compare local `updated_at` vs cloud `updated_at`
- The newer version wins
- Losing version is discarded
- All conflicts are logged and emitted as events for UI notification

## Sync Triggers

| Trigger | Behavior |
|---------|----------|
| Periodic | Every 5 minutes when online and app is visible |
| Manual | User taps "Sinkronkan Sekarang" button |
| Reconnect | When device goes from offline to online |
| Realtime | Supabase Realtime subscription pushes individual record changes |
| Visibility | Sync pauses when app goes to background, resumes on foreground |

## Sync Queue

- Prevents concurrent sync operations
- Retry with exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (max)
- Maximum 3 retries per operation
- Dead letter queue for permanently failed operations

## Realtime Subscriptions

When enabled, the engine subscribes to Supabase Realtime on all `ksp_synced_*` tables filtered by `license_id`. On INSERT/UPDATE, the specific record is pulled into local IndexedDB. This provides near-instant sync for multi-device scenarios.

## Database Tables

### Cloud Tables (Migration: `003_sync_tables.sql`)

| Table | Purpose |
|-------|---------|
| `ksp_synced_products` | Product catalog mirror |
| `ksp_synced_transactions` | Sales transactions mirror |
| `ksp_synced_categories` | Product categories mirror |
| `ksp_synced_stock_adjustments` | Stock adjustment history |
| `ksp_synced_receipts` | Receipt data for reprint |
| `ksp_synced_daily_reports` | Daily business summaries |
| `ksp_sync_log` | Audit trail of sync operations |

All tables:
- Have `license_id` FK to `ksp_licenses` for multi-tenancy
- Have `updated_at` trigger for automatic timestamp management
- Have RLS policies via `ksp_user_owns_license()` function
- Are indexed on `(license_id, updated_at)` for efficient pull queries
- Support soft-delete via `deleted_at` column
- Are added to Supabase Realtime publication

## Security

- All synced tables use Row Level Security (RLS)
- `ksp_user_owns_license()` function validates ownership through: `license -> client -> auth.uid()`
- Cloud sync only available for `cloud_monthly` and `cloud_yearly` plan types
- Device ID is logged in `ksp_sync_log` for auditing

## File Structure

```
packages/sync/
  src/
    index.ts        - Re-exports
    types.ts        - All type definitions
    engine.ts       - SyncEngine class (main orchestrator)
    push.ts         - Push local -> cloud logic
    pull.ts         - Pull cloud -> local logic
    conflict.ts     - Last-write-wins conflict resolution
    queue.ts        - Sync queue with retry/backoff
    realtime.ts     - Supabase Realtime subscription manager
    utils.ts        - Mapping, diffing, logging helpers
  package.json
  tsconfig.json

apps/kasir-retail/src/features/sync/
  data/
    types.ts        - UI-facing sync types
  ui/
    SyncStatusBar.tsx     - TopBar indicator
    SyncPanel.tsx         - Full management bottom sheet
    SyncConflictModal.tsx - Conflict viewer
    UpgradePrompt.tsx     - Cloud plan CTA
  logic/
    useSync.ts           - Main sync hook
    useSyncStatus.ts     - Lightweight status hook
  index.tsx              - Feature barrel export
```

## Business Rules

1. Sync is **only** for `cloud_monthly` and `cloud_yearly` plans
2. Offline-plan users see an upgrade prompt instead of sync controls
3. All data is scoped by `license_id` (multi-tenant)
4. Sync preserves the offline-first principle: IndexedDB is always the source of truth for the current device
5. `last_synced_at` is stored in local `PosSettings` for pull optimization

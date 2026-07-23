# Data Strategy: Cloud vs Local

## Overview

KASIRSOLO uses a **hybrid data strategy** that splits data between cloud (Supabase PostgreSQL) and local (IndexedDB in the browser). This design enables offline-first POS operations while maintaining centralized management through the cloud.

## Prefix Convention

| Prefix | Storage | Purpose |
|--------|---------|---------|
| `ksp_` | Supabase (PostgreSQL) | Platform-level data: licenses, users, subscriptions, sites |
| `pos_` | IndexedDB (Browser) | App-level operational data: products, sales, inventory |

## When to Use Cloud (`ksp_*`)

Cloud storage via Supabase is used for data that:
- Must be accessible across devices
- Requires server-side validation or authorization
- Is related to billing, licensing, or authentication
- Needs to be queried by the admin dashboard
- Must persist beyond a single browser/device

### Cloud Tables

| Table | Purpose |
|-------|---------|
| `ksp_apps` | Product catalog (8 apps) |
| `ksp_clients` | Customer/business records |
| `ksp_licenses` | License keys, plans, status |
| `ksp_devices` | Device fingerprints & bindings |
| `ksp_users` | Authenticated users with roles |
| `ksp_transactions` | Payment history |
| `ksp_subscriptions` | Recurring billing |
| `ksp_sites` | Portfolio site definitions |
| `ksp_site_pages` | CMS page content |
| `ksp_site_settings` | Site theming & branding |
| `ksp_logs` | Audit trail |
| `ksp_settings` | Global config (JSONB) |

## When to Use Local (`pos_*`)

IndexedDB is used for data that:
- Must work without internet connectivity
- Is high-frequency (every POS transaction)
- Is specific to one business/location
- Needs instant read/write (no network latency)
- Can be eventually synced to cloud

### Local Stores (IndexedDB via Dexie.js)

| Store | Purpose | Syncs to Cloud |
|-------|---------|---------------|
| `pos_products` | Product catalog (name, price, barcode, image) | Yes (cloud plan) |
| `pos_categories` | Product categories/groups | Yes (cloud plan) |
| `pos_inventory` | Stock levels, adjustments | Yes (cloud plan) |
| `pos_sales` | Completed sale transactions | Yes (cloud plan) |
| `pos_sale_items` | Line items for each sale | Yes (cloud plan) |
| `pos_customers` | Local customer records | Yes (cloud plan) |
| `pos_cart` | Current cart state (ephemeral) | No |
| `pos_drafts` | Saved/parked transactions | No |
| `pos_sync_queue` | Pending sync operations | N/A (meta) |
| `pos_settings` | Local app settings | No |

## Sync Architecture

```
+-------------------+        +-------------------+        +-------------------+
|   POS App (UI)    |        |   Sync Engine     |        |   Supabase        |
|                   |        |   (Service Worker) |        |                   |
|  User makes sale  +------->+  Queue operation   +------->+  Receive & store  |
|                   |        |                   |        |                   |
|  Read from local  +<-------+  Pull updates     +<-------+  Send changes     |
+-------------------+        +-------------------+        +-------------------+
```

### Sync Rules

1. **Write-local-first**: All POS operations write to IndexedDB immediately. The user never waits for a network response during a sale.

2. **Queue-and-sync**: When a write occurs, a sync operation is queued in `pos_sync_queue`. The Service Worker processes this queue when online.

3. **Delta sync**: Only records modified since last sync are transferred. Each record has a `synced_at` timestamp.

4. **Conflict resolution**: Server timestamp wins. If the same record was modified on two devices, the later server-side timestamp takes precedence. Local changes that conflict are logged for manual review.

5. **Idempotent operations**: Sync operations include a unique operation ID. Replaying the same operation is safe.

## Offline vs Cloud Plans

### Offline Plan (`plan_type: 'offline'`)

```
+------------------+
|   Device 1       |
|   IndexedDB      |     No cloud sync.
|   (all data)     |     Data lives only on device.
+------------------+     Backup: manual export.

+------------------+
|   Device 2       |
|   IndexedDB      |     Independent data.
|   (all data)     |     No cross-device sync.
+------------------+
```

- Data stored only in IndexedDB on the device
- No cloud synchronization
- No cross-device data sharing
- Manual backup via export (JSON/CSV)
- Lower cost (one-time payment)
- Still authenticates via Supabase for license validation

### Cloud Plan (`plan_type: 'cloud_monthly'` or `'cloud_yearly'`)

```
+------------------+        +-------------------+        +------------------+
|   Device 1       |        |     Supabase      |        |   Device 2       |
|   IndexedDB      +<------>+   (cloud sync)    +<------>+   IndexedDB      |
|   (local cache)  |        |   ksp_* + mirror  |        |   (local cache)  |
+------------------+        +-------------------+        +------------------+
```

- Full cloud sync between devices
- Real-time data sharing
- Automatic backups
- Admin dashboard access
- Portfolio site included
- Recurring subscription

## Upgrade Path: Offline to Cloud

When a client upgrades from offline to cloud:

1. **License update**: `plan_type` changes from `offline` to `cloud_monthly` or `cloud_yearly`
2. **Initial upload**: All local IndexedDB data is uploaded to Supabase cloud mirror tables
3. **Sync activation**: Service Worker sync engine activates
4. **Second device**: Client can now use a second device with synced data
5. **No data loss**: Existing offline data is preserved and becomes the cloud baseline

```
BEFORE UPGRADE:
  Device: [IndexedDB: 1000 products, 5000 sales] --> Cloud: [nothing]

UPGRADE PROCESS:
  Step 1: Change license plan_type
  Step 2: Bulk upload IndexedDB --> Supabase
  Step 3: Activate sync engine
  Step 4: Confirm data integrity

AFTER UPGRADE:
  Device: [IndexedDB: cache] <--> Cloud: [1000 products, 5000 sales]
```

## Data Ownership & Privacy

- All `pos_*` data belongs to the client
- Data is stored locally on the client's device (offline plan)
- Cloud plan data is stored in Supabase with RLS policies
- Clients can export all their data at any time
- Deleting a license does not automatically delete local IndexedDB data
- GDPR-like data deletion can be requested through admin

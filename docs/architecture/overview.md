# Architecture Overview

## Grand Architecture Diagram

```
+===========================================================================+
|                          KASIRSOLO PLATFORM                               |
+===========================================================================+
|                                                                           |
|  CLIENTS (Browser / PWA)                                                  |
|  +---------------------------------------------------------------------+  |
|  |                                                                     |  |
|  |  +-------------+  +-----------+  +----------+  +----------------+  |  |
|  |  | Landing App |  | Admin App |  | POS Apps |  | Portfolio Site |  |  |
|  |  | (marketing) |  | (manage)  |  | (8 apps) |  | (per-client)  |  |  |
|  |  +------+------+  +-----+-----+  +----+-----+  +-------+--------+  |  |
|  |         |                |              |                |           |  |
|  +---------|----------------|--------------|----------------|----------+  |
|            |                |              |                |              |
|  +---------v----------------v--------------v----------------v----------+  |
|  |                    SHARED PACKAGES                                  |  |
|  |  +--------+  +----------+  +--------+  +---------+                 |  |
|  |  |   ui   |  |   utils  |  |   db   |  | local-db|                 |  |
|  |  |shadcn  |  | helpers  |  |supabase|  | IndexedDB|                |  |
|  |  +--------+  +----------+  +---+----+  +----+----+                 |  |
|  +-------------------------------------|--------|---------+-----------+  |
|                                        |        |                        |
|            CLOUD                       |        |  LOCAL                 |
|  +---------------------------------+   |        |   +------------------+ |
|  |         SUPABASE                |   |        |   |    BROWSER       | |
|  |  +----------+  +------------+  |   |        |   |  +-----------+   | |
|  |  | Auth     |  | PostgreSQL |  |<--+        +-->|  | IndexedDB |   | |
|  |  | (users)  |  | (ksp_*)    |  |                |  | (pos_*)   |   | |
|  |  +----------+  +------------+  |                |  +-----------+   | |
|  |  +----------+  +------------+  |                |  +-----------+   | |
|  |  | Storage  |  | Edge Funcs |  |                |  | Service   |   | |
|  |  | (files)  |  | (API)      |  |                |  | Worker    |   | |
|  |  +----------+  +------------+  |                |  +-----------+   | |
|  +---------------------------------+                +------------------+ |
|                                                                          |
|  DEPLOYMENT                                                              |
|  +--------------------------------------------------------------------+  |
|  |                         VERCEL                                     |  |
|  |  +----------+ +----------+ +--------+ +--------+ +-------------+  |  |
|  |  | landing  | | admin    | | retail  | | bengkel| | ... (more)  |  |  |
|  |  | .vercel  | | .vercel  | | .vercel | | .vercel| |             |  |  |
|  |  +----------+ +----------+ +--------+ +--------+ +-------------+  |  |
|  +--------------------------------------------------------------------+  |
|                                                                          |
+==========================================================================+
```

## Multi-App Monorepo Architecture

KASIRSOLO uses a Turborepo-based monorepo that houses all 8 POS/management applications plus supporting apps (admin, landing, portfolio). This approach enables:

### Code Sharing
All apps share core packages (`ui`, `utils`, `db`, `local-db`). A bug fix in the shared UI library immediately benefits all 8 apps. Business logic for licensing, authentication, and device management is written once.

### Independent Deployment
Each app deploys independently on Vercel. Updating the retail POS does not require redeploying the clinic app. Turborepo's dependency graph ensures only affected apps rebuild.

### Consistent DX
All apps use the same TypeScript configuration, linting rules, and testing framework. Developers switch between apps with zero context-switching cost.

## Data Flow

```
                    +------------------+
                    |   User Action    |
                    +--------+---------+
                             |
                    +--------v---------+
                    |  Is user online? |
                    +--------+---------+
                        |           |
                      YES           NO
                        |           |
              +---------v--+    +---v-----------+
              | Write to   |    | Write to      |
              | Supabase   |    | IndexedDB     |
              | (ksp_*)    |    | (pos_*)       |
              +-----+------+    +-------+-------+
                    |                   |
              +-----v------+    +-------v-------+
              | RLS Policy |    | Queue for     |
              | Applied    |    | sync later    |
              +-----+------+    +-------+-------+
                    |                   |
              +-----v------+    +-------v-------+
              | Return to  |    | When online:  |
              | UI         |    | Sync to cloud |
              +------------+    +---------------+
```

### Cloud Data (Supabase `ksp_*` tables)
- License management, subscriptions, transactions
- User authentication and roles
- Portfolio site content
- Audit logs
- Global settings

### Local Data (IndexedDB `pos_*` stores)
- Products, categories, inventory
- Sales transactions (POS receipts)
- Customer data (local cache)
- Cart state, drafts
- Offline queue (pending sync)

### Sync Strategy
1. **Offline-first**: POS operations always write to IndexedDB first
2. **Background sync**: Service Worker syncs queued operations when online
3. **Conflict resolution**: Server timestamp wins; local changes merged
4. **Selective sync**: Only changed records sync (delta sync)

## App Responsibilities

| App | Type | Primary Function |
|-----|------|-----------------|
| `landing` | Marketing | Product showcase, trial registration |
| `admin` | Management | License, user, and subscription management |
| `kasir-retail` | POS | Retail point of sale |
| `kasir-konveksi` | Management | Garment production tracking |
| `kasir-bengkel` | POS + Service | Workshop & spare parts |
| `kasir-masjid` | Finance | Mosque financial management |
| `kasir-tpa` | Education | Quran school management |
| `kasir-klinik` | Healthcare | ENT clinic management |
| `kasir-apotek` | POS + Pharma | Pharmacy POS & stock |
| `kasir-dapur` | Operations | Kitchen/meal planning |
| `site-portfolio` | CMS | Client portfolio websites |

## Security Model

```
+------------------+     +------------------+     +------------------+
|   Public Layer   |     |  Authenticated   |     |  Admin Layer     |
|                  |     |  Layer           |     |                  |
|  - Landing page  |     |  - POS apps      |     |  - Admin panel   |
|  - Public sites  |     |  - User settings |     |  - License mgmt  |
|  - App catalog   |     |  - Own data only |     |  - All data      |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        v
+------------------------------------------------------------------+
|                    Supabase RLS Policies                          |
|  - ksp_apps: public read                                         |
|  - ksp_clients: own data only (auth_user_id match)               |
|  - ksp_licenses: via client ownership                            |
|  - ksp_devices: via license -> client ownership                  |
|  - ksp_users: own record + same-license peers                    |
|  - ksp_sites: owner manages, public reads published              |
+------------------------------------------------------------------+
```

# AI Agent Handoff Context

**THIS IS THE KEY FILE.** If you are an AI agent continuing development on KASIRSOLO, read this file first. It contains everything you need to understand the project and continue building.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Project Name** | KASIRSOLO |
| **Full Name** | Kasir Solo - Multi-App POS & Management Platform |
| **Developer** | PT Mesin Kasir Solo |
| **Owner** | Amin Maghfuri |
| **Email** | owner.kasirsolo@gmail.com |
| **WhatsApp** | 0881 6566 935 (international: +628816566935) |
| **Legal Address** | Perum Graha Tiara 2 B1 Gumpang 07/01, Kartasura, Sukoharjo, Jawa Tengah 57169 |
| **Legal Maps** | https://maps.app.goo.gl/DtNwuJvY9KufJN3CA |
| **Operational Address** | Gumiring 04/04, Sidomulyo, Banjarejo, Blora, Jawa Tengah 58253 |
| **Operational Maps** | https://maps.app.goo.gl/F9YMpuBUPMd1tcNWA |
| **Supabase Project ID** | eoowqtsvaayijmjmgmid |
| **Brand Colors** | Primary #FF5F1F, Secondary #F7A237, Accent #FFCE55 |

---

## 2. What KASIRSOLO Is

KASIRSOLO is a **multi-app monorepo platform** that provides specialized POS (Point of Sale) and management applications for small businesses and institutions in Indonesia. It is built as a Turborepo monorepo with 8 customer-facing POS apps, an admin dashboard, a landing page, and a portfolio site system.

The key architectural feature is its **hybrid offline/cloud data strategy**: POS operations work entirely offline using IndexedDB, while platform management (licenses, users, subscriptions) lives in Supabase PostgreSQL. Cloud-plan users get bidirectional sync between local and cloud.

---

## 3. The 8 Apps

| # | Slug | Name | Icon | Price | Category |
|---|------|------|------|-------|----------|
| 1 | `retail` | Kasir Retail | 🛒 | Rp250.000 | bisnis |
| 2 | `fnb` | Kasir F&B | 🍽️ | Rp350.000 | bisnis |
| 3 | `konveksi` | Manajemen Konveksi | 👕 | Rp350.000 | bisnis |
| 4 | `bengkel` | Bengkel + Sparepart | 🔧 | Rp400.000 | bisnis |
| 5 | `masjid` | Manajemen Masjid | 🕌 | Rp200.000 | institusi |
| 6 | `tpa` | Manajemen TPA/TPQ | 📖 | Rp200.000 | institusi |
| 7 | `klinik` | Klinik THT | 🩺 | Rp500.000 | kesehatan |
| 8 | `apotek` | Apotek | 💊 | Rp450.000 | kesehatan |
| 9 | `dapur` | Dapur SPPG | 🍳 | Rp300.000 | institusi |

Plus 3 supporting apps:
- **landing** (kasirsolo.com) - Marketing site, trial registration
- **admin** (admin.kasirsolo.com) - Platform management dashboard
- **site-portfolio** (kasirsolo.com/site/*) - Client portfolio websites

---

## 4. Tech Stack

| Layer | Tech |
|-------|------|
| Language | TypeScript 5 |
| Framework | Next.js 15 (App Router) |
| UI | React 19 |
| Monorepo | Turborepo 2 + pnpm 9 |
| Cloud DB | Supabase (PostgreSQL 15) |
| Local DB | IndexedDB via Dexie.js 4 |
| Styling | Tailwind CSS 3 + shadcn/ui |
| State | Zustand 5 |
| Data Fetching | TanStack Query 5 |
| Auth | Supabase Auth |
| Deployment | Vercel |
| Testing | Vitest 2 |

---

## 5. Architecture Summary

### Monorepo Structure
```
kasirsolo/
  apps/
    landing/          # Marketing site (port 3001)
    admin/            # Admin dashboard (port 3000)
    kasir-retail/     # POS: Retail (port 3002)
    kasir-fnb/        # POS: F&B / Restoran (port 3003)
    kasir-konveksi/   # POS: Konveksi (port 3011)
    kasir-bengkel/    # POS: Bengkel (port 3012)
    kasir-masjid/     # Mgmt: Masjid (port 3013)
    kasir-tpa/        # Mgmt: TPA/TPQ (port 3014)
    kasir-klinik/     # Mgmt: Klinik (port 3015)
    kasir-apotek/     # POS: Apotek (port 3016)
    kasir-dapur/      # Mgmt: Dapur (port 3017)
    site-portfolio/   # Portfolio sites (port 3020)
  packages/
    db/               # Supabase client + types + queries
    local-db/         # IndexedDB (Dexie.js) databases + stores
    ui/               # Shared UI components (shadcn/ui) + brand config
    utils/            # Shared utilities, formatters, validators
    sync/             # Cloud sync engine (IndexedDB <-> Supabase)
    sharing/          # Share missions, trial extension, backup unlock
  supabase/
    migrations/       # SQL migrations (001-004)
    functions/        # Edge Functions
  docs/               # This documentation
```

### Data Strategy
- **Cloud (`ksp_*` tables in Supabase)**: Licenses, users, clients, subscriptions, transactions, sites, logs, settings
- **Local (`pos_*` stores in IndexedDB)**: Products, sales, inventory, customers, cart, drafts, sync queue
- **Sync**: Offline-first. Write to IndexedDB first, sync to cloud via Service Worker when online (cloud plan only)

### Feature Module Pattern
Every feature follows atomic structure:
```
features/feature-name/
  data/    # Types, API calls, store operations
  visual/  # React components (presentational only)
  logic/   # Hooks, calculations, validation
  index.ts # Barrel export (public API)
```

---

## 6. Database

### Cloud Tables (12 tables, all `ksp_` prefix)

| Table | Purpose |
|-------|---------|
| `ksp_apps` | Product catalog (8 apps, seeded) |
| `ksp_clients` | Customer/business records |
| `ksp_licenses` | License keys, plans, status, device limits |
| `ksp_devices` | Device fingerprints, binding slots (max 2) |
| `ksp_users` | App users with roles (owner/manager/cashier) |
| `ksp_transactions` | Payment records |
| `ksp_subscriptions` | Recurring billing (cloud plans) |
| `ksp_sites` | Portfolio site definitions |
| `ksp_site_pages` | CMS pages (JSONB content blocks) |
| `ksp_site_settings` | Theme, branding, colors |
| `ksp_logs` | Immutable audit trail |
| `ksp_settings` | Global config (key-value JSONB) |

### Key ENUMs
- `ksp_plan_type`: offline, cloud_monthly, cloud_yearly
- `ksp_license_status`: trial, active, expired, suspended
- `ksp_user_role`: owner, manager, cashier

### Key Constraints
- Max 2 active devices per license (trigger-enforced)
- Unique license_key, email, fingerprint per license
- Subscriptions only for cloud plans
- Slug format: lowercase alphanumeric + hyphens

### Local Stores (per app, `pos_` prefix)
Common stores: products, categories, inventory, sales, sale_items, customers, cart, drafts, sync_queue, settings.
App-specific stores exist for bengkel (vehicles, service_orders), apotek (prescriptions), klinik (patients, medical_records), masjid (donations), tpa (students, hafalan), dapur (menus).

---

## 7. Key Business Rules

1. **Trial**: 14 days, 100 transaction limit, 50 product limit, all features
2. **Trial extension via sharing**: Share to min 10 contacts per mission, +6 days per mission, max 3 missions (total ~32 days)
3. **Backup unlock via sharing**: Share to min 5 contacts to unlock database backup feature
4. **Offline plan**: One-time payment, never expires, no cloud sync, 2 independent devices
3. **Cloud plan**: Monthly or yearly subscription, cloud sync, portfolio site, 2 synced devices
4. **Cloud yearly**: 20% discount vs 12x monthly
5. **Devices**: Max 2 active per license (default), configurable 1-10 by admin
6. **Grace period**: 7 days past due before features restricted
7. **Suspension**: 30 days past due, app inaccessible
8. **Roles**: Owner (full), Manager (operations), Cashier (POS only)
9. **Cashier PIN**: 6-digit PIN for quick POS access (no email/password needed)
10. **Portfolio site**: Cloud plan only, max 10 pages, 4 templates
11. **Payments**: Manual verification by admin (bank transfer, QRIS, e-wallet)
12. **Data ownership**: All data belongs to client, exportable, 90-day cloud retention after cancellation

---

## 8. Code Conventions

### File Naming
- Components: PascalCase (`ProductGrid.tsx`)
- Hooks: camelCase with `use` prefix (`useProducts.ts`)
- Utilities: camelCase (`formatCurrency.ts`)
- Database tables: snake_case with prefix (`ksp_licenses`, `pos_products`)
- Files/directories: kebab-case (`add-new-app.md`)

### Import Convention
```typescript
// External libraries first
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Monorepo packages
import { Button, Card } from '@kasirsolo/ui';
import { formatIDR } from '@kasirsolo/utils';
import { createSupabaseClient } from '@kasirsolo/db';

// Local imports
import { useProducts } from '@/features/products';
```

### Feature Module Rules
- `data/`: No React imports. Pure TypeScript. Only CRUD/queries.
- `visual/`: React components. Presentational only. No data fetching.
- `logic/`: Hooks, calculations, validators. Orchestrates data + visual.
- `index.ts`: Barrel export of public API only.

---

## 9. Current Status

### Completed
- [x] Full database schema (12 tables, 8 ENUMs, RLS policies, triggers)
- [x] Seed data (8 apps, 22 settings)
- [x] Complete documentation system (29+ docs)
- [x] Monorepo initialization (Turborepo, npm workspaces, tsconfig)
- [x] Shared packages (db, local-db, ui, utils) — fully implemented
- [x] Landing page app (apps/landing — 43 files, all sections, trial form, SEO)
- [x] Admin dashboard app (apps/admin — 94 files, 14 feature modules, atomic pattern)
- [x] Kasir Retail app (apps/kasir-retail — 100 files, PWA offline-first POS)
- [x] Kasir F&B app (apps/kasir-fnb — 110 files, PWA offline-first POS for F&B)
  - Table/meja management (color-coded grid, merge/unmerge, zone support)
  - Kitchen Display System (KDS) with kanban board, timer, status tracking
  - Order types: dine-in, takeaway, delivery (GoFood/GrabFood/ShopeeFood)
  - Split bill (equal split, by item)
  - Service charge + tax configuration
  - Queue number system for takeaway
  - Menu management with modifiers (topping, size, spice level)
  - Reports with table utilization, peak hours, menu ranking
- [x] Auth system (Supabase email+password in admin + kasir apps)
- [x] Trial registration flow (landing form → Supabase → WA redirect)
- [x] License activation flow (device fingerprint binding, max 2 devices)
- [x] Device management (bind/unbind, self-service, slot tracking)
- [x] Cloud sync engine (packages/sync — bidirectional IndexedDB <-> Supabase sync)
  - Sync migration: `supabase/migrations/003_sync_tables.sql` (7 tables, RLS, Realtime)
  - Sync package: `packages/sync/` (@kasirsolo/sync — engine, push, pull, conflict, queue, realtime)
  - Sync UI: `apps/kasir-retail/src/features/sync/` (status bar, panel, conflict modal, upgrade CTA)
  - Sync page: `apps/kasir-retail/src/app/sync/page.tsx`
  - Updated: `packages/local-db/src/sync.ts` (expanded API), TopBar (sync indicator)
  - Docs: `docs/architecture/sync-engine.md`
- [x] Sharing/referral system (packages/sharing — @kasirsolo/sharing)
  - Migration: `supabase/migrations/004_sharing.sql` (ksp_share_missions, ksp_share_logs)
  - Trial extension via sharing: min 10 contacts per mission, max 3 missions (+6 days each)
  - Backup unlock via sharing: min 5 contacts
  - Web Share API + WhatsApp/Telegram/copy-link fallbacks
  - UI: ShareMissionCard, ShareDialog, ShareProgressBar, BackupShareGate, ShareButton
  - Logic hooks: useShareMission, useShareDialog, useBackupAccess
- [x] Brand assets deployed across all apps
  - Logo.png in all app public/ folders
  - Favicon.ico (multi-size 16/32/48) in all apps
  - PWA icons (192x192, 512x512) for kasir apps
  - Shared brand config: packages/ui/src/brand.ts
  - Shared Logo component: packages/ui/src/primitives/Logo.tsx

### Not Yet Built
- [ ] Portfolio site CMS (apps/site — {slug}.kasirsolo.com)
- [ ] Subscription billing (cloud plan monthly/yearly)
- [ ] Other 6 POS apps (konveksi, bengkel, masjid, tpa, klinik, apotek)
- [ ] PWA service worker optimization (advanced caching strategies)
- [ ] Supabase Auth integration (currently using client-side auth pattern)

---

## 10. How to Continue Development (Step-by-Step)

### Phase A: Initialize the Monorepo

1. **Create root package.json** with pnpm workspaces configuration
2. **Create turbo.json** with pipeline definitions (dev, build, lint, typecheck)
3. **Create tsconfig.base.json** shared TypeScript configuration
4. **Create .env.example** with all required environment variables
5. **Create .gitignore** appropriate for Next.js + pnpm monorepo

### Phase B: Build Shared Packages

6. **Build `packages/utils/`** first (no dependencies on other packages):
   - Formatters (currency, date, phone, number, string)
   - Validators (email, phone, license key, barcode, slug)
   - Constants (apps, plans, roles, status)
   - Helpers (ID generation, receipt numbers, retry, debounce)

7. **Build `packages/db/`** (depends on utils):
   - Supabase client factory (browser, server, service)
   - Generate types from Supabase: `supabase gen types typescript`
   - Create query modules for each ksp_* table
   - Export typed query functions

8. **Build `packages/local-db/`** (depends on utils):
   - Create Dexie database classes for each app
   - Create store operation modules (products, sales, etc.)
   - Create React hooks (useProducts, useSales, useCart)
   - Create sync engine skeleton

9. **Build `packages/ui/`** (depends on utils):
   - Set up Tailwind CSS preset with brand colors
   - Install and configure shadcn/ui primitives
   - Create composed components (DataTable, StatusBadge, PriceDisplay, etc.)
   - Create layout components (AppShell, PageHeader, Sidebar)

### Phase C: Build Landing Page

10. **Create `apps/landing/`**:
    - Homepage with hero, product grid, features, pricing, FAQ
    - Product pages (/produk/[slug]) fetching from ksp_apps
    - Pricing page (/harga) with plan comparison
    - Trial registration form (/coba-gratis)
    - About page (/tentang) with company info
    - Contact page (/kontak) with WhatsApp CTA

### Phase D: Build Auth & Admin

11. **Create `apps/admin/`**:
    - Login page with Supabase Auth
    - Dashboard with stats
    - Client management (CRUD)
    - License management (activate, suspend, extend)
    - Transaction management (confirm payments)
    - Settings management (ksp_settings editor)
    - Audit log viewer

### Phase E: Build Kasir Retail (Flagship)

12. **Create `apps/kasir-retail/`**:
    - Auth: login (email/password + PIN)
    - POS screen: product grid, cart, payment
    - Product management: CRUD, categories, barcode
    - Sales history: list, detail, receipt view
    - Reports: daily, weekly, monthly
    - Stock management: levels, adjustments, alerts
    - Settings: store info, printer, tax, users
    - PWA: service worker, offline caching, install prompt
    - IndexedDB: all pos_* stores operational

### Phase F: Platform Features

13. **Device management**: bind/unbind flow, fingerprinting, heartbeat
14. **Cloud sync engine**: queue processing, delta sync, conflict resolution
15. **Portfolio site CMS**: templates, block editor, custom domains
16. **Subscription billing**: automated reminders, grace period, suspension

### Phase G: Remaining Apps

17. Build each remaining app following the same pattern as kasir-retail:
    - `kasir-bengkel` (add vehicle/service order stores)
    - `kasir-masjid` (add donation stores)
    - `kasir-tpa` (add student/hafalan stores)
    - `kasir-klinik` (add patient/medical record stores)
    - `kasir-apotek` (add prescription stores)
    - `kasir-konveksi` (add order tracking stores)
    - `kasir-dapur` (add menu planning stores)

---

## 11. Critical Files to Reference

| File | Purpose |
|------|---------|
| `supabase/migrations/001_init.sql` | Complete database schema |
| `supabase/migrations/002_seed.sql` | Seed data (8 apps, settings) |
| `docs/architecture/overview.md` | System architecture diagram |
| `docs/architecture/data-strategy.md` | Cloud vs local data strategy |
| `docs/architecture/decisions.md` | Why each tech choice was made |
| `docs/database/schema.md` | ERD and table relationships |
| `docs/database/cloud-tables.md` | All ksp_* table details |
| `docs/database/local-tables.md` | All pos_* store details |
| `docs/context/business-rules.md` | All business rules consolidated |
| `docs/context/glossary.md` | All project terms defined |
| `docs/architecture/sync-engine.md` | Sync engine architecture and data flow |
| `packages/sync/src/engine.ts` | SyncEngine class (main orchestrator) |
| `supabase/migrations/003_sync_tables.sql` | Cloud sync table schema |
| `docs/guides/add-new-app.md` | How to add a new POS app |
| `docs/guides/add-new-feature.md` | How to create a feature module |
| `supabase/migrations/004_sharing.sql` | Sharing/referral system schema |
| `packages/sharing/` | @kasirsolo/sharing — share missions, trial extension, backup unlock |
| `packages/ui/src/brand.ts` | Brand constants (colors, addresses, contacts) |

---

## 12. Important Design Decisions to Respect

1. **Always use `ksp_` prefix** for cloud database tables
2. **Always use `pos_` prefix** for local IndexedDB stores
3. **Always use the atomic pattern** (data/visual/logic) for features
4. **Always write offline-first** for POS operations (IndexedDB first, sync later)
5. **Always use UUID** for primary keys (not auto-increment)
6. **Always use BIGINT** for monetary amounts (IDR has no sub-units)
7. **Always use TIMESTAMPTZ** for timestamps
8. **Always use JSONB** for flexible schema columns
9. **Never store secrets** in client-side code or IndexedDB
10. **Never bypass RLS** from client-side (only service_role from server)

---

## 13. Supabase Connection

```
Project ID: eoowqtsvaayijmjmgmid
URL: https://eoowqtsvaayijmjmgmid.supabase.co
Dashboard: https://supabase.com/dashboard/project/eoowqtsvaayijmjmgmid
```

Keys are stored in `.env.local` (not committed to git). Get them from Supabase Dashboard > Settings > API.

---

## 14. Contact for Questions

If you (the AI agent) need clarification on business requirements, the human developer should contact:

- **Amin Maghfuri** (Owner)
- **Email**: owner.kasirsolo@gmail.com
- **WhatsApp**: https://wa.me/628816566935

---

*This document was generated as the initial project context. It should be updated as the project evolves. Any AI agent should read this file before starting work.*

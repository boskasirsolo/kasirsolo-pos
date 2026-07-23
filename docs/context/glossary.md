# Glossary

This document defines all project-specific terms, abbreviations, and conventions used in KASIRSOLO.

---

## Prefixes

| Prefix | Meaning | Location | Example |
|--------|---------|----------|---------|
| `ksp_` | KasirSolo Platform | Supabase PostgreSQL (cloud) | `ksp_licenses`, `ksp_clients` |
| `pos_` | Point of Sale | IndexedDB (browser, local) | `pos_products`, `pos_sales` |

---

## Core Terms

| Term | Definition |
|------|-----------|
| **KASIRSOLO** | The platform name. Multi-app POS & management software by PT Mesin Kasir Solo. |
| **App** | One of the 8 specialized applications (retail, bengkel, etc.). Each app is a separate Next.js project in the monorepo. |
| **Client** | A customer/business that purchases a KASIRSOLO license. Stored in `ksp_clients`. |
| **License** | Authorization to use a specific app. Has a plan type, status, and device limit. Stored in `ksp_licenses`. |
| **License Key** | A unique string in format `XXX-XXXX-XXXX-XXXX-XXXX` that identifies a license. |
| **Plan Type** | The licensing model: `offline` (one-time), `cloud_monthly`, or `cloud_yearly`. |
| **Device** | A browser instance identified by a fingerprint. Bound to a license slot. Stored in `ksp_devices`. |
| **Fingerprint** | A hash string generated from browser/device characteristics to uniquely identify a device. |
| **Device Number** | The slot assignment (1 or 2) for a device within a license. |
| **User** | A person who uses the app. Has a role (owner/manager/cashier). Stored in `ksp_users`. |
| **Subscription** | A recurring billing record for cloud plan licenses. Stored in `ksp_subscriptions`. |
| **Transaction** | A payment record for license purchase or renewal. Stored in `ksp_transactions`. |
| **Site** | A portfolio website created for a client. Stored in `ksp_sites`. |

---

## Business Terms (Indonesian)

| Indonesian | English | Context |
|-----------|---------|---------|
| **Kasir** | Cashier / POS | The point of sale application or the person operating it |
| **Toko** | Shop/Store | A retail business |
| **Warung** | Small shop/stall | A small Indonesian retail shop |
| **Bengkel** | Workshop | A vehicle repair workshop |
| **Konveksi** | Garment factory | A garment/clothing manufacturing business |
| **Masjid** | Mosque | Islamic place of worship |
| **TPA/TPQ** | Taman Pendidikan Al-Quran | Quran education school for children |
| **Apotek** | Pharmacy | A licensed pharmacy/drugstore |
| **Klinik THT** | ENT Clinic | Ear-Nose-Throat medical clinic |
| **Dapur SPPG** | SPPG Kitchen | Institutional kitchen (military/organizational food service) |
| **Infaq** | Voluntary donation | Islamic voluntary financial contribution |
| **Sedekah** | Charity | Islamic charitable giving |
| **Zakat** | Obligatory alms | Islamic obligatory financial giving |
| **Wakaf** | Endowment | Islamic endowment of property/assets |
| **Hafalan** | Memorization | Quran memorization progress |
| **Santri** | Student | Student at an Islamic school |
| **Struk** | Receipt | A printed receipt/bill |
| **Nota** | Invoice/note | A service invoice or note |
| **SPP** | Monthly fee | Monthly tuition/membership fee |
| **SIPNAP** | Reporting system | National pharmacy reporting system in Indonesia |
| **ICD-10** | Diagnosis codes | International Classification of Diseases, 10th revision |

---

## Technical Terms

| Term | Definition |
|------|-----------|
| **Monorepo** | A single repository containing multiple projects/packages. KASIRSOLO uses Turborepo with pnpm workspaces. |
| **Turborepo** | The build system that manages the monorepo. Handles task orchestration, caching, and dependency resolution. |
| **pnpm** | The package manager used. Faster and more disk-efficient than npm/yarn. |
| **App Router** | Next.js routing system using the `app/` directory with React Server Components. |
| **PWA** | Progressive Web App. The POS apps are installable PWAs with offline support. |
| **Service Worker** | Browser-level worker that enables offline caching and background sync. |
| **IndexedDB** | Browser database for storing structured data locally. Used for POS data. |
| **Dexie.js** | A wrapper library that provides a friendly API over raw IndexedDB. |
| **Supabase** | Backend-as-a-Service. Provides PostgreSQL, Auth, Storage, and Edge Functions. |
| **RLS** | Row Level Security. PostgreSQL feature that restricts data access at the database level. |
| **ISR** | Incremental Static Regeneration. Next.js feature for revalidating static pages. |
| **Edge Functions** | Server-side functions running on Supabase's edge network. |
| **Zustand** | Lightweight state management library for React. |
| **shadcn/ui** | Collection of reusable UI components built on Radix UI + Tailwind CSS. |
| **JSONB** | PostgreSQL binary JSON data type. Used for flexible schema columns. |
| **UUID** | Universally Unique Identifier. All primary keys use UUID v4. |
| **BIGINT** | 64-bit integer. Used for monetary amounts (IDR has no sub-units). |
| **TIMESTAMPTZ** | PostgreSQL timestamp with timezone. All timestamps use this type. |

---

## Architecture Terms

| Term | Definition |
|------|-----------|
| **Atomic Feature Module** | A feature organized into three layers: `data/` (storage), `visual/` (UI), `logic/` (business logic). |
| **Barrel Export** | An `index.ts` file that re-exports only the public API of a module. |
| **Cloud Data** | Data stored in Supabase (`ksp_*` tables). Platform-level data. |
| **Local Data** | Data stored in IndexedDB (`pos_*` stores). App-level operational data. |
| **Sync Queue** | A local IndexedDB store that queues operations for background upload to cloud. |
| **Delta Sync** | Syncing only records that have changed since the last sync (not full database). |
| **Device Binding** | The process of associating a device fingerprint with a license slot. |
| **Grace Period** | 7 days after subscription expiry where the app remains accessible. |

---

## Slug Reference

| Slug | App Name | Database | Port (dev) |
|------|----------|----------|------------|
| `retail` | Kasir Retail | pos_retail_v1 | 3010 |
| `konveksi` | Manajemen Konveksi | pos_konveksi_v1 | 3011 |
| `bengkel` | Bengkel + Sparepart | pos_bengkel_v1 | 3012 |
| `masjid` | Manajemen Masjid | pos_masjid_v1 | 3013 |
| `tpa` | Manajemen TPA/TPQ | pos_tpa_v1 | 3014 |
| `klinik` | Klinik THT | pos_klinik_v1 | 3015 |
| `apotek` | Apotek | pos_apotek_v1 | 3016 |
| `dapur` | Dapur SPPG | pos_dapur_v1 | 3017 |

---

## Status Values

### License Status (`ksp_license_status`)
| Value | Meaning |
|-------|---------|
| `trial` | Free trial period (14 days) |
| `active` | Paid and active |
| `expired` | Payment lapsed or trial ended |
| `suspended` | Suspended due to prolonged non-payment |

### Transaction Status (`ksp_transaction_status`)
| Value | Meaning |
|-------|---------|
| `pending` | Payment not yet confirmed |
| `paid` | Payment confirmed |
| `failed` | Payment failed |
| `refunded` | Payment refunded |

### Subscription Status (`ksp_subscription_status`)
| Value | Meaning |
|-------|---------|
| `active` | Subscription current and paid |
| `past_due` | Payment overdue, in grace period |
| `cancelled` | Client cancelled subscription |
| `expired` | Subscription period ended |

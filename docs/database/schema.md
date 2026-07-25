# Database Schema

## Overview

KASIRSOLO uses a **dual auth system** that affects the schema:
- **Kasir apps** (all `kasir-*` apps): WhatsApp number + 6-digit PIN (custom auth, NOT Supabase Auth)
- **Admin dashboard**: Email + password (Supabase Auth via `auth.users`)

The app catalog (`ksp_apps`) is **dynamic** — managed via admin dashboard, not hardcoded.

## Entity Relationship Diagram

```
+------------------+       +-------------------+       +------------------+
|    ksp_apps      |       |   ksp_clients     |       |   ksp_settings   |
|------------------|       |-------------------|       |------------------|
| id (PK)          |       | id (PK)           |       | id (PK)          |
| slug (UQ)        |       | auth_user_id (UQ) |---+   | key (UQ)         |
| name             |       | name              |   |   | value (JSONB)    |
| description      |       | business_name     |   |   | description      |
| icon             |       | whatsapp (UQ,NN)  |   |   | is_public        |
| category (ENUM)  |       | pin_hash          |   |   | created_at       |
| price            |       | email (nullable)  |   |   | updated_at       |
| features (JSONB) |       | phone             |   |   +------------------+
| is_active        |       | address           |   |
| sort_order       |       | city              |   |     auth.users
| created_at       |       | province          |   |    (Supabase)
| updated_at       |       | postal_code       |   |  +-------------+
+--------+---------+       | metadata (JSONB)  |   +->| id (PK)     |
         |                 | is_active         |      | email       |
         |                 | created_at        |      | ...         |
         |                 | updated_at        |      +-------------+
         |                 +--------+----------+   (admin dashboard only)
         |                          |
         |        +-----------------+------------------+
         |        |                                    |
         |        v                                    v
+--------v--------+----------+            +-----------+----------+
|       ksp_licenses          |            |       ksp_users      |
|-----------------------------|            |----------------------|
| id (PK)                     |            | id (PK)              |
| client_id (FK)              |<-----------| license_id (FK)      |
| app_id (FK)                 |     +------| client_id (FK)       |
| license_key (UQ)            |     |      | name                 |
| plan_type (ENUM)            |     |      | whatsapp             |
| status (ENUM)               |     |      | email (nullable)     |
| max_devices (default 2)     |     |      | phone                |
| trial_ends_at               |     |      | role (ENUM)          |
| activated_at                |     |      | pin_hash             |
| expires_at                  |     |      | avatar_url           |
| metadata (JSONB)            |     |      | is_active            |
| created_at                  |     |      | last_login_at        |
| updated_at                  |     |      | metadata (JSONB)     |
+-----------+---------+-------+     |      | created_at           |
            |         |             |      | updated_at           |
            |         |             |      +----------+-----------+
            v         |             |                  |
+-----------+------+  |             |                  |
|   ksp_devices    |  |             |                  |
|------------------|  |             |                  |
| id (PK)          |  |             |                  |
| license_id (FK)  |  |             |                  |
| fingerprint      |  |             |                  |
| device_name      |  |             |                  |
| device_number    |  |             |                  |
| user_agent       |  |             |                  |
| ip_address       |  |             |                  |
| is_active        |  |             |                  |
| last_seen_at     |  |             |                  |
| created_at       |  |             |                  |
| updated_at       |  |             |                  |
+------------------+  |             |                  |
                      |             |                  |
            +---------+             |                  |
            |                       |                  |
            v                       v                  v
+-----------+----------+   +-------+--------+  +------+---------+
| ksp_subscriptions    |   |  ksp_sites     |  |   ksp_logs     |
|----------------------|   |----------------|  |----------------|
| id (PK)              |   | id (PK)        |  | id (PK)        |
| client_id (FK)       |   | client_id (FK) |  | client_id (FK) |
| license_id (FK)      |   | license_id(FK) |  | user_id (FK)   |
| plan_type (ENUM)     |   | slug (UQ)      |  | license_id(FK) |
| status (ENUM)        |   | custom_domain  |  | action (ENUM)  |
| amount               |   | site_name      |  | entity_type    |
| currency             |   | tagline        |  | entity_id      |
| billing_cycle_day    |   | template(ENUM) |  | description    |
| current_period_start |   | is_active      |  | ip_address     |
| current_period_end   |   | is_published   |  | user_agent     |
| next_billing_at      |   | published_at   |  | metadata(JSONB)|
| cancelled_at         |   | metadata(JSONB)|  | created_at     |
| metadata (JSONB)     |   | created_at     |  +----------------+
| created_at           |   | updated_at     |
| updated_at           |   +-------+--------+
+-----------+----------+           |
            |              +-------+--------+      +------------------+
            |              | ksp_site_pages |      |ksp_site_settings |
            v              |----------------|      |------------------|
+-----------+----------+   | id (PK)        |      | id (PK)          |
|  ksp_transactions    |   | site_id (FK)   |      | site_id (FK, UQ) |
|----------------------|   | slug           |      | logo_url         |
| id (PK)              |   | title          |      | favicon_url      |
| client_id (FK)       |   | content (JSONB)|      | primary_color    |
| license_id (FK)      |   | page_type      |      | secondary_color  |
| subscription_id (FK) |   | sort_order     |      | accent_color     |
| invoice_number (UQ)  |   | is_published   |      | font_heading     |
| amount               |   | published_at   |      | font_body        |
| discount             |   | seo_title      |      | social_links     |
| tax                  |   | seo_description|      | contact_info     |
| total                |   | metadata(JSONB)|      | analytics_id     |
| currency             |   | created_at     |      | custom_css       |
| payment_method       |   | updated_at     |      | custom_head      |
| payment_reference    |   +----------------+      | metadata(JSONB)  |
| status (ENUM)        |                           | created_at       |
| description          |                           | updated_at       |
| paid_at              |                           +------------------+
| metadata (JSONB)     |
| created_at           |
| updated_at           |
+----------------------+
```

## Auth Model

| Context | Auth Method | Identity Column | How It Works |
|---------|------------|-----------------|--------------|
| **Kasir apps** | WA + 6-digit PIN | `ksp_clients.whatsapp` | Custom auth: server validates WA number + bcrypt PIN hash. Issues JWT session token. Does NOT use Supabase Auth (`auth.users`). |
| **Admin dashboard** | Email + password | `ksp_clients.auth_user_id` → `auth.users` | Standard Supabase Auth. Only owner/admin uses this path. |
| **Multi-user (cashier/manager)** | PIN only (quick switch) | `ksp_users.pin_hash` | On a device already logged in as owner, cashiers switch by entering their PIN. No WA number needed. |

## Table Summary

| Table | Rows Est. | Primary Key | Notable Columns |
|-------|-----------|-------------|-----------------|
| `ksp_apps` | Dynamic (currently 8) | UUID | slug (unique), category (ENUM). Managed via admin dashboard — can grow. |
| `ksp_clients` | Growing | UUID | whatsapp (unique, NOT NULL), pin_hash, email (nullable). auth_user_id for admin only. |
| `ksp_licenses` | Growing | UUID | license_key (unique), plan_type, status, max_devices (always 2) |
| `ksp_devices` | Growing | UUID | fingerprint, device_number (1-2), unique per license |
| `ksp_users` | Growing | UUID | role (owner/manager/cashier), pin_hash (bcrypt), email nullable |
| `ksp_transactions` | Growing | UUID | invoice_number (unique), amounts in BIGINT (IDR) |
| `ksp_subscriptions` | Growing | UUID | billing cycle, period tracking, cloud plans only |
| `ksp_sites` | Growing | UUID | slug (unique), custom_domain (unique), template |
| `ksp_site_pages` | Growing | UUID | site_id+slug (unique), JSONB content |
| `ksp_site_settings` | Growing | UUID | site_id (unique, 1:1), colors, fonts |
| `ksp_logs` | High volume | UUID | Immutable audit trail, no updated_at |
| `ksp_settings` | ~22 | UUID | key (unique), JSONB value, is_public |

## ENUM Types

| ENUM | Values |
|------|--------|
| `ksp_app_category` | bisnis, institusi, kesehatan |
| `ksp_plan_type` | offline, cloud_monthly, cloud_yearly |
| `ksp_license_status` | trial, active, expired, suspended, **revoked**, **pending** |
| `ksp_user_role` | owner, manager, cashier |
| `ksp_transaction_status` | pending, paid, failed, refunded |
| `ksp_subscription_status` | active, past_due, cancelled, expired |
| `ksp_log_action` | auth.login, auth.logout, auth.register, auth.pin_reset, license.activate, license.expire, license.suspend, license.revoke, license.upgrade, device.bind, device.unbind, subscription.create, subscription.renew, subscription.cancel, transaction.create, transaction.refund, site.create, site.update, site.publish, settings.update, user.create, user.update, user.delete |
| `ksp_site_template` | minimal, business, portfolio, landing |

## Key Relationships

1. **ksp_clients** -> **auth.users**: Optional — only for admin dashboard (email+password). Kasir apps authenticate via `whatsapp` + `pin_hash` (custom auth, no Supabase Auth).
2. **ksp_licenses** -> **ksp_clients** + **ksp_apps**: A license binds a client to an app
3. **ksp_devices** -> **ksp_licenses**: Devices are bound to licenses (max 2 per license)
4. **ksp_users** -> **ksp_licenses** + **ksp_clients**: Users (cashier/manager) operate within a license context. Owner is the client itself.
5. **ksp_transactions** -> **ksp_clients** + **ksp_licenses** + **ksp_subscriptions**: Payment tracking
6. **ksp_subscriptions** -> **ksp_clients** + **ksp_licenses**: Recurring billing for cloud plans
7. **ksp_sites** -> **ksp_clients**: Each client can have portfolio sites
8. **ksp_site_pages** -> **ksp_sites**: CMS pages belong to sites
9. **ksp_site_settings** -> **ksp_sites**: 1:1 theme/branding settings per site
10. **ksp_logs** -> **ksp_clients** + **ksp_users** + **ksp_licenses**: Audit trail

## Constraints & Triggers

| Constraint/Trigger | Table | Purpose |
|-------------------|-------|---------|
| `chk_ksp_licenses_max_devices` | ksp_licenses | max_devices between 1 and 10 |
| `chk_ksp_devices_device_number` | ksp_devices | device_number between 1 and 10 |
| `uq_ksp_devices_license_fingerprint` | ksp_devices | One fingerprint per license |
| `uq_ksp_devices_license_number` | ksp_devices | One device_number per license |
| `chk_ksp_transactions_amount` | ksp_transactions | amount >= 0 |
| `chk_ksp_transactions_total` | ksp_transactions | total >= 0 |
| `chk_ksp_subscriptions_amount` | ksp_subscriptions | amount >= 0 |
| `chk_ksp_subscriptions_billing_day` | ksp_subscriptions | 1-28 |
| `chk_ksp_subscriptions_plan` | ksp_subscriptions | cloud plans only |
| `chk_ksp_sites_slug` | ksp_sites | lowercase alphanumeric + hyphens |
| `trg_ksp_devices_check_max` | ksp_devices | Enforce max active devices per license |
| `trg_ksp_*_updated_at` | All (except logs) | Auto-update updated_at timestamp |

## Helper Functions

| Function | Purpose |
|----------|---------|
| `ksp_set_updated_at()` | Trigger function to set updated_at = NOW() |
| `ksp_check_max_devices()` | Trigger function to enforce device limit |
| `ksp_generate_license_key(app_slug)` | Generate formatted license key: `XXX-XXXX-XXXX-XXXX-XXXX`. Used for internal license tracking, NOT for user authentication. |
| `ksp_generate_invoice_number()` | Generate invoice: `KSP-YYYYMMDD-NNNN` |

## Migration Status

| Migration | File | Status | Description |
|-----------|------|--------|-------------|
| 001 | `001_init.sql` | ✅ Applied | Initial schema: 12 tables, 8 ENUMs, 4 functions, RLS policies |
| 002 | `002_seed.sql` | ✅ Applied | Seed data for ksp_apps and ksp_settings |
| 002b | `002_fix_license_status_enum.sql` | ✅ Applied | Add `revoked` and `pending` to ksp_license_status |
| 003 | `003_sync_tables.sql` | ✅ Applied | Cloud sync support tables |
| 004 | `004_sharing.sql` | ✅ Applied | Referral/sharing system |
| 005 | `005_app_popularity_rpc.sql` | ✅ Applied | RPC for app popularity tracking |
| 006 | `006_wa_pin_auth.sql` | ❌ **Pending** | Migrate to WA+PIN auth: add `pin_hash`, make `whatsapp` NOT NULL+UNIQUE, make `email` nullable |

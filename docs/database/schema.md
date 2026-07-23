# Database Schema

## Entity Relationship Diagram

```
+------------------+       +-------------------+       +------------------+
|    ksp_apps      |       |   ksp_clients     |       |   ksp_settings   |
|------------------|       |-------------------|       |------------------|
| id (PK)          |       | id (PK)           |       | id (PK)          |
| slug (UQ)        |       | auth_user_id (UQ) |---+   | key (UQ)         |
| name             |       | name              |   |   | value (JSONB)    |
| description      |       | business_name     |   |   | description      |
| icon             |       | email (UQ)        |   |   | is_public        |
| category (ENUM)  |       | phone             |   |   | created_at       |
| price            |       | whatsapp          |   |   | updated_at       |
| features (JSONB) |       | address           |   |   +------------------+
| is_active        |       | city              |   |
| sort_order       |       | province          |   |        auth.users
| created_at       |       | postal_code       |   |       (Supabase)
| updated_at       |       | metadata (JSONB)  |   |    +-------------+
+--------+---------+       | is_active         |   +--->| id (PK)     |
         |                 | created_at        |        | email       |
         |                 | updated_at        |        | ...         |
         |                 +--------+----------+        +-------------+
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
| license_key (UQ)            |     |      | auth_user_id (UQ)    |
| plan_type (ENUM)            |     |      | name                 |
| status (ENUM)               |     |      | email                |
| max_devices (default 2)     |     |      | phone                |
| trial_ends_at               |     |      | role (ENUM)          |
| activated_at                |     |      | pin                  |
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

## Table Summary

| Table | Rows Est. | Primary Key | Notable Columns |
|-------|-----------|-------------|-----------------|
| `ksp_apps` | 8 (fixed) | UUID | slug (unique), category (ENUM) |
| `ksp_clients` | Growing | UUID | auth_user_id -> auth.users, email (unique) |
| `ksp_licenses` | Growing | UUID | license_key (unique), plan_type, status, max_devices |
| `ksp_devices` | Growing | UUID | fingerprint, device_number (1-2), unique per license |
| `ksp_users` | Growing | UUID | role (owner/manager/cashier), linked to license+client |
| `ksp_transactions` | Growing | UUID | invoice_number (unique), amounts in BIGINT (IDR) |
| `ksp_subscriptions` | Growing | UUID | billing cycle, period tracking, cloud plans only |
| `ksp_sites` | Growing | UUID | slug (unique), custom_domain (unique), template |
| `ksp_site_pages` | Growing | UUID | site_id+slug (unique), JSONB content |
| `ksp_site_settings` | Growing | UUID | site_id (unique, 1:1), colors, fonts |
| `ksp_logs` | High volume | UUID | Immutable audit trail, no updated_at |
| `ksp_settings` | ~22 (fixed) | UUID | key (unique), JSONB value, is_public |

## ENUM Types

| ENUM | Values |
|------|--------|
| `ksp_app_category` | bisnis, institusi, kesehatan |
| `ksp_plan_type` | offline, cloud_monthly, cloud_yearly |
| `ksp_license_status` | trial, active, expired, suspended |
| `ksp_user_role` | owner, manager, cashier |
| `ksp_transaction_status` | pending, paid, failed, refunded |
| `ksp_subscription_status` | active, past_due, cancelled, expired |
| `ksp_log_action` | auth.login, auth.logout, auth.register, license.activate, license.expire, license.suspend, license.upgrade, device.bind, device.unbind, subscription.create, subscription.renew, subscription.cancel, transaction.create, transaction.refund, site.create, site.update, site.publish, settings.update, user.create, user.update, user.delete |
| `ksp_site_template` | minimal, business, portfolio, landing |

## Key Relationships

1. **ksp_clients** -> **auth.users**: One client maps to one Supabase auth user
2. **ksp_licenses** -> **ksp_clients** + **ksp_apps**: A license binds a client to an app
3. **ksp_devices** -> **ksp_licenses**: Devices are bound to licenses (max 2 default)
4. **ksp_users** -> **ksp_licenses** + **ksp_clients**: Users operate within a license context
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
| `ksp_generate_license_key(app_slug)` | Generate formatted license key: `XXX-XXXX-XXXX-XXXX-XXXX` |
| `ksp_generate_invoice_number()` | Generate invoice: `KSP-YYYYMMDD-NNNN` |

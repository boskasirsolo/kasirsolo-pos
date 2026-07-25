# Cloud Tables (`ksp_*`)

All cloud tables are stored in Supabase PostgreSQL. They use the `ksp_` prefix (KasirSolo Platform). All tables have Row Level Security (RLS) enabled.

## Auth Context

KASIRSOLO uses **dual auth**:
- **Kasir apps**: Custom auth via `whatsapp` + `pin_hash` (bcrypt). Does NOT use Supabase Auth (`auth.users`).
- **Admin dashboard**: Supabase Auth (email + password) via `auth_user_id` → `auth.users`.

RLS policies currently reference `auth.uid()` (Supabase Auth). These will need to be updated when the custom WA+PIN auth is implemented — kasir app requests will use a service role with custom JWT claims instead.

---

## ksp_apps

**Purpose**: Dynamic product catalog of KASIRSOLO applications. Managed via admin dashboard — apps can be added, edited, or deactivated at any time. Do NOT hardcode the number of apps anywhere in the codebase.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `slug` | VARCHAR(50) | NO | - | Unique app identifier (e.g., `retail`, `bengkel`) |
| `name` | VARCHAR(100) | NO | - | Display name (e.g., "Kasir Retail") |
| `description` | TEXT | YES | - | Full app description |
| `icon` | VARCHAR(10) | YES | - | Emoji icon |
| `category` | ksp_app_category | NO | - | bisnis / institusi / kesehatan |
| `price` | INTEGER | NO | 0 | Base price in IDR (offline plan) |
| `features` | JSONB | YES | [] | Array of feature strings |
| `is_active` | BOOLEAN | NO | true | Whether app is available |
| `sort_order` | INTEGER | NO | 0 | Display ordering |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Last modification time |

**RLS**: Public read (active apps only), admin write.

**Important**: Landing page, trial form dropdown, and admin dashboard all fetch apps from this table. Never hardcode app lists.

---

## ksp_clients

**Purpose**: Customer/business records. Each client is a business entity that purchases licenses. Primary identifier is **WhatsApp number** (not email).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `auth_user_id` | UUID | YES | - | FK to auth.users — **admin dashboard only**. NULL for kasir-only clients. |
| `name` | VARCHAR(200) | NO | - | Contact person name |
| `business_name` | VARCHAR(200) | YES | - | Business/company name |
| `whatsapp` | VARCHAR(20) | **NO** | - | **Primary identifier**. Unique WhatsApp number (format: 08xx or +628xx) |
| `pin_hash` | VARCHAR(255) | YES | - | **Bcrypt hash** of 6-digit PIN. Used for kasir app login. |
| `email` | VARCHAR(255) | YES | - | Email address — **nullable**. Only required for admin dashboard users. |
| `phone` | VARCHAR(20) | YES | - | Phone number (if different from WA) |
| `address` | TEXT | YES | - | Full address |
| `city` | VARCHAR(100) | YES | - | City name |
| `province` | VARCHAR(100) | YES | - | Province name |
| `postal_code` | VARCHAR(10) | YES | - | Postal/ZIP code |
| `metadata` | JSONB | YES | {} | Extra data |
| `is_active` | BOOLEAN | NO | true | Active status |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Last modification time |

**Auth flow**:
- Registration: user provides WA number → server generates 6-digit PIN → hashes with bcrypt → stores in `pin_hash` → sends plain PIN via WhatsApp API
- Login: user enters WA + PIN → server finds client by `whatsapp` → verifies `pin_hash` with bcrypt → issues JWT

**RLS**: Clients can only read/update their own record.

**⚠️ Migration needed**: `006_wa_pin_auth.sql` — make `whatsapp` NOT NULL + UNIQUE, add `pin_hash`, make `email` nullable, add index on `whatsapp`.

---

## ksp_licenses

**Purpose**: License management. Each license binds a client to an app with a specific plan.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `client_id` | UUID | NO | - | FK to ksp_clients |
| `app_id` | UUID | NO | - | FK to ksp_apps |
| `license_key` | VARCHAR(100) | NO | - | Unique license key (e.g., RET-A1B2-C3D4-E5F6-G7H8). Internal tracking only — NOT used for user login. |
| `plan_type` | ksp_plan_type | NO | offline | offline / cloud_monthly / cloud_yearly |
| `status` | ksp_license_status | NO | trial | trial / active / expired / suspended / **revoked** / **pending** |
| `max_devices` | INTEGER | NO | 2 | Maximum active devices (always 2 per business rule) |
| `trial_ends_at` | TIMESTAMPTZ | YES | - | When trial period ends |
| `activated_at` | TIMESTAMPTZ | YES | - | When license was activated |
| `expires_at` | TIMESTAMPTZ | YES | - | When license expires (cloud plans) |
| `metadata` | JSONB | YES | {} | Extra data |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Last modification time |

**Key rules**:
- `max_devices` CHECK: 1-10 (but business rule: always set to 2)
- Offline licenses: `expires_at` is NULL (never expires)
- Trial licenses: `trial_ends_at` is set to **7 days** from creation (extendable via sharing)
- Cloud licenses: `expires_at` tracks subscription end
- `license_key` is auto-generated for internal tracking — users authenticate with WA+PIN, not license key

**RLS**: Clients see their own licenses via client_id chain.

---

## ksp_devices

**Purpose**: Device binding. Tracks which physical devices are authorized for each license.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `license_id` | UUID | NO | - | FK to ksp_licenses |
| `fingerprint` | VARCHAR(255) | NO | - | Browser/device fingerprint |
| `device_name` | VARCHAR(200) | YES | - | Human-readable name (e.g., "Kasir 1") |
| `device_number` | INTEGER | NO | - | Slot number (1 or 2) |
| `user_agent` | TEXT | YES | - | Browser user agent string |
| `ip_address` | INET | YES | - | Last known IP address |
| `is_active` | BOOLEAN | NO | true | Whether device is currently bound |
| `last_seen_at` | TIMESTAMPTZ | YES | NOW() | Last activity timestamp |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Last modification time |

**Key rules**:
- `device_number` CHECK: 1-10
- UNIQUE (license_id, fingerprint): one fingerprint per license
- UNIQUE (license_id, device_number): one device per slot
- Trigger `ksp_check_max_devices`: prevents exceeding max_devices active count
- Business rule: max 2 devices per license

**RLS**: Via license -> client ownership chain.

---

## ksp_users

**Purpose**: Application users with roles. Multiple users can share a license (e.g., owner + cashier). Each user has their own PIN for quick-switch on shared devices.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `license_id` | UUID | NO | - | FK to ksp_licenses |
| `client_id` | UUID | NO | - | FK to ksp_clients |
| `name` | VARCHAR(200) | NO | - | User display name |
| `whatsapp` | VARCHAR(20) | YES | - | User WhatsApp number (required for owner/manager, optional for cashier) |
| `email` | VARCHAR(255) | YES | - | User email — **nullable** (not required for kasir users) |
| `phone` | VARCHAR(20) | YES | - | User phone |
| `role` | ksp_user_role | NO | cashier | owner / manager / cashier |
| `pin_hash` | VARCHAR(255) | YES | - | **Bcrypt hash** of 6-digit PIN. Used for quick-switch on POS. |
| `avatar_url` | TEXT | YES | - | Profile image URL |
| `is_active` | BOOLEAN | NO | true | Active status |
| `last_login_at` | TIMESTAMPTZ | YES | - | Last login timestamp |
| `metadata` | JSONB | YES | {} | Extra data |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Last modification time |

**Role permissions**:
- **owner**: Full access. Manage users, view all reports, change settings. Authenticates via WA+PIN at `ksp_clients` level.
- **manager**: View reports, manage inventory, limited settings. Has own PIN for quick-switch.
- **cashier**: POS operations only. Cannot view reports or settings. PIN-only quick-switch.

**Auth flow for multi-user**:
1. Owner logs in with WA+PIN (validated against `ksp_clients.pin_hash`)
2. Device is bound to the license
3. On that device, cashier/manager can switch by entering their `ksp_users.pin_hash`
4. No WA number needed for cashier quick-switch — just PIN

**⚠️ Migration needed**: `006_wa_pin_auth.sql` — rename `pin` to `pin_hash` (VARCHAR 255), make `email` nullable, remove `auth_user_id` FK.

**RLS**: Users see own record + peers on same license. Owners manage all users on their license.

---

## ksp_transactions

**Purpose**: Payment records for license purchases and subscription renewals.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `client_id` | UUID | NO | - | FK to ksp_clients |
| `license_id` | UUID | YES | - | FK to ksp_licenses |
| `subscription_id` | UUID | YES | - | FK to ksp_subscriptions |
| `invoice_number` | VARCHAR(50) | NO | - | Unique invoice (KSP-YYYYMMDD-NNNN) |
| `amount` | BIGINT | NO | 0 | Base amount in IDR |
| `discount` | BIGINT | NO | 0 | Discount amount |
| `tax` | BIGINT | NO | 0 | Tax amount |
| `total` | BIGINT | NO | 0 | Final amount (amount - discount + tax) |
| `currency` | VARCHAR(3) | NO | IDR | Currency code |
| `payment_method` | VARCHAR(50) | YES | - | bank_transfer, ewallet, etc. |
| `payment_reference` | VARCHAR(255) | YES | - | External payment ID |
| `status` | ksp_transaction_status | NO | pending | pending / paid / failed / refunded |
| `description` | TEXT | YES | - | Transaction description |
| `paid_at` | TIMESTAMPTZ | YES | - | When payment was confirmed |
| `metadata` | JSONB | YES | {} | Extra data |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Last modification time |

**Note**: Amounts use BIGINT (not DECIMAL) to avoid floating-point issues. All amounts in smallest currency unit (IDR has no sub-units, so 250000 = Rp250.000).

**RLS**: Clients see their own transactions.

---

## ksp_subscriptions

**Purpose**: Recurring billing for cloud plan licenses.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `client_id` | UUID | NO | - | FK to ksp_clients |
| `license_id` | UUID | NO | - | FK to ksp_licenses |
| `plan_type` | ksp_plan_type | NO | - | cloud_monthly / cloud_yearly only |
| `status` | ksp_subscription_status | NO | active | active / past_due / cancelled / expired |
| `amount` | BIGINT | NO | 0 | Recurring amount in IDR |
| `currency` | VARCHAR(3) | NO | IDR | Currency code |
| `billing_cycle_day` | INTEGER | NO | 1 | Day of month for billing (1-28) |
| `current_period_start` | TIMESTAMPTZ | NO | NOW() | Current billing period start |
| `current_period_end` | TIMESTAMPTZ | NO | - | Current billing period end |
| `next_billing_at` | TIMESTAMPTZ | YES | - | Next billing date |
| `cancelled_at` | TIMESTAMPTZ | YES | - | When cancelled |
| `metadata` | JSONB | YES | {} | Extra data |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Last modification time |

**Key rules**:
- Only cloud plans can have subscriptions (CHECK constraint)
- `billing_cycle_day` is 1-28 (avoids issues with months that have fewer than 31 days)
- When `status` = `past_due`, a 7-day grace period applies before license suspension

**RLS**: Clients see their own subscriptions.

---

## ksp_sites

**Purpose**: Portfolio site definitions. Each client can create sites to showcase their business.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `client_id` | UUID | NO | - | FK to ksp_clients |
| `license_id` | UUID | YES | - | FK to ksp_licenses |
| `slug` | VARCHAR(100) | NO | - | Unique URL slug (e.g., `toko-maju`) |
| `custom_domain` | VARCHAR(255) | YES | - | Custom domain (e.g., `tokomaju.com`) |
| `site_name` | VARCHAR(200) | NO | - | Site display name |
| `tagline` | VARCHAR(500) | YES | - | Site tagline/subtitle |
| `template` | ksp_site_template | NO | minimal | minimal / business / portfolio / landing |
| `is_active` | BOOLEAN | NO | true | Active status |
| `is_published` | BOOLEAN | NO | false | Published to public |
| `published_at` | TIMESTAMPTZ | YES | - | When first published |
| `metadata` | JSONB | YES | {} | Extra data |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Last modification time |

**Key rules**:
- `slug` CHECK: lowercase alphanumeric + hyphens, no leading/trailing hyphens
- `slug` is globally unique (used in URL: `kasirsolo.com/site/{slug}`)
- `custom_domain` is globally unique
- Available on cloud plans only

**RLS**: Owner manages their own sites. Public reads published+active sites.

---

## ksp_site_pages

**Purpose**: CMS pages for portfolio sites. Content stored as JSONB for flexible block-based editing.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `site_id` | UUID | NO | - | FK to ksp_sites |
| `slug` | VARCHAR(100) | NO | - | Page slug (unique per site) |
| `title` | VARCHAR(200) | NO | - | Page title |
| `content` | JSONB | YES | {} | Block-based page content |
| `page_type` | VARCHAR(50) | NO | page | page / blog / gallery / contact |
| `sort_order` | INTEGER | NO | 0 | Navigation ordering |
| `is_published` | BOOLEAN | NO | false | Published status |
| `published_at` | TIMESTAMPTZ | YES | - | When published |
| `seo_title` | VARCHAR(200) | YES | - | SEO override title |
| `seo_description` | VARCHAR(500) | YES | - | SEO meta description |
| `metadata` | JSONB | YES | {} | Extra data |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Last modification time |

**Key rules**:
- UNIQUE (site_id, slug): one slug per site
- Max 10 pages per site (enforced in application logic, configurable via ksp_settings)

**RLS**: Site owner manages pages. Public reads published pages on published sites.

---

## ksp_site_settings

**Purpose**: Theme and branding settings for portfolio sites. One-to-one relationship with ksp_sites.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `site_id` | UUID | NO | - | FK to ksp_sites (UNIQUE - 1:1) |
| `logo_url` | TEXT | YES | - | Logo image URL |
| `favicon_url` | TEXT | YES | - | Favicon URL |
| `primary_color` | VARCHAR(7) | YES | #FF5F1F | Primary theme color |
| `secondary_color` | VARCHAR(7) | YES | #F7A237 | Secondary theme color |
| `accent_color` | VARCHAR(7) | YES | #FFCE55 | Accent theme color |
| `font_heading` | VARCHAR(100) | YES | Inter | Heading font family |
| `font_body` | VARCHAR(100) | YES | Inter | Body font family |
| `social_links` | JSONB | YES | {} | Social media links |
| `contact_info` | JSONB | YES | {} | Contact information |
| `analytics_id` | VARCHAR(50) | YES | - | Google Analytics ID |
| `custom_css` | TEXT | YES | - | Custom CSS overrides |
| `custom_head` | TEXT | YES | - | Custom HTML in <head> |
| `metadata` | JSONB | YES | {} | Extra data |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Last modification time |

**RLS**: Site owner manages settings. Public reads settings for published sites.

---

## ksp_logs

**Purpose**: Immutable audit trail. Logs important actions across the platform.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `client_id` | UUID | YES | - | FK to ksp_clients |
| `user_id` | UUID | YES | - | FK to ksp_users |
| `license_id` | UUID | YES | - | FK to ksp_licenses |
| `action` | ksp_log_action | NO | - | Action type ENUM |
| `entity_type` | VARCHAR(50) | YES | - | Related entity table name |
| `entity_id` | UUID | YES | - | Related entity row ID |
| `description` | TEXT | YES | - | Human-readable description |
| `ip_address` | INET | YES | - | Request IP address |
| `user_agent` | TEXT | YES | - | Browser user agent |
| `metadata` | JSONB | YES | {} | Extra context data |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Log entry time |

**Key rules**:
- No `updated_at` column (immutable records)
- No UPDATE or DELETE policies (append-only)
- Index on `created_at DESC` for recent log queries

**RLS**: Clients see their own logs.

---

## ksp_settings

**Purpose**: Global configuration store. Key-value pairs with JSONB values for flexibility.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | gen_random_uuid() | Primary key |
| `key` | VARCHAR(100) | NO | - | Unique setting key (e.g., `app.name`) |
| `value` | JSONB | NO | {} | Setting value (any JSON type) |
| `description` | TEXT | YES | - | Human description of the setting |
| `is_public` | BOOLEAN | NO | false | Whether visible to unauthenticated users |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Record creation time |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Last modification time |

**Key conventions**:
- `app.*` - Application metadata
- `brand.*` - Brand colors and assets
- `company.*` - Company information
- `trial.*` - Trial configuration (default: 7 days)
- `license.*` - License defaults (max_devices: 2)
- `pricing.*` - Plan pricing details
- `site.*` - Portfolio site defaults
- `notification.*` - Notification configuration (WhatsApp API settings)
- `maintenance.*` - Maintenance mode

**RLS**: Public settings readable by all. Admin manages all settings.

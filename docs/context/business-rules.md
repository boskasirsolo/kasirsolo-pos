# Business Rules

This document defines the business rules for the KASIRSOLO platform. These rules govern how the system behaves and must be respected by all implementations.

---

## 1. Pricing Rules

### 1.1 Trial Period
- Every new registration gets a **14-day free trial**
- Trial starts from the moment of registration (`trial_ends_at = NOW() + 14 days`)
- No payment information required during trial
- Full feature access during trial (no feature gating)
- Trial applies per license (per app), not per client

### 1.2 Subscription Pricing
- Pricing is **per app, per month**
- Each app has its own `base_price` defined in `ksp_apps`
- Standard pricing: Rp 99.000/month per app (may vary per app)
- No annual discount currently (future consideration)
- Price displayed in Indonesian Rupiah (IDR), no decimals

### 1.3 Payment Rules
- Payment via bank transfer (manual verification by admin)
- Admin manually activates license after payment confirmation
- No auto-recurring billing (future consideration)
- Payment extends license by the purchased period
- Grace period: 7 days after expiry before suspension

---

## 2. License Rules

### 2.1 License Lifecycle
```
trial → active → expired → suspended
                    ↑          |
                    +----------+
                   (payment)
```

- **trial**: Initial 14-day free period. Full access.
- **active**: Paid and current. Full access.
- **expired**: Payment period ended. 7-day grace period with full access + renewal banner.
- **suspended**: Grace period ended. Read-only access. Cannot create new transactions.

### 2.2 License Scope
- One license = one app for one client
- A client can hold multiple licenses (e.g., kasir-fnb + kasir-toko)
- Each license is independent (separate trial, separate payment)
- License data is isolated — no cross-license data access

### 2.3 License Activation
- Admin manually changes `status` from `trial` or `expired` to `active`
- Admin sets `activated_at` and `expires_at` dates
- System tracks `last_payment_at` and `last_payment_amount`

---

## 3. Device Rules

### 3.1 Device Registration
- Each license has a `max_devices` limit (default: 1)
- Device fingerprint generated on first login from a device
- Device registered in `ksp_devices` table with `license_id`
- Device info captured: browser, OS, screen size, device name

### 3.2 Device Limits
| Plan | Max Devices |
|------|-------------|
| Trial | 1 |
| Basic | 1 |
| Standard | 3 |
| Premium | 5 |

- When device limit reached, new device login is rejected
- User sees message: "Batas perangkat tercapai. Hubungi admin untuk menambah perangkat."
- Owner can deactivate devices from settings to free up slots
- Admin can override device limits

### 3.3 Device Management
- Devices can be named by the user (e.g., "Kasir 1", "Tablet Dapur")
- Devices can be deactivated (soft delete) by owner
- Deactivated devices don't count toward limit
- Device `last_active_at` tracked for admin visibility

---

## 4. User & Auth Rules

### 4.1 User Hierarchy
```
Platform Admin (Supabase Auth — email + password)
  └── manages all clients, licenses, apps

Client (ksp_clients — business entity)
  └── License (ksp_licenses — per-app subscription)
       └── Owner  (ksp_users — role: owner, WhatsApp + PIN auth)
       └── Manager (ksp_users — role: manager, WhatsApp + PIN auth)
       └── Cashier (ksp_users — role: cashier, WhatsApp + PIN auth)
```

### 4.2 Auth Method
- **Admin dashboard**: Email + password via Supabase Auth
- **All kasir apps**: WhatsApp number + 6-digit PIN (custom auth)
- WhatsApp number is the primary login identifier for kasir app users
- PIN is a 6-digit numeric code, hashed before storage
- Quick PIN switch allows changing users on the same device without full re-login
- PIN reset is done via WhatsApp message (new PIN generated and sent)

### 4.3 User Creation
- **Owner**: Created automatically during registration (WhatsApp + generated PIN)
- **Manager/Cashier**: Created by Owner from app settings
- All kasir app users require a WhatsApp number
- WhatsApp number must be unique within a license (same number can exist across different licenses)
- PIN must be unique within a license (for quick-switch functionality)
- Users can be deactivated (soft delete via `is_active` flag)

### 4.4 Role Permissions
- **Owner**: Full access to all features including settings, user management, billing
- **Manager**: Operational access — sales, products, inventory, reports. No settings or billing.
- **Cashier**: Minimal access — make sales, view own sales only
- Role is fixed per user (no dynamic permission system)
- See auth-flow.md for the full permissions matrix

---

## 5. Registration Rules

### 5.1 Trial Registration
- Registration is through the landing page (`/coba-gratis`)
- Required fields: `nama_bisnis`, `nama_lengkap`, `whatsapp`, `alamat`, `app`
- WhatsApp number must be valid Indonesian format (08xx or +628xx)
- WhatsApp number must be unique across all clients (one business per WA number)
- App selection is from the dynamic list fetched from `ksp_apps` (published apps only)
- On successful registration:
  1. Create `ksp_clients` record
  2. Create `ksp_licenses` record (status: trial, 14-day trial)
  3. Create `ksp_users` record (role: owner, with generated 6-digit PIN)
  4. Send WhatsApp message with login credentials (WA number, PIN, app URL)
- Redirect to `/coba-gratis/berhasil` success page

### 5.2 Duplicate Prevention
- WhatsApp number is unique per client — cannot register twice with same WA
- Same WhatsApp can be used as a user across different licenses (multi-business scenario handled at user level, not client level)
- Business name is not required to be unique

---

## 6. App Catalog Rules

### 6.1 Dynamic App Catalog
- The app catalog is stored in the `ksp_apps` table in Supabase
- All app listings on the landing page MUST be fetched from `ksp_apps`
- `constants.ts` may contain a fallback `KSP_APPS` array, but it is NEVER the primary source
- Never hardcode the app count in UI text — always use the dynamic count from the database
- Example: use `${apps.length} aplikasi` not `"6 aplikasi"`

### 6.2 App Record Fields
- `id` (UUID), `name`, `slug`, `tagline`, `description`
- `icon` (emoji or icon reference), `base_price` (integer, IDR)
- `features` (JSONB array of feature strings)
- `is_published` (boolean — only published apps shown on landing)
- `display_order` (integer — controls order on landing page)
- `created_at`, `updated_at`

### 6.3 App Management
- Only platform admin can create, update, or soft-delete apps
- Unpublishing an app hides it from the landing page but does NOT affect existing licenses
- New apps can be added without code changes or redeployment
- Registration form app selector only shows published apps

---

## 7. Portfolio / Landing Page Rules

### 7.1 Content
- Landing page is the public-facing marketing site
- Must display all published apps from `ksp_apps` dynamically
- Must show pricing from the database (not hardcoded)
- Registration CTA leads to `/coba-gratis`
- Portfolio section showcases app screenshots and features

### 7.2 SEO
- Landing page uses Server Components for SEO
- Indonesian language (Bahasa Indonesia) as primary
- Meta tags, Open Graph, structured data required
- Target keywords: "aplikasi kasir", "software kasir", "kasir online"

---

## 8. POS / Sales Rules

### 8.1 Transaction Rules
- Every sale gets a unique `transaction_number` (format: `TRX-{YYYYMMDD}-{sequence}`)
- Transaction must have at least one item
- Transaction total = sum of (item price * quantity) - discount + tax
- Discount can be percentage or fixed amount
- Tax rate configurable per license (default: 11% PPN for Indonesia)
- Payment methods: cash, transfer, QRIS (configurable per license)
- Cash payment must be >= total (calculate change)
- Void/refund allowed by owner and manager only

### 8.2 Offline Sales
- Sales can be created offline (stored in IndexedDB)
- Offline sales get temporary IDs (UUID generated client-side)
- Sync to server when online — server assigns permanent transaction_number
- Conflict resolution: client-side UUID prevents duplicates during sync

---

## 9. Product Rules

### 9.1 Product Management
- Products belong to a license (scoped by `license_id`)
- Required fields: name, price
- Optional: SKU, barcode, category, image, description
- Products can be categorized (categories also scoped by license)
- Products can be deactivated (hidden from POS but preserved in history)
- Price is in IDR, stored as integer (no decimals)

### 9.2 Inventory (Optional Feature)
- Stock tracking is optional (can be enabled per product)
- Stock decremented on sale
- Stock alerts when below threshold
- Stock adjustments logged with reason

---

## 10. Customer Rules

### 10.1 Customer Management
- Customers are optional for transactions
- Customer data: name, phone (WhatsApp), address, notes
- Customer scoped by `license_id`
- Customer purchase history tracked
- Cashiers can view customers but not edit

---

## 11. Notification Rules

### 11.1 Notification Channels
- **Primary**: WhatsApp messages (via Fonnte or similar API)
- **Secondary**: In-app notifications
- **Admin**: Email (via Supabase Auth email or custom)

### 11.2 Notification Triggers
- Registration: Send login credentials via WhatsApp
- PIN reset: Send new PIN via WhatsApp
- Trial expiring: WhatsApp reminder at 3 days and 1 day before expiry
- License expired: WhatsApp notification with renewal instructions
- Payment confirmed: WhatsApp confirmation with activation details

---

## 12. Data Rules

### 12.1 Data Isolation
- All app data MUST be scoped by `license_id`
- RLS policies enforce isolation at the database level
- No cross-license data access (except admin dashboard)
- Admin dashboard bypasses RLS using service role key

### 12.2 Data Retention
- Soft delete for all user-facing data (is_active / deleted_at flag)
- Transaction data never hard-deleted (audit trail)
- Deactivated products preserved for historical transaction references
- Client data retained even after license expiry (for reactivation)

### 12.3 Data Formats
- Currency: Indonesian Rupiah (IDR), integer, no decimals
- Dates: ISO 8601, stored in UTC, displayed in WIB (UTC+7)
- Phone/WhatsApp: Indonesian format, stored with country code (+62)
- Names: Title case not enforced, stored as entered

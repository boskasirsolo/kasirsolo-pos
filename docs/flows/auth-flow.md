# Auth Flow

## Overview

KASIRSOLO uses a **dual auth strategy**:
- **Admin dashboard**: Supabase Auth with email + password (platform owner only)
- **All kasir apps**: Custom auth with **WhatsApp number + 6-digit PIN** (all end-users)

This decision reflects the target market: Indonesian small business owners and cashiers who are more familiar with WhatsApp numbers than email addresses.

---

## User Types

| Type | Auth Method | Where | Role |
|------|-------------|-------|------|
| Platform Admin | Email + Password (Supabase Auth) | Admin Dashboard | admin |
| Client/Owner | WhatsApp + PIN | POS Apps | owner |
| Manager | WhatsApp + PIN | POS Apps | manager |
| Cashier | WhatsApp + PIN | POS Apps | cashier |

---

## Registration Flow (Landing Page → Trial)

```
LANDING PAGE (/coba-gratis)
        |
        v
+-------------------+
| Registration Form |
| - nama_bisnis     |
| - nama_lengkap    |
| - whatsapp        |
| - alamat          |
| - app (select     |
|   from ksp_apps)  |
+--------+----------+
         |
         v
+--------+----------+
| Server Action:     |
| 1. Validate WA     |
|    number format   |
| 2. Check duplicate |
|    WA number       |
+--------+----------+
         |
         v
+--------+----------+
| 3. INSERT INTO     |
|    ksp_clients     |
|    (name, phone,   |
|     business_name, |
|     whatsapp)      |
+--------+----------+
         |
         v
+--------+----------+
| 4. INSERT INTO     |
|    ksp_licenses    |
|    (client_id,     |
|     app_id,        |
|     status: trial, |
|     trial_ends_at: |
|     +14 days)      |
+--------+----------+
         |
         v
+--------+----------+
| 5. INSERT INTO     |
|    ksp_users       |
|    (client_id,     |
|     license_id,    |
|     whatsapp,      |
|     pin: generated,|
|     role: owner)   |
+--------+----------+
         |
         v
+--------+----------+
| 6. Send WA message |
|    with login      |
|    credentials:    |
|    - WA number     |
|    - PIN (6 digit) |
|    - App URL       |
+--------+----------+
         |
         v
  /coba-gratis/berhasil
```

---

## Login Flow (All Kasir Apps)

### WhatsApp + PIN Login

```
POS APP (/login)
        |
        v
+-------------------+
| Login Form        |
| - WhatsApp number |
| - PIN (6 digits)  |
| [_ _ _ _ _ _]     |
+--------+----------+
         |
         v
+--------+----------+
| Query ksp_users    |
| WHERE whatsapp =   |
|   input_whatsapp   |
| AND pin = input_pin|
| AND is_active      |
+--------+----------+
         |
    +----+----+
    |         |
  MATCH    NO MATCH
    |         |
    v         v
  Fetch    Show error
  license  "Nomor WA atau
  + client  PIN salah"
    |
    v
  Check license status
    |
    +----> trial → check trial_ends_at
    +----> active → proceed
    +----> expired → show renewal CTA
    +----> suspended → show contact admin
    |
    v
  Check role → route accordingly
    +----> owner   → /dashboard (full access)
    +----> manager → / (POS + reports)
    +----> cashier → / (POS only)
```

### Quick PIN Switch (Multi-User on Same Device)

```
POS APP (active session)
  User taps "Ganti User"
        |
        v
+-------------------+
| PIN Entry Screen  |
| [_ _ _ _ _ _]     |
+--------+----------+
         |
         v
| Query ksp_users    |
| WHERE pin = input  |
| AND license_id =   |
|   current_license  |
| AND is_active      |
         |
    MATCH → Switch user context
    NO MATCH → Show error "PIN salah"
```

---

## Admin Dashboard Login (Email + Password)

```
ADMIN (/login) → supabase.auth.signInWithPassword → Verify admin role → /dashboard
```

---

## Session Management

### Kasir App Session
- Custom session stored in IndexedDB (`pos_settings.auth_cache`)
- Session contains: user_id, license_id, client_id, role, whatsapp, name
- Session persists across browser restarts
- No JWT tokens — validated against ksp_users on app start
- Offline access: cached session allows POS use without internet
- Online re-validation required every 7 days

### Admin Session
- Supabase Auth JWT tokens in cookies
- Auto-refresh session

---

## Role Permissions Matrix

| Permission | Owner | Manager | Cashier |
|------------|-------|---------|---------|
| Make sales | Yes | Yes | Yes |
| View own sales | Yes | Yes | Yes |
| View all sales | Yes | Yes | No |
| Void/refund sale | Yes | Yes | No |
| Manage products | Yes | Yes | No |
| Manage inventory | Yes | Yes | No |
| View reports | Yes | Yes | No |
| Export data | Yes | Yes | No |
| Manage customers | Yes | Yes | View only |
| App settings | Yes | No | No |
| User management | Yes | No | No |
| License/devices | Yes | No | No |
| Billing/payments | Yes | No | No |

---

## PIN Reset

```
LOGIN > LUPA PIN → Enter WhatsApp → Verify exists → Generate new PIN → Send via WA → Redirect to /login
```

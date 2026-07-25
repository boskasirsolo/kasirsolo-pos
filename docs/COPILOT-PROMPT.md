# Copilot Implementation Prompt

This document outlines the prioritized implementation tasks for KASIRSOLO. Work through these in order. Each task includes context and acceptance criteria.

---

## PRIORITY 1 — Auth System (WhatsApp + PIN)

The most critical pending feature. All kasir apps need authentication before any other feature can work properly.

### Task 1: Update ksp_users Table (Migration 006)

Create a new Supabase migration that updates the `ksp_users` table to support WhatsApp + PIN auth.

**Changes**:
- Add `whatsapp` column (text, not null for new rows)
- Add `pin` column (text, not null — stores hashed 6-digit PIN)
- Add UNIQUE constraint on (`whatsapp`, `license_id`) — same WA can exist across licenses
- Add UNIQUE constraint on (`pin`, `license_id`) — enables quick-switch within a license
- Make `email` column nullable (no longer required)
- Make `auth_user_id` column nullable (not used for kasir app auth)
- Add index on `whatsapp` for login lookups
- Add index on (`pin`, `license_id`) for quick-switch lookups

**File**: `packages/db/supabase/migrations/006_users_whatsapp_pin_auth.sql`

**Acceptance criteria**:
- Migration runs without errors on existing data
- Existing rows get null whatsapp/pin (backfill separately)
- New users can be created with whatsapp + pin
- Unique constraints enforced correctly

---

### Task 2: Create Auth Module

Create the authentication module for WhatsApp + PIN auth.

**File**: `packages/db/src/auth.ts`

**Functions to implement**:

```typescript
// Login with WhatsApp + PIN
async function loginWithWhatsAppPin(
  whatsapp: string,
  pin: string,
  appSlug: string
): Promise<AuthResult>

// Quick PIN switch (within same license)
async function switchUserByPin(
  pin: string,
  licenseId: string
): Promise<AuthResult>

// Verify session is still valid
async function verifySession(
  userId: string,
  licenseId: string
): Promise<SessionResult>

// Generate a new 6-digit PIN (unique within license)
async function generateUniquePin(
  licenseId: string
): Promise<string>

// Hash PIN for storage
function hashPin(pin: string): string

// Verify PIN against hash
function verifyPin(pin: string, hash: string): boolean

// Reset PIN (generate new, update DB, return plain PIN for WA message)
async function resetPin(
  whatsapp: string,
  licenseId: string
): Promise<string>

// Create user with WhatsApp + PIN
async function createUser(params: {
  whatsapp: string;
  name: string;
  licenseId: string;
  clientId: string;
  role: 'owner' | 'manager' | 'cashier';
}): Promise<{ user: KspUser; plainPin: string }>
```

**Types**:
```typescript
interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    name: string;
    whatsapp: string;
    role: 'owner' | 'manager' | 'cashier';
    licenseId: string;
    clientId: string;
  };
  license?: {
    id: string;
    status: 'trial' | 'active' | 'expired' | 'suspended';
    appSlug: string;
    trialEndsAt?: string;
    expiresAt?: string;
  };
  error?: string;
}

interface SessionResult {
  valid: boolean;
  user?: AuthResult['user'];
  reason?: 'not_found' | 'inactive' | 'license_expired' | 'license_suspended';
}
```

**Acceptance criteria**:
- All functions exported from packages/db
- PIN hashing uses bcrypt or similar
- Login validates whatsapp + pin + is_active + license status
- Quick switch validates pin + license_id + is_active
- Generated PINs are guaranteed unique within a license

---

### Task 3: Create Login Pages for Kasir Apps

Create the WhatsApp + PIN login page. This should be a shared component/pattern used by all kasir apps.

**File**: `apps/kasir-fnb/src/app/login/page.tsx` (and equivalent for other kasir apps)

**UI Requirements**:
- WhatsApp number input (with +62 prefix, formatted)
- PIN input (6 individual digit boxes, auto-advance)
- "Masuk" (Login) button
- "Lupa PIN?" link (triggers PIN reset flow)
- Error messages in Bahasa Indonesia
- Mobile-first responsive design
- Loading state during auth

**Flow**:
1. User enters WhatsApp number
2. User enters 6-digit PIN
3. Submit calls `loginWithWhatsAppPin`
4. On success: store session in IndexedDB, redirect based on role
5. On failure: show error message

**Acceptance criteria**:
- PIN input auto-advances to next digit
- Backspace moves to previous digit
- Paste support for 6-digit PIN
- Proper error messages (WA/PIN salah, license expired, etc.)
- Session stored in IndexedDB after successful login
- Redirect: owner → /dashboard, manager → /, cashier → /

---

### Task 4: Create AuthGuard Component

Client-side component that checks for a valid session and redirects to login if not found.

**File**: `packages/ui/src/components/auth-guard.tsx`

**Behavior**:
- On mount: check IndexedDB for cached session
- If no session: redirect to /login
- If session found: validate online (if connected) every 7 days
- Provide session context to child components via React Context
- Handle license status (show banners for trial/expired)

**Acceptance criteria**:
- Works offline (uses cached session)
- Shows loading state while checking
- Redirects to login if no valid session
- Provides user/license info via context
- Shows trial expiry warning banner when < 3 days remaining
- Shows expired banner with renewal CTA

---

### Task 5: Create PinSwitch Component

Component for quick user switching on shared POS devices.

**File**: `packages/ui/src/components/pin-switch.tsx`

**UI Requirements**:
- Triggered by "Ganti User" button in POS header
- Shows modal/drawer with PIN input (6 digits)
- Current user name displayed
- List of other active users on this license (names only, no PINs shown)
- On valid PIN: switch user context, close modal
- On invalid PIN: show error, stay open

**Acceptance criteria**:
- PIN validated via `switchUserByPin`
- User context updated in IndexedDB
- UI reflects new user immediately (name, role permissions)
- Invalid PIN shows "PIN salah" error
- Can cancel and stay as current user

---

### Task 6: Update Registration Flow

Update the landing page registration to use WhatsApp instead of email.

**Files**:
- `apps/landing/src/app/coba-gratis/page.tsx`
- `apps/landing/src/app/coba-gratis/actions.ts`

**Changes**:
- Remove email field from registration form
- WhatsApp number field: validated Indonesian format (08xx or +628xx)
- Store whatsapp in ksp_clients and ksp_users
- Auto-generate 6-digit PIN for the owner user
- Server action creates: client → license → user (with whatsapp + pin)
- Success page shows: "Kredensial login telah dikirim ke WhatsApp Anda"
- (Future: actually send WA message with credentials via Fonnte)

**Acceptance criteria**:
- No email field in registration form
- WhatsApp validation (Indonesian format)
- Duplicate WhatsApp check
- PIN auto-generated and stored (hashed)
- User created with role: owner
- Success page displays confirmation message

---

### Task 7: Admin Auth (No Changes Needed)

Admin dashboard authentication stays as-is (Supabase Auth, email + password). No changes required.

**Verification only**: Confirm that admin auth is independent from the new WhatsApp + PIN system and still works correctly.

---

## PRIORITY 2 — Dynamic App Catalog

### Task 8: Update Landing Page to Fetch from ksp_apps

The landing page must display apps dynamically from the database.

**Files**:
- `apps/landing/src/app/page.tsx` (or wherever apps are listed)
- `apps/landing/src/lib/queries.ts` (or similar)

**Changes**:
- Fetch published apps from `ksp_apps` table (where `is_published = true`, ordered by `display_order`)
- Use Server Component for data fetching (SSR or ISR)
- Replace any hardcoded app listings with dynamic data
- App count text must be dynamic: `${apps.length} aplikasi` not a hardcoded number
- Registration form app selector populated from database
- Fallback to `constants.ts` KSP_APPS only if database fetch fails

**Acceptance criteria**:
- Apps fetched from ksp_apps table
- Only published apps shown
- Correct display order
- No hardcoded app count anywhere in UI
- Registration form shows dynamic app list
- Graceful fallback if DB unavailable

---

### Task 9: Admin Apps CRUD

Add app catalog management to the admin dashboard.

**Files**: `apps/admin/src/app/apps/` (new route)

**Features**:
- List all apps (published and unpublished)
- Create new app (name, slug, tagline, description, icon, base_price, features)
- Edit existing app
- Toggle `is_published` status
- Reorder apps (`display_order`)
- Cannot hard-delete apps that have active licenses

**Acceptance criteria**:
- Full CRUD for ksp_apps
- Publish/unpublish toggle
- Drag-and-drop or input-based reordering
- Validation (required fields, unique slug)
- Protection against deleting apps with active licenses

---

### Task 10: Update constants.ts

Update `constants.ts` to clearly mark KSP_APPS as a fallback.

**Changes**:
- Add comment: "FALLBACK ONLY — primary source is ksp_apps table in Supabase"
- Ensure the array structure matches the ksp_apps table schema
- Remove any hardcoded app count references
- Add a `FALLBACK_APPS` export name (rename from `KSP_APPS` if appropriate)

**Acceptance criteria**:
- Clear documentation that this is fallback only
- Structure matches DB schema
- No hardcoded counts

---

## PRIORITY 3 — Security & Cleanup

### Task 11: RLS Policies

Ensure Row Level Security policies are properly configured for all tables.

**Key policies**:
- `ksp_users`: Users can only read/update their own record within their license
- `ksp_licenses`: Users can only read their own license
- `ksp_devices`: Users can read devices for their license, owners can manage
- App data tables: All scoped by `license_id`
- Admin (service role) bypasses all RLS

**Acceptance criteria**:
- RLS enabled on all tables
- Policies tested with different roles
- No data leakage between licenses
- Admin access works with service role key

---

### Task 12: Standardize maxDevices

Ensure `max_devices` is consistently handled across the platform.

**Changes**:
- Default value in database: 1
- Plan-based limits defined in a shared constant
- Device registration checks limit before allowing new device
- Clear error messages when limit reached

**Acceptance criteria**:
- Consistent max_devices handling
- Device limit enforced on login/registration
- Clear user-facing error messages

---

### Task 13: Delete Dead Code

Remove any dead code, unused imports, or deprecated patterns.

**Areas to check**:
- Unused email-based auth code in kasir apps (replaced by WhatsApp + PIN)
- Hardcoded app lists that should now be dynamic
- Unused components or pages
- Commented-out code blocks
- Unused dependencies in package.json

**Acceptance criteria**:
- No unused imports
- No dead code paths
- No commented-out code blocks (except TODOs with context)
- Clean build with no warnings

---

### Task 14: Add .env.local.example to kasir-fnb

Create an example environment file for the kasir-fnb app.

**File**: `apps/kasir-fnb/.env.local.example`

**Content**:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_SLUG=kasir-fnb
```

**Acceptance criteria**:
- File exists with all required variables
- No actual secrets in the file
- Comments explain each variable

---

### Task 15: Device Management Page

Create a device management page accessible by license owners.

**File**: `apps/kasir-fnb/src/app/settings/devices/page.tsx`

**Features**:
- List registered devices (name, browser, OS, last active)
- Rename devices
- Deactivate devices (frees up device slot)
- Show current device highlighted
- Show device limit and usage (e.g., "2 / 3 perangkat")

**Acceptance criteria**:
- Owner-only access (role check)
- Device list from ksp_devices
- Deactivate functionality
- Device count vs limit display
- Mobile-friendly layout

---

## Rules

These rules MUST be followed for all implementations:

### Auth Rules
1. **Kasir apps use WhatsApp + PIN only** — never Supabase Auth for kasir app users
2. **Admin uses Supabase Auth only** — email + password
3. **PIN is always 6 digits**, numeric only
4. **PIN must be hashed** before storage (bcrypt or argon2)
5. **PIN must be unique within a license** — enables quick-switch
6. **WhatsApp must be unique within a license** for users
7. **WhatsApp must be unique globally** for clients (ksp_clients)
8. **Session stored in IndexedDB** — not cookies, not localStorage
9. **Offline auth**: cached session allows POS use without internet
10. **Online re-validation**: every 7 days, verify session against server

### App Catalog Rules
11. **Always fetch from ksp_apps** — never hardcode app list
12. **Never hardcode app count** — always use dynamic count
13. **constants.ts is fallback only** — clearly documented as such
14. **Only published apps shown** on landing page and registration
15. **New apps added via admin** — no code changes required

### General Rules
16. **All UI text in Bahasa Indonesia**
17. **Mobile-first design** for all kasir app pages
18. **Server Components by default** — "use client" only when needed
19. **Server Actions for mutations** — no unnecessary API routes
20. **All queries scoped by license_id** — enforced by RLS
21. **Import UI from @kasirsolo/ui** — not directly from shadcn
22. **Import DB from @kasirsolo/db** — no direct Supabase client in apps
23. **Soft delete only** — never hard delete user-facing data
24. **Currency in IDR** — integer, no decimals
25. **Dates in WIB (UTC+7)** for display, UTC for storage

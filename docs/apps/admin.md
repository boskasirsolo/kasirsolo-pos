# Admin App

## Overview

The Admin app is the central management dashboard for KASIRSOLO platform administrators. It provides tools to manage clients, licenses, subscriptions, transactions, and platform settings.

**Path**: `apps/admin/`
**URL**: `admin.kasirsolo.com`
**Framework**: Next.js 15 (App Router)
**Auth Required**: Yes (owner role only)

---

## Routes

```
/                           # Dashboard (redirect to /dashboard)
/login                      # Admin login
/dashboard                  # Overview: stats, recent activity, alerts
|
/clients                    # Client management
/clients/[id]               # Client detail
/clients/[id]/licenses      # Client's licenses
/clients/[id]/transactions  # Client's transactions
/clients/[id]/sites         # Client's portfolio sites
|
/licenses                   # License management
/licenses/[id]              # License detail
/licenses/[id]/devices      # Device bindings
/licenses/[id]/users        # Users under license
|
/transactions               # Transaction history
/transactions/[id]          # Transaction detail
|
/subscriptions              # Subscription management
/subscriptions/[id]         # Subscription detail
|
/apps                       # App catalog management
/apps/[slug]                # App detail & settings
|
/sites                      # Portfolio sites overview
/sites/[id]                 # Site detail & pages
|
/settings                   # Platform settings
/settings/general           # General settings
/settings/pricing           # Pricing configuration
/settings/notifications     # Notification settings
/settings/maintenance       # Maintenance mode
|
/logs                       # Audit logs viewer
/logs?action=...            # Filtered logs
|
/profile                    # Admin profile
```

---

## Features

### Dashboard
- Total clients, active licenses, revenue this month
- Recent registrations (last 7 days)
- Expiring licenses (next 7 days)
- Recent transactions
- System health alerts

### Client Management
- List all clients with search and filter
- View client details, licenses, transactions
- Activate/suspend clients
- Send WhatsApp notifications

### License Management
- List all licenses with status filter (trial/active/expired/suspended)
- Activate trial licenses after payment
- Extend/upgrade licenses
- View bound devices, manage device slots
- Generate new license keys

### Transaction Management
- View all transactions with status filter
- Confirm pending payments
- Process refunds
- Generate invoices (PDF)
- Export transaction reports (CSV/Excel)

### Subscription Management
- View active subscriptions
- Handle past_due subscriptions
- Cancel subscriptions
- Billing history per subscription

### App Catalog
- Edit app descriptions, features, pricing
- Enable/disable apps
- View per-app statistics

### Portfolio Sites
- View all client sites
- Moderate content
- Manage custom domain verification

### Settings
- Edit global ksp_settings
- Toggle maintenance mode
- Configure trial duration
- Set pricing parameters

### Audit Logs
- View all ksp_logs entries
- Filter by action, client, date range
- Export logs

---

## Auth Flow

```
1. Admin navigates to admin.kasirsolo.com
2. Middleware checks for Supabase session
3. If no session: redirect to /login
4. /login: email + password via Supabase Auth
5. After auth: check ksp_users.role = 'owner'
6. If not owner: show "Access Denied"
7. If owner: redirect to /dashboard
8. Session persists via Supabase cookie
```

### Middleware

```typescript
// apps/admin/middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = createServerClient(/* ... */);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role check happens in layout.tsx via server component
}
```

---

## Data Access

The Admin app uses the `@kasirsolo/db` package for all Supabase operations. It has service-role access for operations that bypass RLS (e.g., listing all clients).

```typescript
// Server actions use service role for admin operations
import { createServiceClient } from '@kasirsolo/db';

export async function getClients() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('ksp_clients')
    .select('*, ksp_licenses(*)')
    .order('created_at', { ascending: false });
  return data;
}
```

---

## UI Components

The Admin app uses shared components from `@kasirsolo/ui`:
- DataTable with pagination, sorting, filtering
- StatCard for dashboard metrics
- StatusBadge for license/transaction status
- DateRangePicker for log/transaction filtering
- ConfirmDialog for destructive actions

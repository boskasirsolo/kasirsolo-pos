# Architecture Decision Records (ADRs)

This document records the key architectural decisions made for the KASIRSOLO platform.

---

## ADR-001: Turborepo Monorepo Structure

**Date**: 2025-01

**Status**: Accepted

**Context**: KASIRSOLO will consist of multiple applications (admin dashboard, landing page, kasir-fnb, kasir-toko, kasir-laundry, etc.) that share common UI components, database schemas, and business logic. Managing these as separate repositories would lead to code duplication, version drift, and complex cross-repo dependency management.

**Decision**: Use Turborepo as the monorepo build system with pnpm workspaces.

**Structure**:
- `apps/` — deployable applications (admin, landing, kasir-*)
- `packages/` — shared libraries (ui, db, utils, typescript-config)

**Rationale**:
- Shared code via packages (UI components, DB client, types)
- Atomic changes across multiple apps in a single commit
- Turborepo caching speeds up builds significantly
- pnpm provides efficient disk usage and strict dependency resolution

**Consequences**:
- All apps must use compatible versions of shared dependencies
- CI/CD pipeline must understand monorepo structure
- New developers need to understand the workspace layout

---

## ADR-002: Next.js for All Applications

**Date**: 2025-01

**Status**: Accepted

**Context**: Need a framework that supports both server-rendered pages (landing, admin) and client-heavy interactive apps (POS).

**Decision**: Use Next.js (App Router) for all applications.

**Rationale**:
- Server Components for landing page SEO
- Server Actions for form submissions and data mutations
- Client Components for interactive POS features
- API Routes when needed
- Single framework reduces learning curve
- Vercel deployment is straightforward

**Consequences**:
- Team needs to understand Server vs Client Component boundaries
- POS apps need careful consideration for offline capability (service workers alongside Next.js)
- Bundle size must be monitored for POS apps

---

## ADR-003: Supabase as Backend-as-a-Service

**Date**: 2025-01

**Status**: Accepted

**Context**: Need a database, authentication (for admin), storage, and real-time capabilities without building a custom backend.

**Decision**: Use Supabase (hosted PostgreSQL) as the primary backend.

**Rationale**:
- PostgreSQL provides robust relational data modeling
- Row Level Security (RLS) for data isolation between clients
- Built-in auth for admin dashboard
- Real-time subscriptions for future features
- Storage for product images
- Free tier sufficient for development and early production

**Consequences**:
- Vendor dependency on Supabase (mitigated: standard PostgreSQL underneath)
- Must carefully design RLS policies for multi-tenant isolation
- Supabase client library included in all apps
- Custom auth for kasir apps (WhatsApp+PIN) runs alongside Supabase Auth (admin only)

---

## ADR-004: Multi-Tenant Architecture with License-Based Isolation

**Date**: 2025-01

**Status**: Accepted

**Context**: Multiple businesses (clients) will use the same application instances. Need to ensure data isolation while keeping infrastructure costs manageable.

**Decision**: Single database, multi-tenant architecture with `license_id` as the primary isolation key.

**Data hierarchy**:
```
ksp_clients (business entity)
  └── ksp_licenses (per-app subscription)
       └── ksp_users (users within a license)
       └── app data (products, sales, etc.) — all keyed by license_id
```

**Rationale**:
- One client can have multiple licenses (one per app)
- All app data is scoped to license_id
- RLS policies enforce isolation at the database level
- Simpler than database-per-tenant at this scale

**Consequences**:
- Every app data table MUST have a `license_id` column
- RLS policies MUST be applied to all tables
- Queries must always filter by license_id
- Cross-tenant reporting requires admin-level access bypassing RLS

---

## ADR-005: Hybrid Online/Offline POS Architecture

**Date**: 2025-01

**Status**: Accepted

**Context**: Indonesian small businesses often have unreliable internet. The POS must work offline for critical operations (making sales) while syncing data when online.

**Decision**: Hybrid architecture using IndexedDB for local storage with background sync to Supabase.

**Rationale**:
- Sales must never be blocked by internet outage
- IndexedDB provides sufficient local storage
- Background sync handles data upload when connectivity returns
- Service workers manage offline capability

**Consequences**:
- Conflict resolution strategy needed for sync
- Local-first data model for transactions
- Product catalog cached locally
- Session/auth cached in IndexedDB
- More complex data flow than pure online app

---

## ADR-006: shadcn/ui Component Library

**Date**: 2025-01

**Status**: Accepted

**Context**: Need a consistent UI across all applications with customizable components.

**Decision**: Use shadcn/ui as the component library, installed in `packages/ui`.

**Rationale**:
- Components are copied into the project (not a dependency) — full control
- Built on Radix UI primitives — accessible by default
- Tailwind CSS integration matches our styling approach
- Easy to customize per-app while maintaining shared base
- Growing ecosystem and community

**Consequences**:
- Components live in packages/ui/src/components
- All apps import from @kasirsolo/ui
- Must maintain consistent theming across apps
- New components should follow shadcn/ui patterns

---

## ADR-007: WhatsApp + PIN Authentication for Kasir Apps

**Date**: 2025-07

**Status**: Accepted

**Context**: The target market is Indonesian small business owners and their employees (cashiers, managers). Key observations:
- 99%+ WhatsApp penetration in the target demographic
- Many users don't have or regularly check email
- Cashiers often share devices and need to switch users quickly
- PIN-based login is familiar from banking apps and other Indonesian services
- Email-based auth creates unnecessary friction for registration and login

**Decision**: Use WhatsApp number + 6-digit PIN as the authentication method for all kasir apps (kasir-fnb, kasir-toko, kasir-laundry, etc.). Keep email + password (Supabase Auth) for the admin dashboard only.

**Rationale**:
- **User familiarity**: WhatsApp number is the most natural identifier for Indonesian users
- **Quick login**: 6-digit PIN is fast to enter, especially on mobile/tablet
- **Multi-user switching**: PIN-only switch enables shared device scenarios (one tablet, multiple cashiers)
- **Low registration friction**: No email required, no email verification needed
- **Built-in communication channel**: Credentials, receipts, and notifications sent via WhatsApp
- **Offline capable**: PIN validation can work with cached session data

**Consequences**:
- `ksp_users.whatsapp` becomes the login identifier (not email)
- `ksp_users.pin` stores a 6-digit hashed PIN
- Custom auth implementation required (not using Supabase Auth for kasir apps)
- PIN reset flow sends new PIN via WhatsApp message
- `ksp_users.email` and `ksp_users.auth_user_id` become nullable
- WhatsApp number must be unique per license (same person can have accounts on different licenses)
- Need WhatsApp messaging integration (Fonnte or similar) for sending credentials
- Admin dashboard continues to use Supabase Auth (email + password)

---

## ADR-008: Dynamic App Catalog from Supabase

**Date**: 2025-07

**Status**: Accepted

**Context**: The KASIRSOLO platform started with an initial set of kasir apps (kasir-fnb, kasir-toko, kasir-laundry). The app catalog was partially hardcoded in frontend constants and partially stored in the `ksp_apps` database table. As the platform grows, new apps will be added (kasir-bengkel, kasir-salon, etc.) and existing apps will be updated.

**Decision**: The app catalog must be fetched dynamically from the `ksp_apps` table in Supabase. Frontend constants serve as a fallback only.

**Rationale**:
- **Extensibility**: New apps can be added via admin dashboard without code changes
- **Admin control**: Platform admin can enable/disable apps, update pricing, change descriptions
- **Consistency**: Single source of truth for app metadata (name, slug, price, features, description)
- **No deploy required**: Adding a new app to the catalog doesn't require redeploying the landing page

**Consequences**:
- Landing page fetches app list from `ksp_apps` at build time (ISR) or request time (SSR)
- `constants.ts` `KSP_APPS` array is a fallback only — never the primary source
- Never hardcode app count in UI text (e.g., don't write "6 aplikasi", use dynamic count)
- Registration form app selector populated from database
- Admin dashboard needs Apps CRUD (create, read, update, soft-delete)
- `ksp_apps` table must include: id, name, slug, tagline, description, icon, base_price, features, is_published, display_order
- App URLs/routing still based on separate Next.js apps in the monorepo

# Architecture Decision Records (ADR)

This document captures the key architectural decisions made for the KASIRSOLO platform, including the context, decision, and consequences of each choice.

---

## ADR-001: Why Turborepo

### Context
KASIRSOLO needs to build and maintain 8 specialized POS/management apps plus supporting apps (admin, landing, portfolio). These apps share significant code: UI components, database clients, utility functions, and business logic.

### Options Considered
1. **Separate repositories** - One repo per app
2. **Nx** - Full-featured monorepo tool
3. **Turborepo** - Lightweight, fast monorepo build system
4. **Lerna** - Legacy monorepo tool

### Decision
**Use Turborepo** as the monorepo build system.

### Rationale
- **Simplicity**: Turborepo requires minimal configuration compared to Nx. A single `turbo.json` manages the entire build pipeline.
- **Speed**: Remote caching and intelligent task scheduling mean rebuilds are fast even with 11+ apps.
- **Vercel alignment**: Turborepo is a Vercel product. Since we deploy on Vercel, the integration is seamless (automatic remote caching, zero-config deployment).
- **pnpm workspaces**: Works natively with pnpm workspaces, which we use for package management.
- **Low lock-in**: Turborepo is a build orchestrator, not a framework. Switching away is straightforward if needed.

### Consequences
- All apps and packages live in one repository
- Shared packages (`ui`, `db`, `utils`, `local-db`) are internal packages
- CI/CD pipelines build all affected apps on change
- Developers must understand workspace structure

---

## ADR-002: Why IndexedDB, Not localStorage

### Context
POS apps need to store significant amounts of data locally for offline operation: product catalogs (thousands of items), transaction history, inventory levels, and queued sync operations.

### Options Considered
1. **localStorage** - Simple key-value store
2. **IndexedDB** - Full database in the browser
3. **SQLite (via WASM)** - SQL database in the browser
4. **PouchDB/CouchDB** - Sync-first local database

### Decision
**Use IndexedDB** (via Dexie.js wrapper) for all local data storage.

### Rationale
- **Storage limit**: localStorage is limited to ~5-10MB. A product catalog with images can easily exceed this. IndexedDB has no practical storage limit (browser asks for permission after ~50MB).
- **Structured queries**: IndexedDB supports indexes, key ranges, and compound queries. localStorage only supports key-value lookup.
- **Async API**: IndexedDB is fully asynchronous, preventing UI blocking during large data operations. localStorage is synchronous and blocks the main thread.
- **Binary data**: IndexedDB can store Blobs (images, files). localStorage only stores strings.
- **Dexie.js**: Provides a clean Promise-based API over the raw IndexedDB API, making it developer-friendly.
- **Why not SQLite WASM**: Adds ~1MB to bundle size, requires WASM support, and the query patterns in POS apps do not require complex SQL joins.
- **Why not PouchDB**: Couples us to CouchDB for sync. We already have Supabase; adding another sync target creates complexity.

### Consequences
- `pos_*` stores are IndexedDB databases managed by Dexie.js
- Each app has its own IndexedDB database (no cross-app data leakage)
- Browser DevTools can inspect IndexedDB directly
- Data survives browser restarts but not browser data clears
- Users should be warned about clearing browser data

---

## ADR-003: Why Atomic Feature Modules (Data/Visual/Logic)

### Context
With 8 apps sharing a codebase, feature organization must be clear and consistent. Different developers (and AI agents) need to understand where to add code without deep knowledge of the entire system.

### Options Considered
1. **Feature folders** - Group by feature name
2. **Layer folders** - Group by technical concern (components/, hooks/, services/)
3. **Atomic modules** - Each feature is a self-contained unit with data/visual/logic layers
4. **Domain-driven** - Group by business domain

### Decision
**Use atomic feature modules** where each feature is a directory containing three layers: `data/`, `visual/`, and `logic/`.

### Structure
```
features/
  sales/
    data/          # Data access: API calls, IndexedDB queries, types
      api.ts
      store.ts
      types.ts
    visual/        # UI components: purely presentational
      SaleForm.tsx
      SaleList.tsx
      SaleReceipt.tsx
    logic/         # Business logic: hooks, calculations, validation
      useSale.ts
      calculateTotal.ts
      validateSale.ts
    index.ts       # Public API barrel export
```

### Rationale
- **Discoverability**: Any developer (or AI agent) can find code for a feature in one place.
- **Separation of concerns**: Data access, presentation, and logic are clearly separated. Testing each layer independently is straightforward.
- **Reusability**: The `visual/` layer can be reused across apps. The `logic/` layer can be shared via packages.
- **Scalability**: Adding a new feature means creating a new directory with three subdirectories. The pattern scales to hundreds of features.
- **AI-friendly**: AI agents can be given a simple rule: "Each feature has data/, visual/, and logic/. Data handles storage. Visual handles rendering. Logic handles computation."

### Consequences
- Feature directories may seem verbose for small features
- Developers must decide which layer a piece of code belongs to
- Cross-feature dependencies should go through barrel exports (index.ts)
- Shared logic moves to `packages/utils`, shared UI to `packages/ui`

---

## ADR-004: Why 2 Devices Per License

### Context
KASIRSOLO serves small businesses in Indonesia (warung, toko kecil, bengkel). These businesses need the app on multiple devices but have limited budgets.

### Options Considered
1. **1 device per license** - Simplest, most restrictive
2. **2 devices per license** - Balance of flexibility and control
3. **Unlimited devices** - Most flexible, hardest to monetize
4. **Per-device pricing** - Complex pricing model

### Decision
**Default to 2 devices per license** with the ability to increase via admin override.

### Rationale
- **Typical use case**: A small retail shop has one POS terminal at the counter and the owner wants to check reports on their phone or a second register. Two devices covers 90% of use cases.
- **Piracy prevention**: Unlimited devices means one license can be shared widely. Two devices is generous enough to not frustrate legitimate users while preventing abuse.
- **Upsell path**: Businesses that need more than 2 devices are larger and can afford a higher tier. The `max_devices` column can be increased per license.
- **Technical simplicity**: The constraint is enforced at the database level via a trigger function (`ksp_check_max_devices`). Device binding/unbinding is a simple operation.

### Consequences
- `ksp_licenses.max_devices` defaults to 2 (configurable 1-10)
- `ksp_devices` table tracks fingerprint + device_number (1 or 2)
- Trigger function prevents binding more than max_devices active devices
- Users can unbind a device to free up a slot
- Admin can override max_devices for enterprise clients

---

## ADR-005: Why Hybrid Pricing (Offline + Cloud)

### Context
The Indonesian market for POS software is price-sensitive. Many small businesses cannot afford monthly subscriptions. However, cloud features (sync, multi-device, portfolio sites) provide significant value that justifies recurring revenue.

### Options Considered
1. **Subscription only** - Monthly/yearly for all users
2. **One-time only** - Single payment, no recurring revenue
3. **Freemium** - Free basic, paid premium
4. **Hybrid** - One-time offline + subscription cloud

### Decision
**Use hybrid pricing**: one-time payment for offline use, monthly/yearly subscription for cloud features.

### Pricing Model

| Plan | Type | What You Get |
|------|------|-------------|
| Offline | One-time | App works locally, no sync, 2 devices (independent data) |
| Cloud Monthly | Subscription | Cloud sync, cross-device data, portfolio site, admin dashboard |
| Cloud Yearly | Subscription | Same as monthly, 20% discount |

### Rationale
- **Market accessibility**: Small businesses can start with an affordable one-time payment. No barrier of ongoing costs.
- **Upgrade path**: Once businesses experience the value, upgrading to cloud is a natural progression. They keep all their data.
- **Recurring revenue**: Cloud subscriptions provide predictable revenue for ongoing development and support.
- **Value alignment**: Users pay for value they actually use. Offline users who do not need sync should not pay for it.
- **Trial gateway**: 14-day free trial of cloud features demonstrates value before any payment.

### Consequences
- Three plan types in `ksp_licenses`: `offline`, `cloud_monthly`, `cloud_yearly`
- Offline licenses never expire (status: `active` after one-time payment)
- Cloud licenses expire if subscription lapses (7-day grace period)
- Upgrade path must handle bulk data upload from local to cloud
- Different feature gates based on plan type

---

## ADR-006: Why Next.js App Router

### Context
All KASIRSOLO apps are web applications (PWA). We need a React framework that supports server-side rendering, API routes, static generation, and modern React features.

### Options Considered
1. **Next.js Pages Router** - Legacy but stable
2. **Next.js App Router** - Modern, React Server Components
3. **Remix** - Alternative React framework
4. **Vite + React** - Lightweight SPA
5. **Astro** - Content-focused framework

### Decision
**Use Next.js 15 with App Router** for all applications.

### Rationale
- **React Server Components**: Reduce client-side JavaScript. The admin dashboard and landing page benefit heavily from server rendering.
- **Streaming & Suspense**: Progressive loading improves perceived performance on slow Indonesian mobile networks.
- **Route groups & layouts**: App Router's nested layouts map perfectly to the multi-role UI (owner vs cashier layouts).
- **API routes**: Server actions and route handlers replace the need for a separate backend. Supabase Edge Functions handle the rest.
- **Vercel optimization**: App Router on Vercel gets automatic edge optimization, ISR, and image optimization.
- **PWA support**: With `next-pwa`, the POS apps become installable PWAs with offline support via Service Workers.
- **Ecosystem**: The largest React ecosystem means more available components, examples, and community support.
- **Why not Pages Router**: App Router is the future of Next.js. Starting a new project on Pages Router means accumulating tech debt.
- **Why not Remix**: Smaller ecosystem, less Vercel optimization, fewer community resources for Indonesian developers.
- **Why not Vite SPA**: POS apps need PWA features and the admin/landing need SSR. Pure SPA lacks these without additional tooling.

### Consequences
- All apps use `app/` directory structure
- Server Components are the default; `'use client'` only when needed
- Data fetching uses server actions and React Query for client-side
- Middleware handles auth checks at the edge
- PWA configuration via `next-pwa` package
- Minimum Node.js 20 required

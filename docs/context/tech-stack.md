# Tech Stack

## Overview

KASIRSOLO is built with a modern JavaScript/TypeScript stack optimized for offline-first PWA applications with cloud sync capability.

---

## Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Language | TypeScript | 5.x | Type safety across all packages |
| Framework | Next.js | 15.x | App framework (App Router, SSR, SSG, ISR) |
| UI Library | React | 19.x | UI rendering |
| Monorepo | Turborepo | 2.x | Build orchestration, caching |
| Package Manager | pnpm | 9.x | Fast, disk-efficient dependency management |
| Cloud Database | Supabase (PostgreSQL) | Latest | Cloud data, auth, storage, edge functions |
| Local Database | IndexedDB (Dexie.js) | 4.x | Offline-first POS data storage |
| CSS Framework | Tailwind CSS | 3.x | Utility-first styling |
| UI Components | shadcn/ui | Latest | Pre-built accessible components |
| State Management | Zustand | 5.x | Lightweight client state |
| Data Fetching | TanStack Query | 5.x | Server state management, caching |
| Deployment | Vercel | - | Hosting, CDN, edge network |
| Auth | Supabase Auth | - | Email/password, JWT sessions |
| PWA | next-pwa | Latest | Service worker, offline caching |
| Linting | ESLint | 9.x | Code quality |
| Formatting | Prettier | 3.x | Code formatting |
| Testing | Vitest | 2.x | Unit & integration testing |

---

## Why Each Choice

### TypeScript 5
- **Why**: Type safety prevents runtime errors in a multi-app monorepo. Shared packages have typed interfaces that catch breaking changes at compile time.
- **Alternative rejected**: Plain JavaScript (too error-prone for a project this size).

### Next.js 15 (App Router)
- **Why**: React Server Components reduce client JS. App Router's nested layouts map perfectly to multi-role UIs. Vercel deploys Next.js optimally. PWA support via next-pwa.
- **Alternative rejected**: Remix (smaller ecosystem), Vite SPA (no SSR), Pages Router (legacy).

### React 19
- **Why**: Latest React with concurrent features, Suspense, Server Components. Required by Next.js 15.
- **Alternative rejected**: None (React is the de facto standard for Next.js).

### Turborepo 2
- **Why**: Lightweight monorepo build tool. Remote caching on Vercel. Minimal configuration. Handles 11+ apps efficiently.
- **Alternative rejected**: Nx (too heavy/complex for this project size), Lerna (legacy).

### pnpm 9
- **Why**: 3x faster than npm. Saves 50%+ disk space via content-addressable store. Native workspace support. Strict dependency resolution prevents phantom dependencies.
- **Alternative rejected**: npm (slow, wasteful), yarn (less mature workspaces).

### Supabase (PostgreSQL 15)
- **Why**: Full PostgreSQL with RLS for multi-tenant security. Built-in auth, storage, edge functions. Generous free tier. Self-hostable if needed.
- **Alternative rejected**: Firebase (NoSQL, vendor lock-in), PlanetScale (MySQL, no built-in auth), raw PostgreSQL (no auth/storage/edge).

### IndexedDB via Dexie.js 4
- **Why**: Large storage capacity (100MB+). Structured queries with indexes. Async API. Dexie.js provides a clean Promise-based wrapper. `useLiveQuery` for reactive React integration.
- **Alternative rejected**: localStorage (5MB limit, sync API), SQLite WASM (1MB+ bundle, overkill), PouchDB (CouchDB dependency).

### Tailwind CSS 3
- **Why**: Utility-first approach enables rapid UI development. Consistent design tokens. Tree-shaking removes unused CSS. Small production bundles.
- **Alternative rejected**: CSS Modules (more boilerplate), styled-components (runtime overhead), plain CSS (inconsistent).

### shadcn/ui
- **Why**: Not a dependency (source code copied into project). Fully customizable. Built on Radix UI (accessible). Tailwind-native. Active community.
- **Alternative rejected**: MUI (heavy, opinionated), Chakra UI (runtime overhead), Ant Design (less customizable, Chinese-focused).

### Zustand 5
- **Why**: Minimal API (3-5 lines for a store). No providers/wrappers. Works with SSR. Tiny bundle (~1KB). Perfect for client-side state that does not belong in the URL or server.
- **Alternative rejected**: Redux (too much boilerplate), Jotai (atomic model unnecessary here), React Context (re-render issues at scale).

### TanStack Query 5
- **Why**: Server state management with automatic caching, refetching, and optimistic updates. Integrates with Supabase client. Handles loading/error states declaratively.
- **Alternative rejected**: SWR (less features), manual fetch (no caching).

### Vercel
- **Why**: Native Next.js deployment. Automatic edge optimization. ISR support. Global CDN. Preview deployments for PRs. Monorepo support via Turborepo integration.
- **Alternative rejected**: Netlify (less Next.js optimization), AWS (complex setup), self-hosted (maintenance burden).

### Vitest 2
- **Why**: Vite-powered test runner. ESM-native. Compatible with Jest API. Fast execution. TypeScript without config.
- **Alternative rejected**: Jest (slower, CJS-first), Playwright (for E2E, not unit).

---

## Runtime Requirements

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| Node.js | 20.x | 22.x |
| pnpm | 9.0 | Latest 9.x |
| Browser | Chrome 90+ | Chrome 120+ |
| Mobile | Chrome Android 90+ | Chrome Android 120+ |
| iOS | Safari 15+ | Safari 17+ |

---

## Database Versions

| Component | Version | Notes |
|-----------|---------|-------|
| PostgreSQL | 15 | Supabase managed |
| IndexedDB | 2.0 | Browser standard |
| Dexie.js | 4.x | IndexedDB wrapper |

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://eoowqtsvaayijmjmgmid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Vercel
VERCEL_URL=<auto-set by Vercel>
TURBO_TOKEN=<remote cache token>
TURBO_TEAM=<team slug>
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ProductGrid.tsx` |
| Hooks | camelCase with `use` prefix | `useProducts.ts` |
| Utilities | camelCase | `formatCurrency.ts` |
| Types | PascalCase | `types.ts` (exported types are PascalCase) |
| Constants | UPPER_SNAKE_CASE | `MAX_DEVICES = 2` |
| Database tables | snake_case with prefix | `ksp_licenses`, `pos_products` |
| Files/directories | kebab-case | `add-new-app.md` |
| Packages | kebab-case with scope | `@kasirsolo/local-db` |
| Apps | kebab-case | `kasir-retail` |

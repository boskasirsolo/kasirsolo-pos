# KASIRSOLO

**Multi-App POS & Management Platform**
by PT Mesin Kasir Solo

---

## Overview

KASIRSOLO is a multi-app monorepo platform that provides Point of Sale (POS) and management applications for various business verticals in Indonesia. Built with a hybrid offline-first architecture, it supports 8 specialized apps ranging from retail POS to clinic management.

```
kasirsolo/
|
|-- apps/
|   |-- admin/          # Admin dashboard (Next.js)
|   |-- landing/        # Marketing site & trial registration
|   |-- kasir-retail/   # POS: Retail (Next.js PWA)
|   |-- kasir-konveksi/ # POS: Konveksi
|   |-- kasir-bengkel/  # POS: Bengkel + Sparepart
|   |-- kasir-masjid/   # Management: Masjid
|   |-- kasir-tpa/      # Management: TPA/TPQ
|   |-- kasir-klinik/   # Management: Klinik THT
|   |-- kasir-apotek/   # Management: Apotek
|   |-- kasir-dapur/    # Management: Dapur SPPG
|   |-- site-portfolio/ # Dynamic portfolio sites
|
|-- packages/
|   |-- db/             # Supabase client, types, queries (cloud)
|   |-- local-db/       # IndexedDB wrapper (offline POS)
|   |-- ui/             # Shared UI components (shadcn/ui based)
|   |-- utils/          # Shared utilities, helpers, constants
|
|-- supabase/
|   |-- migrations/     # SQL migrations (001_init.sql, 002_seed.sql)
|   |-- functions/      # Edge Functions
|   |-- config.toml     # Supabase configuration
|
|-- docs/               # This documentation
|   |-- architecture/   # System architecture docs
|   |-- database/       # Database schema & strategy docs
|   |-- apps/           # Per-app documentation
|   |-- packages/       # Package API references
|   |-- guides/         # How-to guides
|   |-- flows/          # Business & user flow docs
|   |-- context/        # Project context for AI agents
|
|-- turbo.json          # Turborepo configuration
|-- package.json        # Root workspace
|-- .env.local          # Environment variables (not committed)
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Supabase CLI
- Git

### Setup

```bash
# Clone repository
git clone <repo-url> kasirsolo
cd kasirsolo

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run Supabase locally (optional)
supabase start
supabase db reset

# Start all apps in dev mode
pnpm dev

# Start specific app
pnpm dev --filter=kasir-retail
```

### Common Commands

```bash
# Development
pnpm dev                         # Start all apps
pnpm dev --filter=<app-name>     # Start specific app
pnpm build                       # Build all apps
pnpm lint                        # Lint all packages
pnpm typecheck                   # TypeScript check

# Database
supabase start                   # Start local Supabase
supabase db reset                # Reset & re-run migrations
supabase db push                 # Push migrations to remote
supabase gen types typescript    # Generate TypeScript types

# Testing
pnpm test                        # Run all tests
pnpm test --filter=<package>     # Test specific package
```

## Architecture Highlights

- **Turborepo monorepo** for code sharing across 8+ apps
- **Hybrid data strategy**: Cloud (Supabase `ksp_*`) + Local (IndexedDB `pos_*`)
- **Offline-first POS**: Works without internet, syncs when online
- **Multi-tenant licensing**: 2 devices per license, trial/offline/cloud plans
- **Atomic feature modules**: Each feature = data + visual + logic layers
- **Portfolio sites**: Each client gets a customizable portfolio site

## Key Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/eoowqtsvaayijmjmgmid
- **Documentation**: `docs/` directory
- **AI Handoff Context**: `docs/context/ai-handoff.md`

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Next.js 15 (App Router)             |
| Language    | TypeScript 5                        |
| Monorepo    | Turborepo                           |
| Cloud DB    | Supabase (PostgreSQL)               |
| Local DB    | IndexedDB (via Dexie.js)            |
| UI          | Tailwind CSS + shadcn/ui            |
| State       | Zustand                             |
| Auth        | Supabase Auth                       |
| Deployment  | Vercel                              |
| Package Mgr | pnpm                                |

## Contact

- **Developer**: PT Mesin Kasir Solo
- **Owner**: Amin Maghfuri
- **Email**: owner.kasirsolo@gmail.com
- **WhatsApp**: 0881 6566 935

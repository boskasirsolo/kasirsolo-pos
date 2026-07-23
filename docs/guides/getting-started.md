# Getting Started

## Prerequisites

Before starting, ensure you have the following installed:

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20+ | https://nodejs.org/ or `nvm install 20` |
| pnpm | 9+ | `npm install -g pnpm` |
| Git | Latest | https://git-scm.com/ |
| Supabase CLI | Latest | `npm install -g supabase` |
| VS Code | Latest | https://code.visualstudio.com/ (recommended) |

---

## Step 1: Clone the Repository

```bash
git clone <repo-url> kasirsolo
cd kasirsolo
```

---

## Step 2: Install Dependencies

```bash
pnpm install
```

This installs all dependencies for all apps and packages in the monorepo workspace.

---

## Step 3: Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with the following values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://eoowqtsvaayijmjmgmid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# App URLs (development)
NEXT_PUBLIC_LANDING_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
NEXT_PUBLIC_RETAIL_URL=http://localhost:3010
NEXT_PUBLIC_KONVEKSI_URL=http://localhost:3011
NEXT_PUBLIC_BENGKEL_URL=http://localhost:3012
NEXT_PUBLIC_MASJID_URL=http://localhost:3013
NEXT_PUBLIC_TPA_URL=http://localhost:3014
NEXT_PUBLIC_KLINIK_URL=http://localhost:3015
NEXT_PUBLIC_APOTEK_URL=http://localhost:3016
NEXT_PUBLIC_DAPUR_URL=http://localhost:3017
NEXT_PUBLIC_PORTFOLIO_URL=http://localhost:3020
```

Get the Supabase keys from:
- Dashboard: https://supabase.com/dashboard/project/eoowqtsvaayijmjmgmid/settings/api

---

## Step 4: Set Up the Database

### Option A: Use Remote Supabase (Recommended for first setup)

1. Go to Supabase Dashboard SQL Editor
2. Run `supabase/migrations/001_init.sql`
3. Run `supabase/migrations/002_seed.sql`

### Option B: Use Local Supabase

```bash
# Start local Supabase containers (Docker required)
supabase start

# Apply migrations
supabase db reset
```

This runs all migration files in `supabase/migrations/` automatically.

---

## Step 5: Generate TypeScript Types

```bash
# From remote database
supabase gen types typescript --project-id eoowqtsvaayijmjmgmid > packages/db/src/generated/database.types.ts

# Or from local database
supabase gen types typescript --local > packages/db/src/generated/database.types.ts
```

---

## Step 6: Start Development

### Start All Apps

```bash
pnpm dev
```

This starts all apps simultaneously using Turborepo:

| App | Port | URL |
|-----|------|-----|
| Landing | 3000 | http://localhost:3000 |
| Admin | 3001 | http://localhost:3001 |
| Kasir Retail | 3010 | http://localhost:3010 |
| Kasir Konveksi | 3011 | http://localhost:3011 |
| Kasir Bengkel | 3012 | http://localhost:3012 |
| Kasir Masjid | 3013 | http://localhost:3013 |
| Kasir TPA | 3014 | http://localhost:3014 |
| Kasir Klinik | 3015 | http://localhost:3015 |
| Kasir Apotek | 3016 | http://localhost:3016 |
| Kasir Dapur | 3017 | http://localhost:3017 |
| Site Portfolio | 3020 | http://localhost:3020 |

### Start a Specific App

```bash
pnpm dev --filter=kasir-retail
pnpm dev --filter=admin
pnpm dev --filter=landing
```

---

## Step 7: Create a Test Account

1. Start the landing app: `pnpm dev --filter=landing`
2. Navigate to http://localhost:3000/coba-gratis
3. Fill in the trial registration form
4. Or create a user directly via Supabase Dashboard > Authentication > Users

---

## Step 8: Verify Everything Works

### Checklist

- [ ] `pnpm install` completes without errors
- [ ] `.env.local` has correct Supabase keys
- [ ] Database migrations applied (ksp_apps has 8 rows)
- [ ] `pnpm dev` starts without errors
- [ ] Landing page loads at http://localhost:3000
- [ ] Admin page loads at http://localhost:3001
- [ ] TypeScript types generated in `packages/db/src/generated/`

---

## Common Issues

### "Module not found" errors
Run `pnpm install` again. If the issue persists, delete `node_modules` and reinstall:
```bash
rm -rf node_modules
rm -rf apps/*/node_modules packages/*/node_modules
pnpm install
```

### Supabase connection errors
- Verify your `.env.local` values match the Supabase dashboard
- Ensure the Supabase project is active (not paused)
- For local Supabase: ensure Docker is running and `supabase start` completed

### Port conflicts
Change the port in the app's `package.json` dev script:
```json
{
  "scripts": {
    "dev": "next dev -p 3099"
  }
}
```

### TypeScript errors after schema changes
Regenerate types: `supabase gen types typescript --project-id eoowqtsvaayijmjmgmid > packages/db/src/generated/database.types.ts`

---

## Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Error Translator
- Prisma (for SQL syntax highlighting in migration files)

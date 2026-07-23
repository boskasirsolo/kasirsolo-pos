# Deployment Guide

## Overview

KASIRSOLO deploys to Vercel as a multi-project monorepo. Each app is a separate Vercel project with its own domain and build configuration.

---

## Vercel Project Setup

### Project Mapping

| App | Vercel Project | Domain (Production) | Domain (Staging) |
|-----|---------------|--------------------|--------------------|
| Landing | kasirsolo-landing | kasirsolo.com | staging.kasirsolo.com |
| Admin | kasirsolo-admin | admin.kasirsolo.com | admin-staging.kasirsolo.com |
| Kasir Retail | kasirsolo-retail | retail.kasirsolo.com | retail-staging.kasirsolo.com |
| Kasir Konveksi | kasirsolo-konveksi | konveksi.kasirsolo.com | konveksi-staging.kasirsolo.com |
| Kasir Bengkel | kasirsolo-bengkel | bengkel.kasirsolo.com | bengkel-staging.kasirsolo.com |
| Kasir Masjid | kasirsolo-masjid | masjid.kasirsolo.com | masjid-staging.kasirsolo.com |
| Kasir TPA | kasirsolo-tpa | tpa.kasirsolo.com | tpa-staging.kasirsolo.com |
| Kasir Klinik | kasirsolo-klinik | klinik.kasirsolo.com | klinik-staging.kasirsolo.com |
| Kasir Apotek | kasirsolo-apotek | apotek.kasirsolo.com | apotek-staging.kasirsolo.com |
| Kasir Dapur | kasirsolo-dapur | dapur.kasirsolo.com | dapur-staging.kasirsolo.com |
| Site Portfolio | kasirsolo-portfolio | kasirsolo.com/site/* | portfolio-staging.kasirsolo.com |

---

## Creating a Vercel Project

For each app, create a Vercel project pointing to the monorepo:

### Step 1: Link Repository

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# From monorepo root, for each app:
cd apps/kasir-retail
vercel link
```

### Step 2: Configure Build Settings

In the Vercel dashboard for each project:

- **Framework Preset**: Next.js
- **Root Directory**: `apps/kasir-retail` (adjust per app)
- **Build Command**: `cd ../.. && npx turbo run build --filter=kasir-retail`
- **Output Directory**: `.next`
- **Install Command**: `cd ../.. && pnpm install`

### Step 3: Environment Variables

Set these environment variables in each Vercel project:

```
NEXT_PUBLIC_SUPABASE_URL=https://eoowqtsvaayijmjmgmid.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>  (admin app only)

# App-specific URLs
NEXT_PUBLIC_LANDING_URL=https://kasirsolo.com
NEXT_PUBLIC_ADMIN_URL=https://admin.kasirsolo.com
NEXT_PUBLIC_RETAIL_URL=https://retail.kasirsolo.com
# ... etc
```

### Step 4: Domain Configuration

```bash
# Add custom domain
vercel domains add kasirsolo.com --project kasirsolo-landing
vercel domains add admin.kasirsolo.com --project kasirsolo-admin
vercel domains add retail.kasirsolo.com --project kasirsolo-retail
# ... etc
```

---

## Turborepo Remote Caching

Enable remote caching for faster builds:

```bash
# Login to Vercel from monorepo root
npx turbo login

# Link to Vercel team
npx turbo link
```

This enables Turborepo to share build cache across CI/CD runs and team members.

---

## CI/CD Pipeline

### GitHub Actions (recommended)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  TURBO_TOKEN: ${{ secrets.TURBO_TOKEN }}
  TURBO_TEAM: ${{ secrets.TURBO_TEAM }}

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck

  deploy-preview:
    if: github.event_name == 'pull_request'
    needs: lint-and-typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: lint-and-typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Database Migrations (Production)

### Applying Migrations

```bash
# Link to production Supabase
supabase link --project-ref eoowqtsvaayijmjmgmid

# Push migrations
supabase db push

# Verify
supabase db diff
```

### Migration Workflow

1. Create new migration file: `supabase/migrations/NNN_description.sql`
2. Test locally: `supabase db reset` (local)
3. Review SQL carefully
4. Push to production: `supabase db push`
5. Regenerate types: `supabase gen types typescript`

---

## Rollback Strategy

### App Rollback
Vercel keeps all deployment history. To rollback:
1. Go to Vercel Dashboard > Project > Deployments
2. Find the last working deployment
3. Click "..." > "Promote to Production"

### Database Rollback
- Supabase has point-in-time recovery (PITR)
- For schema rollbacks, create a reverse migration
- Always test migrations on a staging project first

---

## Monitoring

### Vercel
- Analytics dashboard for each app
- Speed Insights for Core Web Vitals
- Function logs for server-side errors

### Supabase
- Database performance dashboard
- Auth logs for login events
- Edge Function logs
- Storage usage

### Recommended Third-Party
- **Sentry**: Error tracking across all apps
- **Uptime Robot**: Uptime monitoring for all domains

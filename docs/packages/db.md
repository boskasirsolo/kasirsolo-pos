# Package: @kasirsolo/db

## Overview

The `db` package provides the Supabase client, TypeScript types, and query utilities for all cloud (`ksp_*`) operations. It is the single source of truth for cloud database access across all apps.

**Path**: `packages/db/`
**Exports**: Supabase clients, typed queries, database types

---

## Structure

```
packages/db/
  src/
    client.ts           # Supabase client factory
    types.ts            # Generated + custom types
    queries/
      apps.ts           # ksp_apps queries
      clients.ts        # ksp_clients queries
      licenses.ts       # ksp_licenses queries
      devices.ts        # ksp_devices queries
      users.ts          # ksp_users queries
      transactions.ts   # ksp_transactions queries
      subscriptions.ts  # ksp_subscriptions queries
      sites.ts          # ksp_sites queries
      site-pages.ts     # ksp_site_pages queries
      site-settings.ts  # ksp_site_settings queries
      logs.ts           # ksp_logs queries
      settings.ts       # ksp_settings queries
    index.ts            # Barrel export
  package.json
  tsconfig.json
```

---

## Client Factory

```typescript
// packages/db/src/client.ts
import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Browser client (uses RLS, respects auth session)
export function createSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Server client (for server components, uses RLS)
export function createServerClient(cookieStore: any) {
  return createServerComponentClient<Database>({ cookies: () => cookieStore });
}

// Service client (bypasses RLS, for admin operations)
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

---

## Types

Types are auto-generated from the Supabase schema using `supabase gen types typescript`. Additional custom types are added for convenience:

```typescript
// packages/db/src/types.ts (excerpt)
export type { Database } from './generated/database.types';

// Convenience aliases
export type KspApp = Database['public']['Tables']['ksp_apps']['Row'];
export type KspClient = Database['public']['Tables']['ksp_clients']['Row'];
export type KspLicense = Database['public']['Tables']['ksp_licenses']['Row'];
export type KspDevice = Database['public']['Tables']['ksp_devices']['Row'];
export type KspUser = Database['public']['Tables']['ksp_users']['Row'];
export type KspTransaction = Database['public']['Tables']['ksp_transactions']['Row'];
export type KspSubscription = Database['public']['Tables']['ksp_subscriptions']['Row'];
export type KspSite = Database['public']['Tables']['ksp_sites']['Row'];
export type KspSitePage = Database['public']['Tables']['ksp_site_pages']['Row'];
export type KspSiteSettings = Database['public']['Tables']['ksp_site_settings']['Row'];
export type KspLog = Database['public']['Tables']['ksp_logs']['Row'];
export type KspSetting = Database['public']['Tables']['ksp_settings']['Row'];

// Insert types
export type KspClientInsert = Database['public']['Tables']['ksp_clients']['Insert'];
export type KspLicenseInsert = Database['public']['Tables']['ksp_licenses']['Insert'];
// ... etc

// ENUM types
export type AppCategory = Database['public']['Enums']['ksp_app_category'];
export type PlanType = Database['public']['Enums']['ksp_plan_type'];
export type LicenseStatus = Database['public']['Enums']['ksp_license_status'];
export type UserRole = Database['public']['Enums']['ksp_user_role'];
export type TransactionStatus = Database['public']['Enums']['ksp_transaction_status'];
export type SubscriptionStatus = Database['public']['Enums']['ksp_subscription_status'];
export type LogAction = Database['public']['Enums']['ksp_log_action'];
export type SiteTemplate = Database['public']['Enums']['ksp_site_template'];
```

---

## Query Functions

Each query module exports typed functions. Example:

```typescript
// packages/db/src/queries/licenses.ts
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database, KspLicense, KspLicenseInsert } from '../types';

export function licenseQueries(supabase: SupabaseClient<Database>) {
  return {
    async getById(id: string) {
      const { data, error } = await supabase
        .from('ksp_licenses')
        .select('*, ksp_apps(*), ksp_clients(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },

    async getByClientId(clientId: string) {
      const { data, error } = await supabase
        .from('ksp_licenses')
        .select('*, ksp_apps(*)')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },

    async getByLicenseKey(key: string) {
      const { data, error } = await supabase
        .from('ksp_licenses')
        .select('*, ksp_apps(*), ksp_devices(*)')
        .eq('license_key', key)
        .single();
      if (error) throw error;
      return data;
    },

    async create(license: KspLicenseInsert) {
      const { data, error } = await supabase
        .from('ksp_licenses')
        .insert(license)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async updateStatus(id: string, status: KspLicense['status']) {
      const { data, error } = await supabase
        .from('ksp_licenses')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async getExpiring(days: number = 7) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      const { data, error } = await supabase
        .from('ksp_licenses')
        .select('*, ksp_clients(*), ksp_apps(*)')
        .eq('status', 'active')
        .not('expires_at', 'is', null)
        .lte('expires_at', futureDate.toISOString())
        .order('expires_at', { ascending: true });
      if (error) throw error;
      return data;
    },
  };
}
```

---

## Usage in Apps

```typescript
// In any app
import { createSupabaseClient, licenseQueries } from '@kasirsolo/db';

const supabase = createSupabaseClient();
const licenses = licenseQueries(supabase);

// Get a license by key
const license = await licenses.getByLicenseKey('RET-A1B2-C3D4-E5F6-G7H8');

// Get expiring licenses (admin)
const expiring = await licenses.getExpiring(7);
```

---

## Regenerating Types

When the database schema changes, regenerate types:

```bash
supabase gen types typescript --project-id eoowqtsvaayijmjmgmid > packages/db/src/generated/database.types.ts
```

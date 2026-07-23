# Upgrade Flow

## Overview

The upgrade flow handles the transition from an Offline plan to a Cloud plan (monthly or yearly). This involves activating cloud sync, creating a subscription, and migrating local data to the cloud.

---

## Upgrade Path

```
OFFLINE PLAN                        CLOUD PLAN
+-------------------+               +-------------------+
| - Local data only |               | - Cloud sync      |
| - No sync         |    UPGRADE    | - Cross-device    |
| - Independent     |  ---------->  | - Portfolio site  |
|   devices         |               | - Admin dashboard |
| - One-time pay    |               | - Subscription    |
+-------------------+               +-------------------+
```

---

## Upgrade Flow Diagram

```
USER (POS App)                SYSTEM                        ADMIN
     |                           |                             |
     |  Settings > License       |                             |
     |  "Upgrade ke Cloud"       |                             |
     |-------------------------->|                             |
     |                           |                             |
     |  Show plan comparison     |                             |
     |  Cloud Monthly vs Yearly  |                             |
     |<--------------------------|                             |
     |                           |                             |
     |  Select Cloud Yearly      |                             |
     |-------------------------->|                             |
     |                           |                             |
     |  Show payment info        |                             |
     |  Amount: Rp2.400.000/thn  |                             |
     |  Bank/QRIS/eWallet        |                             |
     |<--------------------------|                             |
     |                           |                             |
     |  Make payment             |                             |
     |-------------------------->|                             |
     |                           |                             |
     |  Confirm via WhatsApp     |                             |
     |  "Sudah transfer untuk    |   Notification              |
     |   upgrade cloud"          |------------------------------>|
     |                           |                             |
     |                           |   Verify payment            |
     |                           |<-----------------------------|
     |                           |                             |
     |                           |   1. Create transaction     |
     |                           |   2. Update license:        |
     |                           |      plan_type -> cloud_    |
     |                           |      yearly                 |
     |                           |   3. Create subscription    |
     |                           |   4. Log: license.upgrade   |
     |                           |                             |
     |  Upgrade confirmed        |                             |
     |<--------------------------|                             |
     |                           |                             |
     |  START DATA MIGRATION     |                             |
     |  (automatic)              |                             |
     |                           |                             |
     |  Upload local data        |                             |
     |  to cloud (bulk)          |                             |
     |-------------------------->|                             |
     |                           |                             |
     |  Enable sync engine       |                             |
     |                           |                             |
     |  UPGRADE COMPLETE         |                             |
```

---

## Data Migration Process

When upgrading from offline to cloud, all existing local data needs to be uploaded to Supabase:

### Step 1: Pre-Migration Check

```typescript
async function preMigrationCheck(db: Dexie) {
  const counts = {
    products: await db.table('products').count(),
    categories: await db.table('categories').count(),
    sales: await db.table('sales').count(),
    saleItems: await db.table('saleItems').count(),
    customers: await db.table('customers').count(),
    inventory: await db.table('inventory').count(),
  };

  const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);

  return {
    counts,
    totalRecords,
    estimatedTime: Math.ceil(totalRecords / 100) + ' detik', // ~100 records/sec
  };
}
```

### Step 2: Bulk Upload

```typescript
async function migrateToCloud(db: Dexie, supabase: SupabaseClient, licenseId: string) {
  const BATCH_SIZE = 100;

  // Upload products
  const products = await db.table('products').toArray();
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    await supabase.from('ksp_sync_products').upsert(
      batch.map(p => ({ ...p, license_id: licenseId }))
    );
    // Update progress
    onProgress('products', i + batch.length, products.length);
  }

  // Upload sales
  const sales = await db.table('sales').toArray();
  for (let i = 0; i < sales.length; i += BATCH_SIZE) {
    const batch = sales.slice(i, i + BATCH_SIZE);
    await supabase.from('ksp_sync_sales').upsert(
      batch.map(s => ({ ...s, license_id: licenseId }))
    );
    onProgress('sales', i + batch.length, sales.length);
  }

  // ... repeat for other stores

  // Mark all records as synced
  await db.table('products').toCollection().modify({ synced_at: new Date().toISOString() });
  await db.table('sales').toCollection().modify({ synced_at: new Date().toISOString() });
}
```

### Step 3: Verification

```typescript
async function verifyMigration(db: Dexie, supabase: SupabaseClient, licenseId: string) {
  const localProductCount = await db.table('products').count();
  const { count: cloudProductCount } = await supabase
    .from('ksp_sync_products')
    .select('*', { count: 'exact', head: true })
    .eq('license_id', licenseId);

  const localSaleCount = await db.table('sales').count();
  const { count: cloudSaleCount } = await supabase
    .from('ksp_sync_sales')
    .select('*', { count: 'exact', head: true })
    .eq('license_id', licenseId);

  return {
    products: { local: localProductCount, cloud: cloudProductCount, match: localProductCount === cloudProductCount },
    sales: { local: localSaleCount, cloud: cloudSaleCount, match: localSaleCount === cloudSaleCount },
    success: localProductCount === cloudProductCount && localSaleCount === cloudSaleCount,
  };
}
```

---

## Migration UI

```
+--------------------------------------------------+
|  Upgrade ke Cloud                                |
|                                                  |
|  Migrasi Data                                    |
|  ============================================    |
|                                                  |
|  [============================------] 78%        |
|                                                  |
|  Produk:     500/500   [v]                       |
|  Kategori:    25/25    [v]                       |
|  Penjualan: 2340/3000  [...]                     |
|  Pelanggan:   0/150    [ ]                       |
|  Stok:        0/1000   [ ]                       |
|                                                  |
|  Estimasi waktu: ~30 detik                       |
|                                                  |
|  [Jangan tutup halaman ini selama migrasi]       |
+--------------------------------------------------+
```

---

## Database Changes on Upgrade

### ksp_licenses update:
```sql
UPDATE ksp_licenses SET
  plan_type = 'cloud_yearly',   -- or cloud_monthly
  status = 'active',
  expires_at = NOW() + INTERVAL '1 year',  -- or 1 month
  updated_at = NOW()
WHERE id = '<license-id>';
```

### ksp_subscriptions insert:
```sql
INSERT INTO ksp_subscriptions (
  client_id, license_id, plan_type, status,
  amount, billing_cycle_day,
  current_period_start, current_period_end,
  next_billing_at
) VALUES (
  '<client-id>', '<license-id>', 'cloud_yearly', 'active',
  2400000, EXTRACT(DAY FROM NOW()),
  NOW(), NOW() + INTERVAL '1 year',
  NOW() + INTERVAL '1 year'
);
```

### ksp_transactions insert:
```sql
INSERT INTO ksp_transactions (
  client_id, license_id, subscription_id,
  invoice_number, amount, total,
  status, description, paid_at
) VALUES (
  '<client-id>', '<license-id>', '<subscription-id>',
  'KSP-20260722-0001', 2400000, 2400000,
  'paid', 'Kasir Retail - Upgrade to Cloud Yearly',
  NOW()
);
```

---

## Post-Upgrade Features

After upgrading to cloud, the client gains:

| Feature | Before (Offline) | After (Cloud) |
|---------|-----------------|---------------|
| Data storage | Local only | Local + Cloud sync |
| Cross-device | Independent data | Synced data |
| Portfolio site | Not available | Create & publish |
| Admin dashboard | Not available | Full access |
| Automatic backup | Manual export | Automatic |
| Reports | Local only | Cloud-aggregated |
| Support | Standard | Priority |

---

## Downgrade Path

Downgrading from Cloud to Offline is possible but discouraged:

1. Cancel subscription (ksp_subscriptions.status = 'cancelled')
2. After current period ends, license reverts to offline
3. Cloud sync stops
4. Portfolio site deactivated
5. Local data remains intact on device
6. Cloud data archived (not deleted) for 90 days
7. If client re-upgrades within 90 days, cloud data is restored

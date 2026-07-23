# Package: @kasirsolo/local-db

## Overview

The `local-db` package provides the IndexedDB client using Dexie.js for all local (`pos_*`) operations. Each POS app uses this package to manage its offline data store.

**Path**: `packages/local-db/`
**Exports**: Database classes, store hooks, sync utilities

---

## Structure

```
packages/local-db/
  src/
    databases/
      retail.ts          # RetailDatabase class
      konveksi.ts        # KonveksiDatabase class
      bengkel.ts         # BengkelDatabase class
      masjid.ts          # MasjidDatabase class
      tpa.ts             # TpaDatabase class
      klinik.ts          # KlinikDatabase class
      apotek.ts          # ApotekDatabase class
      dapur.ts           # DapurDatabase class
    stores/
      products.ts        # Product store operations
      categories.ts      # Category store operations
      sales.ts           # Sales store operations
      inventory.ts       # Inventory store operations
      customers.ts       # Customer store operations
      cart.ts            # Cart store operations
      drafts.ts          # Draft store operations
      sync-queue.ts      # Sync queue operations
      settings.ts        # Settings store operations
    sync/
      engine.ts          # Sync engine core
      queue.ts           # Queue management
      conflict.ts        # Conflict resolution
      worker.ts          # Service Worker sync handler
    hooks/
      useProducts.ts     # React hook for products
      useSales.ts        # React hook for sales
      useCart.ts         # React hook for cart
      useSync.ts         # React hook for sync status
    types.ts             # Store types
    utils.ts             # Helper functions (ID generation, timestamps)
    index.ts             # Barrel export
  package.json
  tsconfig.json
```

---

## Database Classes

Each app gets a Dexie database class with app-specific stores:

```typescript
// packages/local-db/src/databases/retail.ts
import Dexie, { Table } from 'dexie';
import type { PosProduct, PosCategory, PosSale, PosSaleItem,
  PosInventory, PosCustomer, PosCart, PosDraft,
  PosSyncQueue, PosSetting } from '../types';

export class RetailDatabase extends Dexie {
  products!: Table<PosProduct>;
  categories!: Table<PosCategory>;
  inventory!: Table<PosInventory>;
  sales!: Table<PosSale>;
  saleItems!: Table<PosSaleItem>;
  customers!: Table<PosCustomer>;
  cart!: Table<PosCart>;
  drafts!: Table<PosDraft>;
  syncQueue!: Table<PosSyncQueue>;
  settings!: Table<PosSetting>;

  constructor() {
    super('pos_retail_v1');
    this.version(1).stores({
      products: '++id, name, sku, barcode, category_id, is_active, created_at, updated_at, synced_at',
      categories: '++id, name, parent_id, is_active, synced_at',
      inventory: '++id, product_id, type, reference_id, created_at, synced_at',
      sales: '++id, receipt_number, customer_id, user_id, payment_method, status, created_at, synced_at',
      saleItems: '++id, sale_id, product_id',
      customers: '++id, name, phone, email, is_active, created_at, synced_at',
      cart: 'id',
      drafts: '++id, customer_id, created_at',
      syncQueue: '++id, operation, store_name, record_id, status, created_at',
      settings: 'key',
    });
  }
}

export const retailDb = new RetailDatabase();
```

---

## Store Operations

Each store module provides CRUD operations:

```typescript
// packages/local-db/src/stores/products.ts
import type { PosProduct } from '../types';
import type Dexie from 'dexie';

export function createProductStore(db: Dexie) {
  const table = db.table<PosProduct>('products');

  return {
    async getAll() {
      return table.where('is_active').equals(1).toArray();
    },

    async getById(id: string) {
      return table.get(id);
    },

    async search(query: string) {
      return table
        .filter(p => p.name.toLowerCase().includes(query.toLowerCase())
          || p.sku?.includes(query)
          || p.barcode?.includes(query))
        .toArray();
    },

    async getByCategory(categoryId: string) {
      return table.where('category_id').equals(categoryId).toArray();
    },

    async getByBarcode(barcode: string) {
      return table.where('barcode').equals(barcode).first();
    },

    async create(product: Omit<PosProduct, 'id' | 'created_at' | 'updated_at'>) {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      await table.add({
        ...product,
        id,
        created_at: now,
        updated_at: now,
        synced_at: null,
      });
      return id;
    },

    async update(id: string, changes: Partial<PosProduct>) {
      await table.update(id, {
        ...changes,
        updated_at: new Date().toISOString(),
        synced_at: null,  // Mark as needing sync
      });
    },

    async delete(id: string) {
      await table.update(id, { is_active: false, updated_at: new Date().toISOString() });
    },

    async getUnsyncedCount() {
      return table.where('synced_at').equals(null as any).count();
    },

    async getLowStock(threshold?: number) {
      return table
        .filter(p => p.is_active && p.stock <= (threshold ?? p.min_stock ?? 0))
        .toArray();
    },
  };
}
```

---

## React Hooks

```typescript
// packages/local-db/src/hooks/useProducts.ts
import { useLiveQuery } from 'dexie-react-hooks';
import type Dexie from 'dexie';

export function useProducts(db: Dexie) {
  const products = useLiveQuery(
    () => db.table('products').where('is_active').equals(1).toArray(),
    [],
    []
  );
  return products;
}

export function useProductsByCategory(db: Dexie, categoryId: string | null) {
  const products = useLiveQuery(
    () => categoryId
      ? db.table('products').where('category_id').equals(categoryId).toArray()
      : db.table('products').where('is_active').equals(1).toArray(),
    [categoryId],
    []
  );
  return products;
}
```

---

## Sync Engine

```typescript
// packages/local-db/src/sync/engine.ts
import type Dexie from 'dexie';
import type { SupabaseClient } from '@supabase/supabase-js';

export class SyncEngine {
  private db: Dexie;
  private supabase: SupabaseClient;
  private isRunning = false;

  constructor(db: Dexie, supabase: SupabaseClient) {
    this.db = db;
    this.supabase = supabase;
  }

  async processQueue() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const queue = await this.db.table('syncQueue')
        .where('status').equals('pending')
        .sortBy('created_at');

      for (const item of queue) {
        try {
          await this.processItem(item);
          await this.db.table('syncQueue').update(item.id, { status: 'completed' });
        } catch (error) {
          await this.db.table('syncQueue').update(item.id, {
            status: 'failed',
            attempts: (item.attempts || 0) + 1,
            last_error: String(error),
          });
        }
      }
    } finally {
      this.isRunning = false;
    }
  }

  private async processItem(item: any) {
    // Map local store names to cloud table names
    // Upload/download logic here
  }

  async pullChanges(lastSyncAt: string) {
    // Pull remote changes since lastSyncAt
    // Merge into local IndexedDB
  }
}
```

---

## Usage in Apps

```typescript
// In kasir-retail app
import { RetailDatabase, createProductStore, useProducts } from '@kasirsolo/local-db';

const db = new RetailDatabase();
const products = createProductStore(db);

// In a React component
function ProductList() {
  const allProducts = useProducts(db);
  // ...
}

// In business logic
async function addProduct(name: string, price: number) {
  const id = await products.create({ name, price, stock: 0, is_active: true });
  return id;
}
```

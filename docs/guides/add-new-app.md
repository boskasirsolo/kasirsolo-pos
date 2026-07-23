# Guide: Add a New Kasir App

This guide walks you through adding a new specialized POS/management app to the KASIRSOLO monorepo.

---

## Example: Adding "Kasir Laundry"

We will add a laundry management app as an example.

### Step 1: Create the App Directory

```bash
# From monorepo root
mkdir -p apps/kasir-laundry
```

### Step 2: Initialize the Next.js App

```bash
cd apps/kasir-laundry

# Create package.json
cat > package.json << 'EOF'
{
  "name": "kasir-laundry",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3018",
    "build": "next build",
    "start": "next start -p 3018",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@kasirsolo/db": "workspace:*",
    "@kasirsolo/local-db": "workspace:*",
    "@kasirsolo/ui": "workspace:*",
    "@kasirsolo/utils": "workspace:*",
    "next": "15.x",
    "react": "19.x",
    "react-dom": "19.x"
  },
  "devDependencies": {
    "@types/react": "19.x",
    "typescript": "5.x",
    "tailwindcss": "3.x"
  }
}
EOF
```

### Step 3: Create the App Router Structure

```bash
mkdir -p app/(auth)/login
mkdir -p app/(dashboard)
mkdir -p app/(dashboard)/orders
mkdir -p app/(dashboard)/customers
mkdir -p app/(dashboard)/reports
mkdir -p app/(dashboard)/settings
mkdir -p features
```

Create the root layout:

```typescript
// apps/kasir-laundry/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@kasirsolo/ui/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kasir Laundry - KASIRSOLO',
  description: 'Aplikasi manajemen laundry',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### Step 4: Create the Local Database

```typescript
// packages/local-db/src/databases/laundry.ts
import Dexie, { Table } from 'dexie';

export class LaundryDatabase extends Dexie {
  products!: Table;      // Services (cuci kiloan, cuci satuan, setrika, etc.)
  categories!: Table;
  sales!: Table;         // Orders
  saleItems!: Table;     // Order items
  customers!: Table;
  inventory!: Table;
  cart!: Table;
  drafts!: Table;
  syncQueue!: Table;
  settings!: Table;
  // Laundry-specific stores:
  orders!: Table;        // Laundry orders with status tracking

  constructor() {
    super('pos_laundry_v1');
    this.version(1).stores({
      products: '++id, name, sku, category_id, is_active, synced_at',
      categories: '++id, name, is_active, synced_at',
      sales: '++id, receipt_number, customer_id, status, created_at, synced_at',
      saleItems: '++id, sale_id, product_id',
      customers: '++id, name, phone, email, is_active, synced_at',
      inventory: '++id, product_id, type, created_at, synced_at',
      cart: 'id',
      drafts: '++id, customer_id, created_at',
      syncQueue: '++id, operation, store_name, record_id, status, created_at',
      settings: 'key',
      // Laundry-specific:
      orders: '++id, customer_id, status, pickup_date, created_at, synced_at',
    });
  }
}

export const laundryDb = new LaundryDatabase();
```

### Step 5: Create Feature Modules

Follow the atomic pattern (data/visual/logic):

```bash
mkdir -p features/orders/{data,visual,logic}
mkdir -p features/customers/{data,visual,logic}
mkdir -p features/reports/{data,visual,logic}
```

Example feature:

```typescript
// features/orders/data/types.ts
export interface LaundryOrder {
  id: string;
  customer_id: string;
  items: LaundryOrderItem[];
  status: 'received' | 'washing' | 'drying' | 'ironing' | 'ready' | 'picked_up';
  total_weight: number;
  total_price: number;
  received_at: string;
  estimated_ready: string;
  picked_up_at?: string;
  note?: string;
  created_at: string;
  updated_at: string;
}

// features/orders/visual/OrderCard.tsx
// features/orders/visual/OrderList.tsx
// features/orders/visual/OrderStatusBadge.tsx

// features/orders/logic/useOrders.ts
// features/orders/logic/calculatePrice.ts

// features/orders/index.ts (barrel export)
export { OrderCard } from './visual/OrderCard';
export { OrderList } from './visual/OrderList';
export { useOrders } from './logic/useOrders';
```

### Step 6: Add the App to the Product Catalog

Create a new migration:

```sql
-- supabase/migrations/003_add_laundry.sql
INSERT INTO ksp_apps (slug, name, description, icon, category, price, features, sort_order)
VALUES (
  'laundry',
  'Kasir Laundry',
  'Aplikasi manajemen laundry. Tracking order, manajemen pelanggan, laporan pendapatan.',
  '👔',
  'bisnis',
  300000,
  '["Order Tracking", "Status Laundry", "Manajemen Pelanggan", "Laporan Pendapatan", "Notifikasi WhatsApp", "Mode Offline"]'::jsonb,
  9
);
```

### Step 7: Configure Turborepo

The app is automatically detected by Turborepo via pnpm workspaces. Ensure the workspace glob in root `package.json` includes it:

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

### Step 8: Configure Tailwind

```typescript
// apps/kasir-laundry/tailwind.config.ts
import preset from '@kasirsolo/ui/tailwind.preset';

export default {
  presets: [preset],
  content: [
    './app/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};
```

### Step 9: Add TypeScript Config

```json
// apps/kasir-laundry/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "paths": {
      "@/*": ["./*"],
      "@kasirsolo/db": ["../../packages/db/src"],
      "@kasirsolo/local-db": ["../../packages/local-db/src"],
      "@kasirsolo/ui": ["../../packages/ui/src"],
      "@kasirsolo/utils": ["../../packages/utils/src"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Step 10: Install & Run

```bash
# From monorepo root
pnpm install
pnpm dev --filter=kasir-laundry
```

Open http://localhost:3018

---

## Checklist for a New App

- [ ] App directory created under `apps/`
- [ ] `package.json` with correct name, port, and workspace dependencies
- [ ] Root `layout.tsx` with metadata and font
- [ ] Auth middleware for protected routes
- [ ] Local database class in `packages/local-db/src/databases/`
- [ ] Feature modules with data/visual/logic structure
- [ ] App record in `ksp_apps` table (via migration)
- [ ] Tailwind config extending shared preset
- [ ] TypeScript config extending base
- [ ] Development port assigned (no conflicts)
- [ ] App documentation in `docs/apps/`
- [ ] Added to landing page product list

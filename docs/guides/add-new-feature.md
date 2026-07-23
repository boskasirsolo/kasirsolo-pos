# Guide: Add a New Feature Module

This guide explains how to create an atomic feature module following the KASIRSOLO data/visual/logic pattern.

---

## The Atomic Feature Pattern

Every feature in KASIRSOLO follows a three-layer structure:

```
features/
  feature-name/
    data/          # Data access layer: API calls, store operations, types
    visual/        # Visual layer: React components (presentational)
    logic/         # Logic layer: hooks, calculations, validation
    index.ts       # Public API (barrel export)
```

### Why This Pattern?

1. **Separation of concerns**: Each layer has one job
2. **Testability**: Each layer can be unit-tested independently
3. **Reusability**: Visual components can be reused; logic can be shared
4. **Discoverability**: Any developer (or AI agent) knows where to find code
5. **Consistency**: All features follow the same structure

---

## Step-by-Step: Creating a "Discount" Feature

### Step 1: Create the Directory Structure

```bash
# From the app root (e.g., apps/kasir-retail/)
mkdir -p features/discount/{data,visual,logic}
```

### Step 2: Define Types (data/types.ts)

```typescript
// features/discount/data/types.ts

export interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;           // percentage (0-100) or fixed amount (IDR)
  min_purchase: number;    // minimum purchase amount to qualify
  max_discount?: number;   // maximum discount amount (for percentage)
  start_date?: string;     // ISO date string
  end_date?: string;       // ISO date string
  is_active: boolean;
  applies_to: 'all' | 'category' | 'product';
  target_ids?: string[];   // category or product IDs
  created_at: string;
  updated_at: string;
}

export interface DiscountApplication {
  discount_id: string;
  discount_name: string;
  original_amount: number;
  discount_amount: number;
  final_amount: number;
}
```

### Step 3: Create Data Access (data/store.ts)

```typescript
// features/discount/data/store.ts
import type { Discount } from './types';

// If using IndexedDB (local data):
export function createDiscountStore(db: any) {
  const table = db.table('discounts');

  return {
    async getAll(): Promise<Discount[]> {
      return table.where('is_active').equals(1).toArray();
    },

    async getById(id: string): Promise<Discount | undefined> {
      return table.get(id);
    },

    async getActive(): Promise<Discount[]> {
      const now = new Date().toISOString();
      return table
        .filter((d: Discount) =>
          d.is_active
          && (!d.start_date || d.start_date <= now)
          && (!d.end_date || d.end_date >= now)
        )
        .toArray();
    },

    async create(discount: Omit<Discount, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
      const now = new Date().toISOString();
      const id = crypto.randomUUID();
      await table.add({ ...discount, id, created_at: now, updated_at: now });
      return id;
    },

    async update(id: string, changes: Partial<Discount>): Promise<void> {
      await table.update(id, { ...changes, updated_at: new Date().toISOString() });
    },

    async delete(id: string): Promise<void> {
      await table.update(id, { is_active: false, updated_at: new Date().toISOString() });
    },
  };
}
```

### Step 4: Create Business Logic (logic/)

```typescript
// features/discount/logic/calculateDiscount.ts
import type { Discount, DiscountApplication } from '../data/types';

export function calculateDiscount(
  discount: Discount,
  subtotal: number
): DiscountApplication {
  // Check minimum purchase
  if (subtotal < discount.min_purchase) {
    return {
      discount_id: discount.id,
      discount_name: discount.name,
      original_amount: subtotal,
      discount_amount: 0,
      final_amount: subtotal,
    };
  }

  let discountAmount: number;

  if (discount.type === 'percentage') {
    discountAmount = Math.round(subtotal * (discount.value / 100));
    // Apply max_discount cap
    if (discount.max_discount && discountAmount > discount.max_discount) {
      discountAmount = discount.max_discount;
    }
  } else {
    // Fixed amount
    discountAmount = discount.value;
  }

  // Discount cannot exceed subtotal
  discountAmount = Math.min(discountAmount, subtotal);

  return {
    discount_id: discount.id,
    discount_name: discount.name,
    original_amount: subtotal,
    discount_amount: discountAmount,
    final_amount: subtotal - discountAmount,
  };
}

export function findBestDiscount(
  discounts: Discount[],
  subtotal: number
): DiscountApplication | null {
  if (discounts.length === 0) return null;

  const applications = discounts
    .map(d => calculateDiscount(d, subtotal))
    .filter(a => a.discount_amount > 0)
    .sort((a, b) => b.discount_amount - a.discount_amount);

  return applications[0] || null;
}
```

```typescript
// features/discount/logic/validateDiscount.ts
import type { Discount } from '../data/types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateDiscount(discount: Partial<Discount>): ValidationResult {
  const errors: string[] = [];

  if (!discount.name || discount.name.trim() === '') {
    errors.push('Nama diskon harus diisi');
  }

  if (!discount.type) {
    errors.push('Tipe diskon harus dipilih');
  }

  if (discount.type === 'percentage' && (discount.value! < 0 || discount.value! > 100)) {
    errors.push('Persentase diskon harus antara 0-100');
  }

  if (discount.type === 'fixed' && discount.value! < 0) {
    errors.push('Nilai diskon tidak boleh negatif');
  }

  if (discount.start_date && discount.end_date && discount.start_date > discount.end_date) {
    errors.push('Tanggal mulai harus sebelum tanggal berakhir');
  }

  return { valid: errors.length === 0, errors };
}
```

```typescript
// features/discount/logic/useDiscount.ts
import { useState, useCallback } from 'react';
import type { Discount } from '../data/types';
import { calculateDiscount, findBestDiscount } from './calculateDiscount';
import { validateDiscount } from './validateDiscount';

export function useDiscount(discountStore: ReturnType<typeof import('../data/store').createDiscountStore>) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDiscounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await discountStore.getActive();
      setDiscounts(data);
    } finally {
      setLoading(false);
    }
  }, [discountStore]);

  const applyBestDiscount = useCallback((subtotal: number) => {
    return findBestDiscount(discounts, subtotal);
  }, [discounts]);

  const createDiscount = useCallback(async (discount: Omit<Discount, 'id' | 'created_at' | 'updated_at'>) => {
    const validation = validateDiscount(discount);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }
    const id = await discountStore.create(discount);
    await loadDiscounts();
    return id;
  }, [discountStore, loadDiscounts]);

  return {
    discounts,
    loading,
    loadDiscounts,
    applyBestDiscount,
    calculateDiscount,
    createDiscount,
    validateDiscount,
  };
}
```

### Step 5: Create Visual Components (visual/)

```typescript
// features/discount/visual/DiscountBadge.tsx
import { Badge } from '@kasirsolo/ui';
import { formatIDR } from '@kasirsolo/utils';
import type { Discount } from '../data/types';

interface DiscountBadgeProps {
  discount: Discount;
}

export function DiscountBadge({ discount }: DiscountBadgeProps) {
  const label = discount.type === 'percentage'
    ? `${discount.value}% OFF`
    : `${formatIDR(discount.value)} OFF`;

  return (
    <Badge variant="secondary" className="bg-accent text-accent-foreground">
      {label}
    </Badge>
  );
}
```

```typescript
// features/discount/visual/DiscountForm.tsx
import { Input, Button, Select, Label } from '@kasirsolo/ui';
import type { Discount } from '../data/types';
import type { ValidationResult } from '../logic/validateDiscount';

interface DiscountFormProps {
  initialValues?: Partial<Discount>;
  validation?: ValidationResult;
  onSubmit: (data: Partial<Discount>) => void;
  onCancel: () => void;
}

export function DiscountForm({ initialValues, validation, onSubmit, onCancel }: DiscountFormProps) {
  // Form implementation with controlled inputs
  // Shows validation errors from logic layer
  // Calls onSubmit with form data
  return (
    <form>
      {/* Form fields */}
    </form>
  );
}
```

```typescript
// features/discount/visual/DiscountList.tsx
import { Card } from '@kasirsolo/ui';
import type { Discount } from '../data/types';
import { DiscountBadge } from './DiscountBadge';

interface DiscountListProps {
  discounts: Discount[];
  onSelect: (discount: Discount) => void;
  onEdit: (discount: Discount) => void;
  onDelete: (id: string) => void;
}

export function DiscountList({ discounts, onSelect, onEdit, onDelete }: DiscountListProps) {
  // List of discount cards
  return (
    <div className="space-y-2">
      {discounts.map(discount => (
        <Card key={discount.id}>
          {/* Discount details + DiscountBadge + actions */}
        </Card>
      ))}
    </div>
  );
}
```

### Step 6: Create the Barrel Export (index.ts)

```typescript
// features/discount/index.ts

// Types
export type { Discount, DiscountApplication } from './data/types';

// Data
export { createDiscountStore } from './data/store';

// Logic
export { calculateDiscount, findBestDiscount } from './logic/calculateDiscount';
export { validateDiscount } from './logic/validateDiscount';
export { useDiscount } from './logic/useDiscount';

// Visual
export { DiscountBadge } from './visual/DiscountBadge';
export { DiscountForm } from './visual/DiscountForm';
export { DiscountList } from './visual/DiscountList';
```

### Step 7: Use the Feature in a Page

```typescript
// app/(dashboard)/discounts/page.tsx
'use client';

import { useEffect } from 'react';
import { PageHeader } from '@kasirsolo/ui';
import { DiscountList, useDiscount, createDiscountStore } from '@/features/discount';
import { retailDb } from '@kasirsolo/local-db';

const discountStore = createDiscountStore(retailDb);

export default function DiscountsPage() {
  const { discounts, loading, loadDiscounts } = useDiscount(discountStore);

  useEffect(() => {
    loadDiscounts();
  }, [loadDiscounts]);

  return (
    <div>
      <PageHeader title="Diskon" />
      <DiscountList
        discounts={discounts}
        onSelect={(d) => { /* apply to cart */ }}
        onEdit={(d) => { /* open edit form */ }}
        onDelete={(id) => { /* confirm & delete */ }}
      />
    </div>
  );
}
```

---

## Rules of the Pattern

### data/ layer rules:
- Contains types, API calls, store operations
- No React imports (pure TypeScript)
- No business logic calculations
- Only CRUD and query operations

### visual/ layer rules:
- Contains React components only
- Purely presentational (receives data via props)
- No direct data fetching (no API calls, no store access)
- No complex business logic
- Can use `@kasirsolo/ui` primitives

### logic/ layer rules:
- Contains hooks, calculations, validators
- Can use React hooks
- Orchestrates data/ and visual/ layers
- Contains business rules and validation
- Pure functions where possible

### index.ts rules:
- Only exports public API
- Internal types/functions stay unexported
- Consumers import from the feature root: `import { X } from '@/features/discount'`

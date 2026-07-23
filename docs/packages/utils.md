# Package: @kasirsolo/utils

## Overview

The `utils` package provides shared utility functions, constants, validators, and helpers used across all KASIRSOLO apps and packages.

**Path**: `packages/utils/`
**Exports**: Pure functions, constants, validators, formatters

---

## Structure

```
packages/utils/
  src/
    constants/
      apps.ts              # App slugs, names, icons, categories
      plans.ts             # Plan types, labels, features
      roles.ts             # User roles, permissions
      status.ts            # Status labels, colors
      routes.ts            # Common route paths
      regex.ts             # Common regex patterns
    formatters/
      currency.ts          # IDR formatting
      date.ts              # Date/time formatting (Indonesian locale)
      phone.ts             # Phone number formatting
      number.ts            # Number formatting
      string.ts            # String utilities (slugify, truncate, etc.)
    validators/
      email.ts             # Email validation
      phone.ts             # Phone/WhatsApp validation
      license.ts           # License key format validation
      barcode.ts           # Barcode validation
      slug.ts              # URL slug validation
    helpers/
      id.ts                # UUID generation
      receipt.ts           # Receipt number generation
      license-key.ts       # License key generation
      invoice.ts           # Invoice number generation
      device.ts            # Device fingerprint helpers
      error.ts             # Error handling utilities
      retry.ts             # Retry with backoff
      debounce.ts          # Debounce/throttle
      array.ts             # Array utilities (groupBy, sortBy, etc.)
      object.ts            # Object utilities (pick, omit, deepMerge)
    types/
      common.ts            # Shared TypeScript types
      api.ts               # API response types
    index.ts               # Barrel export
  package.json
  tsconfig.json
```

---

## Key Utilities

### Currency Formatting

```typescript
// packages/utils/src/formatters/currency.ts
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// formatIDR(250000) => "Rp250.000"
// formatIDR(1500000) => "Rp1.500.000"

export function formatCompact(amount: number): string {
  if (amount >= 1_000_000) return `Rp${(amount / 1_000_000).toFixed(1)}jt`;
  if (amount >= 1_000) return `Rp${(amount / 1_000).toFixed(0)}rb`;
  return `Rp${amount}`;
}

// formatCompact(250000) => "Rp250rb"
// formatCompact(1500000) => "Rp1.5jt"
```

### Date Formatting

```typescript
// packages/utils/src/formatters/date.ts
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

// formatDate('2026-07-22') => "22 Juli 2026"

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// formatDateTime('2026-07-22T14:30:00') => "22 Jul 2026, 14.30"

export function formatRelative(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Baru saja';
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return formatDate(date);
}
```

### Validators

```typescript
// packages/utils/src/validators/phone.ts
export function isValidIndonesianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return /^(\+62|62|0)8[1-9][0-9]{7,10}$/.test(cleaned);
}

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  if (cleaned.startsWith('+62')) return cleaned.slice(1);
  if (cleaned.startsWith('0')) return '62' + cleaned.slice(1);
  return cleaned;
}

// normalizePhone('0881 6566 935') => '628816566935'
// normalizePhone('+62881-6566-935') => '628816566935'
```

### Constants

```typescript
// packages/utils/src/constants/apps.ts
export const APPS = [
  { slug: 'retail', name: 'Kasir Retail', icon: '🛒', price: 250000, category: 'bisnis' },
  { slug: 'konveksi', name: 'Manajemen Konveksi', icon: '👕', price: 350000, category: 'bisnis' },
  { slug: 'bengkel', name: 'Bengkel + Sparepart', icon: '🔧', price: 400000, category: 'bisnis' },
  { slug: 'masjid', name: 'Manajemen Masjid', icon: '🕌', price: 200000, category: 'institusi' },
  { slug: 'tpa', name: 'Manajemen TPA/TPQ', icon: '📖', price: 200000, category: 'institusi' },
  { slug: 'klinik', name: 'Klinik THT', icon: '🩺', price: 500000, category: 'kesehatan' },
  { slug: 'apotek', name: 'Apotek', icon: '💊', price: 450000, category: 'kesehatan' },
  { slug: 'dapur', name: 'Dapur SPPG', icon: '🍳', price: 300000, category: 'institusi' },
] as const;

export type AppSlug = typeof APPS[number]['slug'];
```

### ID Generation

```typescript
// packages/utils/src/helpers/id.ts
export function generateId(): string {
  return crypto.randomUUID();
}

export function generateReceiptNumber(prefix: string = 'RET'): string {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  return `${prefix}-${datePart}-${seq}`;
}

// generateReceiptNumber('RET') => "RET-20260722-0042"
```

---

## Usage

```typescript
import {
  formatIDR,
  formatDate,
  formatRelative,
  isValidIndonesianPhone,
  normalizePhone,
  generateId,
  generateReceiptNumber,
  APPS,
} from '@kasirsolo/utils';
```

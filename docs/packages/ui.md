# Package: @kasirsolo/ui

## Overview

The `ui` package provides shared React UI components for all KASIRSOLO apps. Built on shadcn/ui + Tailwind CSS, it provides a consistent design system across the platform.

**Path**: `packages/ui/`
**Exports**: React components, Tailwind preset, theme configuration

---

## Structure

```
packages/ui/
  src/
    components/
      primitives/           # Base shadcn/ui components
        button.tsx
        input.tsx
        select.tsx
        dialog.tsx
        dropdown-menu.tsx
        table.tsx
        card.tsx
        badge.tsx
        toast.tsx
        tabs.tsx
        accordion.tsx
        sheet.tsx
        popover.tsx
        command.tsx
        separator.tsx
        skeleton.tsx
        switch.tsx
        textarea.tsx
        label.tsx
        checkbox.tsx
        radio-group.tsx
        avatar.tsx
        tooltip.tsx
        scroll-area.tsx
        calendar.tsx
      composed/             # Platform-specific composed components
        DataTable.tsx        # Data table with pagination, sort, filter
        StatCard.tsx         # Dashboard stat card
        StatusBadge.tsx      # License/transaction status badge
        PriceDisplay.tsx     # Formatted IDR price
        DateRangePicker.tsx  # Date range picker
        ConfirmDialog.tsx    # Confirmation dialog
        SearchInput.tsx      # Debounced search input
        EmptyState.tsx       # Empty state placeholder
        LoadingState.tsx     # Loading skeleton
        AppCard.tsx          # App product card
        LicenseCard.tsx      # License info card
        DeviceCard.tsx       # Device info card
        UserAvatar.tsx       # User avatar with role badge
        WhatsAppButton.tsx   # WhatsApp CTA button
        ReceiptView.tsx      # Receipt display component
        ProductGrid.tsx      # POS product selection grid
        CartPanel.tsx        # POS cart sidebar
        PaymentModal.tsx     # Payment processing modal
      layout/               # Layout components
        AppShell.tsx         # Main app layout (sidebar + content)
        PageHeader.tsx       # Page title + breadcrumb
        Sidebar.tsx          # Navigation sidebar
        MobileNav.tsx        # Mobile navigation
        Footer.tsx           # Footer component
    hooks/
      useMediaQuery.ts       # Responsive breakpoint hook
      useDebounce.ts         # Debounce hook
      useLocalStorage.ts     # localStorage hook
    lib/
      cn.ts                  # className merge utility (clsx + twMerge)
      format.ts              # Number/date formatters
    styles/
      globals.css            # Global styles + Tailwind base
      theme.ts               # Theme tokens (colors, spacing)
    tailwind.preset.ts       # Shared Tailwind preset
    index.ts                 # Barrel export
  package.json
  tsconfig.json
  tailwind.config.ts
```

---

## Theme Configuration

```typescript
// packages/ui/src/styles/theme.ts
export const theme = {
  colors: {
    primary: {
      DEFAULT: '#FF5F1F',
      50: '#FFF3ED',
      100: '#FFE4D4',
      200: '#FFC5A8',
      300: '#FFA071',
      400: '#FF7038',
      500: '#FF5F1F',  // Primary
      600: '#F04006',
      700: '#C73004',
      800: '#9E280C',
      900: '#80240D',
    },
    secondary: {
      DEFAULT: '#F7A237',
      500: '#F7A237',
    },
    accent: {
      DEFAULT: '#FFCE55',
      500: '#FFCE55',
    },
  },
  fontFamily: {
    sans: ['Inter', 'sans-serif'],
  },
};
```

---

## Key Components

### DataTable

Full-featured data table for admin views.

```typescript
import { DataTable } from '@kasirsolo/ui';

<DataTable
  columns={columns}
  data={clients}
  searchKey="name"
  searchPlaceholder="Cari nama klien..."
  pagination={{ pageIndex: 0, pageSize: 10 }}
  onRowClick={(row) => router.push(`/clients/${row.id}`)}
/>
```

### StatusBadge

Color-coded status display.

```typescript
import { StatusBadge } from '@kasirsolo/ui';

<StatusBadge status="active" />    // Green
<StatusBadge status="trial" />     // Blue
<StatusBadge status="expired" />   // Red
<StatusBadge status="suspended" /> // Gray
```

### PriceDisplay

Formatted Indonesian Rupiah display.

```typescript
import { PriceDisplay } from '@kasirsolo/ui';

<PriceDisplay amount={250000} />          // Rp250.000
<PriceDisplay amount={250000} suffix="/bulan" />  // Rp250.000/bulan
```

### WhatsAppButton

Direct WhatsApp link with pre-filled message.

```typescript
import { WhatsAppButton } from '@kasirsolo/ui';

<WhatsAppButton
  phone="628816566935"
  message="Halo, saya ingin bertanya tentang KASIRSOLO"
/>
```

---

## Tailwind Preset

All apps extend the shared Tailwind preset:

```typescript
// packages/ui/tailwind.preset.ts
import type { Config } from 'tailwindcss';
import { theme } from './src/styles/theme';

export default {
  theme: {
    extend: {
      colors: theme.colors,
      fontFamily: theme.fontFamily,
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
} satisfies Partial<Config>;
```

Apps use it:

```typescript
// apps/kasir-retail/tailwind.config.ts
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

---

## Usage

```typescript
import {
  Button,
  Input,
  Card,
  DataTable,
  StatusBadge,
  PriceDisplay,
  AppShell,
  PageHeader,
} from '@kasirsolo/ui';
```

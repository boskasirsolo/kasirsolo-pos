# Kasir Retail (POS App)

## Overview

Kasir Retail is the flagship POS application for retail businesses (toko, warung, minimarket). It is an offline-first Progressive Web App (PWA) that works without internet and syncs to the cloud when connected.

**Path**: `apps/kasir-retail/`
**URL**: `retail.kasirsolo.com`
**Framework**: Next.js 15 (App Router, PWA)
**Auth Required**: Yes (owner/manager/cashier)
**Price**: Rp250.000 (offline), subscription (cloud)

---

## Routes

```
/                           # POS screen (main cashier view)
/login                      # Login (email/password or PIN)
|
/products                   # Product management
/products/new               # Add product
/products/[id]              # Edit product
/products/categories        # Category management
/products/import            # Bulk import (CSV)
|
/sales                      # Sales history
/sales/[id]                 # Sale detail / receipt view
/sales/report               # Sales reports (daily, weekly, monthly)
|
/inventory                  # Stock management
/inventory/adjust           # Stock adjustment
/inventory/low-stock        # Low stock alerts
|
/customers                  # Customer list
/customers/[id]             # Customer detail + purchase history
|
/settings                   # App settings
/settings/store             # Store info (name, address, receipt header)
/settings/printer           # Printer configuration
/settings/tax               # Tax settings
/settings/users             # User management (owner only)
/settings/license           # License info & device management
/settings/sync              # Sync status (cloud plan only)
/settings/backup            # Manual backup/export
```

---

## Features

### POS Screen (`/`)
The main cashier interface. Optimized for speed and touch/keyboard input.

```
+-------------------------------------------+---------------------------+
|  [Search products...]  [Scan Barcode]     |  CART                     |
|                                           |                           |
|  +--------+ +--------+ +--------+         |  Indomie Goreng    x3    |
|  | Prod 1 | | Prod 2 | | Prod 3 |         |    @3.500 = 10.500       |
|  | Rp3500 | | Rp5000 | | Rp2000 |         |  Aqua 600ml       x1    |
|  +--------+ +--------+ +--------+         |    @3.000 =  3.000       |
|  +--------+ +--------+ +--------+         |  Pulpen Pilot      x2   |
|  | Prod 4 | | Prod 5 | | Prod 6 |         |    @5.000 = 10.000       |
|  | Rp8000 | | Rp1500 | | Rp4000 |         |                           |
|  +--------+ +--------+ +--------+         |  Subtotal:   23.500      |
|                                           |  Diskon:          0      |
|  Categories: [All] [Makanan] [Minuman]    |  Total:      23.500      |
|              [ATK] [Sembako]              |                           |
|                                           |  [Cash] [QRIS] [Transfer] |
|                                           |  [Park] [Diskon] [Clear]  |
|                                           |  +---------------------+  |
|                                           |  |    BAYAR Rp23.500   |  |
|                                           |  +---------------------+  |
+-------------------------------------------+---------------------------+
```

- Product grid with category filter
- Search by name, SKU, or barcode
- Barcode scanner integration (camera or USB)
- Cart with quantity +/- controls
- Item-level and cart-level discounts
- Multiple payment methods
- Park/save transaction as draft
- Keyboard shortcuts for fast operation

### Payment Flow

```
1. Tap "BAYAR" button
2. Payment modal:
   - Show total: Rp23.500
   - Payment method: Cash / QRIS / Transfer / E-Wallet
   - If cash: input payment amount, calculate change
   - If digital: reference number input
3. Confirm payment
4. Write to pos_sales + pos_sale_items (IndexedDB)
5. Update pos_products stock (decrement)
6. Write pos_inventory movement (type: out)
7. Queue sync if cloud plan
8. Print receipt (if printer configured)
9. Show receipt on screen
10. Clear cart, ready for next transaction
```

### Product Management
- CRUD products with name, price, cost, stock, barcode, image
- Category assignment
- Bulk import from CSV (name, sku, barcode, price, stock)
- Product image capture via camera
- Print barcode labels (future)

### Sales Reports
- Daily sales summary (today, yesterday, custom date)
- Weekly/monthly aggregations
- Top selling products
- Sales by category
- Sales by payment method
- Sales by cashier
- Export to PDF/Excel/CSV

### Stock Management
- Current stock levels per product
- Stock adjustment (add/subtract with reason)
- Low stock alerts (below min_stock threshold)
- Stock movement history (pos_inventory)

---

## Offline Behavior

### How It Works

1. **Service Worker**: Registered on first visit. Caches all app assets (JS, CSS, images).
2. **IndexedDB**: All data stored locally. No network required for any POS operation.
3. **PWA Install**: Users can install the app to their home screen. Launches in standalone mode.

### What Works Offline

| Feature | Offline | Notes |
|---------|---------|-------|
| POS (ring up sales) | YES | Full functionality |
| Product management | YES | Add/edit/delete products |
| Sales history | YES | View past sales |
| Reports | YES | Generated from local data |
| Stock management | YES | All local |
| Print receipt | YES | Direct Bluetooth/USB |
| Barcode scan | YES | Camera-based |
| Login | YES | Cached credentials + PIN |
| Cloud sync | NO | Queued for when online |
| License validation | PARTIAL | Cached license, periodic online check |

### Sync Behavior (Cloud Plan)

```
ONLINE:
  Every write --> IndexedDB (immediate)
                  --> Sync queue (background)
                  --> Service Worker syncs to Supabase

OFFLINE:
  Every write --> IndexedDB (immediate)
                  --> Sync queue (stored)

BACK ONLINE:
  Service Worker detects connectivity
  --> Process sync queue (FIFO)
  --> Pull remote changes
  --> Merge into local IndexedDB
```

---

## Data Strategy

### Local Data (Primary)

All POS operational data lives in IndexedDB (`pos_retail_v1` database):
- `pos_products` - Product catalog
- `pos_categories` - Product categories
- `pos_inventory` - Stock movements
- `pos_sales` - Sale transactions
- `pos_sale_items` - Sale line items
- `pos_customers` - Customer records
- `pos_cart` - Current cart state
- `pos_drafts` - Parked transactions
- `pos_sync_queue` - Pending sync operations
- `pos_settings` - Local settings (store name, printer config)

### Cloud Data (License & Auth)

Supabase is used only for:
- Authentication (login/logout via Supabase Auth)
- License validation (ksp_licenses, ksp_devices)
- Cloud sync (if cloud plan)

### Data Size Estimates

| Store | Records (typical small shop) | Size |
|-------|------------------------------|------|
| pos_products | 500-2000 | ~1-5 MB |
| pos_sales | 50-100/day, ~30k/year | ~10-30 MB |
| pos_sale_items | ~3x sales | ~30-90 MB |
| pos_inventory | ~2x products | ~1-3 MB |
| pos_customers | 100-500 | ~0.5 MB |
| **Total (1 year)** | | **~50-130 MB** |

IndexedDB can handle this comfortably. Browsers typically allow 50%+ of available disk space.

---

## Receipt Printing

### Supported Printers
- **Bluetooth thermal**: 58mm / 80mm (most common in Indonesia)
- **USB thermal**: Connected via USB-OTG on Android
- **None**: On-screen receipt only

### Receipt Format
```
================================
        TOKO MAJU JAYA
   Jl. Merdeka No. 10, Solo
      Tel: 0271-123456
================================
No: RET-20260722-0001
Tgl: 22/07/2026 14:30:05
Kasir: Ahmad
--------------------------------
Indomie Goreng    3x    10.500
Aqua 600ml        1x     3.000
Pulpen Pilot      2x    10.000
--------------------------------
Subtotal:              23.500
Diskon:                     0
================================
TOTAL:                 23.500
Bayar (Tunai):         25.000
Kembali:                1.500
================================
    Terima kasih atas
    kunjungan Anda!
================================
```

---

## User Roles in Retail POS

| Feature | Owner | Manager | Cashier |
|---------|-------|---------|---------|
| POS (make sales) | Yes | Yes | Yes |
| Void sale | Yes | Yes | No |
| View reports | Yes | Yes | No |
| Manage products | Yes | Yes | No |
| Manage stock | Yes | Yes | No |
| Manage customers | Yes | Yes | Yes (view) |
| App settings | Yes | No | No |
| User management | Yes | No | No |
| License/device | Yes | No | No |

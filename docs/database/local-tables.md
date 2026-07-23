# Local Tables (`pos_*`)

All local tables are stored in IndexedDB via Dexie.js in the user's browser. They use the `pos_` prefix (Point of Sale). Each POS app has its own IndexedDB database, isolated from other apps.

## Database Naming

Each app creates its own IndexedDB database:
```
pos_retail_v1       # Kasir Retail
pos_konveksi_v1     # Manajemen Konveksi
pos_bengkel_v1      # Bengkel + Sparepart
pos_masjid_v1       # Manajemen Masjid
pos_tpa_v1          # Manajemen TPA/TPQ
pos_klinik_v1       # Klinik THT
pos_apotek_v1       # Apotek
pos_dapur_v1        # Dapur SPPG
```

The `_v1` suffix allows database version migration if the schema changes.

---

## Common Stores (All POS Apps)

These stores exist in every POS app's IndexedDB database.

### pos_products

**Purpose**: Product or service catalog. The core data that the POS sells or manages.

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string (UUID) | Primary | Auto-generated unique ID |
| `name` | string | Yes | Product/service name |
| `sku` | string | Yes (unique) | Stock Keeping Unit code |
| `barcode` | string | Yes | Barcode (EAN/UPC) |
| `category_id` | string | Yes | FK to pos_categories |
| `price` | number | No | Selling price (IDR) |
| `cost` | number | No | Cost/purchase price (IDR) |
| `stock` | number | No | Current stock quantity |
| `min_stock` | number | No | Minimum stock alert threshold |
| `unit` | string | No | Unit of measure (pcs, kg, ltr, etc.) |
| `image_url` | string | No | Product image (base64 or URL) |
| `is_active` | boolean | Yes | Whether available for sale |
| `metadata` | object | No | Extra data (varies per app) |
| `created_at` | string (ISO) | Yes | Creation timestamp |
| `updated_at` | string (ISO) | Yes | Last modification |
| `synced_at` | string (ISO) | Yes | Last sync to cloud (null if never) |

**Dexie schema**: `++id, name, sku, barcode, category_id, is_active, created_at, updated_at, synced_at`

---

### pos_categories

**Purpose**: Product grouping/categories.

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string (UUID) | Primary | Auto-generated unique ID |
| `name` | string | Yes | Category name |
| `parent_id` | string | Yes | Parent category (for nesting) |
| `icon` | string | No | Category icon |
| `color` | string | No | Category color (hex) |
| `sort_order` | number | No | Display ordering |
| `is_active` | boolean | Yes | Active status |
| `created_at` | string (ISO) | No | Creation timestamp |
| `updated_at` | string (ISO) | No | Last modification |
| `synced_at` | string (ISO) | Yes | Last sync timestamp |

**Dexie schema**: `++id, name, parent_id, is_active, synced_at`

---

### pos_inventory

**Purpose**: Stock movement history. Every stock change is recorded.

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string (UUID) | Primary | Auto-generated unique ID |
| `product_id` | string | Yes | FK to pos_products |
| `type` | string | Yes | in / out / adjustment / return |
| `quantity` | number | No | Change quantity (positive) |
| `before_stock` | number | No | Stock before change |
| `after_stock` | number | No | Stock after change |
| `reference_type` | string | No | sale / purchase / manual / return |
| `reference_id` | string | Yes | FK to related record |
| `note` | string | No | Reason/description |
| `created_at` | string (ISO) | Yes | Movement timestamp |
| `synced_at` | string (ISO) | Yes | Last sync timestamp |

**Dexie schema**: `++id, product_id, type, reference_id, created_at, synced_at`

---

### pos_sales

**Purpose**: Completed sale transactions (receipts).

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string (UUID) | Primary | Auto-generated unique ID |
| `receipt_number` | string | Yes (unique) | Sequential receipt number |
| `customer_id` | string | Yes | FK to pos_customers (optional) |
| `user_id` | string | Yes | Cashier/user who made the sale |
| `subtotal` | number | No | Sum of items before discount/tax |
| `discount` | number | No | Total discount applied |
| `tax` | number | No | Total tax applied |
| `total` | number | No | Final amount |
| `payment_method` | string | Yes | cash / transfer / ewallet / qris |
| `payment_amount` | number | No | Amount paid |
| `change_amount` | number | No | Change returned |
| `status` | string | Yes | completed / voided / returned |
| `note` | string | No | Sale notes |
| `created_at` | string (ISO) | Yes | Sale timestamp |
| `synced_at` | string (ISO) | Yes | Last sync timestamp |

**Dexie schema**: `++id, receipt_number, customer_id, user_id, payment_method, status, created_at, synced_at`

---

### pos_sale_items

**Purpose**: Line items for each sale transaction.

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string (UUID) | Primary | Auto-generated unique ID |
| `sale_id` | string | Yes | FK to pos_sales |
| `product_id` | string | Yes | FK to pos_products |
| `product_name` | string | No | Snapshot of product name at sale time |
| `quantity` | number | No | Quantity sold |
| `unit_price` | number | No | Price per unit at sale time |
| `discount` | number | No | Item-level discount |
| `subtotal` | number | No | quantity * unit_price - discount |
| `note` | string | No | Item notes |
| `created_at` | string (ISO) | No | Creation timestamp |

**Dexie schema**: `++id, sale_id, product_id`

---

### pos_customers

**Purpose**: Local customer records for the business.

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string (UUID) | Primary | Auto-generated unique ID |
| `name` | string | Yes | Customer name |
| `phone` | string | Yes | Phone number |
| `email` | string | Yes | Email address |
| `address` | string | No | Full address |
| `note` | string | No | Notes about customer |
| `total_transactions` | number | No | Running count of purchases |
| `total_spent` | number | No | Running total amount spent |
| `is_active` | boolean | Yes | Active status |
| `created_at` | string (ISO) | Yes | Creation timestamp |
| `updated_at` | string (ISO) | No | Last modification |
| `synced_at` | string (ISO) | Yes | Last sync timestamp |

**Dexie schema**: `++id, name, phone, email, is_active, created_at, synced_at`

---

### pos_cart

**Purpose**: Current cart state. Ephemeral data, not synced to cloud.

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string | Primary | Fixed key: `current` (singleton) |
| `items` | array | No | Array of cart items with product_id, quantity, price |
| `customer_id` | string | No | Selected customer |
| `discount` | number | No | Cart-level discount |
| `note` | string | No | Cart note |
| `updated_at` | string (ISO) | No | Last modification |

**Dexie schema**: `id`

This store typically holds a single record (`id: 'current'`). Cart state is overwritten, not appended.

---

### pos_drafts

**Purpose**: Saved/parked transactions that were not completed. Not synced to cloud.

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string (UUID) | Primary | Auto-generated unique ID |
| `name` | string | No | Draft label (e.g., "Meja 3") |
| `items` | array | No | Snapshot of cart items |
| `customer_id` | string | Yes | Selected customer |
| `discount` | number | No | Applied discount |
| `note` | string | No | Draft note |
| `created_at` | string (ISO) | Yes | When parked |
| `updated_at` | string (ISO) | No | Last modified |

**Dexie schema**: `++id, customer_id, created_at`

---

### pos_sync_queue

**Purpose**: Queue of pending sync operations. Processed by the Service Worker when online.

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string (UUID) | Primary | Auto-generated unique ID |
| `operation` | string | Yes | create / update / delete |
| `store_name` | string | Yes | Target store (e.g., `pos_products`) |
| `record_id` | string | Yes | ID of the affected record |
| `payload` | object | No | Full record data to sync |
| `attempts` | number | No | Number of sync attempts |
| `last_error` | string | No | Last error message |
| `status` | string | Yes | pending / processing / completed / failed |
| `created_at` | string (ISO) | Yes | When queued |

**Dexie schema**: `++id, operation, store_name, record_id, status, created_at`

---

### pos_settings

**Purpose**: Local app settings. Not synced to cloud.

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `key` | string | Primary | Setting key |
| `value` | any | No | Setting value (any JSON-serializable type) |

**Dexie schema**: `key`

**Common keys**:
- `store_name` - Business name to display on receipts
- `store_address` - Business address for receipts
- `store_phone` - Business phone for receipts
- `receipt_header` - Custom receipt header text
- `receipt_footer` - Custom receipt footer text
- `tax_rate` - Default tax rate (0-100)
- `currency` - Currency code (default: IDR)
- `printer_type` - bluetooth / usb / none
- `printer_address` - Bluetooth MAC or USB device ID
- `theme` - light / dark / system
- `language` - id / en
- `last_sync_at` - Timestamp of last successful sync
- `license_key` - Cached license key for offline validation

---

## App-Specific Stores

Some apps have additional stores specific to their domain.

### Bengkel: pos_vehicles

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string (UUID) | Primary | Vehicle ID |
| `customer_id` | string | Yes | FK to pos_customers |
| `plate_number` | string | Yes (unique) | License plate (e.g., AD 1234 AB) |
| `brand` | string | Yes | Vehicle brand (Honda, Toyota, etc.) |
| `model` | string | No | Vehicle model |
| `year` | number | No | Manufacturing year |
| `color` | string | No | Vehicle color |
| `vin` | string | Yes | Vehicle Identification Number |
| `notes` | string | No | Maintenance notes |
| `created_at` | string (ISO) | Yes | Creation timestamp |
| `synced_at` | string (ISO) | Yes | Sync timestamp |

### Bengkel: pos_service_orders

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string (UUID) | Primary | Service order ID |
| `vehicle_id` | string | Yes | FK to pos_vehicles |
| `customer_id` | string | Yes | FK to pos_customers |
| `mechanic_id` | string | Yes | Assigned mechanic user ID |
| `status` | string | Yes | pending / in_progress / completed / cancelled |
| `items` | array | No | Service items and parts used |
| `total` | number | No | Total cost |
| `note` | string | No | Service notes |
| `started_at` | string (ISO) | No | When service started |
| `completed_at` | string (ISO) | No | When service completed |
| `created_at` | string (ISO) | Yes | Creation timestamp |
| `synced_at` | string (ISO) | Yes | Sync timestamp |

### Apotek: pos_prescriptions

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string (UUID) | Primary | Prescription ID |
| `customer_id` | string | Yes | FK to pos_customers |
| `doctor_name` | string | No | Prescribing doctor |
| `items` | array | No | Prescribed medications |
| `status` | string | Yes | pending / dispensed / partial |
| `sale_id` | string | Yes | FK to pos_sales when dispensed |
| `note` | string | No | Pharmacist notes |
| `created_at` | string (ISO) | Yes | Creation timestamp |
| `synced_at` | string (ISO) | Yes | Sync timestamp |

### Klinik: pos_patients

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string (UUID) | Primary | Patient ID |
| `medical_record_number` | string | Yes (unique) | MR number |
| `name` | string | Yes | Patient name |
| `date_of_birth` | string | No | Date of birth |
| `gender` | string | No | male / female |
| `phone` | string | Yes | Phone |
| `address` | string | No | Address |
| `allergies` | array | No | Known allergies |
| `created_at` | string (ISO) | Yes | Registration date |
| `synced_at` | string (ISO) | Yes | Sync timestamp |

### Klinik: pos_medical_records

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string (UUID) | Primary | Record ID |
| `patient_id` | string | Yes | FK to pos_patients |
| `doctor_id` | string | Yes | Attending doctor user ID |
| `diagnosis` | string | No | Diagnosis text |
| `icd_code` | string | Yes | ICD-10 diagnosis code |
| `treatment` | string | No | Treatment description |
| `prescription` | array | No | Prescribed medications |
| `notes` | string | No | Clinical notes |
| `visit_date` | string (ISO) | Yes | Visit date |
| `created_at` | string (ISO) | Yes | Record creation |
| `synced_at` | string (ISO) | Yes | Sync timestamp |

### Masjid: pos_donations

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string (UUID) | Primary | Donation ID |
| `donor_name` | string | Yes | Donor name (anonymous OK) |
| `type` | string | Yes | infaq / sedekah / zakat / wakaf |
| `amount` | number | No | Donation amount |
| `payment_method` | string | No | cash / transfer |
| `note` | string | No | Purpose/notes |
| `created_at` | string (ISO) | Yes | Donation date |
| `synced_at` | string (ISO) | Yes | Sync timestamp |

### TPA: pos_students

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string (UUID) | Primary | Student ID |
| `name` | string | Yes | Student name |
| `parent_name` | string | No | Parent/guardian name |
| `parent_phone` | string | Yes | Parent phone |
| `class` | string | Yes | Class/group name |
| `enrollment_date` | string (ISO) | No | Enrollment date |
| `is_active` | boolean | Yes | Active student |
| `created_at` | string (ISO) | Yes | Registration date |
| `synced_at` | string (ISO) | Yes | Sync timestamp |

### TPA: pos_hafalan

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string (UUID) | Primary | Record ID |
| `student_id` | string | Yes | FK to pos_students |
| `surah` | string | Yes | Surah name/number |
| `ayat_from` | number | No | Starting ayat |
| `ayat_to` | number | No | Ending ayat |
| `grade` | string | No | Assessment grade |
| `teacher_id` | string | Yes | Assessing teacher user ID |
| `note` | string | No | Teacher notes |
| `assessed_at` | string (ISO) | Yes | Assessment date |
| `synced_at` | string (ISO) | Yes | Sync timestamp |

### Dapur: pos_menus

| Field | Type | Indexed | Description |
|-------|------|---------|-------------|
| `id` | string (UUID) | Primary | Menu ID |
| `date` | string (ISO date) | Yes | Menu date |
| `meal_type` | string | Yes | breakfast / lunch / dinner / snack |
| `items` | array | No | Menu items with portions |
| `total_portions` | number | No | Total portions planned |
| `nutrition` | object | No | Calculated nutrition info |
| `status` | string | Yes | planned / prepared / served |
| `note` | string | No | Menu notes |
| `created_at` | string (ISO) | Yes | Creation timestamp |
| `synced_at` | string (ISO) | Yes | Sync timestamp |

---

## Dexie.js Database Definition Example

```typescript
// packages/local-db/src/databases/retail.ts
import Dexie, { Table } from 'dexie';

export class RetailDatabase extends Dexie {
  products!: Table;
  categories!: Table;
  inventory!: Table;
  sales!: Table;
  saleItems!: Table;
  customers!: Table;
  cart!: Table;
  drafts!: Table;
  syncQueue!: Table;
  settings!: Table;

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

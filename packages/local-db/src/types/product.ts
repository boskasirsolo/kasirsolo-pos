/**
 * PosProduct represents a product in the local POS system.
 */
export interface PosProduct {
  /** UUID primary key */
  id: string;
  /** Product barcode / SKU */
  barcode: string | null;
  /** Product display name */
  name: string;
  /** FK to PosCategory.id */
  category_id: string | null;
  /** Selling price in IDR */
  price: number;
  /** Cost price in IDR */
  cost_price: number;
  /** Current stock quantity */
  stock: number;
  /** Minimum stock threshold for alerts */
  min_stock: number;
  /** Unit of measurement (e.g. "pcs", "kg", "liter") */
  unit: string;
  /** Product image URL or base64 */
  image: string | null;
  /** Whether this product is active and visible */
  is_active: boolean;
  /** Whether this product tracks stock */
  track_stock: boolean;
  /** Optional notes */
  notes: string | null;
  /** Record creation timestamp (ISO string) */
  created_at: string;
  /** Record last update timestamp (ISO string) */
  updated_at: string;
  /** Sync status with server */
  sync_status: SyncStatus;
}

export type SyncStatus = "synced" | "pending" | "conflict";

import type { SyncStatus } from "./product";

/**
 * PosStockAdjustment represents a manual stock adjustment entry.
 */
export interface PosStockAdjustment {
  /** UUID primary key */
  id: string;
  /** FK to PosProduct.id */
  product_id: string;
  /** Product name snapshot */
  product_name: string;
  /** Adjustment type */
  type: StockAdjustmentType;
  /** Quantity adjusted (positive = increase, negative = decrease) */
  quantity: number;
  /** Stock before adjustment */
  stock_before: number;
  /** Stock after adjustment */
  stock_after: number;
  /** Reason for adjustment */
  reason: string;
  /** ID of the user who made the adjustment */
  adjusted_by: string | null;
  /** Adjustment timestamp (ISO string) */
  created_at: string;
  /** Sync status with server */
  sync_status: SyncStatus;
}

export type StockAdjustmentType =
  | "purchase"
  | "sale"
  | "return"
  | "damaged"
  | "lost"
  | "correction"
  | "transfer_in"
  | "transfer_out";

import type { SyncStatus } from "./product";

/**
 * PosTransaction represents a completed POS transaction (sale).
 */
export interface PosTransaction {
  /** UUID primary key */
  id: string;
  /** Human-readable transaction number (e.g. "TRX-20260722-001") */
  transaction_number: string;
  /** Transaction items */
  items: PosTransactionItem[];
  /** Total before discount */
  subtotal: number;
  /** Discount amount applied */
  discount_amount: number;
  /** Discount type */
  discount_type: "fixed" | "percentage" | null;
  /** Discount raw value (e.g. 10 for 10% or 5000 for Rp 5.000) */
  discount_value: number;
  /** Tax amount */
  tax_amount: number;
  /** Tax percentage (e.g. 11 for PPN 11%) */
  tax_percentage: number;
  /** Final total after discount and tax */
  total: number;
  /** Amount paid by customer */
  amount_paid: number;
  /** Change returned to customer */
  change: number;
  /** Payment method used */
  payment_method: PosPaymentMethod;
  /** Payment reference (e.g. QRIS ID, card last 4) */
  payment_ref: string | null;
  /** ID of the cashier user */
  cashier_id: string | null;
  /** Name of the cashier */
  cashier_name: string | null;
  /** Customer name (optional) */
  customer_name: string | null;
  /** Customer phone (optional) */
  customer_phone: string | null;
  /** Transaction notes */
  notes: string | null;
  /** Whether this transaction was voided/refunded */
  is_void: boolean;
  /** Reason for voiding */
  void_reason: string | null;
  /** Transaction timestamp (ISO string) */
  created_at: string;
  /** Sync status with server */
  sync_status: SyncStatus;
}

/**
 * PosTransactionItem represents a line item within a transaction.
 */
export interface PosTransactionItem {
  /** FK to PosProduct.id */
  product_id: string;
  /** Product name snapshot (denormalized for receipt) */
  product_name: string;
  /** Product barcode snapshot */
  barcode: string | null;
  /** Quantity sold */
  quantity: number;
  /** Unit price at time of sale */
  unit_price: number;
  /** Line item discount */
  discount: number;
  /** Line total (quantity * unit_price - discount) */
  total: number;
}

export type PosPaymentMethod = "cash" | "qris" | "debit" | "credit" | "transfer" | "ewallet" | "other";

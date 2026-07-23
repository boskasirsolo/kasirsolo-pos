import type { PosTransactionItem, PosPaymentMethod } from "./transaction";

/**
 * PosReceipt represents receipt data for printing or digital display.
 */
export interface PosReceipt {
  /** UUID primary key (same as transaction ID) */
  id: string;
  /** Transaction number */
  transaction_number: string;
  /** Store/business name */
  store_name: string;
  /** Store address */
  store_address: string | null;
  /** Store phone */
  store_phone: string | null;
  /** Transaction items */
  items: PosTransactionItem[];
  /** Subtotal */
  subtotal: number;
  /** Discount description text */
  discount_label: string | null;
  /** Discount amount */
  discount_amount: number;
  /** Tax label (e.g. "PPN 11%") */
  tax_label: string | null;
  /** Tax amount */
  tax_amount: number;
  /** Grand total */
  total: number;
  /** Amount paid */
  amount_paid: number;
  /** Change returned */
  change: number;
  /** Payment method */
  payment_method: PosPaymentMethod;
  /** Cashier name */
  cashier_name: string | null;
  /** Customer name */
  customer_name: string | null;
  /** Footer message (e.g. "Terima kasih!") */
  footer_message: string | null;
  /** Transaction timestamp (ISO string) */
  created_at: string;
  /** Receipt format */
  format: "thermal_58mm" | "thermal_80mm" | "a4" | "digital";
}

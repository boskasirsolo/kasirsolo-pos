import { get, put, query } from "../engine";
import type { PosTransaction, PosTransactionItem } from "../types/transaction";
import type { SyncStatus } from "../types/product";
import { updateProductStock, getProductById } from "./products";

/**
 * Get all transactions, optionally filtered by date range.
 */
export async function getTransactions(options?: {
  startDate?: string;
  endDate?: string;
  cashierId?: string;
  paymentMethod?: string;
  limit?: number;
  offset?: number;
}): Promise<PosTransaction[]> {
  const { startDate, endDate, cashierId, paymentMethod, limit, offset } = options ?? {};

  if (startDate || endDate) {
    const lower = startDate ?? "";
    const upper = endDate ?? "\uffff";
    const range = IDBKeyRange.bound(lower, upper);

    let results = await query("transactions", {
      indexName: "by-date",
      range,
      direction: "prev",
      limit,
      offset,
    });

    if (cashierId) results = results.filter((t) => t.cashier_id === cashierId);
    if (paymentMethod) results = results.filter((t) => t.payment_method === paymentMethod);

    return results;
  }

  let results = await query("transactions", {
    direction: "prev",
    limit,
    offset,
  });

  if (cashierId) results = results.filter((t) => t.cashier_id === cashierId);
  if (paymentMethod) results = results.filter((t) => t.payment_method === paymentMethod);

  return results;
}

/**
 * Get a single transaction by ID.
 */
export async function getTransactionById(id: string): Promise<PosTransaction | undefined> {
  return get("transactions", id);
}

/**
 * Generate a new transaction number for today.
 * Format: TRX-YYYYMMDD-NNN
 */
export async function generateTransactionNumber(): Promise<string> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `TRX-${dateStr}-`;

  // Get today's transactions to determine next number
  const todayStart = now.toISOString().slice(0, 10) + "T00:00:00.000Z";
  const todayEnd = now.toISOString().slice(0, 10) + "T23:59:59.999Z";
  const range = IDBKeyRange.bound(todayStart, todayEnd);

  const todayTxns = await query("transactions", {
    indexName: "by-date",
    range,
  });

  const nextNum = todayTxns.length + 1;
  return `${prefix}${String(nextNum).padStart(3, "0")}`;
}

/**
 * Create a new transaction and update product stock accordingly.
 */
export async function createTransaction(
  transaction: Omit<PosTransaction, "transaction_number" | "created_at" | "sync_status">
): Promise<PosTransaction> {
  const transactionNumber = await generateTransactionNumber();

  const record: PosTransaction = {
    ...transaction,
    transaction_number: transactionNumber,
    created_at: new Date().toISOString(),
    sync_status: "pending" as SyncStatus,
  };

  // Deduct stock for each item
  for (const item of record.items) {
    const product = await getProductById(item.product_id);
    if (product && product.track_stock) {
      await updateProductStock(item.product_id, product.stock - item.quantity);
    }
  }

  await put("transactions", record);
  return record;
}

/**
 * Void a transaction and restore stock.
 */
export async function voidTransaction(
  transactionId: string,
  reason: string
): Promise<PosTransaction> {
  const transaction = await get("transactions", transactionId);
  if (!transaction) throw new Error(`Transaction not found: ${transactionId}`);
  if (transaction.is_void) throw new Error("Transaction already voided");

  // Restore stock
  for (const item of transaction.items) {
    const product = await getProductById(item.product_id);
    if (product && product.track_stock) {
      await updateProductStock(item.product_id, product.stock + item.quantity);
    }
  }

  const voided: PosTransaction = {
    ...transaction,
    is_void: true,
    void_reason: reason,
    sync_status: "pending",
  };

  await put("transactions", voided);
  return voided;
}

/**
 * Calculate transaction totals from items and discount/tax settings.
 */
export function calculateTransactionTotals(
  items: PosTransactionItem[],
  options?: {
    discountType?: "fixed" | "percentage" | null;
    discountValue?: number;
    taxPercentage?: number;
  }
): {
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const { discountType, discountValue = 0, taxPercentage = 0 } = options ?? {};

  let discount_amount = 0;
  if (discountType === "fixed") {
    discount_amount = discountValue;
  } else if (discountType === "percentage") {
    discount_amount = Math.round(subtotal * (discountValue / 100));
  }

  const afterDiscount = subtotal - discount_amount;
  const tax_amount = Math.round(afterDiscount * (taxPercentage / 100));
  const total = afterDiscount + tax_amount;

  return { subtotal, discount_amount, tax_amount, total };
}

/**
 * Get today's transaction summary.
 */
export async function getTodaySummary(): Promise<{
  count: number;
  total: number;
  voidCount: number;
}> {
  const now = new Date();
  const todayStart = now.toISOString().slice(0, 10) + "T00:00:00.000Z";
  const todayEnd = now.toISOString().slice(0, 10) + "T23:59:59.999Z";
  const range = IDBKeyRange.bound(todayStart, todayEnd);

  const transactions = await query("transactions", {
    indexName: "by-date",
    range,
  });

  const active = transactions.filter((t) => !t.is_void);
  const voidCount = transactions.filter((t) => t.is_void).length;

  return {
    count: active.length,
    total: active.reduce((sum, t) => sum + t.total, 0),
    voidCount,
  };
}

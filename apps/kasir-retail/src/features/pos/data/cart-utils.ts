import type { CartItem, CartState, EMPTY_CART } from "./types";
import type { PosProduct, PosTransactionItem } from "@/lib/db";

/**
 * Add a product to the cart. If it already exists, increment quantity.
 */
export function addToCart(items: CartItem[], product: PosProduct, qty: number = 1): CartItem[] {
  const existing = items.find((item) => item.productId === product.id);

  if (existing) {
    return items.map((item) =>
      item.productId === product.id
        ? {
            ...item,
            quantity: item.quantity + qty,
            total: (item.quantity + qty) * item.price - item.discount,
          }
        : item
    );
  }

  const newItem: CartItem = {
    productId: product.id,
    name: product.name,
    barcode: product.barcode,
    price: product.price,
    costPrice: product.cost_price,
    quantity: qty,
    discount: 0,
    total: qty * product.price,
  };

  return [...items, newItem];
}

/**
 * Remove an item from the cart by product ID.
 */
export function removeFromCart(items: CartItem[], productId: string): CartItem[] {
  return items.filter((item) => item.productId !== productId);
}

/**
 * Update the quantity of a cart item. If qty <= 0, remove the item.
 */
export function updateQty(items: CartItem[], productId: string, qty: number): CartItem[] {
  if (qty <= 0) {
    return removeFromCart(items, productId);
  }

  return items.map((item) =>
    item.productId === productId
      ? {
          ...item,
          quantity: qty,
          total: qty * item.price - item.discount,
        }
      : item
  );
}

/**
 * Apply a per-item discount.
 */
export function applyItemDiscount(
  items: CartItem[],
  productId: string,
  discount: number
): CartItem[] {
  return items.map((item) =>
    item.productId === productId
      ? {
          ...item,
          discount,
          total: item.quantity * item.price - discount,
        }
      : item
  );
}

/**
 * Calculate the totals for a cart state.
 */
export function calculateTotals(
  items: CartItem[],
  options: {
    discountType: "fixed" | "percentage" | null;
    discountValue: number;
    taxEnabled: boolean;
    taxPercentage: number;
  }
): {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
} {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  let discountAmount = 0;
  if (options.discountType === "fixed") {
    discountAmount = Math.min(options.discountValue, subtotal);
  } else if (options.discountType === "percentage") {
    discountAmount = Math.round(subtotal * (options.discountValue / 100));
  }

  const afterDiscount = subtotal - discountAmount;

  let taxAmount = 0;
  if (options.taxEnabled && options.taxPercentage > 0) {
    taxAmount = Math.round(afterDiscount * (options.taxPercentage / 100));
  }

  const total = afterDiscount + taxAmount;

  return { subtotal, discountAmount, taxAmount, total };
}

/**
 * Calculate change from payment.
 */
export function calculateChange(total: number, amountPaid: number): number {
  return Math.max(0, amountPaid - total);
}

/**
 * Convert cart items to transaction items (for saving to IndexedDB).
 */
export function cartToTransactionItems(items: CartItem[]): PosTransactionItem[] {
  return items.map((item) => ({
    product_id: item.productId,
    product_name: item.name,
    barcode: item.barcode,
    quantity: item.quantity,
    unit_price: item.price,
    discount: item.discount,
    total: item.total,
  }));
}

/**
 * Get total item count in the cart.
 */
export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Check if the cart is empty.
 */
export function isCartEmpty(items: CartItem[]): boolean {
  return items.length === 0;
}

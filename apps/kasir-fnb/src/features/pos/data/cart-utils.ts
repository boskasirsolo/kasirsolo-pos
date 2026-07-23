import type { FnbCartItem, FnbCartState, SplitDetail, SplitBillMode } from "./types";

/**
 * Menu item from IndexedDB (simplified for cart operations).
 */
export interface MenuItemForCart {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category_id: string;
  is_available: boolean;
}

/**
 * Add a menu item to the cart. If it already exists (same item + same modifiers), increment quantity.
 */
export function addToCart(
  items: FnbCartItem[],
  menuItem: MenuItemForCart,
  qty: number = 1,
  modifiers: FnbCartItem["modifiers"] = [],
  notes: string | null = null
): FnbCartItem[] {
  const modifiersTotal = modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0);
  const modKey = modifiers.map((m) => `${m.id}:${m.option}`).sort().join("|");

  const existing = items.find(
    (item) =>
      item.menuItemId === menuItem.id &&
      item.modifiers.map((m) => `${m.id}:${m.option}`).sort().join("|") === modKey
  );

  if (existing) {
    return items.map((item) =>
      item === existing
        ? {
            ...item,
            quantity: item.quantity + qty,
            total: (item.quantity + qty) * (item.price + item.modifiersTotal) - item.discount,
          }
        : item
    );
  }

  const newItem: FnbCartItem = {
    menuItemId: menuItem.id,
    name: menuItem.name,
    price: menuItem.price,
    quantity: qty,
    discount: 0,
    modifiers,
    modifiersTotal,
    notes,
    total: qty * (menuItem.price + modifiersTotal),
  };

  return [...items, newItem];
}

/**
 * Remove an item from the cart by index.
 */
export function removeFromCart(items: FnbCartItem[], index: number): FnbCartItem[] {
  return items.filter((_, i) => i !== index);
}

/**
 * Update the quantity of a cart item by index.
 */
export function updateQty(items: FnbCartItem[], index: number, qty: number): FnbCartItem[] {
  if (qty <= 0) {
    return removeFromCart(items, index);
  }

  return items.map((item, i) =>
    i === index
      ? {
          ...item,
          quantity: qty,
          total: qty * (item.price + item.modifiersTotal) - item.discount,
        }
      : item
  );
}

/**
 * Apply a per-item discount by index.
 */
export function applyItemDiscount(
  items: FnbCartItem[],
  index: number,
  discount: number
): FnbCartItem[] {
  return items.map((item, i) =>
    i === index
      ? {
          ...item,
          discount,
          total: item.quantity * (item.price + item.modifiersTotal) - discount,
        }
      : item
  );
}

/**
 * Calculate the totals for a cart state.
 */
export function calculateFnbTotals(
  items: FnbCartItem[],
  options: {
    discountType: "fixed" | "percentage" | null;
    discountValue: number;
    taxEnabled: boolean;
    taxPercentage: number;
    serviceChargeEnabled: boolean;
    serviceChargePercentage: number;
  }
): {
  subtotal: number;
  discountAmount: number;
  serviceChargeAmount: number;
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

  let serviceChargeAmount = 0;
  if (options.serviceChargeEnabled && options.serviceChargePercentage > 0) {
    serviceChargeAmount = Math.round(afterDiscount * (options.serviceChargePercentage / 100));
  }

  const beforeTax = afterDiscount + serviceChargeAmount;

  let taxAmount = 0;
  if (options.taxEnabled && options.taxPercentage > 0) {
    taxAmount = Math.round(beforeTax * (options.taxPercentage / 100));
  }

  const total = beforeTax + taxAmount;

  return { subtotal, discountAmount, serviceChargeAmount, taxAmount, total };
}

/**
 * Calculate change from payment.
 */
export function calculateChange(total: number, amountPaid: number): number {
  return Math.max(0, amountPaid - total);
}

/**
 * Split bill equally among N people.
 */
export function splitBillEqual(total: number, count: number): SplitDetail[] {
  if (count <= 1) return [];
  const perPerson = Math.ceil(total / count);
  const lastPerson = total - perPerson * (count - 1);

  return Array.from({ length: count }, (_, i) => ({
    label: `Bagian ${i + 1}`,
    items: [],
    amount: i === count - 1 ? lastPerson : perPerson,
    paid: false,
    method: "cash" as const,
  }));
}

/**
 * Split bill by items - assign items to different groups.
 */
export function splitBillByItem(
  items: FnbCartItem[],
  assignments: Map<number, number>
): SplitDetail[] {
  const groups = new Map<number, FnbCartItem[]>();

  items.forEach((item, index) => {
    const group = assignments.get(index) ?? 0;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push(item);
  });

  return Array.from(groups.entries()).map(([groupIdx, groupItems]) => ({
    label: `Bagian ${groupIdx + 1}`,
    items: groupItems,
    amount: groupItems.reduce((sum, item) => sum + item.total, 0),
    paid: false,
    method: "cash" as const,
  }));
}

/**
 * Get total item count in the cart.
 */
export function getCartItemCount(items: FnbCartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Check if the cart is empty.
 */
export function isCartEmpty(items: FnbCartItem[]): boolean {
  return items.length === 0;
}

// ────────────────────────────────────────────────────────────
// FnB POS types
// ────────────────────────────────────────────────────────────

export type OrderType = "dine_in" | "takeaway" | "delivery";
export type FnbPaymentMethod = "cash" | "qris" | "debit" | "transfer" | "ewallet" | "gofood" | "grabfood" | "shopeefood" | "other";
export type KitchenStatus = "pending" | "sent" | "preparing" | "ready" | "served";
export type SplitBillMode = "equal" | "by_item";

export interface MenuItemModifier {
  id: string;
  name: string;
  option: string;
  priceAdjustment: number;
}

export interface FnbCartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  discount: number;
  modifiers: MenuItemModifier[];
  modifiersTotal: number;
  notes: string | null;
  total: number;
}

export interface FnbCartState {
  items: FnbCartItem[];
  orderType: OrderType;
  tableId: string | null;
  tableNumber: number | null;
  queueNumber: number | null;
  subtotal: number;
  discountType: "fixed" | "percentage" | null;
  discountValue: number;
  discountAmount: number;
  taxEnabled: boolean;
  taxPercentage: number;
  taxAmount: number;
  serviceChargeEnabled: boolean;
  serviceChargePercentage: number;
  serviceChargeAmount: number;
  total: number;
  customerName: string | null;
  customerPhone: string | null;
  deliveryPlatform: string | null;
  notes: string | null;
  isHeld: boolean;
  kitchenStatus: KitchenStatus;
}

export interface FnbPaymentState {
  method: FnbPaymentMethod;
  amountPaid: number;
  change: number;
  paymentRef: string | null;
  splitMode: SplitBillMode | null;
  splitCount: number;
  splitDetails: SplitDetail[];
  isProcessing: boolean;
  isComplete: boolean;
}

export interface SplitDetail {
  label: string;
  items: FnbCartItem[];
  amount: number;
  paid: boolean;
  method: FnbPaymentMethod;
}

export const EMPTY_FNB_CART: FnbCartState = {
  items: [],
  orderType: "dine_in",
  tableId: null,
  tableNumber: null,
  queueNumber: null,
  subtotal: 0,
  discountType: null,
  discountValue: 0,
  discountAmount: 0,
  taxEnabled: true,
  taxPercentage: 11,
  taxAmount: 0,
  serviceChargeEnabled: false,
  serviceChargePercentage: 5,
  serviceChargeAmount: 0,
  total: 0,
  customerName: null,
  customerPhone: null,
  deliveryPlatform: null,
  notes: null,
  isHeld: false,
  kitchenStatus: "pending",
};

export const INITIAL_FNB_PAYMENT: FnbPaymentState = {
  method: "cash",
  amountPaid: 0,
  change: 0,
  paymentRef: null,
  splitMode: null,
  splitCount: 2,
  splitDetails: [],
  isProcessing: false,
  isComplete: false,
};

export const FNB_PAYMENT_METHODS: { value: FnbPaymentMethod; label: string; icon: string }[] = [
  { value: "cash", label: "Tunai", icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" },
  { value: "qris", label: "QRIS", icon: "M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" },
  { value: "debit", label: "Debit", icon: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" },
  { value: "transfer", label: "Transfer", icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" },
  { value: "ewallet", label: "E-Wallet", icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" },
  { value: "gofood", label: "GoFood", icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" },
  { value: "grabfood", label: "GrabFood", icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" },
  { value: "shopeefood", label: "ShopeeFood", icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" },
];

export const ORDER_TYPE_OPTIONS: { value: OrderType; label: string; icon: string }[] = [
  { value: "dine_in", label: "Dine In", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" },
  { value: "takeaway", label: "Takeaway", icon: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" },
  { value: "delivery", label: "Delivery", icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" },
];

export const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

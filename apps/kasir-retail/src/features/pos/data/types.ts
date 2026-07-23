import type { PosProduct, PosPaymentMethod } from "@/lib/db";

export interface CartItem {
  productId: string;
  name: string;
  barcode: string | null;
  price: number;
  costPrice: number;
  quantity: number;
  discount: number;
  total: number;
}

export interface CartState {
  items: CartItem[];
  subtotal: number;
  discountType: "fixed" | "percentage" | null;
  discountValue: number;
  discountAmount: number;
  taxEnabled: boolean;
  taxPercentage: number;
  taxAmount: number;
  total: number;
  customerName: string | null;
  customerPhone: string | null;
  notes: string | null;
  isHeld: boolean;
}

export interface PaymentState {
  method: PosPaymentMethod;
  amountPaid: number;
  change: number;
  paymentRef: string | null;
  isProcessing: boolean;
  isComplete: boolean;
}

export const EMPTY_CART: CartState = {
  items: [],
  subtotal: 0,
  discountType: null,
  discountValue: 0,
  discountAmount: 0,
  taxEnabled: false,
  taxPercentage: 11,
  taxAmount: 0,
  total: 0,
  customerName: null,
  customerPhone: null,
  notes: null,
  isHeld: false,
};

export const INITIAL_PAYMENT: PaymentState = {
  method: "cash",
  amountPaid: 0,
  change: 0,
  paymentRef: null,
  isProcessing: false,
  isComplete: false,
};

export const PAYMENT_METHODS: { value: PosPaymentMethod; label: string; icon: string }[] = [
  { value: "cash", label: "Tunai", icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" },
  { value: "qris", label: "QRIS", icon: "M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" },
  { value: "debit", label: "Debit", icon: "M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" },
  { value: "transfer", label: "Transfer", icon: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" },
  { value: "ewallet", label: "E-Wallet", icon: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" },
];

export const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

export type OrderStatus = "completed" | "void" | "pending";

export interface FnbTransaction {
  id: string;
  transaction_number: string;
  order_type: string;
  table_id: string | null;
  table_number: number | null;
  queue_number: number | null;
  items: FnbTransactionItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  service_charge_amount: number;
  total: number;
  amount_paid: number;
  change: number;
  payment_method: string;
  cashier_name: string | null;
  customer_name: string | null;
  status: OrderStatus;
  kitchen_status: string;
  is_void: boolean;
  void_reason: string | null;
  created_at: string;
}

export interface FnbTransactionItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  modifiers: Array<{ name: string; option: string; priceAdjustment: number }>;
  notes: string | null;
  total: number;
}

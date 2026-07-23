export type KitchenOrderStatus = "new" | "preparing" | "ready" | "served";

export interface KitchenOrder {
  id: string;
  transaction_id: string;
  items: KitchenOrderItem[];
  status: KitchenOrderStatus;
  table_number: number | null;
  order_type: string;
  queue_number: number | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface KitchenOrderItem {
  name: string;
  quantity: number;
  modifiers: string;
  notes: string | null;
}

export const KITCHEN_STATUS_CONFIG: Record<KitchenOrderStatus, { label: string; color: string; cardClass: string }> = {
  new: { label: "Baru", color: "#3B82F6", cardClass: "kitchen-card-new" },
  preparing: { label: "Dimasak", color: "#F59E0B", cardClass: "kitchen-card-preparing" },
  ready: { label: "Siap", color: "#22C55E", cardClass: "kitchen-card-ready" },
  served: { label: "Disajikan", color: "#6B7280", cardClass: "kitchen-card-served" },
};

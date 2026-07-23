export type TableStatus = "available" | "occupied" | "reserved" | "billing";

export interface Table {
  id: string;
  number: number;
  name: string;
  capacity: number;
  status: TableStatus;
  current_order_id: string | null;
  zone: string;
  merged_with: string[];
  created_at: string;
  updated_at: string;
}

export interface TableLayout {
  zones: string[];
  tables: Table[];
}

export const TABLE_STATUS_CONFIG: Record<TableStatus, { label: string; color: string; bgClass: string }> = {
  available: { label: "Tersedia", color: "#22C55E", bgClass: "table-card-available" },
  occupied: { label: "Terisi", color: "#EF4444", bgClass: "table-card-occupied" },
  reserved: { label: "Dipesan", color: "#F59E0B", bgClass: "table-card-reserved" },
  billing: { label: "Billing", color: "#8B5CF6", bgClass: "table-card-billing" },
};

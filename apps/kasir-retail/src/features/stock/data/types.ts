import type { PosStockAdjustment, StockAdjustmentType } from "@/lib/db";

export interface StockAdjustFormData {
  productId: string;
  type: StockAdjustmentType;
  quantity: number;
  reason: string;
}

export const ADJUSTMENT_TYPES: { value: StockAdjustmentType; label: string }[] = [
  { value: "purchase", label: "Pembelian / Masuk" },
  { value: "return", label: "Retur Pelanggan" },
  { value: "damaged", label: "Rusak / Cacat" },
  { value: "lost", label: "Hilang" },
  { value: "correction", label: "Koreksi / Opname" },
  { value: "transfer_in", label: "Transfer Masuk" },
  { value: "transfer_out", label: "Transfer Keluar" },
];

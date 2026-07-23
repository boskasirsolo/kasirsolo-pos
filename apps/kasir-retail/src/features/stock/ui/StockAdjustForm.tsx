"use client";

import { useState } from "react";
import { Button } from "@kasirsolo/ui";
import { ADJUSTMENT_TYPES, type StockAdjustFormData } from "../data/types";
import type { PosProduct, StockAdjustmentType } from "@/lib/db";

interface StockAdjustFormProps {
  products: PosProduct[];
  selectedProduct?: PosProduct | null;
  onSubmit: (data: StockAdjustFormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export function StockAdjustForm({
  products,
  selectedProduct,
  onSubmit,
  onCancel,
  loading,
}: StockAdjustFormProps) {
  const [productId, setProductId] = useState(selectedProduct?.id ?? "");
  const [type, setType] = useState<StockAdjustmentType>("purchase");
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selected = products.find((p) => p.id === productId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!productId) {
      setError("Pilih produk");
      return;
    }
    if (quantity <= 0) {
      setError("Jumlah harus lebih dari 0");
      return;
    }

    await onSubmit({ productId, type, quantity, reason });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <h3 className="text-lg font-heading font-bold text-gray-900">Penyesuaian Stok</h3>

      {/* Product selector */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Produk</label>
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="w-full px-4 py-3 bg-white border border-pos-border rounded-xl text-base
            focus:outline-none focus:border-brand-primary"
        >
          <option value="">Pilih produk...</option>
          {products.filter((p) => p.track_stock).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} (Stok: {p.stock})
            </option>
          ))}
        </select>
      </div>

      {/* Adjustment type */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Jenis Penyesuaian</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as StockAdjustmentType)}
          className="w-full px-4 py-3 bg-white border border-pos-border rounded-xl text-base
            focus:outline-none focus:border-brand-primary"
        >
          {ADJUSTMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Jumlah</label>
        <input
          type="number"
          value={quantity || ""}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
          min={1}
          className="w-full px-4 py-3 bg-white border border-pos-border rounded-xl text-base
            focus:outline-none focus:border-brand-primary"
        />
        {selected && (
          <p className="text-xs text-gray-500 mt-1">
            Stok saat ini: {selected.stock} {selected.unit}
          </p>
        )}
      </div>

      {/* Reason */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Alasan</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Keterangan penyesuaian..."
          rows={2}
          className="w-full px-4 py-3 bg-white border border-pos-border rounded-xl text-base resize-none
            focus:outline-none focus:border-brand-primary"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onCancel} type="button">Batal</Button>
        <Button variant="primary" fullWidth type="submit" loading={loading}>
          Simpan Penyesuaian
        </Button>
      </div>
    </form>
  );
}

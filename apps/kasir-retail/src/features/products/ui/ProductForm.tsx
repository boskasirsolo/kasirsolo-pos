"use client";

import { useState, useEffect } from "react";
import { Button } from "@kasirsolo/ui";
import { productSchema } from "../data/schema";
import { EMPTY_PRODUCT_FORM, UNITS, type ProductFormData } from "../data/types";
import type { PosProduct, PosCategory } from "@/lib/db";

interface ProductFormProps {
  initialData?: PosProduct | null;
  categories: PosCategory[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export function ProductForm({
  initialData,
  categories,
  onSubmit,
  onDelete,
  onCancel,
  loading,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(EMPTY_PRODUCT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        barcode: initialData.barcode || "",
        category_id: initialData.category_id || "",
        price: initialData.price,
        cost_price: initialData.cost_price,
        stock: initialData.stock,
        min_stock: initialData.min_stock,
        unit: initialData.unit,
        image: initialData.image,
        track_stock: initialData.track_stock,
        notes: initialData.notes || "",
      });
    }
  }, [initialData]);

  function updateField<K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = productSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    await onSubmit(form);
  }

  const isEditing = !!initialData;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      {/* Name */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Nama Produk <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="contoh: Indomie Goreng"
          className={`w-full px-4 py-3 bg-white border rounded-xl text-base
            focus:outline-none focus:border-brand-primary
            ${errors.name ? "border-red-400" : "border-pos-border"}`}
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>

      {/* Barcode */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Barcode / SKU</label>
        <input
          type="text"
          value={form.barcode}
          onChange={(e) => updateField("barcode", e.target.value)}
          placeholder="Scan atau ketik manual"
          className="w-full px-4 py-3 bg-white border border-pos-border rounded-xl text-base
            focus:outline-none focus:border-brand-primary font-mono"
        />
      </div>

      {/* Category */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Kategori</label>
        <select
          value={form.category_id}
          onChange={(e) => updateField("category_id", e.target.value)}
          className="w-full px-4 py-3 bg-white border border-pos-border rounded-xl text-base
            focus:outline-none focus:border-brand-primary"
        >
          <option value="">Tanpa Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Price & Cost */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Harga Jual <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
            <input
              type="number"
              value={form.price || ""}
              onChange={(e) => updateField("price", parseInt(e.target.value) || 0)}
              placeholder="0"
              className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-base
                focus:outline-none focus:border-brand-primary
                ${errors.price ? "border-red-400" : "border-pos-border"}`}
            />
          </div>
          {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Harga Modal</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
            <input
              type="number"
              value={form.cost_price || ""}
              onChange={(e) => updateField("cost_price", parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full pl-10 pr-4 py-3 bg-white border border-pos-border rounded-xl text-base
                focus:outline-none focus:border-brand-primary"
            />
          </div>
        </div>
      </div>

      {/* Stock & Min Stock */}
      <div className="flex items-center gap-3 mb-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.track_stock}
            onChange={(e) => updateField("track_stock", e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
          />
          <span className="text-gray-700">Lacak stok</span>
        </label>
      </div>

      {form.track_stock && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Stok</label>
            <input
              type="number"
              value={form.stock || ""}
              onChange={(e) => updateField("stock", parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-white border border-pos-border rounded-xl text-base
                focus:outline-none focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Min. Stok</label>
            <input
              type="number"
              value={form.min_stock || ""}
              onChange={(e) => updateField("min_stock", parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 bg-white border border-pos-border rounded-xl text-base
                focus:outline-none focus:border-brand-primary"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Satuan</label>
            <select
              value={form.unit}
              onChange={(e) => updateField("unit", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-pos-border rounded-xl text-base
                focus:outline-none focus:border-brand-primary"
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Catatan</label>
        <textarea
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
          placeholder="Catatan opsional..."
          rows={2}
          className="w-full px-4 py-3 bg-white border border-pos-border rounded-xl text-base resize-none
            focus:outline-none focus:border-brand-primary"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2"
        style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}
      >
        <Button variant="ghost" onClick={onCancel} type="button">
          Batal
        </Button>
        <Button
          variant="primary"
          fullWidth
          type="submit"
          loading={loading}
        >
          {isEditing ? "Simpan Perubahan" : "Tambah Produk"}
        </Button>
      </div>

      {/* Delete */}
      {isEditing && onDelete && (
        <div className="pt-2 border-t border-pos-border">
          <button
            onClick={onDelete}
            className="w-full text-center text-sm text-red-500 py-3 hover:bg-red-50 rounded-xl transition-colors"
            type="button"
          >
            Hapus Produk
          </button>
        </div>
      )}
    </form>
  );
}

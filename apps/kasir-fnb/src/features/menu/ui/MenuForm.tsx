"use client";

import { useState } from "react";
import { Button } from "@kasirsolo/ui";
import type { MenuItem, MenuCategory } from "../data/types";

interface MenuFormProps {
  item?: MenuItem | null;
  categories: MenuCategory[];
  onSave: (item: MenuItem) => void;
  onClose: () => void;
}

export function MenuForm({ item, categories, onSave, onClose }: MenuFormProps) {
  const [name, setName] = useState(item?.name ?? "");
  const [price, setPrice] = useState(item?.price ?? 0);
  const [categoryId, setCategoryId] = useState(item?.category_id ?? categories[0]?.id ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [isAvailable, setIsAvailable] = useState(item?.is_available ?? true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || price < 0 || !categoryId) return;

    onSave({
      id: item?.id ?? crypto.randomUUID(),
      name,
      price,
      category_id: categoryId,
      image: item?.image ?? null,
      modifiers: item?.modifiers ?? [],
      is_available: isAvailable,
      sort_order: item?.sort_order ?? 0,
      description: description || null,
      created_at: item?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />

      <div className="relative bg-white rounded-t-2xl max-h-[90vh] flex flex-col animate-slide-up">
        <div className="pt-3 pb-2">
          <div className="sheet-handle" />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          <h2 className="text-lg font-heading font-bold text-gray-900">
            {item ? "Edit Menu" : "Tambah Menu"}
          </h2>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Nama Menu *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Nasi Goreng Spesial"
              className="w-full px-4 py-3 border border-pos-border rounded-xl text-base
                focus:outline-none focus:border-brand-primary"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Harga *</label>
            <input
              type="number"
              value={price || ""}
              onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
              placeholder="0"
              className="w-full px-4 py-3 border border-pos-border rounded-xl text-base
                focus:outline-none focus:border-brand-primary"
              min={0}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Kategori *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-pos-border rounded-xl text-base
                focus:outline-none focus:border-brand-primary bg-white"
              required
            >
              <option value="">Pilih kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Deskripsi (opsional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat menu"
              rows={2}
              className="w-full px-4 py-3 border border-pos-border rounded-xl text-base
                focus:outline-none focus:border-brand-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-700">Tersedia</span>
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-12 h-7 rounded-full transition-colors ${isAvailable ? "bg-green-500" : "bg-gray-300"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${isAvailable ? "translate-x-6" : "translate-x-1"}`} />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={onClose} type="button">
              Batal
            </Button>
            <Button variant="primary" fullWidth type="submit">
              Simpan
            </Button>
          </div>
        </form>

        <div style={{ paddingBottom: "var(--safe-bottom)" }} />
      </div>
    </div>
  );
}

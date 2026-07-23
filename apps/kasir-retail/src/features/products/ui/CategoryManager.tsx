"use client";

import { useState } from "react";
import { Button } from "@kasirsolo/ui";
import type { PosCategory } from "@/lib/db";

interface CategoryManagerProps {
  categories: PosCategory[];
  onAdd: (name: string, color: string) => Promise<void>;
  onEdit: (id: string, name: string, color: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const CATEGORY_COLORS = [
  "#FF5F1F", "#F7A237", "#22C55E", "#3B82F6", "#8B5CF6",
  "#EC4899", "#EF4444", "#14B8A6", "#F59E0B", "#6366F1",
];

export function CategoryManager({ categories, onAdd, onEdit, onDelete }: CategoryManagerProps) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(CATEGORY_COLORS[0]);

  async function handleAdd() {
    if (!name.trim()) return;
    await onAdd(name.trim(), color);
    setName("");
    setColor(CATEGORY_COLORS[0]);
    setAdding(false);
  }

  async function handleEdit(id: string) {
    if (!name.trim()) return;
    await onEdit(id, name.trim(), color);
    setName("");
    setEditing(null);
  }

  function startEdit(cat: PosCategory) {
    setEditing(cat.id);
    setName(cat.name);
    setColor(cat.color);
    setAdding(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Kategori</h3>
        {!adding && (
          <Button variant="ghost" size="sm" onClick={() => { setAdding(true); setEditing(null); setName(""); }}>
            + Tambah
          </Button>
        )}
      </div>

      {/* Add/Edit form */}
      {(adding || editing) && (
        <div className="bg-white rounded-xl border border-pos-border p-3 space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kategori"
            className="w-full px-3 py-2 border border-pos-border rounded-lg text-sm
              focus:outline-none focus:border-brand-primary"
            autoFocus
          />
          <div className="flex gap-2 flex-wrap">
            {CATEGORY_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-all
                  ${color === c ? "border-gray-800 scale-110" : "border-transparent"}`}
                style={{ backgroundColor: c }}
                type="button"
                aria-label={`Warna ${c}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setAdding(false); setEditing(null); setName(""); }}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => editing ? handleEdit(editing) : handleAdd()}
            >
              {editing ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </div>
      )}

      {/* Category list */}
      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-3 bg-white rounded-xl border border-pos-border p-3"
          >
            <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
            <span className="flex-1 text-sm text-gray-900">{cat.name}</span>
            <button
              onClick={() => startEdit(cat)}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
              type="button"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(cat.id)}
              className="text-xs text-red-400 hover:text-red-600 px-2 py-1"
              type="button"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

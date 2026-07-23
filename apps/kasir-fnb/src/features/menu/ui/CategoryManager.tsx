"use client";

import { useState } from "react";
import { Button } from "@kasirsolo/ui";
import type { MenuCategory } from "../data/types";

interface CategoryManagerProps {
  categories: MenuCategory[];
  onAdd: (cat: MenuCategory) => void;
  onDelete: (id: string) => void;
}

export function CategoryManager({ categories, onAdd, onDelete }: CategoryManagerProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#FF5F1F");

  function handleAdd() {
    if (!name.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      icon: null,
      sort_order: categories.length + 1,
      color,
    });
    setName("");
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-700">Kategori Menu</h3>

      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kategori baru"
          className="flex-1 px-3 py-2 border border-pos-border rounded-xl text-sm
            focus:outline-none focus:border-brand-primary"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 rounded-xl border border-pos-border cursor-pointer"
        />
        <Button variant="primary" size="sm" onClick={handleAdd}>
          Tambah
        </Button>
      </div>

      <div className="space-y-1">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="text-sm">{cat.name}</span>
            </div>
            <button
              onClick={() => onDelete(cat.id)}
              className="text-gray-400 hover:text-red-500 p-1"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@kasirsolo/ui";
import type { MenuModifier, MenuModifierOption } from "../data/types";

interface ModifierManagerProps {
  modifiers: MenuModifier[];
  onSave: (modifier: MenuModifier) => void;
  onDelete: (id: string) => void;
}

export function ModifierManager({ modifiers, onSave, onDelete }: ModifierManagerProps) {
  const [name, setName] = useState("");
  const [options, setOptions] = useState<MenuModifierOption[]>([]);
  const [optionLabel, setOptionLabel] = useState("");
  const [optionPrice, setOptionPrice] = useState(0);

  function handleAddOption() {
    if (!optionLabel.trim()) return;
    setOptions((prev) => [...prev, { label: optionLabel.trim(), price_adjustment: optionPrice }]);
    setOptionLabel("");
    setOptionPrice(0);
  }

  function handleSave() {
    if (!name.trim() || options.length === 0) return;
    onSave({
      id: crypto.randomUUID(),
      name: name.trim(),
      options,
      is_required: false,
    });
    setName("");
    setOptions([]);
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-700">Modifier (Topping, Ukuran, Level Pedas)</h3>

      {/* Existing modifiers */}
      <div className="space-y-2">
        {modifiers.map((mod) => (
          <div key={mod.id} className="p-3 bg-white rounded-xl border border-pos-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{mod.name}</span>
              <button onClick={() => onDelete(mod.id)} className="text-gray-400 hover:text-red-500 p-1" type="button">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              {mod.options.map((opt, idx) => (
                <span key={idx} className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">
                  {opt.label} {opt.price_adjustment > 0 ? `+${opt.price_adjustment}` : ""}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add new modifier */}
      <div className="p-3 bg-gray-50 rounded-xl space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama modifier (contoh: Level Pedas)"
          className="w-full px-3 py-2 border border-pos-border rounded-lg text-sm
            focus:outline-none focus:border-brand-primary"
        />

        <div className="flex gap-2">
          <input
            type="text"
            value={optionLabel}
            onChange={(e) => setOptionLabel(e.target.value)}
            placeholder="Pilihan (contoh: Pedas)"
            className="flex-1 px-3 py-2 border border-pos-border rounded-lg text-sm
              focus:outline-none focus:border-brand-primary"
          />
          <input
            type="number"
            value={optionPrice || ""}
            onChange={(e) => setOptionPrice(parseInt(e.target.value, 10) || 0)}
            placeholder="+Rp"
            className="w-24 px-3 py-2 border border-pos-border rounded-lg text-sm
              focus:outline-none focus:border-brand-primary"
          />
          <button
            onClick={handleAddOption}
            className="px-3 py-2 bg-gray-200 rounded-lg text-sm font-medium text-gray-700"
            type="button"
          >
            +
          </button>
        </div>

        {options.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {options.map((opt, idx) => (
              <span key={idx} className="text-xs bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-full">
                {opt.label} {opt.price_adjustment > 0 ? `+${opt.price_adjustment}` : ""}
              </span>
            ))}
          </div>
        )}

        <Button variant="primary" size="sm" onClick={handleSave} disabled={!name.trim() || options.length === 0}>
          Simpan Modifier
        </Button>
      </div>
    </div>
  );
}

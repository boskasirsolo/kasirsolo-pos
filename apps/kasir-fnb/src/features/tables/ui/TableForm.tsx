"use client";

import { useState } from "react";
import { Button } from "@kasirsolo/ui";
import type { Table } from "../data/types";

interface TableFormProps {
  table?: Table | null;
  onSave: (table: Table) => void;
  onClose: () => void;
}

export function TableForm({ table, onSave, onClose }: TableFormProps) {
  const [number, setNumber] = useState(table?.number ?? 0);
  const [name, setName] = useState(table?.name ?? "");
  const [capacity, setCapacity] = useState(table?.capacity ?? 4);
  const [zone, setZone] = useState(table?.zone ?? "Utama");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (number <= 0) return;

    onSave({
      id: table?.id ?? crypto.randomUUID(),
      number,
      name: name || `Meja ${number}`,
      capacity,
      status: table?.status ?? "available",
      current_order_id: table?.current_order_id ?? null,
      zone,
      merged_with: table?.merged_with ?? [],
      created_at: table?.created_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />

      <div className="relative bg-white rounded-t-2xl animate-slide-up">
        <div className="pt-3 pb-2">
          <div className="sheet-handle" />
        </div>

        <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-4">
          <h2 className="text-lg font-heading font-bold text-gray-900">
            {table ? "Edit Meja" : "Tambah Meja"}
          </h2>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Nomor Meja</label>
            <input
              type="number"
              value={number || ""}
              onChange={(e) => setNumber(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-3 border border-pos-border rounded-xl text-base
                focus:outline-none focus:border-brand-primary"
              min={1}
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Nama (opsional)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: VIP, Outdoor, dll"
              className="w-full px-4 py-3 border border-pos-border rounded-xl text-base
                focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Kapasitas (kursi)</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 2)}
              className="w-full px-4 py-3 border border-pos-border rounded-xl text-base
                focus:outline-none focus:border-brand-primary"
              min={1}
              max={50}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Area/Zona</label>
            <input
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              placeholder="Contoh: Indoor, Outdoor, Lantai 2"
              className="w-full px-4 py-3 border border-pos-border rounded-xl text-base
                focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex gap-3">
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

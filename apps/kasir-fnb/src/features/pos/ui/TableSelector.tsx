"use client";

import type { Table } from "@/features/tables/data/types";

interface TableSelectorProps {
  tables: Table[];
  selectedTableId: string | null;
  onSelect: (tableId: string, tableNumber: number) => void;
  onClose: () => void;
}

export function TableSelector({ tables, selectedTableId, onSelect, onClose }: TableSelectorProps) {
  const availableTables = tables.filter((t) => t.status === "available" || t.id === selectedTableId);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />

      <div className="relative bg-white rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-up">
        <div className="pt-3 pb-2">
          <div className="sheet-handle" />
        </div>

        <div className="flex items-center justify-between px-4 pb-3 border-b border-pos-border">
          <h2 className="text-lg font-heading font-bold text-gray-900">Pilih Meja</h2>
          <button onClick={onClose} className="p-2 text-gray-400" type="button" aria-label="Tutup">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {availableTables.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Semua meja sedang terisi</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {availableTables.map((table) => (
                <button
                  key={table.id}
                  onClick={() => onSelect(table.id, table.number)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
                    ${table.id === selectedTableId
                      ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                      : "border-green-300 bg-green-50 text-green-700"}`}
                  type="button"
                >
                  <span className="text-lg font-bold">{table.number}</span>
                  <span className="text-[10px]">{table.name || `Meja ${table.number}`}</span>
                  <span className="text-[10px] opacity-70">{table.capacity} kursi</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

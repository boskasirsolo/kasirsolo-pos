"use client";

import type { Table } from "../data/types";
import { TABLE_STATUS_CONFIG } from "../data/types";

interface TableGridProps {
  tables: Table[];
  loading: boolean;
  merging: boolean;
  selectedForMerge: string[];
  onTableTap: (table: Table) => void;
  onTableMergeToggle: (tableId: string) => void;
}

export function TableGrid({ tables, loading, merging, selectedForMerge, onTableTap, onTableMergeToggle }: TableGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="table-card animate-pulse bg-gray-100 border-gray-200">
            <div className="w-8 h-8 bg-gray-200 rounded-full mb-2" />
            <div className="w-12 h-3 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
        </svg>
        <p className="text-sm font-medium">Belum ada meja</p>
        <p className="text-xs mt-1">Tambah meja di Pengaturan</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-4">
      {tables.map((table) => {
        const config = TABLE_STATUS_CONFIG[table.status];
        const isSelected = selectedForMerge.includes(table.id);

        return (
          <button
            key={table.id}
            onClick={() => merging ? onTableMergeToggle(table.id) : onTableTap(table)}
            className={`${config.bgClass}
              ${merging && isSelected ? "ring-2 ring-brand-primary ring-offset-2" : ""}
              ${table.merged_with.length > 0 ? "col-span-2" : ""}`}
            type="button"
          >
            <span className="text-2xl font-bold">{table.number}</span>
            <span className="text-xs font-medium">{table.name || `Meja ${table.number}`}</span>
            <span className="text-[10px] opacity-70">{table.capacity} kursi</span>
            <span className={`text-[10px] font-medium mt-1 px-2 py-0.5 rounded-full`}
              style={{ backgroundColor: `${config.color}20`, color: config.color }}
            >
              {config.label}
            </span>
            {table.merged_with.length > 0 && (
              <span className="text-[9px] text-purple-600 mt-1">Gabungan</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { formatRupiah } from "@kasirsolo/utils";
import { Button } from "@kasirsolo/ui";
import type { Table, TableStatus } from "../data/types";
import { TABLE_STATUS_CONFIG } from "../data/types";

interface TableDetailProps {
  table: Table;
  onClose: () => void;
  onChangeStatus: (status: TableStatus) => void;
  onOpenOrder: () => void;
}

export function TableDetail({ table, onClose, onChangeStatus, onOpenOrder }: TableDetailProps) {
  const config = TABLE_STATUS_CONFIG[table.status];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />

      <div className="relative bg-white rounded-t-2xl animate-slide-up">
        <div className="pt-3 pb-2">
          <div className="sheet-handle" />
        </div>

        <div className="px-4 pb-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-heading font-bold text-gray-900">
                Meja {table.number}
              </h2>
              <p className="text-sm text-gray-500">
                {table.name} - {table.capacity} kursi
              </p>
            </div>
            <span
              className="text-sm font-medium px-3 py-1 rounded-full"
              style={{ backgroundColor: `${config.color}20`, color: config.color }}
            >
              {config.label}
            </span>
          </div>

          {/* Status buttons */}
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(TABLE_STATUS_CONFIG) as TableStatus[]).map((status) => {
              const sc = TABLE_STATUS_CONFIG[status];
              return (
                <button
                  key={status}
                  onClick={() => onChangeStatus(status)}
                  disabled={table.status === status}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all
                    ${table.status === status
                      ? "opacity-50 cursor-not-allowed"
                      : "active:scale-95"}`}
                  style={{
                    borderColor: sc.color,
                    backgroundColor: table.status === status ? `${sc.color}20` : "transparent",
                    color: sc.color,
                  }}
                  type="button"
                >
                  {sc.label}
                </button>
              );
            })}
          </div>

          {/* Actions */}
          {table.status === "occupied" && (
            <Button variant="primary" fullWidth size="lg" onClick={onOpenOrder}>
              Lihat Pesanan
            </Button>
          )}

          {table.status === "available" && (
            <Button variant="primary" fullWidth size="lg" onClick={onOpenOrder}>
              Buat Pesanan Baru
            </Button>
          )}
        </div>

        <div style={{ paddingBottom: "var(--safe-bottom)" }} />
      </div>
    </div>
  );
}

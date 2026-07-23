"use client";

import { Button } from "@kasirsolo/ui";
import type { Table } from "../data/types";

interface MergeTableModalProps {
  tables: Table[];
  selectedTables: string[];
  onToggle: (tableId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MergeTableModal({ tables, selectedTables, onToggle, onConfirm, onCancel }: MergeTableModalProps) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 bg-brand-primary/95 text-white p-4 animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-heading font-bold">Mode Gabung Meja</h3>
          <p className="text-xs text-white/70">Pilih 2+ meja untuk digabung</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={selectedTables.length < 2}
          >
            Gabung ({selectedTables.length})
          </Button>
        </div>
      </div>
    </div>
  );
}

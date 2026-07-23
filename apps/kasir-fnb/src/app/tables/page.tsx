"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FnbShell } from "@/components/layout/FnbShell";
import { TableGrid, TableDetail, TableForm, MergeTableModal, useTables, useTableMerge } from "@/features/tables";
import type { Table, TableStatus } from "@/features/tables";

export default function TablesPage() {
  const router = useRouter();
  const { tables, loading, addTable, changeStatus } = useTables();
  const merge = useTableMerge();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showForm, setShowForm] = useState(false);

  function handleTableTap(table: Table) {
    setSelectedTable(table);
  }

  function handleChangeStatus(status: TableStatus) {
    if (!selectedTable) return;
    changeStatus(selectedTable.id, status);
    setSelectedTable(null);
  }

  function handleOpenOrder() {
    if (!selectedTable) return;
    // Navigate to POS with table pre-selected
    router.push(`/pos?table=${selectedTable.id}&tableNumber=${selectedTable.number}`);
    setSelectedTable(null);
  }

  async function handleSaveTable(table: Table) {
    await addTable(table);
    setShowForm(false);
  }

  return (
    <FnbShell>
      <div>
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h1 className="text-lg font-heading font-bold text-gray-900">Meja</h1>
          <div className="flex gap-2">
            {!merge.merging && (
              <button
                onClick={merge.startMerge}
                className="text-xs text-gray-600 font-medium px-3 py-1.5 rounded-lg border border-pos-border"
                type="button"
              >
                Gabung
              </button>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="text-xs text-white font-medium px-3 py-1.5 rounded-lg bg-brand-primary"
              type="button"
            >
              + Meja
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-3 px-4 pb-2">
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-[10px] text-gray-500">Tersedia</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-[10px] text-gray-500">Terisi</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-yellow-500" /><span className="text-[10px] text-gray-500">Dipesan</span></div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-purple-500" /><span className="text-[10px] text-gray-500">Billing</span></div>
        </div>

        {merge.merging && (
          <MergeTableModal
            tables={tables}
            selectedTables={merge.selectedTables}
            onToggle={merge.toggleSelect}
            onConfirm={() => { merge.confirmMerge(); }}
            onCancel={merge.cancelMerge}
          />
        )}

        <TableGrid
          tables={tables}
          loading={loading}
          merging={merge.merging}
          selectedForMerge={merge.selectedTables}
          onTableTap={handleTableTap}
          onTableMergeToggle={merge.toggleSelect}
        />

        {selectedTable && (
          <TableDetail
            table={selectedTable}
            onClose={() => setSelectedTable(null)}
            onChangeStatus={handleChangeStatus}
            onOpenOrder={handleOpenOrder}
          />
        )}

        {showForm && (
          <TableForm
            onSave={handleSaveTable}
            onClose={() => setShowForm(false)}
          />
        )}
      </div>
    </FnbShell>
  );
}

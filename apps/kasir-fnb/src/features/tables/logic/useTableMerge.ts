"use client";

import { useState, useCallback } from "react";
import { saveTable, getTables } from "../data/queries";
import type { Table } from "../data/types";

export function useTableMerge() {
  const [merging, setMerging] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);

  const toggleSelect = useCallback((tableId: string) => {
    setSelectedTables((prev) =>
      prev.includes(tableId)
        ? prev.filter((id) => id !== tableId)
        : [...prev, tableId]
    );
  }, []);

  const startMerge = useCallback(() => {
    setMerging(true);
    setSelectedTables([]);
  }, []);

  const cancelMerge = useCallback(() => {
    setMerging(false);
    setSelectedTables([]);
  }, []);

  const confirmMerge = useCallback(async () => {
    if (selectedTables.length < 2) return;

    const tables = await getTables();
    const primary = selectedTables[0];
    const merged = selectedTables.slice(1);

    for (const table of tables) {
      if (table.id === primary) {
        await saveTable({
          ...table,
          merged_with: merged,
          status: "occupied",
          updated_at: new Date().toISOString(),
        });
      } else if (merged.includes(table.id)) {
        await saveTable({
          ...table,
          merged_with: [primary],
          status: "occupied",
          updated_at: new Date().toISOString(),
        });
      }
    }

    setMerging(false);
    setSelectedTables([]);
  }, [selectedTables]);

  const unmerge = useCallback(async (tableId: string) => {
    const tables = await getTables();
    const table = tables.find((t) => t.id === tableId);
    if (!table || table.merged_with.length === 0) return;

    const allMerged = [tableId, ...table.merged_with];
    for (const t of tables) {
      if (allMerged.includes(t.id)) {
        await saveTable({
          ...t,
          merged_with: [],
          status: "available",
          current_order_id: null,
          updated_at: new Date().toISOString(),
        });
      }
    }
  }, []);

  return {
    merging,
    selectedTables,
    toggleSelect,
    startMerge,
    cancelMerge,
    confirmMerge,
    unmerge,
  };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { getTables, saveTable, deleteTable, updateTableStatus } from "../data/queries";
import type { Table, TableStatus } from "../data/types";

export function useTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTables();
      setTables(data);
    } catch {
      // Offline or empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addTable = useCallback(async (table: Table) => {
    await saveTable(table);
    await load();
  }, [load]);

  const removeTable = useCallback(async (id: string) => {
    await deleteTable(id);
    await load();
  }, [load]);

  const changeStatus = useCallback(async (id: string, status: TableStatus, orderId?: string | null) => {
    await updateTableStatus(id, status, orderId);
    await load();
  }, [load]);

  return {
    tables,
    loading,
    load,
    addTable,
    removeTable,
    changeStatus,
  };
}

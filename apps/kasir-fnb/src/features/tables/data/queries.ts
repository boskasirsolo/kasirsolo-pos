"use client";

import { openDatabase, getAll, put, del } from "@/lib/db";
import type { Table } from "./types";

export async function getTables(): Promise<Table[]> {
  await openDatabase();
  const tables = await getAll<Table>("tables");
  return tables.sort((a, b) => a.number - b.number);
}

export async function saveTable(table: Table): Promise<void> {
  await openDatabase();
  await put("tables", table);
}

export async function deleteTable(id: string): Promise<void> {
  await openDatabase();
  await del("tables", id);
}

export async function updateTableStatus(id: string, status: Table["status"], orderId?: string | null): Promise<void> {
  await openDatabase();
  const tables = await getAll<Table>("tables");
  const table = tables.find((t) => t.id === id);
  if (!table) return;

  await put("tables", {
    ...table,
    status,
    current_order_id: orderId ?? table.current_order_id,
    updated_at: new Date().toISOString(),
  });
}

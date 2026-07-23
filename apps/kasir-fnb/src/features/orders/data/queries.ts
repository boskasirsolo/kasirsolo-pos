"use client";

import { openDatabase, getAll } from "@/lib/db";
import type { FnbTransaction } from "./types";

export async function getTransactions(options?: {
  startDate?: string;
  endDate?: string;
}): Promise<FnbTransaction[]> {
  await openDatabase();
  let transactions = await getAll<FnbTransaction>("fnb_transactions");

  if (options?.startDate) {
    transactions = transactions.filter((t) => t.created_at >= options.startDate!);
  }
  if (options?.endDate) {
    transactions = transactions.filter((t) => t.created_at <= options.endDate!);
  }

  return transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getTodaySummary(): Promise<{ total: number; count: number }> {
  const today = new Date().toISOString().slice(0, 10);
  const transactions = await getTransactions({
    startDate: `${today}T00:00:00.000Z`,
    endDate: `${today}T23:59:59.999Z`,
  });

  const active = transactions.filter((t) => !t.is_void);
  return {
    total: active.reduce((sum, t) => sum + t.total, 0),
    count: active.length,
  };
}

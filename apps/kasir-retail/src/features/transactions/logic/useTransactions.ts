"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getTransactions,
  getTransactionById,
  voidTransaction as voidTx,
  getTodaySummary,
  openDatabase,
} from "@/lib/db";
import type { PosTransaction, PosPaymentMethod } from "@/lib/db";

export function useTransactions() {
  const [transactions, setTransactions] = useState<PosTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [voiding, setVoiding] = useState(false);
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [todayVoidCount, setTodayVoidCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await openDatabase();
      const [txns, summary] = await Promise.all([
        getTransactions({ limit: 200 }),
        getTodaySummary(),
      ]);
      setTransactions(txns);
      setTodayTotal(summary.total);
      setTodayCount(summary.count);
      setTodayVoidCount(summary.voidCount);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const voidTransaction = useCallback(async (id: string, reason: string) => {
    setVoiding(true);
    try {
      const voided = await voidTx(id, reason);
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? voided : t))
      );
      // Reload summary
      const summary = await getTodaySummary();
      setTodayTotal(summary.total);
      setTodayCount(summary.count);
      setTodayVoidCount(summary.voidCount);
      return voided;
    } finally {
      setVoiding(false);
    }
  }, []);

  const getPaymentBreakdown = useCallback(() => {
    const today = new Date().toDateString();
    const todayTxns = transactions.filter(
      (t) => !t.is_void && new Date(t.created_at).toDateString() === today
    );

    const breakdown = new Map<PosPaymentMethod, { count: number; total: number }>();
    todayTxns.forEach((tx) => {
      const existing = breakdown.get(tx.payment_method) ?? { count: 0, total: 0 };
      breakdown.set(tx.payment_method, {
        count: existing.count + 1,
        total: existing.total + tx.total,
      });
    });

    return Array.from(breakdown.entries()).map(([method, data]) => ({
      method,
      ...data,
    }));
  }, [transactions]);

  return {
    transactions,
    loading,
    voiding,
    todayTotal,
    todayCount,
    todayVoidCount,
    load,
    voidTransaction,
    getPaymentBreakdown,
  };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { getTransactions, getTodaySummary } from "../data/queries";
import type { FnbTransaction } from "../data/types";

export function useOrders() {
  const [transactions, setTransactions] = useState<FnbTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayTotal, setTodayTotal] = useState(0);
  const [todayCount, setTodayCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [txs, summary] = await Promise.all([
        getTransactions(),
        getTodaySummary(),
      ]);
      setTransactions(txs);
      setTodayTotal(summary.total);
      setTodayCount(summary.count);
    } catch {
      // Offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    transactions,
    loading,
    todayTotal,
    todayCount,
    refresh: load,
  };
}

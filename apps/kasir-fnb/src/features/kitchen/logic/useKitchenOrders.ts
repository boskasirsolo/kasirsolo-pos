"use client";

import { useState, useEffect, useCallback } from "react";
import { getKitchenOrders, updateKitchenOrderStatus } from "../data/queries";
import type { KitchenOrder, KitchenOrderStatus } from "../data/types";

export function useKitchenOrders() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<KitchenOrderStatus | "all">("all");

  const load = useCallback(async () => {
    try {
      const data = await getKitchenOrders();
      setOrders(data);
    } catch {
      // Offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Auto-refresh every 10 seconds for KDS
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const updateStatus = useCallback(async (id: string, status: KitchenOrderStatus) => {
    await updateKitchenOrderStatus(id, status);
    await load();
  }, [load]);

  const filtered = filter === "all"
    ? orders.filter((o) => o.status !== "served")
    : orders.filter((o) => o.status === filter);

  return {
    orders: filtered,
    allOrders: orders,
    loading,
    filter,
    setFilter,
    updateStatus,
    refresh: load,
  };
}

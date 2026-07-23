"use client";

import { openDatabase, getAll, put } from "@/lib/db";
import type { KitchenOrder, KitchenOrderStatus } from "./types";

export async function getKitchenOrders(): Promise<KitchenOrder[]> {
  await openDatabase();
  const orders = await getAll<KitchenOrder>("kitchen_orders");
  return orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function updateKitchenOrderStatus(
  id: string,
  status: KitchenOrderStatus
): Promise<void> {
  await openDatabase();
  const orders = await getAll<KitchenOrder>("kitchen_orders");
  const order = orders.find((o) => o.id === id);
  if (!order) return;

  const now = new Date().toISOString();
  await put("kitchen_orders", {
    ...order,
    status,
    started_at: status === "preparing" ? now : order.started_at,
    completed_at: status === "ready" || status === "served" ? now : order.completed_at,
  });
}

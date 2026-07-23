"use client";

import { FnbShell } from "@/components/layout/FnbShell";
import { KitchenBoard, KitchenFilter, useKitchenOrders } from "@/features/kitchen";
import type { KitchenOrderStatus } from "@/features/kitchen";

export default function KitchenPage() {
  const { orders, allOrders, loading, filter, setFilter, updateStatus } = useKitchenOrders();

  const counts = {
    all: allOrders.filter((o) => o.status !== "served").length,
    new: allOrders.filter((o) => o.status === "new").length,
    preparing: allOrders.filter((o) => o.status === "preparing").length,
    ready: allOrders.filter((o) => o.status === "ready").length,
    served: allOrders.filter((o) => o.status === "served").length,
  };

  return (
    <FnbShell>
      <div>
        <div className="px-4 pt-3 pb-1">
          <h1 className="text-lg font-heading font-bold text-gray-900">Dapur (KDS)</h1>
        </div>

        <KitchenFilter
          active={filter}
          counts={counts}
          onChange={(f) => setFilter(f as KitchenOrderStatus | "all")}
        />

        <KitchenBoard
          orders={orders}
          loading={loading}
          onUpdateStatus={updateStatus}
        />
      </div>
    </FnbShell>
  );
}

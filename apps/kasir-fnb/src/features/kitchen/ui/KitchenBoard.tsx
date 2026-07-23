"use client";

import type { KitchenOrder, KitchenOrderStatus } from "../data/types";
import { KITCHEN_STATUS_CONFIG } from "../data/types";
import { KitchenCard } from "./KitchenCard";

interface KitchenBoardProps {
  orders: KitchenOrder[];
  loading: boolean;
  onUpdateStatus: (id: string, status: KitchenOrderStatus) => void;
}

export function KitchenBoard({ orders, loading, onUpdateStatus }: KitchenBoardProps) {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="kitchen-card animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-3 w-32 bg-gray-100 rounded mb-1" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
        </svg>
        <p className="text-sm font-medium">Tidak ada pesanan dapur</p>
        <p className="text-xs mt-1">Pesanan baru akan muncul di sini</p>
      </div>
    );
  }

  // Group by status for Kanban view
  const grouped = new Map<KitchenOrderStatus, KitchenOrder[]>();
  (["new", "preparing", "ready"] as KitchenOrderStatus[]).forEach((status) => {
    grouped.set(status, orders.filter((o) => o.status === status));
  });

  return (
    <div className="p-4 space-y-4">
      {(["new", "preparing", "ready"] as KitchenOrderStatus[]).map((status) => {
        const statusOrders = grouped.get(status) || [];
        if (statusOrders.length === 0) return null;

        const config = KITCHEN_STATUS_CONFIG[status];

        return (
          <div key={status}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: config.color }} />
              <h3 className="text-sm font-bold text-gray-700">
                {config.label} ({statusOrders.length})
              </h3>
            </div>
            <div className="space-y-2">
              {statusOrders.map((order) => (
                <KitchenCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={onUpdateStatus}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

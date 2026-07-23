"use client";

import type { KitchenOrder, KitchenOrderStatus } from "../data/types";
import { KITCHEN_STATUS_CONFIG } from "../data/types";
import { KitchenTimer } from "./KitchenTimer";

interface KitchenCardProps {
  order: KitchenOrder;
  onUpdateStatus: (id: string, status: KitchenOrderStatus) => void;
}

export function KitchenCard({ order, onUpdateStatus }: KitchenCardProps) {
  const config = KITCHEN_STATUS_CONFIG[order.status];
  const nextStatus: KitchenOrderStatus | null =
    order.status === "new" ? "preparing" :
    order.status === "preparing" ? "ready" :
    order.status === "ready" ? "served" :
    null;

  const nextLabel =
    order.status === "new" ? "Mulai Masak" :
    order.status === "preparing" ? "Siap Saji" :
    order.status === "ready" ? "Sudah Disajikan" :
    null;

  return (
    <div className={config.cardClass}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {order.table_number && (
            <span className="text-sm font-bold bg-gray-100 px-2 py-0.5 rounded">
              Meja {order.table_number}
            </span>
          )}
          {order.queue_number && (
            <span className="text-sm font-bold bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded">
              #{order.queue_number}
            </span>
          )}
          <span className="text-xs text-gray-500 capitalize">{order.order_type.replace("_", " ")}</span>
        </div>
        <KitchenTimer createdAt={order.created_at} />
      </div>

      {/* Items */}
      <div className="space-y-1 mb-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <span className="text-sm font-bold text-brand-primary min-w-[24px]">
              {item.quantity}x
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{item.name}</p>
              {item.modifiers && (
                <p className="text-xs text-gray-500">{item.modifiers}</p>
              )}
              {item.notes && (
                <p className="text-xs text-brand-primary font-medium">* {item.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action */}
      {nextStatus && nextLabel && (
        <button
          onClick={() => onUpdateStatus(order.id, nextStatus)}
          className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-95"
          style={{ backgroundColor: KITCHEN_STATUS_CONFIG[nextStatus].color }}
          type="button"
        >
          {nextLabel}
        </button>
      )}
    </div>
  );
}

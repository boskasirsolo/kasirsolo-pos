"use client";

import type { KitchenOrderStatus } from "../data/types";
import { KITCHEN_STATUS_CONFIG } from "../data/types";

interface KitchenFilterProps {
  active: KitchenOrderStatus | "all";
  counts: Record<KitchenOrderStatus | "all", number>;
  onChange: (status: KitchenOrderStatus | "all") => void;
}

export function KitchenFilter({ active, counts, onChange }: KitchenFilterProps) {
  const filters: { value: KitchenOrderStatus | "all"; label: string }[] = [
    { value: "all", label: "Semua" },
    { value: "new", label: "Baru" },
    { value: "preparing", label: "Dimasak" },
    { value: "ready", label: "Siap" },
    { value: "served", label: "Disajikan" },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2">
      {filters.map((f) => {
        const isActive = active === f.value;
        const color = f.value !== "all" ? KITCHEN_STATUS_CONFIG[f.value].color : "#FF5F1F";
        const count = counts[f.value] ?? 0;

        return (
          <button
            key={f.value}
            onClick={() => onChange(f.value)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
              transition-colors border
              ${isActive
                ? "text-white"
                : "bg-white text-gray-600 border-pos-border"}`}
            style={isActive ? { backgroundColor: color, borderColor: color } : undefined}
            type="button"
          >
            {f.label}
            {count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                ${isActive ? "bg-white/20" : "bg-gray-100"}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

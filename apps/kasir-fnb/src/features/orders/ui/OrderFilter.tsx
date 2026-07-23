"use client";

interface OrderFilterProps {
  activeFilter: string;
  onChange: (filter: string) => void;
}

export function OrderFilter({ activeFilter, onChange }: OrderFilterProps) {
  const filters = [
    { value: "all", label: "Semua" },
    { value: "dine_in", label: "Dine In" },
    { value: "takeaway", label: "Takeaway" },
    { value: "delivery", label: "Delivery" },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
            ${activeFilter === f.value
              ? "bg-brand-primary text-white"
              : "bg-white text-gray-600 border border-pos-border"}`}
          type="button"
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

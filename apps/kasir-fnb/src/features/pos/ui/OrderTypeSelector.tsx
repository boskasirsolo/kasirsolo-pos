"use client";

import { ORDER_TYPE_OPTIONS } from "../data/types";
import type { OrderType } from "../data/types";

interface OrderTypeSelectorProps {
  value: OrderType;
  onChange: (value: OrderType) => void;
}

export function OrderTypeSelector({ value, onChange }: OrderTypeSelectorProps) {
  return (
    <div className="flex gap-2">
      {ORDER_TYPE_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium
            transition-all border
            ${value === option.value
              ? "bg-brand-primary text-white border-brand-primary shadow-md"
              : "bg-white text-gray-600 border-pos-border"}`}
          type="button"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d={option.icon} />
          </svg>
          {option.label}
        </button>
      ))}
    </div>
  );
}

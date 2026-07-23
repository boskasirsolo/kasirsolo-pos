"use client";

import { useKitchenTimer } from "../logic/useKitchenTimer";

interface KitchenTimerProps {
  createdAt: string;
}

export function KitchenTimer({ createdAt }: KitchenTimerProps) {
  const { formatted, isOverdue, isWarning } = useKitchenTimer(createdAt);

  return (
    <span
      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full
        ${isOverdue
          ? "bg-red-100 text-red-600 animate-pulse"
          : isWarning
            ? "bg-yellow-100 text-yellow-700"
            : "bg-gray-100 text-gray-600"}`}
    >
      {formatted}
    </span>
  );
}

"use client";

import type { Table } from "../data/types";
import { TABLE_STATUS_CONFIG } from "../data/types";

interface TableCardProps {
  table: Table;
  onTap: () => void;
}

export function TableCard({ table, onTap }: TableCardProps) {
  const config = TABLE_STATUS_CONFIG[table.status];

  return (
    <button onClick={onTap} className={config.bgClass} type="button">
      <span className="text-2xl font-bold">{table.number}</span>
      <span className="text-xs font-medium">{table.name || `Meja ${table.number}`}</span>
      <span className="text-[10px] opacity-70">{table.capacity} kursi</span>
      <span
        className="text-[10px] font-medium mt-1 px-2 py-0.5 rounded-full"
        style={{ backgroundColor: `${config.color}20`, color: config.color }}
      >
        {config.label}
      </span>
    </button>
  );
}

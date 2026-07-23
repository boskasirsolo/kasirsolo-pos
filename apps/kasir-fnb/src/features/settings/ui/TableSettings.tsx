"use client";

import type { FnbSettings } from "@/lib/db";

interface TableSettingsProps {
  settings: FnbSettings;
  onUpdate: (updates: Partial<FnbSettings>) => void;
}

export function TableSettings({ settings, onUpdate }: TableSettingsProps) {
  return (
    <div className="bg-white rounded-xl border border-pos-border p-4 space-y-3">
      <h3 className="text-sm font-bold text-gray-700">Pengaturan Meja</h3>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Jumlah Meja Default</label>
        <input type="number" value={settings.table_count} onChange={(e) => onUpdate({ table_count: parseInt(e.target.value, 10) || 1 })} min={1} max={100} className="w-full px-3 py-2 border border-pos-border rounded-lg text-sm focus:outline-none focus:border-brand-primary" />
      </div>
      <p className="text-xs text-gray-400">Meja dapat dikelola di halaman Meja</p>
    </div>
  );
}

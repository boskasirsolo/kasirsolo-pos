"use client";

import type { FnbSettings } from "@/lib/db";

interface ReceiptSettingsProps {
  settings: FnbSettings;
  onUpdate: (updates: Partial<FnbSettings>) => void;
}

export function ReceiptSettings({ settings, onUpdate }: ReceiptSettingsProps) {
  return (
    <div className="bg-white rounded-xl border border-pos-border p-4 space-y-3">
      <h3 className="text-sm font-bold text-gray-700">Struk / Receipt</h3>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Format Cetak</label>
        <select value={settings.receipt_format} onChange={(e) => onUpdate({ receipt_format: e.target.value as FnbSettings["receipt_format"] })} className="w-full px-3 py-2 border border-pos-border rounded-lg text-sm focus:outline-none focus:border-brand-primary bg-white">
          <option value="thermal_58mm">Thermal 58mm</option>
          <option value="thermal_80mm">Thermal 80mm</option>
          <option value="a4">A4</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Pesan Footer</label>
        <input type="text" value={settings.receipt_footer} onChange={(e) => onUpdate({ receipt_footer: e.target.value })} placeholder="Terima kasih atas kunjungan Anda!" className="w-full px-3 py-2 border border-pos-border rounded-lg text-sm focus:outline-none focus:border-brand-primary" />
      </div>
    </div>
  );
}

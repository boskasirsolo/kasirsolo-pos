"use client";

import type { FnbSettings } from "@/lib/db";

interface KitchenSettingsProps {
  settings: FnbSettings;
  onUpdate: (updates: Partial<FnbSettings>) => void;
}

export function KitchenSettings({ settings, onUpdate }: KitchenSettingsProps) {
  return (
    <div className="bg-white rounded-xl border border-pos-border p-4 space-y-3">
      <h3 className="text-sm font-bold text-gray-700">Kitchen Display System</h3>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-700">KDS Aktif</span>
          <p className="text-xs text-gray-400">Tampilkan pesanan di layar dapur</p>
        </div>
        <button type="button" onClick={() => onUpdate({ kds_enabled: !settings.kds_enabled })} className={`w-12 h-7 rounded-full transition-colors ${settings.kds_enabled ? "bg-green-500" : "bg-gray-300"}`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.kds_enabled ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm text-gray-700">Auto Print ke Dapur</span>
          <p className="text-xs text-gray-400">Cetak otomatis ke printer dapur</p>
        </div>
        <button type="button" onClick={() => onUpdate({ kds_auto_print: !settings.kds_auto_print })} className={`w-12 h-7 rounded-full transition-colors ${settings.kds_auto_print ? "bg-green-500" : "bg-gray-300"}`}>
          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.kds_auto_print ? "translate-x-6" : "translate-x-1"}`} />
        </button>
      </div>
    </div>
  );
}

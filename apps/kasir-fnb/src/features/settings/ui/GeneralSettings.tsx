"use client";

import type { FnbSettings } from "@/lib/db";

interface GeneralSettingsProps {
  settings: FnbSettings;
  onUpdate: (updates: Partial<FnbSettings>) => void;
  saving: boolean;
}

export function GeneralSettings({ settings, onUpdate, saving }: GeneralSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-pos-border p-4 space-y-3">
        <h3 className="text-sm font-bold text-gray-700">Informasi Toko</h3>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Nama Toko</label>
          <input type="text" value={settings.store_name} onChange={(e) => onUpdate({ store_name: e.target.value })} className="w-full px-3 py-2 border border-pos-border rounded-lg text-sm focus:outline-none focus:border-brand-primary" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Alamat</label>
          <input type="text" value={settings.store_address || ""} onChange={(e) => onUpdate({ store_address: e.target.value || null })} className="w-full px-3 py-2 border border-pos-border rounded-lg text-sm focus:outline-none focus:border-brand-primary" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Telepon</label>
          <input type="tel" value={settings.store_phone || ""} onChange={(e) => onUpdate({ store_phone: e.target.value || null })} className="w-full px-3 py-2 border border-pos-border rounded-lg text-sm focus:outline-none focus:border-brand-primary" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-pos-border p-4 space-y-3">
        <h3 className="text-sm font-bold text-gray-700">Preferensi</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Suara Notifikasi</span>
          <button type="button" onClick={() => onUpdate({ sound_enabled: !settings.sound_enabled })} className={`w-12 h-7 rounded-full transition-colors ${settings.sound_enabled ? "bg-green-500" : "bg-gray-300"}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.sound_enabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Antrian Takeaway</span>
          <button type="button" onClick={() => onUpdate({ queue_enabled: !settings.queue_enabled })} className={`w-12 h-7 rounded-full transition-colors ${settings.queue_enabled ? "bg-green-500" : "bg-gray-300"}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.queue_enabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

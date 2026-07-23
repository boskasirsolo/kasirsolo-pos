"use client";

import type { FnbSettings } from "@/lib/db";

interface TaxSettingsProps {
  settings: FnbSettings;
  onUpdate: (updates: Partial<FnbSettings>) => void;
}

export function TaxSettings({ settings, onUpdate }: TaxSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-pos-border p-4 space-y-3">
        <h3 className="text-sm font-bold text-gray-700">Pajak</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Pajak Aktif</span>
          <button type="button" onClick={() => onUpdate({ tax_enabled: !settings.tax_enabled })} className={`w-12 h-7 rounded-full transition-colors ${settings.tax_enabled ? "bg-green-500" : "bg-gray-300"}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.tax_enabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        {settings.tax_enabled && (
          <>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Label Pajak</label>
              <input type="text" value={settings.tax_label} onChange={(e) => onUpdate({ tax_label: e.target.value })} className="w-full px-3 py-2 border border-pos-border rounded-lg text-sm focus:outline-none focus:border-brand-primary" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Persentase (%)</label>
              <input type="number" value={settings.tax_percentage} onChange={(e) => onUpdate({ tax_percentage: parseFloat(e.target.value) || 0 })} min={0} max={100} step={0.5} className="w-full px-3 py-2 border border-pos-border rounded-lg text-sm focus:outline-none focus:border-brand-primary" />
            </div>
          </>
        )}
      </div>

      <div className="bg-white rounded-xl border border-pos-border p-4 space-y-3">
        <h3 className="text-sm font-bold text-gray-700">Service Charge</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Service Charge Aktif</span>
          <button type="button" onClick={() => onUpdate({ service_charge_enabled: !settings.service_charge_enabled })} className={`w-12 h-7 rounded-full transition-colors ${settings.service_charge_enabled ? "bg-green-500" : "bg-gray-300"}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.service_charge_enabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        {settings.service_charge_enabled && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Persentase (%)</label>
            <input type="number" value={settings.service_charge_percentage} onChange={(e) => onUpdate({ service_charge_percentage: parseFloat(e.target.value) || 0 })} min={0} max={30} step={0.5} className="w-full px-3 py-2 border border-pos-border rounded-lg text-sm focus:outline-none focus:border-brand-primary" />
          </div>
        )}
      </div>
    </div>
  );
}

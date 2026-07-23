"use client";

import { useState, useEffect } from "react";
import { Button } from "@kasirsolo/ui";
import type { PosSettings } from "@/lib/db";

interface StoreSettingsProps {
  settings: PosSettings;
  onUpdate: (updates: Partial<PosSettings>) => Promise<void>;
  saving: boolean;
}

export function StoreSettings({ settings, onUpdate, saving }: StoreSettingsProps) {
  const [storeName, setStoreName] = useState(settings.store_name);
  const [storeAddress, setStoreAddress] = useState(settings.store_address);
  const [storePhone, setStorePhone] = useState(settings.store_phone);
  const [taxEnabled, setTaxEnabled] = useState(settings.tax_enabled);
  const [taxPercentage, setTaxPercentage] = useState(settings.tax_percentage);

  useEffect(() => {
    setStoreName(settings.store_name);
    setStoreAddress(settings.store_address);
    setStorePhone(settings.store_phone);
    setTaxEnabled(settings.tax_enabled);
    setTaxPercentage(settings.tax_percentage);
  }, [settings]);

  async function handleSave() {
    await onUpdate({
      store_name: storeName,
      store_address: storeAddress,
      store_phone: storePhone,
      tax_enabled: taxEnabled,
      tax_percentage: taxPercentage,
    });
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-heading font-bold text-gray-900">Informasi Toko</h3>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Nama Toko</label>
        <input
          type="text"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          placeholder="Nama toko Anda"
          className="w-full px-4 py-3 bg-white border border-pos-border rounded-xl text-base
            focus:outline-none focus:border-brand-primary"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Alamat</label>
        <textarea
          value={storeAddress}
          onChange={(e) => setStoreAddress(e.target.value)}
          placeholder="Alamat toko"
          rows={2}
          className="w-full px-4 py-3 bg-white border border-pos-border rounded-xl text-base resize-none
            focus:outline-none focus:border-brand-primary"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">No. Telepon</label>
        <input
          type="tel"
          value={storePhone}
          onChange={(e) => setStorePhone(e.target.value)}
          placeholder="08xx-xxxx-xxxx"
          className="w-full px-4 py-3 bg-white border border-pos-border rounded-xl text-base
            focus:outline-none focus:border-brand-primary"
        />
      </div>

      <div className="border-t border-pos-border pt-4">
        <h3 className="text-base font-heading font-bold text-gray-900 mb-3">Pajak</h3>

        <label className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={taxEnabled}
            onChange={(e) => setTaxEnabled(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
          />
          <span className="text-sm text-gray-700">Aktifkan pajak (PPN)</span>
        </label>

        {taxEnabled && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Persentase Pajak (%)</label>
            <input
              type="number"
              value={taxPercentage}
              onChange={(e) => setTaxPercentage(parseInt(e.target.value) || 0)}
              min={0}
              max={100}
              className="w-full px-4 py-3 bg-white border border-pos-border rounded-xl text-base
                focus:outline-none focus:border-brand-primary"
            />
          </div>
        )}
      </div>

      <Button variant="primary" fullWidth onClick={handleSave} loading={saving}>
        Simpan Pengaturan
      </Button>
    </div>
  );
}

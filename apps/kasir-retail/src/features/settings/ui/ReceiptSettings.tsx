"use client";

import { useState, useEffect } from "react";
import { Button } from "@kasirsolo/ui";
import type { PosSettings } from "@/lib/db";

interface ReceiptSettingsProps {
  settings: PosSettings;
  onUpdate: (updates: Partial<PosSettings>) => Promise<void>;
  saving: boolean;
}

export function ReceiptSettings({ settings, onUpdate, saving }: ReceiptSettingsProps) {
  const [footer, setFooter] = useState(settings.receipt_footer);
  const [format, setFormat] = useState(settings.receipt_format);
  const [autoPrint, setAutoPrint] = useState(settings.auto_print_receipt);
  const [soundEnabled, setSoundEnabled] = useState(settings.sound_enabled);

  useEffect(() => {
    setFooter(settings.receipt_footer);
    setFormat(settings.receipt_format);
    setAutoPrint(settings.auto_print_receipt);
    setSoundEnabled(settings.sound_enabled);
  }, [settings]);

  async function handleSave() {
    await onUpdate({
      receipt_footer: footer,
      receipt_format: format,
      auto_print_receipt: autoPrint,
      sound_enabled: soundEnabled,
    });
  }

  const formats: { value: PosSettings["receipt_format"]; label: string }[] = [
    { value: "thermal_58mm", label: "Thermal 58mm" },
    { value: "thermal_80mm", label: "Thermal 80mm" },
    { value: "a4", label: "A4" },
    { value: "digital", label: "Digital / WA" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-base font-heading font-bold text-gray-900">Pengaturan Struk</h3>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Format Struk</label>
        <div className="grid grid-cols-2 gap-2">
          {formats.map((f) => (
            <button
              key={f.value}
              onClick={() => setFormat(f.value)}
              className={`py-3 rounded-xl border text-sm font-medium transition-colors
                ${format === f.value
                  ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                  : "border-pos-border bg-white text-gray-600"}`}
              type="button"
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Pesan Footer Struk</label>
        <textarea
          value={footer}
          onChange={(e) => setFooter(e.target.value)}
          placeholder="Terima kasih atas kunjungan Anda!"
          rows={2}
          className="w-full px-4 py-3 bg-white border border-pos-border rounded-xl text-base resize-none
            focus:outline-none focus:border-brand-primary"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={autoPrint}
            onChange={(e) => setAutoPrint(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
          />
          <div>
            <span className="text-sm text-gray-700">Auto cetak struk</span>
            <p className="text-xs text-gray-400">Cetak otomatis setelah transaksi selesai</p>
          </div>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
          />
          <div>
            <span className="text-sm text-gray-700">Suara transaksi</span>
            <p className="text-xs text-gray-400">Bunyi setelah pembayaran berhasil</p>
          </div>
        </label>
      </div>

      <Button variant="primary" fullWidth onClick={handleSave} loading={saving}>
        Simpan Pengaturan
      </Button>
    </div>
  );
}

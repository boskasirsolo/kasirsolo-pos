"use client";

import { useState, useEffect } from "react";
import { FnbShell } from "@/components/layout/FnbShell";
import { GeneralSettings, TableSettings, KitchenSettings, TaxSettings, ReceiptSettings, DeviceInfo, useSettings } from "@/features/settings";
import type { SettingsTab } from "@/features/settings";
import { useAuth } from "@/features/auth";
import { useToast } from "@kasirsolo/ui";
import { getLicenseStatus, type LicenseStatus } from "@/lib/license";
import type { FnbSettings } from "@/lib/db";

const TABS: { value: SettingsTab; label: string }[] = [
  { value: "general", label: "Umum" },
  { value: "tax", label: "Pajak" },
  { value: "table", label: "Meja" },
  { value: "kitchen", label: "Dapur" },
  { value: "receipt", label: "Struk" },
  { value: "device", label: "Perangkat" },
];

export default function SettingsPage() {
  const { settings, loading, saving, updateSettings } = useSettings();
  const { logout } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState<SettingsTab>("general");
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);

  useEffect(() => {
    getLicenseStatus().then(setLicenseStatus).catch(() => {});
  }, []);

  async function handleUpdate(updates: Partial<FnbSettings>) {
    try {
      await updateSettings(updates);
      addToast({ type: "success", title: "Pengaturan disimpan" });
    } catch {
      addToast({ type: "error", title: "Gagal menyimpan" });
    }
  }

  if (loading || !settings) {
    return (
      <FnbShell>
        <div className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      </FnbShell>
    );
  }

  return (
    <FnbShell>
      <div>
        <div className="px-4 pt-3 pb-2">
          <h1 className="text-lg font-heading font-bold text-gray-900">Pengaturan</h1>
        </div>

        {/* Tab selector */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 pb-3">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${tab === t.value
                  ? "bg-brand-primary text-white"
                  : "bg-white text-gray-600 border border-pos-border"}`}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-4 pb-8">
          {tab === "general" && <GeneralSettings settings={settings} onUpdate={handleUpdate} saving={saving} />}
          {tab === "tax" && <TaxSettings settings={settings} onUpdate={handleUpdate} />}
          {tab === "table" && <TableSettings settings={settings} onUpdate={handleUpdate} />}
          {tab === "kitchen" && <KitchenSettings settings={settings} onUpdate={handleUpdate} />}
          {tab === "receipt" && <ReceiptSettings settings={settings} onUpdate={handleUpdate} />}
          {tab === "device" && <DeviceInfo licenseStatus={licenseStatus} onLogout={logout} />}
        </div>
      </div>
    </FnbShell>
  );
}

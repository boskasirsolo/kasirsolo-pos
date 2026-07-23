"use client";

import { PosShell } from "@/components/layout/PosShell";
import { SettingsPage, useSettings } from "@/features/settings";
import { useAuth } from "@/features/auth";
import { useToast } from "@kasirsolo/ui";
import { getLicenseStatus, type LicenseStatus } from "@/lib/license";
import { useEffect, useState } from "react";

export default function SettingsPageRoute() {
  const { settings, loading, saving, updateSettings } = useSettings();
  const { logout } = useAuth();
  const { addToast } = useToast();
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);

  useEffect(() => {
    getLicenseStatus().then(setLicenseStatus).catch(() => {});
  }, []);

  async function handleUpdateSettings(updates: Parameters<typeof updateSettings>[0]) {
    try {
      await updateSettings(updates);
      addToast({ type: "success", title: "Pengaturan disimpan" });
    } catch {
      addToast({ type: "error", title: "Gagal menyimpan pengaturan" });
    }
  }

  if (loading) {
    return (
      <PosShell>
        <div className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      </PosShell>
    );
  }

  return (
    <PosShell>
      <div>
        <div className="px-4 pt-3 pb-2">
          <h1 className="text-lg font-heading font-bold text-gray-900">Pengaturan</h1>
        </div>
        <SettingsPage
          settings={settings}
          licenseStatus={licenseStatus}
          onUpdateSettings={handleUpdateSettings}
          onLogout={logout}
          saving={saving}
        />
      </div>
    </PosShell>
  );
}

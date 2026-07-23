"use client";

import { Button } from "@kasirsolo/ui";
import type { LicenseStatus } from "@/lib/license";

interface DeviceInfoProps {
  licenseStatus: LicenseStatus | null;
  onLogout: () => void;
}

export function DeviceInfo({ licenseStatus, onLogout }: DeviceInfoProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-pos-border p-4 space-y-2">
        <h3 className="text-sm font-bold text-gray-700">Informasi Perangkat</h3>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Aplikasi</span>
          <span className="font-medium">KASIRSOLO F&B v0.1.0</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status Lisensi</span>
          <span className={`font-medium ${licenseStatus?.valid ? "text-green-600" : "text-red-500"}`}>
            {licenseStatus?.type === "trial" ? `Trial (${licenseStatus.trialDaysLeft}h)` : licenseStatus?.type === "licensed" ? "Berlisensi" : "Tidak Aktif"}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-pos-border p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Tentang</h3>
        <p className="text-xs text-gray-500 mb-4">
          KASIRSOLO F&B adalah aplikasi kasir offline-first untuk bisnis Food & Beverage.
          Dibuat oleh PT Mesin Kasir Solo.
        </p>
        <Button variant="outline" fullWidth onClick={onLogout}>
          Keluar / Logout
        </Button>
      </div>
    </div>
  );
}

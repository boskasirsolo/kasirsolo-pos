"use client";

import { useEffect, useState } from "react";
import { Badge, Button } from "@kasirsolo/ui";
import { formatDate } from "@kasirsolo/utils";
import { getDeviceInfo, getLicenseDevices, removeDevice } from "@/lib/device";
import type { DeviceInfo } from "@/lib/device";
import type { KspDevice } from "@kasirsolo/db";
import type { LicenseStatus } from "@/lib/license";
import { useToast } from "@kasirsolo/ui";

interface DeviceSettingsProps {
  licenseStatus: LicenseStatus | null;
}

export function DeviceSettings({ licenseStatus }: DeviceSettingsProps) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [devices, setDevices] = useState<KspDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        const [info, devs] = await Promise.all([
          getDeviceInfo(),
          getLicenseDevices(),
        ]);
        setDeviceInfo(info);
        setDevices(devs);
      } catch {
        // Ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleUnbind(deviceId: string) {
    if (!confirm("Lepas perangkat ini? Perangkat harus diaktivasi ulang.")) return;
    try {
      await removeDevice(deviceId);
      setDevices((prev) => prev.filter((d) => d.id !== deviceId));
      addToast({ type: "success", title: "Perangkat dilepas" });
    } catch {
      addToast({ type: "error", title: "Gagal melepas perangkat" });
    }
  }

  if (loading) {
    return <div className="h-32 bg-white rounded-xl animate-pulse" />;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-heading font-bold text-gray-900">Perangkat & Lisensi</h3>

      {/* License Status */}
      <div className="bg-white rounded-xl border border-pos-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status Lisensi</span>
          {licenseStatus && (
            <Badge
              status={
                licenseStatus.type === "licensed"
                  ? "active"
                  : licenseStatus.type === "trial"
                    ? "trial"
                    : "expired"
              }
            >
              {licenseStatus.type === "licensed"
                ? "Aktif"
                : licenseStatus.type === "trial"
                  ? `Trial (${licenseStatus.trialDaysLeft}h)`
                  : "Expired"}
            </Badge>
          )}
        </div>
        {licenseStatus?.license && (
          <>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Kode Lisensi</span>
              <span className="text-gray-700 font-mono">{licenseStatus.license.license_key}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Maks. Perangkat</span>
              <span className="text-gray-700">{licenseStatus.license.max_devices}</span>
            </div>
          </>
        )}
      </div>

      {/* Current Device */}
      {deviceInfo && (
        <div className="bg-white rounded-xl border border-pos-border p-4 space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">Perangkat Ini</h4>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Nama</span>
            <span className="text-gray-700">{deviceInfo.deviceName}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">ID</span>
            <span className="text-gray-700 font-mono text-[10px] truncate max-w-[200px]">
              {deviceInfo.deviceId}
            </span>
          </div>
        </div>
      )}

      {/* All Devices */}
      {devices.length > 0 && (
        <div className="bg-white rounded-xl border border-pos-border p-4 space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">
            Perangkat Terdaftar ({devices.filter((d) => d.is_active).length})
          </h4>
          {devices.map((device) => (
            <div key={device.id} className="flex items-center justify-between py-2 border-t border-pos-border first:border-t-0">
              <div>
                <p className="text-sm text-gray-900">
                  {device.device_name || `Perangkat ${device.device_number}`}
                </p>
                <p className="text-[10px] text-gray-400">
                  {device.last_seen_at
                    ? `Terakhir aktif: ${formatDate(device.last_seen_at, { relative: true })}`
                    : `Aktif sejak: ${formatDate(device.activated_at, { short: true })}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge status={device.is_active ? "active" : "locked"} size="sm">
                  {device.is_active ? "Aktif" : "Nonaktif"}
                </Badge>
                {device.is_active && (
                  <button
                    onClick={() => handleUnbind(device.id)}
                    className="text-[10px] text-red-400 hover:text-red-600"
                    type="button"
                  >
                    Lepas
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSync } from "@/features/sync/logic/useSync";
import { SyncConflictModal } from "@/features/sync/ui/SyncConflictModal";
import { UpgradePrompt } from "@/features/sync/ui/UpgradePrompt";
import type { LicenseStatus } from "@/lib/license";

// ---------------------------------------------------------------------------
// /sync — Client-side sync page (extracted for ssr:false)
// ---------------------------------------------------------------------------

export default function SyncPageClient() {
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  // Load license info on mount
  useEffect(() => {
    async function loadLicenseInfo() {
      try {
        const { getLicenseStatus: getLicStatus } = await import("@/lib/license");
        const status = await getLicStatus();
        setLicenseStatus(status);

        const { checkDeviceBinding } = await import("@/lib/device");
        const binding = await checkDeviceBinding();
        if (binding.device) {
          setDeviceId(binding.device.id);
        }
      } catch {
        // License info not available
      }
    }
    loadLicenseInfo();
  }, []);

  const planType = licenseStatus?.license?.plan_type ?? null;

  const sync = useSync({
    planType,
    deviceId,
    autoStart: true,
  });

  const pendingByStore = sync.syncState?.pendingByStore ?? {
    products: 0,
    transactions: 0,
    categories: 0,
    stockAdjustments: 0,
    receipts: 0,
    dailyReports: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <a
            href="/pos"
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Kembali"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Sinkronisasi</h1>
            <p className="text-xs text-gray-500">
              Kelola sinkronisasi data antara perangkat dan cloud
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {/* Status Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Status</h2>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  sync.displayStatus === "synced"
                    ? "bg-green-400"
                    : sync.displayStatus === "pending"
                    ? "bg-yellow-400"
                    : sync.displayStatus === "syncing"
                    ? "bg-blue-400 animate-pulse"
                    : sync.displayStatus === "offline"
                    ? "bg-gray-400"
                    : sync.displayStatus === "error"
                    ? "bg-red-400"
                    : "bg-gray-300"
                }`}
              />
              <span className="text-xs text-gray-600">
                {sync.displayStatus === "synced" && "Tersinkron"}
                {sync.displayStatus === "pending" && `${sync.pendingCount} menunggu`}
                {sync.displayStatus === "syncing" && "Menyinkronkan..."}
                {sync.displayStatus === "offline" && "Offline"}
                {sync.displayStatus === "error" && "Error"}
                {sync.displayStatus === "disabled" && "Tidak aktif"}
              </span>
            </div>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Terakhir sinkron</span>
              <span className="text-gray-700">
                {sync.lastSyncAt
                  ? new Date(sync.lastSyncAt).toLocaleString("id-ID", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Belum pernah"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Auto-sync</span>
              <span className="text-gray-700">
                {sync.isRunning ? "Aktif (setiap 5 menit)" : "Nonaktif"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Koneksi</span>
              <span className={sync.isOnline ? "text-green-600" : "text-red-600"}>
                {sync.isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* Pending Records */}
        {sync.pendingCount > 0 && (
          <div className="bg-white rounded-xl border border-yellow-200 p-4">
            <h2 className="text-sm font-semibold text-yellow-800 mb-3">
              Data Menunggu ({sync.pendingCount})
            </h2>
            <div className="space-y-2">
              {Object.entries(pendingByStore).map(([key, count]) => {
                if (count === 0) return null;
                const names: Record<string, string> = {
                  products: "Produk",
                  transactions: "Transaksi",
                  categories: "Kategori",
                  stockAdjustments: "Stok",
                  receipts: "Struk",
                  dailyReports: "Laporan",
                };
                return (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-gray-600">{names[key] ?? key}</span>
                    <span className="font-medium text-yellow-700">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sync Button */}
        {sync.isCloudUser && (
          <button
            type="button"
            onClick={() => sync.syncNow()}
            disabled={sync.displayStatus === "syncing" || sync.displayStatus === "offline"}
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
              sync.displayStatus === "syncing" || sync.displayStatus === "offline"
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-brand-primary text-white hover:bg-brand-primary/90 active:scale-[0.98] shadow-sm"
            }`}
          >
            {sync.displayStatus === "syncing" ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menyinkronkan...
              </span>
            ) : (
              "Sinkronkan Sekarang"
            )}
          </button>
        )}

        {/* Conflicts */}
        {sync.conflicts.length > 0 && (
          <div className="bg-white rounded-xl border border-orange-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-orange-800">
                Konflik ({sync.conflicts.length})
              </h2>
              <button
                type="button"
                onClick={() => setIsConflictModalOpen(true)}
                className="text-xs text-orange-600 hover:text-orange-700"
              >
                Lihat semua
              </button>
            </div>
            <p className="text-xs text-orange-600">
              Konflik diselesaikan otomatis. Versi terbaru menang.
            </p>
          </div>
        )}

        {/* Errors */}
        {sync.errors.length > 0 && (
          <div className="bg-white rounded-xl border border-red-200 p-4">
            <h2 className="text-sm font-semibold text-red-800 mb-2">
              Kesalahan
            </h2>
            <ul className="text-xs text-red-600 space-y-1">
              {sync.errors.slice(0, 5).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Sync History */}
        {sync.history.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              Riwayat
            </h2>
            <div className="space-y-2">
              {sync.history.slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        entry.success ? "bg-green-400" : "bg-red-400"
                      }`}
                    />
                    <span className="text-gray-600">
                      {new Date(entry.completedAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-500">
                    {entry.pushed > 0 && <span>Kirim: {entry.pushed}</span>}
                    {entry.pulled > 0 && <span>Terima: {entry.pulled}</span>}
                    <span className="text-gray-400">{entry.durationMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upgrade Prompt for offline users */}
        {!sync.isCloudUser && (
          <UpgradePrompt show={true} />
        )}
      </div>

      {/* Conflict Modal */}
      <SyncConflictModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        conflicts={sync.conflicts}
      />
    </div>
  );
}

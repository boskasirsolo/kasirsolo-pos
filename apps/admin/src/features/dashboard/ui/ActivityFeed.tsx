"use client";

import { timeAgo } from "@/lib/utils";
import type { ActivityLogEntry } from "../data/types";

interface ActivityFeedProps {
  items: ActivityLogEntry[];
  loading: boolean;
}

const actionLabels: Record<string, string> = {
  trial_created: "Trial baru dibuat",
  license_activated: "Lisensi diaktifkan",
  payment_received: "Pembayaran diterima",
  payment_verified: "Pembayaran diverifikasi",
  device_registered: "Perangkat didaftarkan",
  device_removed: "Perangkat dihapus",
  client_updated: "Data klien diperbarui",
  license_expired: "Lisensi kedaluwarsa",
  trial_extended: "Trial diperpanjang",
  key_generated: "Key baru di-generate",
  client_locked: "Klien dikunci",
  client_suspended: "Klien disuspend",
};

const actionIcons: Record<string, { bg: string; color: string }> = {
  trial_created: { bg: "bg-blue-50", color: "text-blue-600" },
  license_activated: { bg: "bg-green-50", color: "text-green-600" },
  payment_received: { bg: "bg-purple-50", color: "text-purple-600" },
  payment_verified: { bg: "bg-green-50", color: "text-green-600" },
  device_registered: { bg: "bg-cyan-50", color: "text-cyan-600" },
  device_removed: { bg: "bg-red-50", color: "text-red-600" },
  client_updated: { bg: "bg-gray-50", color: "text-gray-600" },
  license_expired: { bg: "bg-amber-50", color: "text-amber-600" },
  trial_extended: { bg: "bg-indigo-50", color: "text-indigo-600" },
  key_generated: { bg: "bg-orange-50", color: "text-orange-600" },
  client_locked: { bg: "bg-red-50", color: "text-red-600" },
  client_suspended: { bg: "bg-red-50", color: "text-red-600" },
};

export default function ActivityFeed({ items, loading }: ActivityFeedProps) {
  if (loading) {
    return (
      <div className="card">
        <h3 className="mb-4 font-heading text-base font-semibold text-gray-900">Aktivitas Terbaru</h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-3 w-40 rounded bg-gray-200" />
                <div className="mt-1 h-3 w-24 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="mb-4 font-heading text-base font-semibold text-gray-900">Aktivitas Terbaru</h3>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">Belum ada aktivitas</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const style = actionIcons[item.action] ?? { bg: "bg-gray-50", color: "text-gray-600" };
            const label = actionLabels[item.action] ?? item.action;

            return (
              <div key={item.id} className="flex items-start gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${style.bg}`}>
                  <div className={`h-2 w-2 rounded-full ${style.color.replace("text-", "bg-")}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700">{label}</p>
                  <p className="text-xs text-gray-400">{timeAgo(item.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

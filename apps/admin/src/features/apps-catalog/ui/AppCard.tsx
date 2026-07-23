"use client";

import { formatRupiah } from "@/lib/utils";
import type { AppWithStats } from "../data/types";

interface AppCardProps {
  app: AppWithStats;
  onToggle: (id: string, isActive: boolean) => void;
}

export default function AppCard({ app, onToggle }: AppCardProps) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
            {app.icon_url ? (
              <img src={app.icon_url} alt={app.name} className="h-8 w-8 rounded" />
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="font-heading text-sm font-semibold text-gray-900">{app.name}</h3>
            <p className="text-xs text-gray-400">v{app.version}</p>
          </div>
        </div>
        <button
          onClick={() => onToggle(app.id, !app.is_active)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
            app.is_active ? "bg-brand-primary" : "bg-gray-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
              app.is_active ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {app.description && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{app.description}</p>
      )}

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <p className="text-lg font-semibold text-gray-900">{app.active_licenses}</p>
          <p className="text-[10px] text-gray-500">Lisensi Aktif</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-2 text-center">
          <p className="text-lg font-semibold text-gray-900">{app.total_licenses}</p>
          <p className="text-[10px] text-gray-500">Total Lisensi</p>
        </div>
      </div>

      {/* Pricing */}
      <div className="mt-4 border-t border-surface-border pt-3">
        <p className="mb-2 text-xs font-medium uppercase text-gray-400">Harga</p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <span className="text-gray-500">Basic: <span className="font-medium text-gray-700">{formatRupiah(app.pricing.basic)}</span></span>
          <span className="text-gray-500">Pro: <span className="font-medium text-gray-700">{formatRupiah(app.pricing.pro)}</span></span>
          <span className="text-gray-500">Enterprise: <span className="font-medium text-gray-700">{formatRupiah(app.pricing.enterprise)}</span></span>
          <span className="text-gray-500">Lifetime: <span className="font-medium text-gray-700">{formatRupiah(app.pricing.lifetime)}</span></span>
        </div>
      </div>
    </div>
  );
}

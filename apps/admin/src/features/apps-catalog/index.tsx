"use client";

import { useAppsCatalog } from "./logic/useAppsCatalog";
import AppCard from "./ui/AppCard";

export default function AppsCatalogFeature() {
  const { apps, loading, error, toggleStatus } = useAppsCatalog();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg font-semibold text-gray-900">Katalog Aplikasi</h2>
        <p className="text-sm text-gray-500">Kelola aplikasi yang tersedia di platform KASIRSOLO</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gray-200" />
                <div>
                  <div className="h-4 w-24 rounded bg-gray-200" />
                  <div className="mt-1 h-3 w-12 rounded bg-gray-200" />
                </div>
              </div>
              <div className="mt-3 h-8 rounded bg-gray-200" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="h-14 rounded-lg bg-gray-100" />
                <div className="h-14 rounded-lg bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : apps.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="text-sm text-gray-400">Belum ada aplikasi terdaftar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} onToggle={toggleStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

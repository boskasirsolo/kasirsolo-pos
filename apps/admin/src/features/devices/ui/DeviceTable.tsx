"use client";

import { formatDateTime } from "@/lib/utils";
import type { DeviceWithRelations, DeviceFilter } from "../data/types";

interface DeviceTableProps {
  devices: DeviceWithRelations[];
  loading: boolean;
  filter: DeviceFilter;
  total: number;
  onFilterChange: (filter: DeviceFilter) => void;
  onDeactivate: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function DeviceTable({
  devices,
  loading,
  filter,
  total,
  onFilterChange,
  onDeactivate,
  onRemove,
}: DeviceTableProps) {
  const totalPages = Math.ceil(total / filter.perPage);

  return (
    <div className="card p-0">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-surface-border p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama device, fingerprint..."
            value={filter.search}
            onChange={(e) => onFilterChange({ ...filter, search: e.target.value, page: 1 })}
            className="input pl-9"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={filter.activeOnly}
            onChange={(e) => onFilterChange({ ...filter, activeOnly: e.target.checked, page: 1 })}
            className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
          />
          Aktif saja
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-4 py-3">Perangkat</th>
              <th className="px-4 py-3">Klien</th>
              <th className="px-4 py-3">Lisensi</th>
              <th className="px-4 py-3">Slot</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Terakhir Online</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="table-cell"><div className="h-4 w-20 rounded bg-gray-200" /></td>
                  ))}
                </tr>
              ))
            ) : devices.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                  Tidak ada perangkat terdaftar
                </td>
              </tr>
            ) : (
              devices.map((device) => (
                <tr key={device.id} className="transition-colors hover:bg-gray-50">
                  <td className="table-cell">
                    <p className="text-sm font-medium text-gray-900">{device.device_name || "Unnamed"}</p>
                    <code className="text-[10px] text-gray-400">{device.fingerprint.slice(0, 16)}...</code>
                  </td>
                  <td className="table-cell text-sm">{device.client_name ?? "-"}</td>
                  <td className="table-cell">
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px]">
                      {device.license_key ?? "-"}
                    </code>
                  </td>
                  <td className="table-cell text-sm text-center">#{device.device_number}</td>
                  <td className="table-cell">
                    <span className={device.is_active ? "badge-success" : "badge-neutral"}>
                      {device.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="table-cell text-xs text-gray-500">
                    {formatDateTime(device.last_seen_at)}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      {device.is_active && (
                        <button
                          onClick={() => onDeactivate(device.id)}
                          className="rounded px-2 py-1 text-xs text-amber-600 hover:bg-amber-50"
                        >
                          Nonaktifkan
                        </button>
                      )}
                      <button
                        onClick={() => onRemove(device.id)}
                        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-surface-border px-4 py-3">
          <p className="text-xs text-gray-500">{total} perangkat</p>
          <div className="flex gap-1">
            <button
              onClick={() => onFilterChange({ ...filter, page: filter.page - 1 })}
              disabled={filter.page <= 1}
              className="btn-secondary px-3 py-1 text-xs disabled:opacity-30"
            >Prev</button>
            <button
              onClick={() => onFilterChange({ ...filter, page: filter.page + 1 })}
              disabled={filter.page >= totalPages}
              className="btn-secondary px-3 py-1 text-xs disabled:opacity-30"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

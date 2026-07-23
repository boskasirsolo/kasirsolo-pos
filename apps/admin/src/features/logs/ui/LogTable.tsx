"use client";

import { formatDateTime } from "@/lib/utils";
import type { ActivityLog, LogFilter } from "../data/types";

interface LogTableProps {
  logs: ActivityLog[];
  loading: boolean;
  filter: LogFilter;
  total: number;
  onFilterChange: (filter: LogFilter) => void;
}

const actionLabels: Record<string, string> = {
  trial_created: "Trial Dibuat",
  license_activated: "Lisensi Diaktifkan",
  payment_received: "Pembayaran Diterima",
  payment_verified: "Pembayaran Diverifikasi",
  device_registered: "Perangkat Didaftarkan",
  device_removed: "Perangkat Dihapus",
  client_updated: "Klien Diperbarui",
  license_expired: "Lisensi Expired",
  trial_extended: "Trial Diperpanjang",
  key_generated: "Key Generated",
  client_locked: "Klien Dikunci",
  client_suspended: "Klien Disuspend",
};

export default function LogTable({ logs, loading, filter, total, onFilterChange }: LogTableProps) {
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
            placeholder="Cari log..."
            value={filter.search}
            onChange={(e) => onFilterChange({ ...filter, search: e.target.value, page: 1 })}
            className="input pl-9"
          />
        </div>
        <select
          value={filter.action}
          onChange={(e) => onFilterChange({ ...filter, action: e.target.value, page: 1 })}
          className="input w-auto"
        >
          <option value="all">Semua Aksi</option>
          <option value="trial_created">Trial Dibuat</option>
          <option value="license_activated">Lisensi Diaktifkan</option>
          <option value="payment_received">Pembayaran</option>
          <option value="payment_verified">Verifikasi</option>
          <option value="key_generated">Key Generated</option>
          <option value="trial_extended">Trial Extended</option>
          <option value="client_locked">Client Locked</option>
        </select>
        <select
          value={filter.entityType}
          onChange={(e) => onFilterChange({ ...filter, entityType: e.target.value, page: 1 })}
          className="input w-auto"
        >
          <option value="all">Semua Entity</option>
          <option value="client">Client</option>
          <option value="license">License</option>
          <option value="device">Device</option>
          <option value="payment">Payment</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-4 py-3">Waktu</th>
              <th className="px-4 py-3">Aksi</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3">Entity ID</th>
              <th className="px-4 py-3">Detail</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="table-cell"><div className="h-4 w-20 rounded bg-gray-200" /></td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                  Tidak ada log aktivitas
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="transition-colors hover:bg-gray-50">
                  <td className="table-cell text-xs text-gray-500 whitespace-nowrap">
                    {formatDateTime(log.created_at)}
                  </td>
                  <td className="table-cell">
                    <span className="text-sm font-medium text-gray-900">
                      {actionLabels[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className="badge-neutral capitalize">{log.entity_type}</span>
                  </td>
                  <td className="table-cell">
                    <code className="text-[10px] text-gray-400">{log.entity_id.slice(0, 8)}...</code>
                  </td>
                  <td className="table-cell">
                    <code className="text-[10px] text-gray-400 line-clamp-1">
                      {JSON.stringify(log.details).slice(0, 80)}
                    </code>
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
          <p className="text-xs text-gray-500">{total} log - Hal {filter.page}/{totalPages}</p>
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

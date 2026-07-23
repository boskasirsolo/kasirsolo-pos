"use client";

import { formatDate, formatRupiah } from "@/lib/utils";
import type { LicenseWithClient, LicenseFilter } from "../data/types";

interface LicenseTableProps {
  licenses: LicenseWithClient[];
  loading: boolean;
  filter: LicenseFilter;
  total: number;
  onFilterChange: (filter: LicenseFilter) => void;
  onRevoke: (id: string) => void;
}

const statusBadge: Record<string, string> = {
  active: "badge-success",
  expired: "badge-warning",
  revoked: "badge-danger",
  suspended: "badge-neutral",
  pending: "badge-info",
};

const planBadge: Record<string, string> = {
  trial: "bg-blue-50 text-blue-700",
  basic: "bg-gray-50 text-gray-700",
  pro: "bg-purple-50 text-purple-700",
  enterprise: "bg-amber-50 text-amber-700",
  lifetime: "bg-emerald-50 text-emerald-700",
};

export default function LicenseTable({
  licenses,
  loading,
  filter,
  total,
  onFilterChange,
  onRevoke,
}: LicenseTableProps) {
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
            placeholder="Cari license key..."
            value={filter.search}
            onChange={(e) => onFilterChange({ ...filter, search: e.target.value, page: 1 })}
            className="input pl-9"
          />
        </div>
        <select
          value={filter.status}
          onChange={(e) => onFilterChange({ ...filter, status: e.target.value as LicenseFilter["status"], page: 1 })}
          className="input w-auto"
        >
          <option value="all">Semua Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
        <select
          value={filter.planType}
          onChange={(e) => onFilterChange({ ...filter, planType: e.target.value as LicenseFilter["planType"], page: 1 })}
          className="input w-auto"
        >
          <option value="all">Semua Plan</option>
          <option value="trial">Trial</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
          <option value="lifetime">Lifetime</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-4 py-3">License Key</th>
              <th className="px-4 py-3">Klien</th>
              <th className="px-4 py-3">Aplikasi</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Bayar</th>
              <th className="px-4 py-3">Berlaku</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="table-cell"><div className="h-4 w-20 rounded bg-gray-200" /></td>
                  ))}
                </tr>
              ))
            ) : licenses.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-gray-400">
                  Tidak ada data lisensi
                </td>
              </tr>
            ) : (
              licenses.map((license) => (
                <tr key={license.id} className="transition-colors hover:bg-gray-50">
                  <td className="table-cell">
                    <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs">
                      {license.license_key}
                    </code>
                  </td>
                  <td className="table-cell">
                    <p className="text-sm font-medium">{license.client_name ?? "-"}</p>
                    <p className="text-xs text-gray-400">{license.client_phone ?? ""}</p>
                  </td>
                  <td className="table-cell text-sm">{license.app_name ?? "-"}</td>
                  <td className="table-cell">
                    <span className={`badge ${planBadge[license.plan_type as keyof typeof planBadge] ?? "bg-gray-50 text-gray-700"}`}>
                      {license.plan_type?.toUpperCase() ?? "UNKNOWN"}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={statusBadge[license.status] ?? "badge-neutral"}>
                      {license.status}
                    </span>
                  </td>
                  <td className="table-cell text-sm">
                    {formatRupiah(license.amount_paid)}
                  </td>
                  <td className="table-cell text-xs text-gray-500">
                    {license.expires_at ? formatDate(license.expires_at) : "Lifetime"}
                  </td>
                  <td className="table-cell">
                    {license.status === "active" && (
                      <button
                        onClick={() => onRevoke(license.id)}
                        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Revoke
                      </button>
                    )}
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
          <p className="text-xs text-gray-500">
            {total} lisensi - Hal {filter.page}/{totalPages}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => onFilterChange({ ...filter, page: filter.page - 1 })}
              disabled={filter.page <= 1}
              className="btn-secondary px-3 py-1 text-xs disabled:opacity-30"
            >
              Prev
            </button>
            <button
              onClick={() => onFilterChange({ ...filter, page: filter.page + 1 })}
              disabled={filter.page >= totalPages}
              className="btn-secondary px-3 py-1 text-xs disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

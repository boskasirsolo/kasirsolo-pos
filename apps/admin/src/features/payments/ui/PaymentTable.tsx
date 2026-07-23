"use client";

import { formatRupiah, formatDateTime } from "@/lib/utils";
import type { PaymentWithClient, PaymentFilter, PaymentStatus } from "../data/types";

interface PaymentTableProps {
  payments: PaymentWithClient[];
  loading: boolean;
  filter: PaymentFilter;
  total: number;
  onFilterChange: (filter: PaymentFilter) => void;
  onChangeStatus: (id: string, status: PaymentStatus) => void;
}

const statusBadge: Record<PaymentStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "badge-warning" },
  verified: { label: "Verified", className: "badge-success" },
  rejected: { label: "Rejected", className: "badge-danger" },
  refunded: { label: "Refunded", className: "badge-info" },
};

export default function PaymentTable({
  payments,
  loading,
  filter,
  total,
  onFilterChange,
  onChangeStatus,
}: PaymentTableProps) {
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
            placeholder="Cari pembayaran..."
            value={filter.search}
            onChange={(e) => onFilterChange({ ...filter, search: e.target.value, page: 1 })}
            className="input pl-9"
          />
        </div>
        <select
          value={filter.status}
          onChange={(e) => onFilterChange({ ...filter, status: e.target.value as PaymentFilter["status"], page: 1 })}
          className="input w-auto"
        >
          <option value="all">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-4 py-3">Klien</th>
              <th className="px-4 py-3">Jumlah</th>
              <th className="px-4 py-3">Metode</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Bukti</th>
              <th className="px-4 py-3">Tanggal</th>
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
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                  Tidak ada data pembayaran
                </td>
              </tr>
            ) : (
              payments.map((payment) => {
                const badge = statusBadge[payment.status];
                return (
                  <tr key={payment.id} className="transition-colors hover:bg-gray-50">
                    <td className="table-cell">
                      <p className="text-sm font-medium">{payment.client_name ?? "-"}</p>
                      <p className="text-xs text-gray-400">{payment.client_phone ?? ""}</p>
                    </td>
                    <td className="table-cell text-sm font-semibold text-gray-900">
                      {formatRupiah(payment.amount)}
                    </td>
                    <td className="table-cell text-sm capitalize">{payment.method}</td>
                    <td className="table-cell">
                      <span className={badge.className}>{badge.label}</span>
                    </td>
                    <td className="table-cell">
                      {payment.proof_url ? (
                        <a
                          href={payment.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-brand-primary hover:underline"
                        >
                          Lihat Bukti
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="table-cell text-xs text-gray-500">
                      {formatDateTime(payment.created_at)}
                    </td>
                    <td className="table-cell">
                      {payment.status === "pending" && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onChangeStatus(payment.id, "verified")}
                            className="rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                          >
                            Terima
                          </button>
                          <button
                            onClick={() => onChangeStatus(payment.id, "rejected")}
                            className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                          >
                            Tolak
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-surface-border px-4 py-3">
          <p className="text-xs text-gray-500">{total} pembayaran</p>
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

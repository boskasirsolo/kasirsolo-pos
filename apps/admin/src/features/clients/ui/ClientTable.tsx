"use client";

import { formatDate, formatRupiah, daysRemaining, openWhatsApp } from "@/lib/utils";
import ClientStatusBadge from "./ClientStatusBadge";
import type { ClientWithRelations } from "../data/types";
import type { ClientFilter } from "../data/types";

interface ClientTableProps {
  clients: ClientWithRelations[];
  loading: boolean;
  filter: ClientFilter;
  totalPages: number;
  onSearch: (search: string) => void;
  onStatusFilter: (status: ClientFilter["status"]) => void;
  onPageChange: (page: number) => void;
  onSelect: (client: ClientWithRelations) => void;
  onEdit: (client: ClientWithRelations) => void;
}

export default function ClientTable({
  clients,
  loading,
  filter,
  totalPages,
  onSearch,
  onStatusFilter,
  onPageChange,
  onSelect,
  onEdit,
}: ClientTableProps) {
  return (
    <div className="card p-0">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-surface-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama, telepon, email, kode..."
              value={filter.search}
              onChange={(e) => onSearch(e.target.value)}
              className="input pl-9"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filter.status}
            onChange={(e) => onStatusFilter(e.target.value as ClientFilter["status"])}
            className="input w-auto"
          >
            <option value="all">Semua Status</option>
            <option value="trial">Trial</option>
            <option value="active">Aktif</option>
            <option value="expired">Expired</option>
            <option value="locked">Locked</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="px-4 py-3">Klien</th>
              <th className="px-4 py-3">Kontak</th>
              <th className="px-4 py-3">Kode</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Trial</th>
              <th className="px-4 py-3">Terdaftar</th>
              <th className="px-4 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="table-cell"><div className="h-4 w-32 rounded bg-gray-200" /></td>
                  <td className="table-cell"><div className="h-4 w-28 rounded bg-gray-200" /></td>
                  <td className="table-cell"><div className="h-4 w-24 rounded bg-gray-200" /></td>
                  <td className="table-cell"><div className="h-4 w-16 rounded bg-gray-200" /></td>
                  <td className="table-cell"><div className="h-4 w-20 rounded bg-gray-200" /></td>
                  <td className="table-cell"><div className="h-4 w-24 rounded bg-gray-200" /></td>
                  <td className="table-cell"><div className="h-4 w-16 rounded bg-gray-200" /></td>
                </tr>
              ))
            ) : clients.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                  {filter.search
                    ? `Tidak ada klien yang cocok dengan "${filter.search}"`
                    : "Belum ada data klien"}
                </td>
              </tr>
            ) : (
              clients.map((client) => {
                const days = daysRemaining(client.trial_expires);
                return (
                  <tr
                    key={client.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50"
                    onClick={() => onSelect(client)}
                  >
                    <td className="table-cell">
                      <p className="font-medium text-gray-900">{client.name}</p>
                      {client.source && (
                        <p className="text-xs text-gray-400">via {client.source}</p>
                      )}
                    </td>
                    <td className="table-cell">
                      <p className="text-sm">{client.phone}</p>
                      {client.email && (
                        <p className="text-xs text-gray-400">{client.email}</p>
                      )}
                    </td>
                    <td className="table-cell">
                      <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700">
                        {client.app_code}
                      </code>
                    </td>
                    <td className="table-cell">
                      <ClientStatusBadge status={client.status} />
                    </td>
                    <td className="table-cell">
                      {client.status === "trial" && days !== null ? (
                        <span
                          className={`text-xs font-medium ${
                            days <= 0
                              ? "text-red-600"
                              : days <= 2
                                ? "text-amber-600"
                                : "text-gray-600"
                          }`}
                        >
                          {days <= 0 ? "Expired" : `${days} hari`}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="table-cell text-xs text-gray-500">
                      {formatDate(client.created_at)}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onEdit(client)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          title="Edit"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openWhatsApp(client.phone, `Halo ${client.name}!`)}
                          className="rounded p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600"
                          title="WhatsApp"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                          </svg>
                        </button>
                      </div>
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
          <p className="text-xs text-gray-500">
            Halaman {filter.page} dari {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(filter.page - 1)}
              disabled={filter.page <= 1}
              className="btn-secondary px-3 py-1 text-xs disabled:opacity-30"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => onPageChange(filter.page + 1)}
              disabled={filter.page >= totalPages}
              className="btn-secondary px-3 py-1 text-xs disabled:opacity-30"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { formatDate, formatRupiah, daysRemaining, openWhatsApp, copyToClipboard } from "@/lib/utils";
import ClientStatusBadge from "./ClientStatusBadge";
import type { ClientWithRelations } from "../data/types";

interface ClientDetailProps {
  client: ClientWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export default function ClientDetail({ client, isOpen, onClose, onEdit }: ClientDetailProps) {
  if (!isOpen || !client) return null;

  const days = daysRemaining(client.trial_expires);

  const handleCopyCode = () => {
    copyToClipboard(client.app_code);
  };

  const handleWhatsApp = () => {
    openWhatsApp(
      client.phone,
      `Halo ${client.name}, terima kasih telah menggunakan KASIRSOLO! Kode aplikasi Anda: ${client.app_code}`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <h3 className="font-heading text-lg font-semibold text-gray-900">{client.name}</h3>
              <div className="flex items-center gap-2">
                <ClientStatusBadge status={client.status} />
                <code className="text-xs text-gray-400">{client.app_code}</code>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium uppercase text-gray-400">Telepon</p>
              <p className="mt-1 text-sm text-gray-900">{client.phone}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-gray-400">Email</p>
              <p className="mt-1 text-sm text-gray-900">{client.email || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-gray-400">Sumber</p>
              <p className="mt-1 text-sm capitalize text-gray-900">{client.source || "-"}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-gray-400">Terdaftar</p>
              <p className="mt-1 text-sm text-gray-900">{formatDate(client.created_at)}</p>
            </div>
          </div>

          {/* Trial Info */}
          {client.status === "trial" && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h4 className="text-sm font-medium text-amber-800">Informasi Trial</h4>
              <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-amber-600">Mulai Trial</p>
                  <p className="font-medium text-amber-900">{formatDate(client.trial_started)}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-600">Berakhir</p>
                  <p className="font-medium text-amber-900">{formatDate(client.trial_expires)}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-600">Sisa Waktu</p>
                  <p className={`font-medium ${days !== null && days <= 2 ? "text-red-600" : "text-amber-900"}`}>
                    {days !== null ? (days <= 0 ? "Expired" : `${days} hari`) : "-"}
                  </p>
                </div>
              </div>
              {client.trial_extended && (
                <p className="mt-2 text-xs text-amber-600">
                  Trial sudah diperpanjang
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          {client.notes && (
            <div className="mt-6">
              <p className="text-xs font-medium uppercase text-gray-400">Catatan</p>
              <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{client.notes}</p>
            </div>
          )}

          {/* App Code Display */}
          <div className="mt-6 rounded-lg border border-surface-border bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase text-gray-400">Kode Aplikasi</p>
            <div className="mt-2 flex items-center gap-3">
              <code className="rounded-lg bg-white px-4 py-2 font-mono text-lg font-semibold text-brand-primary shadow-sm ring-1 ring-surface-border">
                {client.app_code}
              </code>
              <button
                onClick={handleCopyCode}
                className="btn-secondary px-3 py-2 text-xs"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                Copy
              </button>
              <button
                onClick={handleWhatsApp}
                className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
              >
                Kirim WA
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-surface-border px-6 py-4">
          <button onClick={onClose} className="btn-secondary">
            Tutup
          </button>
          <button onClick={onEdit} className="btn-primary">
            Edit Klien
          </button>
        </div>
      </div>
    </div>
  );
}

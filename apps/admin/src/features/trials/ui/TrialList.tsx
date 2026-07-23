"use client";

import { formatDate, openWhatsApp } from "@/lib/utils";
import type { TrialClient } from "../data/types";

interface TrialListProps {
  clients: TrialClient[];
  loading: boolean;
  onExtend: (id: string) => void;
  onLock: (id: string) => void;
}

export default function TrialList({ clients, loading, onExtend, onLock }: TrialListProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg border border-surface-border p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="mt-1 h-3 w-24 rounded bg-gray-200" />
              </div>
              <div className="h-8 w-20 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="rounded-lg border border-surface-border bg-white py-12 text-center">
        <p className="text-sm text-gray-400">Tidak ada data di tab ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {clients.map((client) => (
        <div
          key={client.id}
          className="flex items-center justify-between rounded-lg border border-surface-border bg-white p-4 transition-colors hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{client.name}</p>
              <p className="text-xs text-gray-500">
                {client.phone} | <code className="text-[10px]">{client.app_code}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Days indicator */}
            <div className="text-right">
              {client.days_left !== null && (
                <span
                  className={`text-xs font-medium ${
                    client.days_left <= 0
                      ? "text-red-600"
                      : client.days_left <= 2
                        ? "text-amber-600"
                        : "text-gray-600"
                  }`}
                >
                  {client.days_left <= 0 ? "Expired" : `${client.days_left} hari`}
                </span>
              )}
              <p className="text-[10px] text-gray-400">
                {formatDate(client.trial_expires)}
              </p>
              {client.trial_extended && (
                <span className="text-[10px] text-indigo-500">Extended</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => openWhatsApp(client.phone, `Halo ${client.name}! Bagaimana pengalaman trial KASIRSOLO Anda?`)}
                className="rounded p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600"
                title="WhatsApp"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                </svg>
              </button>
              {client.status !== "locked" && (
                <>
                  <button
                    onClick={() => onExtend(client.id)}
                    className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                  >
                    Extend
                  </button>
                  <button
                    onClick={() => onLock(client.id)}
                    className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                  >
                    Lock
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

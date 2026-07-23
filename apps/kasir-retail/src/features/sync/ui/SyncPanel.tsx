"use client";

import { useState } from "react";
import type { SyncResult, SyncConflict, SyncPendingByStore } from "@kasirsolo/sync";
import type { SyncDisplayStatus, SyncHistoryEntry } from "../data/types";
import {
  SYNC_STATUS_LABELS,
  SYNC_STATUS_COLORS,
  STORE_DISPLAY_NAMES,
} from "../data/types";

// ---------------------------------------------------------------------------
// SyncPanel — Full sync management panel (bottom sheet / modal)
// ---------------------------------------------------------------------------

interface SyncPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Display status */
  status: SyncDisplayStatus;
  /** Last sync label */
  lastSyncLabel: string;
  /** Pending count per category */
  pendingByStore: Record<string, number>;
  /** Total pending count */
  pendingCount: number;
  /** Trigger manual sync */
  onSyncNow: () => Promise<void>;
  /** Sync history */
  history: SyncHistoryEntry[];
  /** Active conflicts */
  conflicts: SyncConflict[];
  /** Errors */
  errors: string[];
  /** Whether the engine is running */
  isRunning: boolean;
  /** Is cloud user */
  isCloudUser: boolean;
}

export function SyncPanel({
  isOpen,
  onClose,
  status,
  lastSyncLabel,
  pendingByStore,
  pendingCount,
  onSyncNow,
  history,
  conflicts,
  errors,
  isRunning,
  isCloudUser,
}: SyncPanelProps) {
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSyncNow();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl max-h-[80vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              Sinkronisasi Data
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {lastSyncLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Tutup"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${SYNC_STATUS_COLORS[status]}`} />
            <span className="text-sm font-medium text-gray-700">
              {SYNC_STATUS_LABELS[status]}
            </span>
            {isRunning && (
              <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                Auto-sync aktif
              </span>
            )}
          </div>

          {/* Pending by Store */}
          {pendingCount > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                Data Menunggu Sinkronisasi ({pendingCount})
              </h3>
              <div className="space-y-1">
                {Object.entries(pendingByStore).map(([key, count]) => {
                  if (count === 0) return null;
                  return (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-yellow-700">
                        {STORE_DISPLAY_NAMES[key] ?? key}
                      </span>
                      <span className="font-medium text-yellow-800">
                        {count} data
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sync Now Button */}
          {isCloudUser && (
            <button
              type="button"
              onClick={handleSync}
              disabled={isSyncing || status === "offline"}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                isSyncing || status === "offline"
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-brand-primary text-white hover:bg-brand-primary/90 active:scale-[0.98]"
              }`}
            >
              {isSyncing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Menyinkronkan...
                </span>
              ) : status === "offline" ? (
                "Tidak ada koneksi internet"
              ) : (
                "Sinkronkan Sekarang"
              )}
            </button>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-red-800 mb-1">
                Kesalahan
              </h3>
              <ul className="text-xs text-red-700 space-y-0.5">
                {errors.slice(0, 5).map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Conflicts */}
          {conflicts.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-orange-800 mb-1">
                Konflik ({conflicts.length})
              </h3>
              <ul className="text-xs text-orange-700 space-y-1">
                {conflicts.slice(0, 5).map((conflict, i) => (
                  <li key={i}>
                    <span className="font-medium">
                      {STORE_DISPLAY_NAMES[conflict.store] ?? conflict.store}
                    </span>
                    : {conflict.description}
                    <span className="text-orange-500 ml-1">
                      ({conflict.resolution === "local" ? "lokal menang" : "cloud menang"})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sync History */}
          {history.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Riwayat Sinkronisasi
              </h3>
              <div className="space-y-2">
                {history.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          entry.success ? "bg-green-400" : "bg-red-400"
                        }`}
                      />
                      <div>
                        <span className="text-gray-700">
                          {formatTime(entry.completedAt)}
                        </span>
                        <span className="text-gray-400 ml-1">
                          ({entry.durationMs}ms)
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      {entry.pushed > 0 && (
                        <span title="Dikirim">+{entry.pushed}</span>
                      )}
                      {entry.pulled > 0 && (
                        <span title="Diterima">-{entry.pulled}</span>
                      )}
                      {entry.conflicts > 0 && (
                        <span className="text-orange-500" title="Konflik">
                          !{entry.conflicts}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

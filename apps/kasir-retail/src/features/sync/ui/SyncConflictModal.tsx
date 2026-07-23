"use client";

import type { SyncConflict } from "@kasirsolo/sync";
import { STORE_DISPLAY_NAMES } from "../data/types";

// ---------------------------------------------------------------------------
// SyncConflictModal — Shows local vs cloud version side by side
// ---------------------------------------------------------------------------

interface SyncConflictModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** List of conflicts to display */
  conflicts: SyncConflict[];
  /** Callback to dismiss a conflict */
  onDismiss?: (index: number) => void;
}

export function SyncConflictModal({
  isOpen,
  onClose,
  conflicts,
  onDismiss,
}: SyncConflictModalProps) {
  if (!isOpen || conflicts.length === 0) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="fixed inset-4 z-50 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-w-lg mx-auto my-auto max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-orange-50">
          <div>
            <h2 className="text-base font-bold text-orange-900">
              Konflik Sinkronisasi
            </h2>
            <p className="text-xs text-orange-700 mt-0.5">
              {conflicts.length} konflik terdeteksi. Diselesaikan otomatis dengan aturan &quot;versi terbaru menang&quot;.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-orange-100 transition-colors"
            aria-label="Tutup"
          >
            <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {conflicts.map((conflict, index) => (
            <div
              key={`${conflict.store}-${conflict.recordId}-${index}`}
              className="border border-orange-200 rounded-lg overflow-hidden"
            >
              {/* Conflict header */}
              <div className="bg-orange-50 px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-orange-800">
                    {STORE_DISPLAY_NAMES[conflict.store] ?? conflict.store}
                  </span>
                  <span className="text-[10px] text-orange-500 font-mono">
                    {conflict.recordId.slice(0, 8)}...
                  </span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    conflict.resolution === "local"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {conflict.resolution === "local" ? "Lokal menang" : "Cloud menang"}
                </span>
              </div>

              {/* Conflict details */}
              <div className="px-3 py-2">
                <p className="text-xs text-gray-600 mb-2">
                  {conflict.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {/* Local version */}
                  <div className="bg-blue-50 rounded-lg p-2">
                    <div className="font-semibold text-blue-700 mb-1">
                      Versi Lokal
                    </div>
                    <div className="text-blue-600 font-mono">
                      {formatTimestamp(conflict.localUpdatedAt)}
                    </div>
                  </div>

                  {/* Cloud version */}
                  <div className="bg-green-50 rounded-lg p-2">
                    <div className="font-semibold text-green-700 mb-1">
                      Versi Cloud
                    </div>
                    <div className="text-green-600 font-mono">
                      {formatTimestamp(conflict.cloudUpdatedAt)}
                    </div>
                  </div>
                </div>

                {/* Dismiss button */}
                {onDismiss && (
                  <button
                    type="button"
                    onClick={() => onDismiss(index)}
                    className="mt-2 text-[10px] text-gray-400 hover:text-gray-600"
                  >
                    Hapus dari daftar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

"use client";

import { formatRupiah, formatDateTime } from "@/lib/utils";
import type { PendingPaymentItem } from "../data/types";
import { SkeletonCard, SkeletonList } from "@/components/SkeletonLoader";

interface PendingPaymentsProps {
  items: PendingPaymentItem[];
  loading: boolean;
}

export default function PendingPayments({ items, loading }: PendingPaymentsProps) {
  if (loading) {
    return <SkeletonList title="Pembayaran Pending" count={3} />;
  }

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold text-gray-900">Pembayaran Pending</h3>
        {items.length > 0 && <span className="badge-danger">{items.length} menunggu</span>}
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">Tidak ada pembayaran yang pending</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-surface-border p-3 transition-colors hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{item.clientName}</p>
                <p className="text-xs text-gray-500">{item.method} - {formatDateTime(item.submittedAt)}</p>
              </div>
              <div className="ml-3 text-right">
                <p className="text-sm font-semibold text-brand-primary">{formatRupiah(item.amount)}</p>
                <div className="mt-1 flex gap-1">
                  <button className="rounded bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700 hover:bg-green-100">
                    Terima
                  </button>
                  <button className="rounded bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700 hover:bg-red-100">
                    Tolak
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

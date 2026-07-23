"use client";

import { formatRupiah, formatDate } from "@kasirsolo/utils";
import type { FnbTransaction } from "../data/types";

interface OrderListProps {
  transactions: FnbTransaction[];
  loading: boolean;
  todayTotal: number;
  todayCount: number;
  onSelect: (tx: FnbTransaction) => void;
}

export function OrderList({ transactions, loading, todayTotal, todayCount, onSelect }: OrderListProps) {
  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <div className="h-20 bg-white rounded-xl animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-heading font-bold text-gray-900">Riwayat Pesanan</h1>

      {/* Today summary */}
      <div className="bg-white rounded-xl border border-pos-border p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">Hari Ini</p>
            <p className="text-xl font-bold text-brand-primary">{formatRupiah(todayTotal)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Transaksi</p>
            <p className="text-xl font-bold text-gray-900">{todayCount}</p>
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <button
              key={tx.id}
              onClick={() => onSelect(tx)}
              className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-pos-border
                text-left active:bg-gray-50 transition-colors"
              type="button"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{tx.transaction_number}</p>
                  {tx.is_void && (
                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">VOID</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {tx.order_type === "dine_in" ? "Dine In" : tx.order_type === "takeaway" ? "Takeaway" : "Delivery"}
                  {tx.table_number ? ` - Meja ${tx.table_number}` : ""}
                  {tx.queue_number ? ` - #${tx.queue_number}` : ""}
                </p>
                <p className="text-[10px] text-gray-400">
                  {formatDate(tx.created_at, { time: true, short: true })}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${tx.is_void ? "text-gray-400 line-through" : "text-gray-900"}`}>
                  {formatRupiah(tx.total)}
                </p>
                <p className="text-[10px] text-gray-500 uppercase">{tx.payment_method}</p>
              </div>
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

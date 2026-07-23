"use client";

import { useState } from "react";
import { formatRupiah, formatDate } from "@kasirsolo/utils";
import { EmptyState, Badge } from "@kasirsolo/ui";
import type { PosTransaction } from "@/lib/db";

interface TransactionListProps {
  transactions: PosTransaction[];
  loading: boolean;
  todayTotal: number;
  todayCount: number;
  onSelect: (transaction: PosTransaction) => void;
}

export function TransactionList({
  transactions,
  loading,
  todayTotal,
  todayCount,
  onSelect,
}: TransactionListProps) {
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month" | "all">("today");

  const now = new Date();
  const filtered = transactions.filter((t) => {
    const txDate = new Date(t.created_at);
    if (dateFilter === "today") {
      return txDate.toDateString() === now.toDateString();
    }
    if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return txDate >= weekAgo;
    }
    if (dateFilter === "month") {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Today summary */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-primary-light mx-4 mt-3 rounded-xl p-4 text-white">
        <p className="text-sm opacity-80">Penjualan Hari Ini</p>
        <p className="text-2xl font-bold mt-1">{formatRupiah(todayTotal)}</p>
        <p className="text-xs opacity-70 mt-0.5">{todayCount} transaksi</p>
      </div>

      {/* Date filter */}
      <div className="flex gap-2 px-4 mt-3 overflow-x-auto scrollbar-hide">
        {(["today", "week", "month", "all"] as const).map((f) => {
          const labels = { today: "Hari Ini", week: "Minggu Ini", month: "Bulan Ini", all: "Semua" };
          return (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                ${dateFilter === f
                  ? "bg-brand-primary text-white"
                  : "bg-white text-gray-600 border border-pos-border"}`}
              type="button"
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      {/* Transaction list */}
      <div className="px-4 mt-3 space-y-2 pb-4">
        {filtered.length === 0 ? (
          <EmptyState
            title="Belum ada transaksi"
            description="Transaksi akan muncul di sini setelah penjualan"
          />
        ) : (
          filtered.map((tx) => (
            <button
              key={tx.id}
              onClick={() => onSelect(tx)}
              className="w-full bg-white rounded-xl border border-pos-border p-3 flex items-center gap-3
                active:bg-gray-50 transition-colors text-left"
              type="button"
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
                ${tx.is_void ? "bg-red-50" : "bg-green-50"}`}>
                {tx.is_void ? (
                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{tx.transaction_number}</p>
                  {tx.is_void && <Badge status="error" size="sm">Void</Badge>}
                </div>
                <p className="text-xs text-gray-500">
                  {formatDate(tx.created_at, { time: true, short: true })} &middot; {tx.payment_method.toUpperCase()}
                </p>
              </div>

              {/* Amount */}
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${tx.is_void ? "text-red-500 line-through" : "text-gray-900"}`}>
                  {formatRupiah(tx.total)}
                </p>
                <p className="text-[10px] text-gray-400">{tx.items.length} item</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

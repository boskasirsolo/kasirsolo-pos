"use client";

import { formatRupiah } from "@kasirsolo/utils";
import type { PosPaymentMethod } from "@/lib/db";

interface DailySummaryProps {
  total: number;
  count: number;
  voidCount: number;
  paymentBreakdown: { method: PosPaymentMethod; count: number; total: number }[];
}

export function DailySummary({ total, count, voidCount, paymentBreakdown }: DailySummaryProps) {
  return (
    <div className="bg-white rounded-xl border border-pos-border p-4 mx-4 mt-3">
      <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Ringkasan Hari Ini</h3>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">{count}</p>
          <p className="text-[10px] text-gray-500">Transaksi</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-brand-primary">{formatRupiah(total, { compact: true })}</p>
          <p className="text-[10px] text-gray-500">Pendapatan</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-red-500">{voidCount}</p>
          <p className="text-[10px] text-gray-500">Void</p>
        </div>
      </div>

      {paymentBreakdown.length > 0 && (
        <div className="border-t border-pos-border pt-3 space-y-2">
          <p className="text-[10px] font-semibold text-gray-500 uppercase">Per Metode</p>
          {paymentBreakdown.map((pb) => (
            <div key={pb.method} className="flex items-center justify-between text-xs">
              <span className="text-gray-600 capitalize">{pb.method}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-400">{pb.count}x</span>
                <span className="font-medium text-gray-900">{formatRupiah(pb.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

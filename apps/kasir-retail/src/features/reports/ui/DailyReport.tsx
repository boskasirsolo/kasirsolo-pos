"use client";

import { formatRupiah } from "@kasirsolo/utils";
import { StatCard, EmptyState } from "@kasirsolo/ui";
import type { ReportData } from "../data/types";

interface DailyReportProps {
  report: ReportData | null;
}

export function DailyReport({ report }: DailyReportProps) {
  if (!report || report.totalTransactions === 0) {
    return (
      <EmptyState
        title="Belum ada data"
        description="Belum ada transaksi hari ini"
      />
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="PENDAPATAN"
          value={formatRupiah(report.netRevenue, { compact: true })}
          accentColor="#FF5F1F"
        />
        <StatCard
          label="TRANSAKSI"
          value={report.totalTransactions.toString()}
          accentColor="#3B82F6"
        />
        <StatCard
          label="ITEM TERJUAL"
          value={report.totalItemsSold.toString()}
          accentColor="#22C55E"
        />
        <StatCard
          label="RATA-RATA"
          value={formatRupiah(report.averageTransaction, { compact: true })}
          accentColor="#F7A237"
        />
      </div>

      {/* Top Products */}
      {report.topProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-pos-border p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Produk Terlaris</h3>
          <div className="space-y-2">
            {report.topProducts.slice(0, 5).map((product, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold
                  flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{product.name}</p>
                  <p className="text-[10px] text-gray-400">{product.qty} terjual</p>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatRupiah(product.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {report.paymentBreakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-pos-border p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Metode Pembayaran</h3>
          <div className="space-y-2">
            {report.paymentBreakdown.map((pb, idx) => {
              const percentage = report.netRevenue > 0
                ? Math.round((pb.total / report.netRevenue) * 100)
                : 0;
              return (
                <div key={idx}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 capitalize">{pb.method}</span>
                    <span className="font-medium">{formatRupiah(pb.total)} ({pb.count}x)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-primary rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Discount & Tax */}
      {(report.totalDiscounts > 0 || report.totalTax > 0) && (
        <div className="bg-white rounded-xl border border-pos-border p-4 space-y-2">
          {report.totalDiscounts > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Diskon</span>
              <span className="text-green-600">-{formatRupiah(report.totalDiscounts)}</span>
            </div>
          )}
          {report.totalTax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Pajak</span>
              <span>{formatRupiah(report.totalTax)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

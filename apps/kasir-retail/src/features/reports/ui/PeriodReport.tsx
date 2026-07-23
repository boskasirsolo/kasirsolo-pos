"use client";

import { formatRupiah, formatDate } from "@kasirsolo/utils";
import { StatCard, EmptyState } from "@kasirsolo/ui";
import type { ReportData, ReportPeriod } from "../data/types";

interface PeriodReportProps {
  report: ReportData | null;
  period: ReportPeriod;
}

export function PeriodReport({ report, period }: PeriodReportProps) {
  if (!report || report.totalTransactions === 0) {
    return (
      <EmptyState
        title="Belum ada data"
        description={`Belum ada transaksi ${period === "weekly" ? "minggu" : "bulan"} ini`}
      />
    );
  }

  const periodLabel = period === "weekly" ? "Minggu Ini" : "Bulan Ini";

  return (
    <div className="p-4 space-y-4">
      {/* Period Header */}
      <div className="bg-gradient-to-r from-brand-dark to-gray-800 rounded-xl p-4 text-white">
        <p className="text-xs opacity-70">{periodLabel}</p>
        <p className="text-xs opacity-50 mt-0.5">
          {formatDate(report.startDate, { short: true })} - {formatDate(report.endDate, { short: true })}
        </p>
        <p className="text-3xl font-bold mt-2">{formatRupiah(report.netRevenue)}</p>
        <p className="text-xs opacity-70 mt-1">
          {report.totalTransactions} transaksi &middot; {report.totalItemsSold} item
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="RATA-RATA / HARI"
          value={formatRupiah(
            report.dailyTrend.length > 0
              ? Math.round(report.netRevenue / report.dailyTrend.length)
              : 0,
            { compact: true }
          )}
          accentColor="#FF5F1F"
        />
        <StatCard
          label="RATA-RATA / TRX"
          value={formatRupiah(report.averageTransaction, { compact: true })}
          accentColor="#3B82F6"
        />
      </div>

      {/* Daily Trend (simple bar chart) */}
      {report.dailyTrend.length > 0 && (
        <div className="bg-white rounded-xl border border-pos-border p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Tren Harian</h3>
          <div className="flex items-end gap-1 h-32">
            {report.dailyTrend.map((day, idx) => {
              const maxRevenue = Math.max(...report.dailyTrend.map((d) => d.revenue));
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-brand-primary/20 rounded-t-sm relative group"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  >
                    <div
                      className="absolute bottom-0 w-full bg-brand-primary rounded-t-sm"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                  <span className="text-[8px] text-gray-400">
                    {new Date(day.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Products */}
      {report.topProducts.length > 0 && (
        <div className="bg-white rounded-xl border border-pos-border p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Produk Terlaris</h3>
          <div className="space-y-2">
            {report.topProducts.slice(0, 10).map((product, idx) => (
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
    </div>
  );
}

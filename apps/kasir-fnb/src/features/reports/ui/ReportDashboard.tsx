"use client";

import { formatRupiah } from "@kasirsolo/utils";
import type { FnbReportData, ReportPeriod } from "../data/types";

interface ReportDashboardProps {
  report: FnbReportData | null;
  period: ReportPeriod;
  loading: boolean;
  onChangePeriod: (period: ReportPeriod) => void;
}

export function ReportDashboard({ report, period, loading, onChangePeriod }: ReportDashboardProps) {
  const periods: { value: ReportPeriod; label: string }[] = [
    { value: "daily", label: "Hari Ini" },
    { value: "weekly", label: "Minggu Ini" },
    { value: "monthly", label: "Bulan Ini" },
  ];

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="p-4 space-y-4">
      {/* Period selector */}
      <div className="flex gap-2">
        {periods.map((p) => (
          <button
            key={p.value}
            onClick={() => onChangePeriod(p.value)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all
              ${period === p.value
                ? "bg-brand-primary text-white border-brand-primary"
                : "bg-white text-gray-600 border-pos-border"}`}
            type="button"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-pos-border p-3">
          <p className="text-xs text-gray-500">Pendapatan Bersih</p>
          <p className="text-lg font-bold text-brand-primary">{formatRupiah(report.netRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-pos-border p-3">
          <p className="text-xs text-gray-500">Transaksi</p>
          <p className="text-lg font-bold text-gray-900">{report.totalTransactions}</p>
        </div>
        <div className="bg-white rounded-xl border border-pos-border p-3">
          <p className="text-xs text-gray-500">Rata-rata</p>
          <p className="text-lg font-bold text-gray-900">{formatRupiah(report.averageTransaction)}</p>
        </div>
        <div className="bg-white rounded-xl border border-pos-border p-3">
          <p className="text-xs text-gray-500">Item Terjual</p>
          <p className="text-lg font-bold text-gray-900">{report.totalItemsSold}</p>
        </div>
      </div>

      {/* Order type breakdown */}
      {report.orderTypeBreakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-pos-border p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Tipe Pesanan</h3>
          <div className="space-y-2">
            {report.orderTypeBreakdown.map((ot) => (
              <div key={ot.type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{ot.type.replace("_", " ")}</span>
                <div className="text-right">
                  <span className="text-sm font-bold">{formatRupiah(ot.total)}</span>
                  <span className="text-xs text-gray-500 ml-2">({ot.count}x)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top menu items */}
      {report.topMenuItems.length > 0 && (
        <div className="bg-white rounded-xl border border-pos-border p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Menu Terlaris</h3>
          <div className="space-y-2">
            {report.topMenuItems.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-primary w-5">{idx + 1}</span>
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold">{formatRupiah(item.revenue)}</span>
                  <span className="text-xs text-gray-500 ml-2">({item.qty}x)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment breakdown */}
      {report.paymentBreakdown.length > 0 && (
        <div className="bg-white rounded-xl border border-pos-border p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Metode Pembayaran</h3>
          <div className="space-y-2">
            {report.paymentBreakdown.map((pm) => (
              <div key={pm.method} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 uppercase">{pm.method}</span>
                <div className="text-right">
                  <span className="text-sm font-bold">{formatRupiah(pm.total)}</span>
                  <span className="text-xs text-gray-500 ml-2">({pm.count}x)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

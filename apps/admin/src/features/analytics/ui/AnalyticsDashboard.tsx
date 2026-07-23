"use client";

import { formatRupiah } from "@/lib/utils";
import type { AnalyticsData } from "../data/types";

interface AnalyticsDashboardProps {
  data: AnalyticsData | null;
  loading: boolean;
}

export default function AnalyticsDashboard({ data, loading }: AnalyticsDashboardProps) {
  if (loading || !data) {
    return (
      <div className="space-y-6">
        {/* KPI Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="mt-2 h-7 w-28 rounded bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card h-64 animate-pulse" />
          <div className="card h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="mt-1 font-heading text-2xl font-semibold text-brand-primary">
            {formatRupiah(data.totalRevenue)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Konversi Rate</p>
          <p className="mt-1 font-heading text-2xl font-semibold text-green-600">
            {data.conversionRate}%
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Trial → Active</p>
          <p className="mt-1 font-heading text-2xl font-semibold text-blue-600">
            {data.trialToActiveRate}%
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Rata-rata Revenue/Klien</p>
          <p className="mt-1 font-heading text-2xl font-semibold text-gray-900">
            {formatRupiah(data.avgRevenuePerClient)}
          </p>
        </div>
      </div>

      {/* Revenue Chart (simplified bar chart with divs) */}
      <div className="card">
        <h3 className="mb-4 font-heading text-base font-semibold text-gray-900">Revenue Bulanan (12 Bulan)</h3>
        <div className="flex items-end gap-2" style={{ height: 200 }}>
          {data.revenue.map((m) => {
            const maxRev = Math.max(...data.revenue.map((r) => r.revenue), 1);
            const heightPct = (m.revenue / maxRev) * 100;
            return (
              <div key={m.month} className="group relative flex flex-1 flex-col items-center">
                <div
                  className="w-full rounded-t bg-brand-primary/80 transition-colors hover:bg-brand-primary"
                  style={{ height: `${Math.max(heightPct, 2)}%` }}
                />
                <span className="mt-1 text-[9px] text-gray-400">
                  {m.month.split("-")[1]}
                </span>
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[10px] text-white group-hover:block">
                  {formatRupiah(m.revenue)} ({m.count})
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* App Mix */}
        <div className="card">
          <h3 className="mb-4 font-heading text-base font-semibold text-gray-900">Distribusi Aplikasi</h3>
          {data.appMix.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {data.appMix.map((app) => (
                <div key={app.appName} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700">{app.appName}</span>
                      <span className="text-gray-400">{app.percentage}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-brand-primary"
                        style={{ width: `${app.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-4 text-xs font-medium text-gray-600">
                    {formatRupiah(app.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Source Breakdown */}
        <div className="card">
          <h3 className="mb-4 font-heading text-base font-semibold text-gray-900">Sumber Klien</h3>
          {data.topSources.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">Belum ada data</p>
          ) : (
            <div className="space-y-2">
              {data.topSources.map((src) => (
                <div
                  key={src.source}
                  className="flex items-center justify-between rounded-lg border border-surface-border p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-brand-primary" />
                    <span className="text-sm capitalize text-gray-700">{src.source}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">{src.count}</span>
                    <span className="ml-1 text-xs text-gray-400">({src.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

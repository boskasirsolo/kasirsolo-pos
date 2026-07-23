"use client";

import { useAnalytics } from "./logic/useAnalytics";
import AnalyticsDashboard from "./ui/AnalyticsDashboard";

export default function AnalyticsFeature() {
  const { data, loading, error, refresh } = useAnalytics();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-semibold text-gray-900">Analitik</h2>
          <p className="text-sm text-gray-500">Laporan konversi, revenue, dan distribusi</p>
        </div>
        <button onClick={refresh} className="btn-secondary text-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <AnalyticsDashboard data={data} loading={loading} />
    </div>
  );
}

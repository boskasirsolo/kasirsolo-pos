"use client";

import { useLogs } from "./logic/useLogs";
import LogTable from "./ui/LogTable";

export default function LogsFeature() {
  const { logs, total, loading, error, filter, setFilter } = useLogs();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-heading text-lg font-semibold text-gray-900">Log Aktivitas</h2>
        <p className="text-sm text-gray-500">Riwayat semua aktivitas di sistem</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <LogTable
        logs={logs}
        loading={loading}
        filter={filter}
        total={total}
        onFilterChange={setFilter}
      />
    </div>
  );
}

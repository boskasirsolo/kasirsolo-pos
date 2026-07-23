"use client";

import { PosShell } from "@/components/layout/PosShell";
import { ReportsPage, useReports } from "@/features/reports";

export default function ReportsPageRoute() {
  const { report, period, loading, changePeriod } = useReports();

  return (
    <PosShell>
      <div>
        <div className="px-4 pt-3 pb-2">
          <h1 className="text-lg font-heading font-bold text-gray-900">Laporan</h1>
        </div>
        <ReportsPage
          report={report}
          loading={loading}
          period={period}
          onChangePeriod={changePeriod}
        />
      </div>
    </PosShell>
  );
}

"use client";

import { FnbShell } from "@/components/layout/FnbShell";
import { ReportDashboard, useReports } from "@/features/reports";

export default function ReportsPage() {
  const { report, period, loading, changePeriod } = useReports();

  return (
    <FnbShell>
      <div>
        <div className="px-4 pt-3 pb-2">
          <h1 className="text-lg font-heading font-bold text-gray-900">Laporan</h1>
        </div>
        <ReportDashboard
          report={report}
          period={period}
          loading={loading}
          onChangePeriod={changePeriod}
        />
      </div>
    </FnbShell>
  );
}

"use client";

import { useState } from "react";
import { DailyReport } from "./DailyReport";
import { PeriodReport } from "./PeriodReport";
import type { ReportData, ReportPeriod } from "../data/types";

interface ReportsPageProps {
  report: ReportData | null;
  loading: boolean;
  period: ReportPeriod;
  onChangePeriod: (period: ReportPeriod) => void;
}

export function ReportsPage({ report, loading, period, onChangePeriod }: ReportsPageProps) {
  const tabs: { value: ReportPeriod; label: string }[] = [
    { value: "daily", label: "Harian" },
    { value: "weekly", label: "Mingguan" },
    { value: "monthly", label: "Bulanan" },
  ];

  return (
    <div>
      {/* Period tabs */}
      <div className="flex bg-white border-b border-pos-border px-4">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChangePeriod(tab.value)}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors
              ${period === tab.value
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-gray-500"}`}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
      ) : period === "daily" ? (
        <DailyReport report={report} />
      ) : (
        <PeriodReport report={report} period={period} />
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { calculateReport } from "../data/queries";
import type { FnbReportData, ReportPeriod } from "../data/types";

export function useReports() {
  const [report, setReport] = useState<FnbReportData | null>(null);
  const [period, setPeriod] = useState<ReportPeriod>("daily");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: ReportPeriod) => {
    setLoading(true);
    try {
      const data = await calculateReport(p);
      setReport(data);
    } catch (err) {
      console.error("Failed to calculate report:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(period);
  }, [period, load]);

  const changePeriod = useCallback((p: ReportPeriod) => {
    setPeriod(p);
  }, []);

  return {
    report,
    period,
    loading,
    changePeriod,
    refresh: () => load(period),
  };
}

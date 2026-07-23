"use client";

import { useState, useEffect, useCallback } from "react";
import { getTransactions, openDatabase } from "@/lib/db";
import type { PosTransaction } from "@/lib/db";
import type { ReportData, ReportPeriod } from "../data/types";

export function useReports() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [period, setPeriod] = useState<ReportPeriod>("daily");
  const [loading, setLoading] = useState(true);

  const calculateReport = useCallback(async (p: ReportPeriod) => {
    setLoading(true);
    try {
      await openDatabase();

      const now = new Date();
      let startDate: string;
      let endDate: string;

      if (p === "daily") {
        startDate = now.toISOString().slice(0, 10) + "T00:00:00.000Z";
        endDate = now.toISOString().slice(0, 10) + "T23:59:59.999Z";
      } else if (p === "weekly") {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        startDate = weekStart.toISOString().slice(0, 10) + "T00:00:00.000Z";
        endDate = now.toISOString().slice(0, 10) + "T23:59:59.999Z";
      } else {
        startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01T00:00:00.000Z`;
        endDate = now.toISOString().slice(0, 10) + "T23:59:59.999Z";
      }

      const transactions = await getTransactions({ startDate, endDate });
      const active = transactions.filter((t) => !t.is_void);

      // Calculate totals
      const totalRevenue = active.reduce((sum, t) => sum + t.subtotal, 0);
      const totalDiscounts = active.reduce((sum, t) => sum + t.discount_amount, 0);
      const totalTax = active.reduce((sum, t) => sum + t.tax_amount, 0);
      const netRevenue = active.reduce((sum, t) => sum + t.total, 0);
      const totalItemsSold = active.reduce(
        (sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0),
        0
      );
      const averageTransaction = active.length > 0 ? Math.round(netRevenue / active.length) : 0;

      // Top products
      const productMap = new Map<string, { name: string; qty: number; revenue: number }>();
      active.forEach((t) => {
        t.items.forEach((item) => {
          const existing = productMap.get(item.product_id) ?? {
            name: item.product_name,
            qty: 0,
            revenue: 0,
          };
          productMap.set(item.product_id, {
            name: item.product_name,
            qty: existing.qty + item.quantity,
            revenue: existing.revenue + item.total,
          });
        });
      });
      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Payment breakdown
      const paymentMap = new Map<string, { count: number; total: number }>();
      active.forEach((t) => {
        const existing = paymentMap.get(t.payment_method) ?? { count: 0, total: 0 };
        paymentMap.set(t.payment_method, {
          count: existing.count + 1,
          total: existing.total + t.total,
        });
      });
      const paymentBreakdown = Array.from(paymentMap.entries())
        .map(([method, data]) => ({ method, ...data }))
        .sort((a, b) => b.total - a.total);

      // Daily trend
      const dailyMap = new Map<string, { revenue: number; count: number }>();
      active.forEach((t) => {
        const date = t.created_at.slice(0, 10);
        const existing = dailyMap.get(date) ?? { revenue: 0, count: 0 };
        dailyMap.set(date, {
          revenue: existing.revenue + t.total,
          count: existing.count + 1,
        });
      });
      const dailyTrend = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setReport({
        period: p,
        startDate,
        endDate,
        totalRevenue,
        totalTransactions: active.length,
        totalItemsSold,
        totalDiscounts,
        totalTax,
        netRevenue,
        averageTransaction,
        topProducts,
        paymentBreakdown,
        dailyTrend,
      });
    } catch (err) {
      console.error("Failed to calculate report:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    calculateReport(period);
  }, [period, calculateReport]);

  const changePeriod = useCallback((p: ReportPeriod) => {
    setPeriod(p);
  }, []);

  return {
    report,
    period,
    loading,
    changePeriod,
    refresh: () => calculateReport(period),
  };
}

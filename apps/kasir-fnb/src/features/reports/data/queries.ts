"use client";

import { openDatabase, getAll } from "@/lib/db";
import type { FnbReportData, ReportPeriod } from "./types";

interface Transaction {
  id: string;
  order_type: string;
  table_number: number | null;
  items: Array<{ name: string; quantity: number; total: number }>;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  service_charge_amount: number;
  total: number;
  payment_method: string;
  is_void: boolean;
  created_at: string;
}

export async function calculateReport(period: ReportPeriod): Promise<FnbReportData> {
  await openDatabase();

  const now = new Date();
  let startDate: string;
  let endDate: string;

  if (period === "daily") {
    startDate = now.toISOString().slice(0, 10) + "T00:00:00.000Z";
    endDate = now.toISOString().slice(0, 10) + "T23:59:59.999Z";
  } else if (period === "weekly") {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    startDate = weekStart.toISOString().slice(0, 10) + "T00:00:00.000Z";
    endDate = now.toISOString().slice(0, 10) + "T23:59:59.999Z";
  } else {
    startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01T00:00:00.000Z`;
    endDate = now.toISOString().slice(0, 10) + "T23:59:59.999Z";
  }

  const allTx = await getAll<Transaction>("fnb_transactions");
  const transactions = allTx.filter(
    (t) => t.created_at >= startDate && t.created_at <= endDate
  );
  const active = transactions.filter((t) => !t.is_void);

  const totalRevenue = active.reduce((sum, t) => sum + t.subtotal, 0);
  const totalDiscounts = active.reduce((sum, t) => sum + t.discount_amount, 0);
  const totalTax = active.reduce((sum, t) => sum + t.tax_amount, 0);
  const totalServiceCharge = active.reduce((sum, t) => sum + (t.service_charge_amount || 0), 0);
  const netRevenue = active.reduce((sum, t) => sum + t.total, 0);
  const totalItemsSold = active.reduce(
    (sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0), 0
  );
  const averageTransaction = active.length > 0 ? Math.round(netRevenue / active.length) : 0;

  // Top menu items
  const itemMap = new Map<string, { name: string; qty: number; revenue: number }>();
  active.forEach((t) => {
    t.items.forEach((item) => {
      const existing = itemMap.get(item.name) ?? { name: item.name, qty: 0, revenue: 0 };
      itemMap.set(item.name, {
        name: item.name,
        qty: existing.qty + item.quantity,
        revenue: existing.revenue + item.total,
      });
    });
  });
  const topMenuItems = Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  // Order type breakdown
  const otMap = new Map<string, { count: number; total: number }>();
  active.forEach((t) => {
    const existing = otMap.get(t.order_type) ?? { count: 0, total: 0 };
    otMap.set(t.order_type, { count: existing.count + 1, total: existing.total + t.total });
  });
  const orderTypeBreakdown = Array.from(otMap.entries()).map(([type, data]) => ({ type, ...data }));

  // Payment breakdown
  const pmMap = new Map<string, { count: number; total: number }>();
  active.forEach((t) => {
    const existing = pmMap.get(t.payment_method) ?? { count: 0, total: 0 };
    pmMap.set(t.payment_method, { count: existing.count + 1, total: existing.total + t.total });
  });
  const paymentBreakdown = Array.from(pmMap.entries()).map(([method, data]) => ({ method, ...data }));

  // Peak hours
  const hourMap = new Map<number, { count: number; revenue: number }>();
  active.forEach((t) => {
    const hour = new Date(t.created_at).getHours();
    const existing = hourMap.get(hour) ?? { count: 0, revenue: 0 };
    hourMap.set(hour, { count: existing.count + 1, revenue: existing.revenue + t.total });
  });
  const peakHours = Array.from(hourMap.entries())
    .map(([hour, data]) => ({ hour, ...data }))
    .sort((a, b) => a.hour - b.hour);

  // Table utilization
  const tableMap = new Map<number, { orders: number; revenue: number }>();
  active.filter((t) => t.table_number).forEach((t) => {
    const existing = tableMap.get(t.table_number!) ?? { orders: 0, revenue: 0 };
    tableMap.set(t.table_number!, { orders: existing.orders + 1, revenue: existing.revenue + t.total });
  });
  const tableUtilization = Array.from(tableMap.entries())
    .map(([tableNumber, data]) => ({ tableNumber, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  // Daily trend
  const dailyMap = new Map<string, { revenue: number; count: number }>();
  active.forEach((t) => {
    const date = t.created_at.slice(0, 10);
    const existing = dailyMap.get(date) ?? { revenue: 0, count: 0 };
    dailyMap.set(date, { revenue: existing.revenue + t.total, count: existing.count + 1 });
  });
  const dailyTrend = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    period,
    startDate,
    endDate,
    totalRevenue,
    totalTransactions: active.length,
    totalItemsSold,
    totalDiscounts,
    totalTax,
    totalServiceCharge,
    netRevenue,
    averageTransaction,
    topMenuItems,
    orderTypeBreakdown,
    paymentBreakdown,
    peakHours,
    tableUtilization,
    dailyTrend,
  };
}

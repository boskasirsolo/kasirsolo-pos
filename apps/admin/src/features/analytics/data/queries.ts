import { SupabaseClient } from "@supabase/supabase-js";
import type { AnalyticsData } from "./types";

export async function getAnalyticsData(supabase: SupabaseClient): Promise<AnalyticsData> {
  // Fetch all needed data
  const [
    { data: clients },
    { data: licenses },
  ] = await Promise.all([
    supabase.from("ksp_clients").select("id, status, source, created_at"),
    supabase.from("ksp_licenses").select("id, app_id, plan_type, status, amount_paid, purchased_at, ksp_apps(name)"),
  ]);

  const allClients = clients ?? [];
  const allLicenses = licenses ?? [];

  // Revenue by month (last 12 months)
  const revenueMap: Record<string, { revenue: number; count: number }> = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    revenueMap[key] = { revenue: 0, count: 0 };
  }

  let totalRevenue = 0;
  for (const l of allLicenses) {
    if (l.plan_type === "trial") continue;
    totalRevenue += l.amount_paid ?? 0;
    const month = (l.purchased_at as string).slice(0, 7);
    if (revenueMap[month]) {
      revenueMap[month].revenue += l.amount_paid ?? 0;
      revenueMap[month].count++;
    }
  }

  const revenue = Object.entries(revenueMap).map(([month, data]) => ({
    month,
    ...data,
  }));

  // Conversion rate
  const totalClients = allClients.length || 1;
  const activeClients = allClients.filter((c) => c.status === "active").length;
  const trialClients = allClients.filter((c) => c.status === "trial").length;
  const conversionRate = Math.round((activeClients / totalClients) * 100);
  const trialToActiveRate = trialClients > 0
    ? Math.round((activeClients / (activeClients + trialClients)) * 100)
    : 0;

  const avgRevenuePerClient = activeClients > 0
    ? Math.round(totalRevenue / activeClients)
    : 0;

  // App mix
  const appMap: Record<string, { name: string; count: number; revenue: number }> = {};
  for (const l of allLicenses) {
    if (l.plan_type === "trial") continue;
    const rec = l as { ksp_apps?: { name: string } | null; amount_paid?: number };
    const appName = rec.ksp_apps?.name ?? "Unknown";
    if (!appMap[l.app_id]) {
      appMap[l.app_id] = { name: appName, count: 0, revenue: 0 };
    }
    appMap[l.app_id].count++;
    appMap[l.app_id].revenue += rec.amount_paid ?? 0;
  }

  const paidLicenses = allLicenses.filter((l) => l.plan_type !== "trial").length || 1;
  const appMix = Object.values(appMap)
    .map((a) => ({
      appName: a.name,
      count: a.count,
      revenue: a.revenue,
      percentage: Math.round((a.count / paidLicenses) * 100),
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // Client growth
  const growthMap: Record<string, { clients: number; trials: number }> = {};
  for (const [key] of Object.entries(revenueMap)) {
    growthMap[key] = { clients: 0, trials: 0 };
  }
  for (const c of allClients) {
    const month = (c.created_at as string).slice(0, 7);
    if (growthMap[month]) {
      growthMap[month].clients++;
      if (c.status === "trial") growthMap[month].trials++;
    }
  }
  const clientGrowth = Object.entries(growthMap).map(([month, data]) => ({
    month,
    ...data,
  }));

  // Source breakdown
  const sourceMap: Record<string, number> = {};
  for (const c of allClients) {
    const src = (c.source as string) || "unknown";
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  }
  const topSources = Object.entries(sourceMap)
    .map(([source, count]) => ({
      source,
      count,
      percentage: Math.round((count / totalClients) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  return {
    revenue,
    conversionRate,
    trialToActiveRate,
    avgRevenuePerClient,
    totalRevenue,
    appMix,
    clientGrowth,
    topSources,
  };
}

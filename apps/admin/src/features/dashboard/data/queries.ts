import { SupabaseClient } from "@supabase/supabase-js";
import type {
  DashboardStats,
  FollowUpItem,
  PendingPaymentItem,
  RecentActivation,
  AppPopularityItem,
  ActivityLogEntry,
} from "./types";

export async function getDashboardStats(
  supabase: SupabaseClient
): Promise<DashboardStats> {
  const [
    { count: totalClients },
    { count: activeTrials },
    { count: activeLicenses },
    { count: pendingPayments },
    { count: totalDevices },
  ] = await Promise.all([
    supabase.from("ksp_clients").select("*", { count: "exact", head: true }),
    supabase
      .from("ksp_clients")
      .select("*", { count: "exact", head: true })
      .eq("status", "trial"),
    supabase
      .from("ksp_licenses")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .neq("plan_type", "trial"),
    supabase
      .from("ksp_payments")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("ksp_devices")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  // Monthly revenue
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: revenueData } = await supabase
    .from("ksp_licenses")
    .select("amount_paid")
    .gte("purchased_at", startOfMonth.toISOString())
    .neq("plan_type", "trial");

  const monthlyRevenue = revenueData?.reduce((sum, l) => sum + (l.amount_paid || 0), 0) ?? 0;

  // Expiring trials (next 3 days)
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  const { count: expiringTrials } = await supabase
    .from("ksp_clients")
    .select("*", { count: "exact", head: true })
    .eq("status", "trial")
    .lte("trial_expires", threeDaysFromNow)
    .gte("trial_expires", new Date().toISOString());

  // Conversion rate
  const { count: convertedCount } = await supabase
    .from("ksp_clients")
    .select("*", { count: "exact", head: true })
    .eq("status", "active");

  const conversionRate =
    totalClients && totalClients > 0
      ? Math.round(((convertedCount ?? 0) / totalClients) * 100)
      : 0;

  return {
    totalClients: totalClients ?? 0,
    activeTrials: activeTrials ?? 0,
    activeLicenses: activeLicenses ?? 0,
    monthlyRevenue,
    pendingPayments: pendingPayments ?? 0,
    expiringTrials: expiringTrials ?? 0,
    totalDevices: totalDevices ?? 0,
    conversionRate,
  };
}

export async function getFollowUpQueue(
  supabase: SupabaseClient
): Promise<FollowUpItem[]> {
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("ksp_clients")
    .select("id, name, phone, trial_expires, trial_extended, status")
    .eq("status", "trial")
    .lte("trial_expires", sevenDaysFromNow)
    .order("trial_expires", { ascending: true })
    .limit(10);

  if (error || !data) return [];

  const now = new Date();
  return data.map((client) => {
    const expires = new Date(client.trial_expires);
    const daysLeft = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      id: client.id,
      clientName: client.name,
      phone: client.phone,
      appName: "-",
      trialExpires: client.trial_expires,
      daysLeft,
      status: client.trial_extended
        ? "extended"
        : daysLeft <= 0
          ? "expired"
          : "expiring_soon",
    };
  });
}

export async function getPendingPayments(
  supabase: SupabaseClient
): Promise<PendingPaymentItem[]> {
  const { data, error } = await supabase
    .from("ksp_payments")
    .select("id, client_id, amount, method, created_at, proof_url, ksp_clients(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error || !data) return [];

  return data.map((p) => ({
    id: p.id,
    clientName: (p as Record<string, unknown>).ksp_clients
      ? ((p as Record<string, unknown>).ksp_clients as { name: string }).name
      : "Unknown",
    amount: p.amount,
    method: p.method ?? "-",
    submittedAt: p.created_at,
    proofUrl: p.proof_url,
  }));
}

export async function getRecentActivations(
  supabase: SupabaseClient
): Promise<RecentActivation[]> {
  const { data, error } = await supabase
    .from("ksp_licenses")
    .select("id, client_id, license_key, plan_type, purchased_at, ksp_clients(name), ksp_apps(name)")
    .eq("status", "active")
    .neq("plan_type", "trial")
    .order("purchased_at", { ascending: false })
    .limit(5);

  if (error || !data) return [];

  return data.map((l) => ({
    id: l.id,
    clientName: (l as Record<string, unknown>).ksp_clients
      ? ((l as Record<string, unknown>).ksp_clients as { name: string }).name
      : "Unknown",
    appName: (l as Record<string, unknown>).ksp_apps
      ? ((l as Record<string, unknown>).ksp_apps as { name: string }).name
      : "Unknown",
    planType: l.plan_type,
    activatedAt: l.purchased_at,
    licenseKey: l.license_key,
  }));
}

export async function getAppPopularity(
  supabase: SupabaseClient
): Promise<AppPopularityItem[]> {
  const { data, error } = await supabase
    .from("ksp_licenses")
    .select("app_id, ksp_apps(name)")
    .eq("status", "active");

  if (error || !data) return [];

  const counts: Record<string, { name: string; count: number }> = {};
  for (const l of data) {
    const appName = (l as Record<string, unknown>).ksp_apps
      ? ((l as Record<string, unknown>).ksp_apps as { name: string }).name
      : "Unknown";
    if (!counts[l.app_id]) {
      counts[l.app_id] = { name: appName, count: 0 };
    }
    counts[l.app_id].count++;
  }

  const total = data.length || 1;
  return Object.entries(counts)
    .map(([appId, { name, count }]) => ({
      appId,
      appName: name,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

export async function getRecentActivity(
  supabase: SupabaseClient
): Promise<ActivityLogEntry[]> {
  const { data, error } = await supabase
    .from("ksp_activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(15);

  if (error || !data) return [];

  return data.map((log) => ({
    id: log.id,
    action: log.action,
    entityType: log.entity_type,
    entityId: log.entity_id,
    details: log.details ?? {},
    createdAt: log.created_at,
    performedBy: log.performed_by,
  }));
}

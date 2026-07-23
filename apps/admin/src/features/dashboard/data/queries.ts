import { SupabaseClient } from "@supabase/supabase-js";
import type {
  DashboardStats,
  FollowUpItem,
  PendingPaymentItem,
  RecentActivation,
  AppPopularityItem,
  ActivityLogEntry,
  PaymentWithClientRaw,
  LicenseWithRelationsRaw,
  LicenseAppRaw,
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
  supabase: SupabaseClient,
  page: number = 0,
  pageSize: number = 10
): Promise<FollowUpItem[]> {
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("ksp_clients")
    .select("id, name, phone, trial_expires, trial_extended, status")
    .eq("status", "trial")
    .lte("trial_expires", sevenDaysFromNow)
    .order("trial_expires", { ascending: true })
    .range(from, to);

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

export async function getFollowUpTotalCount(supabase: SupabaseClient): Promise<number> {
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("ksp_clients")
    .select("*", { count: "exact", head: true })
    .eq("status", "trial")
    .lte("trial_expires", sevenDaysFromNow);
  return count ?? 0;
}

export async function getPendingPayments(
  supabase: SupabaseClient,
  page: number = 0,
  pageSize: number = 10
): Promise<PendingPaymentItem[]> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("ksp_payments")
    .select("id, client_id, amount, method, created_at, proof_url, ksp_clients(name)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) return [];

  return data.map((p: PaymentWithClientRaw) => ({
    id: p.id,
    clientName: p.ksp_clients?.[0]?.name ?? "Unknown",
    amount: p.amount,
    method: p.method ?? "-",
    submittedAt: p.created_at,
    proofUrl: p.proof_url,
  }));
}

export async function getPendingPaymentsTotalCount(supabase: SupabaseClient): Promise<number> {
  const { count } = await supabase
    .from("ksp_payments")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}

export async function getRecentActivations(
  supabase: SupabaseClient,
  page: number = 0,
  pageSize: number = 5
): Promise<RecentActivation[]> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("ksp_licenses")
    .select("id, client_id, license_key, plan_type, purchased_at, ksp_clients(name), ksp_apps(name)")
    .eq("status", "active")
    .neq("plan_type", "trial")
    .order("purchased_at", { ascending: false })
    .range(from, to);

  if (error || !data) return [];

  return data.map((l: LicenseWithRelationsRaw) => ({
    id: l.id,
    clientName: l.ksp_clients?.[0]?.name ?? "Unknown",
    appName: l.ksp_apps?.[0]?.name ?? "Unknown",
    planType: l.plan_type,
    activatedAt: l.purchased_at,
    licenseKey: l.license_key,
  }));
}

export async function getRecentActivationsTotalCount(supabase: SupabaseClient): Promise<number> {
  const { count } = await supabase
    .from("ksp_licenses")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")
    .neq("plan_type", "trial");
  return count ?? 0;
}

export async function getAppPopularity(
  supabase: SupabaseClient
): Promise<AppPopularityItem[]> {
  const { data, error } = await supabase.rpc<{ app_id: string; app_name: string; count: number; percentage: number }[]>('get_app_popularity_top10');

  if (error || !data) return [];

  return data.map((row) => ({
    appId: row.app_id,
    appName: row.app_name ?? 'Unknown',
    count: row.count,
    percentage: row.percentage,
  }));
}

export async function getRecentActivity(
  supabase: SupabaseClient,
  page: number = 0,
  pageSize: number = 15
): Promise<ActivityLogEntry[]> {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("ksp_activity_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

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

export async function getActivityTotalCount(supabase: SupabaseClient): Promise<number> {
  const { count } = await supabase
    .from("ksp_activity_logs")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

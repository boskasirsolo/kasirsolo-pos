export interface DashboardStats {
  totalClients: number;
  activeTrials: number;
  activeLicenses: number;
  monthlyRevenue: number;
  pendingPayments: number;
  expiringTrials: number;
  totalDevices: number;
  conversionRate: number;
}

export interface FollowUpItem {
  id: string;
  clientName: string;
  phone: string;
  appName: string;
  trialExpires: string;
  daysLeft: number;
  status: "expiring_soon" | "expired" | "extended";
}

export interface PendingPaymentItem {
  id: string;
  clientName: string;
  amount: number;
  method: string;
  submittedAt: string;
  proofUrl: string | null;
}

export interface RecentActivation {
  id: string;
  clientName: string;
  appName: string;
  planType: string;
  activatedAt: string;
  licenseKey: string;
}

export interface AppPopularityItem {
  appId: string;
  appName: string;
  count: number;
  percentage: number;
}

export interface ActivityLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  createdAt: string;
  performedBy: string | null;
}

// ─── Supabase relational row types (untuk join queries) ─────────────────

/** Hasil dari `.select("..., ksp_clients(name)")` di ksp_payments */
export interface PaymentWithClientRaw {
  id: string;
  client_id: string;
  amount: number;
  method: string;
  created_at: string;
  proof_url: string | null;
  ksp_clients: Array<{ name: string }> | null;
}

/** Hasil dari `.select("..., ksp_clients(name), ksp_apps(name)")` di ksp_licenses */
export interface LicenseWithRelationsRaw {
  id: string;
  client_id: string;
  license_key: string;
  plan_type: string;
  purchased_at: string;
  app_id: string | null;
  ksp_clients: Array<{ name: string }> | null;
  ksp_apps: Array<{ name: string }> | null;
}

/** Hasil dari `.select("app_id, ksp_apps(name)")` di ksp_licenses (status active) */
export interface LicenseAppRaw {
  app_id: string | null;
  ksp_apps: Array<{ name: string }> | null;
}

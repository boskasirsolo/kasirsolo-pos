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

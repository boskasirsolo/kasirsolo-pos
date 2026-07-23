import type { KspLicense, KspLicenseStatus, KspPlanType } from "@kasirsolo/db/types";

export type { KspLicense, KspLicenseStatus, KspPlanType };

export interface LicenseWithClient extends Pick<KspLicense, 'id' | 'client_id' | 'license_key' | 'status' | 'max_devices' | 'purchased_at' | 'expires_at' | 'amount_paid' | 'auto_renew' | 'created_at'> {
  client_name?: string;
  client_phone?: string;
  app_name?: string;
  app_id?: string | null;
  plan_type?: string;
  payment_method?: string | null;
  features?: Record<string, boolean | string | number> | null;
  upgraded_from?: string | null;
}

export interface LicenseFilter {
  search: string;
  status: KspLicenseStatus | "all";
  planType: KspPlanType | "all";
  page: number;
  perPage: number;
}

// ─── Supabase relational row type ─────────────────

/** Hasil dari `.select("*, ksp_clients(name, phone), ksp_apps(name)")` di ksp_licenses */
export interface LicenseClientAppRaw {
  id: string;
  client_id: string;
  app_id: string | null;
  license_key: string;
  plan_type: string;
  status: KspLicenseStatus;
  max_devices: number;
  purchased_at: string;
  expires_at: string | null;
  amount_paid: number;
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
  ksp_clients: Array<{ name?: string; phone?: string }> | null;
  ksp_apps: Array<{ name?: string }> | null;
}

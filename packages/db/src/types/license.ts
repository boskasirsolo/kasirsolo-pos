/**
 * KspLicense represents a purchased or granted software license.
 * Table: ksp_licenses
 */
export interface KspLicense {
  /** UUID primary key */
  id: string;
  /** FK to ksp_clients.id */
  client_id: string;
  /** FK to ksp_apps.id */
  app_id: string;
  /** Unique license key string (e.g. "KSP-XXXX-XXXX-XXXX") */
  license_key: string;
  /** Plan tier */
  plan_type: KspPlanType;
  /** Current license status */
  status: KspLicenseStatus;
  /** Maximum number of devices allowed under this license */
  max_devices: number;
  /** When the license was purchased */
  purchased_at: string;
  /** When the license expires (null = lifetime) */
  expires_at: string | null;
  /** Amount paid in IDR */
  amount_paid: number;
  /** Payment method used */
  payment_method: string | null;
  /** Whether this license auto-renews */
  auto_renew: boolean;
  /** JSONB feature flags specific to this license */
  features: Record<string, boolean | string | number> | null;
  /** If this was an upgrade, FK to the previous license ID */
  upgraded_from: string | null;
  /** Record creation timestamp */
  created_at: string;
}

export type KspPlanType = 'trial' | 'basic' | 'pro' | 'enterprise' | 'lifetime';

export type KspLicenseStatus = 'trial' | 'active' | 'expired' | 'suspended' | 'revoked' | 'pending';

export type KspLicenseInsert = Omit<KspLicense, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};

export type KspLicenseUpdate = Partial<Omit<KspLicense, 'id' | 'created_at'>>;

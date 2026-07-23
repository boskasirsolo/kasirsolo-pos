import type { KspLicense, KspLicenseStatus, KspPlanType } from "@kasirsolo/db/types";

export type { KspLicense, KspLicenseStatus, KspPlanType };

export interface LicenseWithClient extends KspLicense {
  client_name?: string;
  client_phone?: string;
  app_name?: string;
}

export interface LicenseFilter {
  search: string;
  status: KspLicenseStatus | "all";
  planType: KspPlanType | "all";
  page: number;
  perPage: number;
}

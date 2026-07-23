import type { KspDevice } from "@kasirsolo/db/types";

export type { KspDevice };

export interface DeviceWithRelations extends KspDevice {
  license_key?: string;
  client_name?: string;
  app_name?: string;
}

export interface DeviceFilter {
  search: string;
  activeOnly: boolean;
  page: number;
  perPage: number;
}

// ─── Supabase relational row type ─────────────────

/** Hasil dari `.select("*, ksp_licenses(license_key, ksp_clients(name), ksp_apps(name))")` di ksp_devices */
export interface DeviceLicenseRaw {
  license_key?: string;
  ksp_clients?: Array<{ name?: string }> | null;
  ksp_apps?: Array<{ name?: string }> | null;
}

export interface DeviceLicenseFullRaw {
  license_key?: string;
  ksp_clients?: Array<{ name?: string }> | null;
  ksp_apps?: Array<{ name?: string }> | null;
}

/** Hasil dari `.select("*, ksp_licenses(...)")` di ksp_devices */
export interface DeviceWithRelationsRaw extends KspDevice {
  ksp_licenses: DeviceLicenseFullRaw | null;
}

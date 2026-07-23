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

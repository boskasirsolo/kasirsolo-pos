import type { KspClient, KspClientStatus } from "@kasirsolo/db/types";

export type { KspClient, KspClientStatus };

export interface ClientWithRelations extends KspClient {
  licenses_count?: number;
  devices_count?: number;
  total_paid?: number;
}

export interface ClientFilter {
  search: string;
  status: KspClientStatus | "all";
  source: string | "all";
  sortBy: "created_at" | "name" | "trial_expires";
  sortOrder: "asc" | "desc";
  page: number;
  perPage: number;
}

export interface ClientListResponse {
  data: ClientWithRelations[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

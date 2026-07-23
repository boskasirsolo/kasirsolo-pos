export interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  performed_by: string | null;
  created_at: string;
}

export interface LogFilter {
  search: string;
  action: string | "all";
  entityType: string | "all";
  dateFrom: string;
  dateTo: string;
  page: number;
  perPage: number;
}

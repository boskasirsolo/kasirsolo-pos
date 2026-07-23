/**
 * KspLog represents an audit/activity log entry.
 * Table: ksp_logs
 */
export interface KspLog {
  /** UUID primary key */
  id: string;
  /** FK to ksp_clients.id (null for system-level logs) */
  client_id: string | null;
  /** FK to ksp_users.id (null for automated actions) */
  user_id: string | null;
  /** Action performed */
  action: KspLogAction;
  /** Entity type the action was performed on */
  entity_type: string;
  /** ID of the entity affected */
  entity_id: string | null;
  /** Human-readable log message */
  message: string;
  /** JSONB additional context data */
  details: Record<string, unknown> | null;
  /** IP address of the requester */
  ip_address: string | null;
  /** User agent string */
  user_agent: string | null;
  /** Log severity level */
  level: KspLogLevel;
  /** Record creation timestamp */
  created_at: string;
}

export type KspLogAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "activate"
  | "deactivate"
  | "bind_device"
  | "unbind_device"
  | "purchase"
  | "verify"
  | "extend_trial"
  | "suspend"
  | "error";

export type KspLogLevel = "info" | "warn" | "error" | "debug";

export type KspLogInsert = Omit<KspLog, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

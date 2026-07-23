/**
 * KspSetting represents a key-value configuration entry.
 * Table: ksp_settings
 */
export interface KspSetting {
  /** UUID primary key */
  id: string;
  /** Setting group/namespace (e.g. "general", "payment", "email") */
  group: string;
  /** Setting key within the group */
  key: string;
  /** Setting value (stored as JSONB) */
  value: unknown;
  /** Human-readable label */
  label: string | null;
  /** Description of what this setting controls */
  description: string | null;
  /** Data type hint for the UI */
  value_type: KspSettingValueType;
  /** Whether this setting can be edited by admins */
  is_editable: boolean;
  /** Record last update timestamp */
  updated_at: string;
}

export type KspSettingValueType =
  | "string"
  | "number"
  | "boolean"
  | "json"
  | "url"
  | "email"
  | "phone";

export type KspSettingUpdate = {
  value: unknown;
  updated_at?: string;
};

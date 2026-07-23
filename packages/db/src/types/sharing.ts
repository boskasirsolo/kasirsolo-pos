/**
 * KspShareMission represents a share mission for trial extension or feature unlock.
 * Table: ksp_share_missions
 */
export interface KspShareMission {
  /** UUID primary key */
  id: string;
  /** FK to ksp_licenses.id */
  license_id: string;
  /** FK to ksp_clients.id */
  client_id: string;
  /** Type of mission */
  mission_type: KspShareMissionType;
  /** Sequence number within the mission type (1, 2, or 3 for trial_extension) */
  mission_number: number;
  /** Number of shares required to complete this mission */
  required_shares: number;
  /** Number of shares completed so far */
  completed_shares: number;
  /** Current mission status */
  status: KspShareMissionStatus;
  /** Days rewarded upon completion (6 for trial_extension, 0 for backup_unlock) */
  reward_days: number;
  /** When the mission was started */
  started_at: string;
  /** When the mission was completed (null if not yet completed) */
  completed_at: string | null;
  /** Record creation timestamp */
  created_at: string;
  /** Record update timestamp */
  updated_at: string;
}

export type KspShareMissionType = "trial_extension" | "backup_unlock";

export type KspShareMissionStatus = "active" | "completed" | "expired";

export type KspShareMissionInsert = Omit<KspShareMission, "id" | "created_at" | "updated_at"> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type KspShareMissionUpdate = Partial<
  Omit<KspShareMission, "id" | "created_at" | "updated_at" | "license_id" | "client_id">
>;

/**
 * KspShareLog represents a single share action within a mission.
 * Table: ksp_share_logs
 */
export interface KspShareLog {
  /** UUID primary key */
  id: string;
  /** FK to ksp_share_missions.id */
  mission_id: string;
  /** FK to ksp_licenses.id */
  license_id: string;
  /** FK to ksp_clients.id */
  client_id: string;
  /** Method used to share */
  share_method: KspShareMethod;
  /** Hashed contact identifier for deduplication */
  share_target: string | null;
  /** When the share occurred */
  shared_at: string;
  /** Whether this share has been verified */
  verified: boolean;
  /** Extra metadata */
  metadata: Record<string, unknown> | null;
  /** Record creation timestamp */
  created_at: string;
}

export type KspShareMethod = "web_share" | "copy_link" | "whatsapp" | "telegram" | "other";

export type KspShareLogInsert = Omit<KspShareLog, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

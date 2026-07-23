/**
 * Share mission types used across the sharing feature module.
 */

export type ShareMissionType = "trial_extension" | "backup_unlock";

export type ShareMissionStatus = "active" | "completed" | "expired";

export type ShareMethod = "web_share" | "copy_link" | "whatsapp" | "telegram" | "other";

/**
 * Represents a share mission as used by the UI/logic layers.
 */
export interface ShareMission {
  id: string;
  licenseId: string;
  clientId: string;
  missionType: ShareMissionType;
  missionNumber: number;
  requiredShares: number;
  completedShares: number;
  status: ShareMissionStatus;
  rewardDays: number;
  startedAt: string;
  completedAt: string | null;
}

/**
 * Represents a single share action log.
 */
export interface ShareLog {
  id: string;
  missionId: string;
  licenseId: string;
  clientId: string;
  shareMethod: ShareMethod;
  shareTarget: string | null;
  sharedAt: string;
  verified: boolean;
}

/**
 * Configuration for a specific share mission type.
 */
export interface ShareMissionConfig {
  /** The mission type */
  type: ShareMissionType;
  /** Human-readable label in Bahasa Indonesia */
  label: string;
  /** Short description of the mission */
  description: string;
  /** Number of shares required to complete the mission */
  requiredShares: number;
  /** Days rewarded upon completion (0 for non-trial missions) */
  rewardDays: number;
  /** Maximum number of missions of this type allowed per license */
  maxMissions: number;
}

/**
 * Overall sharing feature configuration.
 */
export interface ShareConfig {
  /** Default trial duration in days */
  defaultTrialDays: number;
  /** Maximum total trial days achievable through sharing */
  maxTrialDays: number;
  /** The share message template. Use {ref} as license ID placeholder */
  shareMessageTemplate: string;
  /** The download URL base */
  downloadUrl: string;
  /** Mission configs by type */
  missions: Record<ShareMissionType, ShareMissionConfig>;
}

/**
 * Result of a share action attempt.
 */
export interface ShareResult {
  success: boolean;
  shareLog?: ShareLog;
  missionCompleted?: boolean;
  error?: string;
}

/**
 * Eligibility check result for starting a new mission.
 */
export interface MissionEligibility {
  canStart: boolean;
  nextMissionNumber: number;
  reason?: string;
}

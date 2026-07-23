import type { ShareConfig, ShareMissionConfig } from "./types";

/**
 * Trial extension mission configuration.
 * - Requires sharing to 10 contacts
 * - Rewards 6 extra trial days per mission
 * - Maximum 3 missions (so +18 days total -> ~30 day trial)
 */
export const TRIAL_EXTENSION_CONFIG: ShareMissionConfig = {
  type: "trial_extension",
  label: "Perpanjang Trial",
  description: "Bagikan aplikasi ke 10 kontak untuk mendapatkan tambahan 6 hari trial",
  requiredShares: 10,
  rewardDays: 6,
  maxMissions: 3,
};

/**
 * Backup unlock mission configuration.
 * - Requires sharing to 5 contacts
 * - Unlocks the database backup feature permanently
 * - Only 1 mission needed
 */
export const BACKUP_UNLOCK_CONFIG: ShareMissionConfig = {
  type: "backup_unlock",
  label: "Buka Fitur Backup",
  description: "Bagikan aplikasi ke 5 kontak untuk membuka fitur backup database",
  requiredShares: 5,
  rewardDays: 0,
  maxMissions: 1,
};

/**
 * Default trial duration in days.
 */
export const DEFAULT_TRIAL_DAYS = 14;

/**
 * Maximum trial days achievable through sharing.
 * 14 (default) + 3 * 6 (share rewards) = 32 days
 */
export const MAX_TRIAL_DAYS = DEFAULT_TRIAL_DAYS + TRIAL_EXTENSION_CONFIG.rewardDays * TRIAL_EXTENSION_CONFIG.maxMissions;

/**
 * Maximum number of trial extension missions.
 */
export const MAX_TRIAL_MISSIONS = 3;

/**
 * The download URL for the share message.
 */
export const DOWNLOAD_URL = "https://kasirsolo.com/download";

/**
 * Share message template.
 * {ref} will be replaced with the license ID for referral tracking.
 */
export const SHARE_MESSAGE_TEMPLATE =
  "Coba aplikasi kasir KASIRSOLO! Gratis dan gampang dipake. Download di: https://kasirsolo.com/download?ref={ref}";

/**
 * Build the share message with a specific license ID.
 */
export function buildShareMessage(licenseId: string): string {
  return SHARE_MESSAGE_TEMPLATE.replace("{ref}", licenseId);
}

/**
 * Full sharing configuration object.
 */
export const SHARE_CONFIG: ShareConfig = {
  defaultTrialDays: DEFAULT_TRIAL_DAYS,
  maxTrialDays: MAX_TRIAL_DAYS,
  shareMessageTemplate: SHARE_MESSAGE_TEMPLATE,
  downloadUrl: DOWNLOAD_URL,
  missions: {
    trial_extension: TRIAL_EXTENSION_CONFIG,
    backup_unlock: BACKUP_UNLOCK_CONFIG,
  },
};

// ============================================================================
// @kasirsolo/sharing - Sharing/Referral Feature Module
// ============================================================================
// Provides share missions for trial extension and feature unlocking.
// Used across all kasir apps (NOT landing or admin).
// ============================================================================

// --- Data: Types, Config, Queries ---
export type {
  ShareMission,
  ShareLog,
  ShareMissionType,
  ShareMissionStatus,
  ShareMethod,
  ShareMissionConfig,
  ShareConfig,
  ShareResult,
  MissionEligibility,
} from "./data";

export {
  SHARE_CONFIG,
  TRIAL_EXTENSION_CONFIG,
  BACKUP_UNLOCK_CONFIG,
  DEFAULT_TRIAL_DAYS,
  MAX_TRIAL_DAYS,
  MAX_TRIAL_MISSIONS,
  DOWNLOAD_URL,
  SHARE_MESSAGE_TEMPLATE,
  buildShareMessage,
  fetchMissions,
  fetchActiveMission,
  checkMissionEligibility,
  startMission,
  fetchCompletedMissionCount,
  recordShare,
  fetchShareLogs,
  fetchShareCount,
  checkBackupUnlocked,
  fetchTotalBonusDays,
} from "./data";

// --- Logic: React Hooks ---
export { useShareMission } from "./logic";
export type { UseShareMissionOptions, UseShareMissionReturn } from "./logic";

export { useShareDialog } from "./logic";
export type { UseShareDialogOptions, UseShareDialogReturn } from "./logic";

export { useBackupAccess } from "./logic";
export type { UseBackupAccessOptions, UseBackupAccessReturn } from "./logic";

// --- UI: React Components ---
export { ShareMissionCard } from "./ui";
export type { ShareMissionCardProps } from "./ui";

export { ShareDialog } from "./ui";
export type { ShareDialogProps } from "./ui";

export { ShareProgressBar } from "./ui";
export type { ShareProgressBarProps } from "./ui";

export { ShareRewardBanner } from "./ui";
export type { ShareRewardBannerProps } from "./ui";

export { BackupShareGate } from "./ui";
export type { BackupShareGateProps } from "./ui";

export { ShareButton } from "./ui";
export type { ShareButtonProps, ShareButtonVariant, ShareButtonSize } from "./ui";

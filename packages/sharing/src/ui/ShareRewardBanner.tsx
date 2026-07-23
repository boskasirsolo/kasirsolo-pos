import React from "react";
import { colors, radii, spacing, fonts, fontSizes, fontWeights, transitions } from "@kasirsolo/ui/theme";

export interface ShareRewardBannerProps {
  /** Days rewarded */
  rewardDays: number;
  /** Mission number that was completed */
  missionNumber: number;
  /** Total completed missions so far */
  totalCompleted: number;
  /** Max missions allowed */
  maxMissions: number;
  /** Whether the reward is for backup unlock (not trial extension) */
  isBackupUnlock?: boolean;
  /** Callback to dismiss the banner */
  onDismiss?: () => void;
}

/**
 * Banner component shown after a share mission is completed.
 * Displays the reward earned and encourages further sharing.
 */
export function ShareRewardBanner({
  rewardDays,
  missionNumber,
  totalCompleted,
  maxMissions,
  isBackupUnlock = false,
  onDismiss,
}: ShareRewardBannerProps) {
  const canDoMore = totalCompleted < maxMissions;

  const bannerStyle: React.CSSProperties = {
    position: "relative",
    backgroundColor: colors.success[50],
    border: `1px solid ${colors.success[100]}`,
    borderRadius: radii.xl,
    padding: spacing[5],
    fontFamily: fonts.body,
  };

  const iconContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "48px",
    borderRadius: radii.full,
    backgroundColor: colors.success[100],
    marginBottom: spacing[3],
    fontSize: "1.5rem",
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: fonts.heading,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.success[700],
    margin: `0 0 ${spacing[1]} 0`,
  };

  const textStyle: React.CSSProperties = {
    fontSize: fontSizes.sm,
    color: colors.success[600],
    margin: 0,
    lineHeight: 1.6,
  };

  const infoRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: spacing[2],
    marginTop: spacing[3],
    padding: `${spacing[2]} ${spacing[3]}`,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    fontSize: fontSizes.sm,
    color: colors.dark[600],
  };

  const dismissStyle: React.CSSProperties = {
    position: "absolute",
    top: spacing[3],
    right: spacing[3],
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    borderRadius: radii.full,
    border: "none",
    backgroundColor: "transparent",
    color: colors.success[500],
    cursor: "pointer",
    fontSize: fontSizes.base,
    transition: `all ${transitions.fast}`,
  };

  return (
    <div style={bannerStyle} role="alert">
      {onDismiss && (
        <button
          type="button"
          style={dismissStyle}
          onClick={onDismiss}
          aria-label="Tutup banner"
        >
          &#x2715;
        </button>
      )}

      <div style={iconContainerStyle} aria-hidden="true">
        {isBackupUnlock ? "\uD83D\uDD13" : "\uD83C\uDF89"}
      </div>

      <h3 style={titleStyle}>
        {isBackupUnlock
          ? "Fitur Backup Terbuka!"
          : `Misi Sharing #${missionNumber} Selesai!`}
      </h3>

      <p style={textStyle}>
        {isBackupUnlock
          ? "Selamat! Kamu sekarang bisa melakukan backup database kapan saja."
          : `Selamat! Trial kamu ditambah ${rewardDays} hari.`}
      </p>

      {!isBackupUnlock && (
        <div style={infoRowStyle}>
          <span style={{ fontWeight: fontWeights.semibold }}>
            {totalCompleted}/{maxMissions}
          </span>
          <span>
            {canDoMore
              ? `misi selesai - masih bisa ${maxMissions - totalCompleted} misi lagi!`
              : "misi selesai - kamu sudah mendapat semua bonus!"}
          </span>
        </div>
      )}
    </div>
  );
}

ShareRewardBanner.displayName = "ShareRewardBanner";

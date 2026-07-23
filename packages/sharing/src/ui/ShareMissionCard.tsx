import React from "react";
import { colors, radii, shadows, spacing, fonts, fontSizes, fontWeights, transitions } from "@kasirsolo/ui/theme";
import type { ShareMission } from "../data/types";
import { SHARE_CONFIG } from "../data/config";
import { ShareProgressBar } from "./ShareProgressBar";

export interface ShareMissionCardProps {
  /** The share mission to display */
  mission: ShareMission;
  /** Called when user taps the share button */
  onShare?: () => void;
  /** Whether the share button is disabled */
  disabled?: boolean;
}

/**
 * Card component that displays a share mission's progress.
 * Shows mission number, progress bar, share count, reward info,
 * and a share action button.
 */
export function ShareMissionCard({ mission, onShare, disabled = false }: ShareMissionCardProps) {
  const config = SHARE_CONFIG.missions[mission.missionType];
  const isCompleted = mission.status === "completed";
  const remaining = Math.max(0, mission.requiredShares - mission.completedShares);

  const missionLabel =
    mission.missionType === "trial_extension"
      ? `Misi Sharing #${mission.missionNumber}`
      : "Misi Unlock Backup";

  const rewardText =
    mission.missionType === "trial_extension"
      ? `+${config.rewardDays} hari trial`
      : "Buka fitur backup";

  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    boxShadow: shadows.card,
    border: `1px solid ${isCompleted ? colors.success[100] : colors.dark[100]}`,
    padding: spacing[5],
    fontFamily: fonts.body,
    transition: `all ${transitions.normal}`,
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing[3],
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: fonts.heading,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.dark[800],
    margin: 0,
  };

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "3px 10px",
    borderRadius: radii.full,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
    backgroundColor: isCompleted ? colors.success[50] : colors.primary[50],
    color: isCompleted ? colors.success[700] : colors.primary[600],
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: fontSizes.sm,
    color: colors.dark[400],
    margin: `0 0 ${spacing[4]} 0`,
    lineHeight: 1.5,
  };

  const rewardStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: spacing[2],
    marginTop: spacing[3],
    padding: `${spacing[2]} ${spacing[3]}`,
    borderRadius: radii.lg,
    backgroundColor: isCompleted ? colors.success[50] : colors.primary[50],
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: isCompleted ? colors.success[700] : colors.primary[700],
  };

  const buttonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: "48px",
    padding: `${spacing[3]} ${spacing[4]}`,
    marginTop: spacing[4],
    borderRadius: radii.lg,
    border: "none",
    backgroundColor: isCompleted
      ? colors.success[500]
      : disabled
        ? colors.dark[200]
        : colors.primary[500],
    color: colors.white,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    fontFamily: fonts.body,
    cursor: isCompleted || disabled ? "default" : "pointer",
    opacity: disabled && !isCompleted ? 0.5 : 1,
    transition: `all ${transitions.fast}`,
    gap: spacing[2],
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>{missionLabel}</h3>
        <span style={badgeStyle}>
          {isCompleted ? "Selesai" : "Berlangsung"}
        </span>
      </div>

      <p style={descriptionStyle}>{config.description}</p>

      <ShareProgressBar
        current={mission.completedShares}
        total={mission.requiredShares}
      />

      <div style={rewardStyle}>
        <span style={{ fontSize: "1.125rem" }} aria-hidden="true">
          {isCompleted ? "\u2714" : "\uD83C\uDF81"}
        </span>
        <span>
          {isCompleted
            ? `Hadiah diterima: ${rewardText}`
            : `Hadiah: ${rewardText} (sisa ${remaining} share)`}
        </span>
      </div>

      {!isCompleted && (
        <button
          type="button"
          style={buttonStyle}
          onClick={onShare}
          disabled={disabled || isCompleted}
          aria-label={`Bagikan aplikasi - ${remaining} share lagi`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Bagikan Sekarang
        </button>
      )}
    </div>
  );
}

ShareMissionCard.displayName = "ShareMissionCard";

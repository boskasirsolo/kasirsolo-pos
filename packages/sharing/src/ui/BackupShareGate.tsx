import React from "react";
import { colors, radii, shadows, spacing, fonts, fontSizes, fontWeights, transitions } from "@kasirsolo/ui/theme";
import { BACKUP_UNLOCK_CONFIG } from "../data/config";
import { ShareProgressBar } from "./ShareProgressBar";

export interface BackupShareGateProps {
  /** Whether backup is unlocked */
  isUnlocked: boolean;
  /** Number of shares completed toward unlock */
  completedShares: number;
  /** Whether the unlock mission has been started */
  missionStarted: boolean;
  /** Children to render when backup is unlocked */
  children: React.ReactNode;
  /** Called when user wants to start the unlock mission */
  onStartMission?: () => void;
  /** Called when user wants to share */
  onShare?: () => void;
  /** Whether loading state */
  loading?: boolean;
}

/**
 * Gate component that blocks access to backup functionality
 * until the user completes the sharing requirement.
 *
 * When unlocked, renders children normally.
 * When locked, shows the sharing requirement and CTA.
 */
export function BackupShareGate({
  isUnlocked,
  completedShares,
  missionStarted,
  children,
  onStartMission,
  onShare,
  loading = false,
}: BackupShareGateProps) {
  // If unlocked, render children directly
  if (isUnlocked) {
    return <>{children}</>;
  }

  const containerStyle: React.CSSProperties = {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    boxShadow: shadows.card,
    border: `1px solid ${colors.dark[100]}`,
    padding: spacing[6],
    fontFamily: fonts.body,
    textAlign: "center",
  };

  const iconStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "64px",
    height: "64px",
    borderRadius: radii.full,
    backgroundColor: colors.warning[50],
    margin: `0 auto ${spacing[4]}`,
    fontSize: "2rem",
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: fonts.heading,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.dark[800],
    margin: `0 0 ${spacing[2]} 0`,
  };

  const descStyle: React.CSSProperties = {
    fontSize: fontSizes.sm,
    color: colors.dark[400],
    margin: `0 0 ${spacing[5]} 0`,
    lineHeight: 1.6,
    maxWidth: "320px",
    marginLeft: "auto",
    marginRight: "auto",
  };

  const progressContainerStyle: React.CSSProperties = {
    marginBottom: spacing[5],
    maxWidth: "280px",
    marginLeft: "auto",
    marginRight: "auto",
  };

  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    minHeight: "48px",
    minWidth: "200px",
    padding: `${spacing[3]} ${spacing[6]}`,
    borderRadius: radii.lg,
    border: "none",
    backgroundColor: colors.primary[500],
    color: colors.white,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    fontFamily: fonts.body,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.6 : 1,
    transition: `all ${transitions.fast}`,
  };

  const stepStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: spacing[3],
    textAlign: "left",
    marginBottom: spacing[3],
  };

  const stepNumberStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "28px",
    height: "28px",
    minWidth: "28px",
    borderRadius: radii.full,
    backgroundColor: colors.primary[100],
    color: colors.primary[700],
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
  };

  const stepTextStyle: React.CSSProperties = {
    fontSize: fontSizes.sm,
    color: colors.dark[600],
    lineHeight: 1.5,
    paddingTop: "3px",
  };

  const stepsContainerStyle: React.CSSProperties = {
    textAlign: "left",
    marginBottom: spacing[5],
    maxWidth: "320px",
    marginLeft: "auto",
    marginRight: "auto",
  };

  const requiredShares = BACKUP_UNLOCK_CONFIG.requiredShares;

  return (
    <div style={containerStyle}>
      <div style={iconStyle} aria-hidden="true">
        {"\uD83D\uDD12"}
      </div>

      <h3 style={titleStyle}>Fitur Backup Terkunci</h3>
      <p style={descStyle}>
        Bagikan KASIRSOLO ke {requiredShares} kontak untuk membuka fitur backup database secara gratis!
      </p>

      {missionStarted && (
        <div style={progressContainerStyle}>
          <ShareProgressBar
            current={completedShares}
            total={requiredShares}
          />
        </div>
      )}

      {!missionStarted && (
        <div style={stepsContainerStyle}>
          <div style={stepStyle}>
            <span style={stepNumberStyle}>1</span>
            <span style={stepTextStyle}>
              Mulai misi sharing dengan menekan tombol di bawah
            </span>
          </div>
          <div style={stepStyle}>
            <span style={stepNumberStyle}>2</span>
            <span style={stepTextStyle}>
              Bagikan KASIRSOLO ke {requiredShares} kontak
            </span>
          </div>
          <div style={stepStyle}>
            <span style={stepNumberStyle}>3</span>
            <span style={stepTextStyle}>
              Fitur backup otomatis terbuka setelah selesai!
            </span>
          </div>
        </div>
      )}

      <button
        type="button"
        style={buttonStyle}
        onClick={missionStarted ? onShare : onStartMission}
        disabled={loading}
      >
        {loading ? (
          <span
            style={{
              display: "inline-block",
              width: "1em",
              height: "1em",
              border: "2px solid currentColor",
              borderTopColor: "transparent",
              borderRadius: "50%",
              animation: "ksp-spin 0.6s linear infinite",
            }}
            aria-hidden="true"
          />
        ) : (
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
        )}
        {missionStarted ? "Bagikan Sekarang" : "Mulai Misi Sharing"}
      </button>
    </div>
  );
}

BackupShareGate.displayName = "BackupShareGate";

import React from "react";
import { colors, radii, shadows, spacing, fonts, fontSizes, fontWeights, transitions, zIndex } from "@kasirsolo/ui/theme";
import type { UseShareDialogReturn } from "../logic/useShareDialog";
import { ShareProgressBar } from "./ShareProgressBar";

export interface ShareDialogProps {
  /** Share dialog hook return value */
  dialog: UseShareDialogReturn;
  /** Current share count for the active mission */
  currentShares?: number;
  /** Total shares required for the active mission */
  totalShares?: number;
  /** Title text override */
  title?: string;
}

/**
 * Full-featured share dialog component.
 *
 * Shows the share message, share methods (Web Share, WhatsApp, Telegram, copy link),
 * and optional progress information. Designed as a bottom sheet on mobile.
 */
export function ShareDialog({
  dialog,
  currentShares = 0,
  totalShares = 10,
  title = "Bagikan KASIRSOLO",
}: ShareDialogProps) {
  if (!dialog.isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: zIndex.modal,
    padding: 0,
  };

  const panelStyle: React.CSSProperties = {
    position: "relative",
    backgroundColor: colors.white,
    borderRadius: `${radii.xl} ${radii.xl} 0 0`,
    boxShadow: shadows.xl,
    width: "100%",
    maxWidth: "480px",
    maxHeight: "85vh",
    overflowY: "auto",
    padding: `${spacing[6]} ${spacing[5]} ${spacing[8]}`,
    fontFamily: fonts.body,
  };

  const handleStyle: React.CSSProperties = {
    width: "40px",
    height: "4px",
    backgroundColor: colors.dark[200],
    borderRadius: radii.full,
    margin: `0 auto ${spacing[5]}`,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: fonts.heading,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.dark[900],
    margin: `0 0 ${spacing[2]} 0`,
    textAlign: "center",
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: fontSizes.sm,
    color: colors.dark[400],
    textAlign: "center",
    margin: `0 0 ${spacing[5]} 0`,
    lineHeight: 1.5,
  };

  const messageBoxStyle: React.CSSProperties = {
    backgroundColor: colors.dark[50],
    borderRadius: radii.lg,
    padding: spacing[4],
    marginBottom: spacing[5],
    fontSize: fontSizes.sm,
    color: colors.dark[600],
    lineHeight: 1.6,
    border: `1px solid ${colors.dark[100]}`,
    wordBreak: "break-word",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: spacing[3],
    marginBottom: spacing[5],
  };

  const shareButtonBase: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    minHeight: "80px",
    padding: spacing[3],
    borderRadius: radii.lg,
    border: `1px solid ${colors.dark[100]}`,
    backgroundColor: colors.white,
    cursor: "pointer",
    transition: `all ${transitions.fast}`,
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.dark[600],
  };

  const webShareButtonStyle: React.CSSProperties = {
    ...shareButtonBase,
    gridColumn: "1 / -1",
    flexDirection: "row",
    minHeight: "56px",
    backgroundColor: colors.primary[500],
    color: colors.white,
    border: "none",
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    gap: spacing[2],
  };

  const closeButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: spacing[4],
    right: spacing[4],
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: radii.md,
    border: "none",
    backgroundColor: "transparent",
    color: colors.dark[400],
    cursor: "pointer",
    fontSize: fontSizes.xl,
    lineHeight: 1,
  };

  const progressSectionStyle: React.CSSProperties = {
    marginBottom: spacing[5],
  };

  return (
    <div style={overlayStyle} onClick={dialog.close} role="dialog" aria-modal="true" aria-label={title}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={handleStyle} aria-hidden="true" />

        <button
          type="button"
          style={closeButtonStyle}
          onClick={dialog.close}
          aria-label="Tutup dialog"
        >
          &#x2715;
        </button>

        <h2 style={titleStyle}>{title}</h2>
        <p style={subtitleStyle}>
          Bagikan ke teman dan dapatkan hadiah!
        </p>

        {totalShares > 0 && (
          <div style={progressSectionStyle}>
            <ShareProgressBar current={currentShares} total={totalShares} />
          </div>
        )}

        <div style={messageBoxStyle}>
          {dialog.shareMessage}
        </div>

        <div style={gridStyle}>
          {/* Native Web Share (full width, primary CTA) */}
          {dialog.isWebShareSupported && (
            <button
              type="button"
              style={webShareButtonStyle}
              onClick={dialog.triggerWebShare}
              disabled={dialog.sharing}
            >
              <svg
                width="22"
                height="22"
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
              {dialog.sharing ? "Membagikan..." : "Bagikan via Share"}
            </button>
          )}

          {/* WhatsApp */}
          <button
            type="button"
            style={{ ...shareButtonBase, borderColor: "#25D366" }}
            onClick={dialog.shareViaWhatsApp}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#25D366" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>WhatsApp</span>
          </button>

          {/* Telegram */}
          <button
            type="button"
            style={{ ...shareButtonBase, borderColor: "#0088CC" }}
            onClick={dialog.shareViaTelegram}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#0088CC" aria-hidden="true">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
            <span>Telegram</span>
          </button>

          {/* Copy Link */}
          <button
            type="button"
            style={{ ...shareButtonBase, gridColumn: "1 / -1" }}
            onClick={dialog.copyLink}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={colors.dark[500]}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ display: "inline" }}
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Salin Teks Bagikan</span>
          </button>
        </div>
      </div>
    </div>
  );
}

ShareDialog.displayName = "ShareDialog";

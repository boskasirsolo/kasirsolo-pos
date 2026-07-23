import React from "react";
import { colors, radii, fonts, fontSizes, fontWeights, transitions } from "@kasirsolo/ui/theme";

export type ShareButtonVariant = "primary" | "outline" | "ghost";
export type ShareButtonSize = "sm" | "md" | "lg";

export interface ShareButtonProps {
  /** Click handler */
  onClick?: () => void;
  /** Button variant */
  variant?: ShareButtonVariant;
  /** Button size */
  size?: ShareButtonSize;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Custom label text */
  label?: string;
  /** Show share count badge */
  shareCount?: number;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

const sizeMap: Record<ShareButtonSize, { height: string; padding: string; fontSize: string; iconSize: number }> = {
  sm: { height: "40px", padding: "0 12px", fontSize: fontSizes.sm, iconSize: 16 },
  md: { height: "48px", padding: "0 20px", fontSize: fontSizes.base, iconSize: 18 },
  lg: { height: "56px", padding: "0 28px", fontSize: fontSizes.lg, iconSize: 22 },
};

/**
 * Reusable share trigger button with share icon.
 * Mobile-first with 44px+ touch targets for all sizes.
 */
export function ShareButton({
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  label = "Bagikan",
  shareCount,
  style: externalStyle,
}: ShareButtonProps) {
  const isDisabled = disabled || loading;
  const sizeConfig = sizeMap[size];

  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case "primary":
        return {
          backgroundColor: colors.primary[500],
          color: colors.white,
          border: "none",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: colors.primary[500],
          border: `1.5px solid ${colors.primary[500]}`,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          color: colors.primary[500],
          border: "none",
        };
    }
  };

  const buttonStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    minHeight: sizeConfig.height,
    padding: sizeConfig.padding,
    borderRadius: radii.lg,
    fontSize: sizeConfig.fontSize,
    fontWeight: fontWeights.semibold,
    fontFamily: fonts.body,
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.5 : 1,
    transition: `all ${transitions.fast}`,
    lineHeight: 1,
    whiteSpace: "nowrap",
    position: "relative",
    width: fullWidth ? "100%" : undefined,
    ...getVariantStyles(),
    ...externalStyle,
  };

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "20px",
    height: "20px",
    padding: "0 6px",
    borderRadius: radii.full,
    backgroundColor: variant === "primary" ? "rgba(255,255,255,0.25)" : colors.primary[100],
    color: variant === "primary" ? colors.white : colors.primary[700],
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold,
    lineHeight: 1,
  };

  return (
    <button
      type="button"
      style={buttonStyle}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={label}
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
          width={sizeConfig.iconSize}
          height={sizeConfig.iconSize}
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
      {label}
      {typeof shareCount === "number" && shareCount > 0 && (
        <span style={badgeStyle}>{shareCount}</span>
      )}
    </button>
  );
}

ShareButton.displayName = "ShareButton";

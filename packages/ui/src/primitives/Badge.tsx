import React, { type HTMLAttributes } from "react";
import { colors, radii, fonts, fontSizes, fontWeights, spacing } from "../theme";

export type BadgeStatus =
  | "trial"
  | "active"
  | "expired"
  | "locked"
  | "suspended"
  | "pending"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Status determines the color scheme */
  status: BadgeStatus;
  /** Optional dot indicator */
  dot?: boolean;
  /** Badge size */
  size?: "sm" | "md";
}

const statusColors: Record<BadgeStatus, { bg: string; text: string; dot: string }> = {
  trial: { bg: colors.info[100], text: colors.info[700], dot: colors.info[500] },
  active: { bg: colors.success[100], text: colors.success[700], dot: colors.success[500] },
  expired: { bg: colors.error[100], text: colors.error[700], dot: colors.error[500] },
  locked: { bg: colors.dark[100], text: colors.dark[600], dot: colors.dark[500] },
  suspended: { bg: colors.warning[100], text: colors.warning[700], dot: colors.warning[500] },
  pending: { bg: colors.secondary[100], text: colors.secondary[700], dot: colors.secondary[500] },
  success: { bg: colors.success[100], text: colors.success[700], dot: colors.success[500] },
  warning: { bg: colors.warning[100], text: colors.warning[700], dot: colors.warning[500] },
  error: { bg: colors.error[100], text: colors.error[700], dot: colors.error[500] },
  info: { bg: colors.info[100], text: colors.info[700], dot: colors.info[500] },
  neutral: { bg: colors.dark[100], text: colors.dark[600], dot: colors.dark[400] },
};

/**
 * Status badge component for displaying states like trial, active, expired, etc.
 */
export function Badge({ status, dot = true, size = "sm", children, style, ...props }: BadgeProps) {
  const scheme = statusColors[status];

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: spacing[1],
    fontFamily: fonts.body,
    fontSize: size === "sm" ? fontSizes.xs : fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: 1,
    padding: size === "sm" ? `${spacing[1]} ${spacing[2]}` : `${spacing[1]} ${spacing[3]}`,
    borderRadius: radii.full,
    backgroundColor: scheme.bg,
    color: scheme.text,
    whiteSpace: "nowrap",
    ...style,
  };

  const dotStyle: React.CSSProperties = {
    width: size === "sm" ? "0.375rem" : "0.5rem",
    height: size === "sm" ? "0.375rem" : "0.5rem",
    borderRadius: radii.full,
    backgroundColor: scheme.dot,
    flexShrink: 0,
  };

  return (
    <span style={badgeStyle} {...props}>
      {dot && <span style={dotStyle} aria-hidden="true" />}
      {children ?? status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

Badge.displayName = "Badge";

import React, { type HTMLAttributes, type ReactNode } from "react";
import { colors, fonts, fontSizes, fontWeights, spacing } from "../theme";

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Illustration or icon */
  icon?: ReactNode;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action element (e.g. a button) */
  action?: ReactNode;
}

/**
 * Empty state placeholder for when there is no data to display.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  style,
  ...props
}: EmptyStateProps) {
  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: `${spacing[10]} ${spacing[4]}`,
    textAlign: "center",
    fontFamily: fonts.body,
    ...style,
  };

  const iconStyle: React.CSSProperties = {
    fontSize: "3rem",
    color: colors.dark[300],
    marginBottom: spacing[4],
  };

  const titleStyle: React.CSSProperties = {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.dark[700],
    lineHeight: 1.4,
    marginBottom: spacing[2],
  };

  const descStyle: React.CSSProperties = {
    fontSize: fontSizes.sm,
    color: colors.dark[400],
    lineHeight: 1.5,
    maxWidth: "24rem",
    marginBottom: action ? spacing[6] : undefined,
  };

  return (
    <div style={containerStyle} {...props}>
      {icon && <div style={iconStyle}>{icon}</div>}
      <h3 style={titleStyle}>{title}</h3>
      {description && <p style={descStyle}>{description}</p>}
      {action}
    </div>
  );
}

EmptyState.displayName = "EmptyState";

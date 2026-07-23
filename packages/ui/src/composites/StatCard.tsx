import React, { type HTMLAttributes, type ReactNode } from "react";
import { colors, radii, shadows, spacing, fonts, fontSizes, fontWeights } from "../theme";

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  /** KPI label */
  label: string;
  /** KPI value (formatted) */
  value: string | number;
  /** Optional icon element */
  icon?: ReactNode;
  /** Change amount (e.g. "+12.5%") */
  change?: string;
  /** Whether the change is positive */
  changePositive?: boolean;
  /** Accent color for the left border */
  accentColor?: string;
  /** Optional sub-label below the value */
  subLabel?: string;
}

/**
 * KPI stat card for dashboard displays.
 */
export function StatCard({
  label,
  value,
  icon,
  change,
  changePositive,
  accentColor = colors.primary[500],
  subLabel,
  style,
  ...props
}: StatCardProps) {
  const cardStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    boxShadow: shadows.card,
    border: `1px solid ${colors.dark[100]}`,
    borderLeft: `4px solid ${accentColor}`,
    fontFamily: fonts.body,
    ...style,
  };

  const iconBoxStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: radii.lg,
    backgroundColor: `${accentColor}15`,
    color: accentColor,
    flexShrink: 0,
    fontSize: fontSizes.xl,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.dark[400],
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    lineHeight: 1.4,
    marginBottom: spacing[1],
  };

  const valueStyle: React.CSSProperties = {
    fontSize: fontSizes["2xl"],
    fontWeight: fontWeights.bold,
    color: colors.dark[900],
    lineHeight: 1.2,
  };

  const changeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.2em",
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: changePositive ? colors.success[600] : colors.error[600],
    marginTop: spacing[1],
  };

  const subLabelStyle: React.CSSProperties = {
    fontSize: fontSizes.xs,
    color: colors.dark[400],
    marginTop: spacing[1],
  };

  return (
    <div style={cardStyle} {...props}>
      {icon && <div style={iconBoxStyle}>{icon}</div>}
      <div style={contentStyle}>
        <div style={labelStyle}>{label}</div>
        <div style={valueStyle}>{value}</div>
        {change && (
          <div style={changeStyle}>
            <span>{changePositive ? "\u2191" : "\u2193"}</span>
            <span>{change}</span>
          </div>
        )}
        {subLabel && <div style={subLabelStyle}>{subLabel}</div>}
      </div>
    </div>
  );
}

StatCard.displayName = "StatCard";

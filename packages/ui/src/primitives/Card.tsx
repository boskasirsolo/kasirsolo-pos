import React, { type HTMLAttributes, type ReactNode } from "react";
import { colors, radii, shadows, spacing, fonts } from "../theme";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card padding size */
  padding?: "none" | "sm" | "md" | "lg";
  /** Whether to show a subtle border */
  bordered?: boolean;
  /** Whether to show a hover shadow effect */
  hoverable?: boolean;
  /** Optional header content */
  header?: ReactNode;
  /** Optional footer content */
  footer?: ReactNode;
}

const paddingMap: Record<string, string> = {
  none: "0",
  sm: spacing[3],
  md: spacing[4],
  lg: spacing[6],
};

/**
 * Base card component with optional header, footer, and hover effects.
 */
export function Card({
  padding = "md",
  bordered = true,
  hoverable = false,
  header,
  footer,
  children,
  style,
  ...props
}: CardProps) {
  const cardStyle: React.CSSProperties = {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    boxShadow: shadows.card,
    border: bordered ? `1px solid ${colors.dark[100]}` : "none",
    overflow: "hidden",
    fontFamily: fonts.body,
    transition: hoverable ? "box-shadow 0.2s ease, transform 0.2s ease" : undefined,
    cursor: hoverable ? "pointer" : undefined,
    ...style,
  };

  const headerStyle: React.CSSProperties = {
    padding: `${spacing[3]} ${paddingMap[padding] || spacing[4]}`,
    borderBottom: `1px solid ${colors.dark[100]}`,
  };

  const bodyStyle: React.CSSProperties = {
    padding: paddingMap[padding],
  };

  const footerStyle: React.CSSProperties = {
    padding: `${spacing[3]} ${paddingMap[padding] || spacing[4]}`,
    borderTop: `1px solid ${colors.dark[100]}`,
  };

  return (
    <div style={cardStyle} {...props}>
      {header && <div style={headerStyle}>{header}</div>}
      <div style={bodyStyle}>{children}</div>
      {footer && <div style={footerStyle}>{footer}</div>}
    </div>
  );
}

Card.displayName = "Card";

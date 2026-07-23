"use client";

import React, { forwardRef, type ButtonHTMLAttributes } from "react";
import { colors, radii, fonts, fontSizes, fontWeights, transitions } from "../theme";

export type ButtonVariant = "primary" | "ghost" | "outline" | "dark" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: colors.primary[500],
    color: colors.white,
    border: "none",
  },
  ghost: {
    backgroundColor: "transparent",
    color: colors.dark[700],
    border: "none",
  },
  outline: {
    backgroundColor: "transparent",
    color: colors.primary[500],
    border: `1.5px solid ${colors.primary[500]}`,
  },
  dark: {
    backgroundColor: colors.dark[900],
    color: colors.white,
    border: "none",
  },
  danger: {
    backgroundColor: colors.error[500],
    color: colors.white,
    border: "none",
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: "0.375rem 0.75rem",
    fontSize: fontSizes.sm,
    borderRadius: radii.md,
    gap: "0.375rem",
  },
  md: {
    padding: "0.5rem 1rem",
    fontSize: fontSizes.base,
    borderRadius: radii.lg,
    gap: "0.5rem",
  },
  lg: {
    padding: "0.75rem 1.5rem",
    fontSize: fontSizes.lg,
    borderRadius: radii.lg,
    gap: "0.5rem",
  },
};

/**
 * Primary button component with multiple variants and sizes.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: fonts.body,
      fontWeight: fontWeights.semibold,
      lineHeight: 1.5,
      cursor: isDisabled ? "not-allowed" : "pointer",
      opacity: isDisabled ? 0.5 : 1,
      transition: `all ${transitions.fast}`,
      outline: "none",
      textDecoration: "none",
      whiteSpace: "nowrap",
      width: fullWidth ? "100%" : undefined,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    };

    return (
      <button ref={ref} disabled={isDisabled} style={baseStyle} {...props}>
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
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

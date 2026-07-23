import React, { forwardRef, useId, type InputHTMLAttributes } from "react";
import { colors, radii, fonts, fontSizes, fontWeights, transitions, spacing } from "../theme";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Hint text displayed below the input (hidden when error is shown) */
  hint?: string;
  /** Left addon element (e.g. icon) */
  leftAddon?: React.ReactNode;
  /** Right addon element (e.g. icon or button) */
  rightAddon?: React.ReactNode;
  /** Full width mode */
  fullWidth?: boolean;
}

/**
 * Form input component with label, error, and hint support.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftAddon,
      rightAddon,
      fullWidth = true,
      id: providedId,
      style,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = providedId ?? generatedId;
    const hasError = Boolean(error);

    const containerStyle: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: spacing[1],
      width: fullWidth ? "100%" : undefined,
    };

    const labelStyle: React.CSSProperties = {
      fontFamily: fonts.body,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      color: colors.dark[700],
      lineHeight: 1.5,
    };

    const inputWrapperStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      borderRadius: radii.lg,
      border: `1.5px solid ${hasError ? colors.error[500] : colors.dark[200]}`,
      backgroundColor: colors.white,
      transition: `border-color ${transitions.fast}`,
      overflow: "hidden",
    };

    const inputStyle: React.CSSProperties = {
      flex: 1,
      padding: `${spacing[2]} ${spacing[3]}`,
      fontFamily: fonts.body,
      fontSize: fontSizes.base,
      color: colors.dark[900],
      border: "none",
      outline: "none",
      backgroundColor: "transparent",
      width: "100%",
      lineHeight: 1.5,
      ...style,
    };

    const addonStyle: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: `0 ${spacing[3]}`,
      color: colors.dark[400],
      flexShrink: 0,
    };

    const messageStyle: React.CSSProperties = {
      fontFamily: fonts.body,
      fontSize: fontSizes.xs,
      lineHeight: 1.5,
    };

    return (
      <div style={containerStyle}>
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}
          </label>
        )}
        <div style={inputWrapperStyle}>
          {leftAddon && <span style={addonStyle}>{leftAddon}</span>}
          <input ref={ref} id={inputId} style={inputStyle} aria-invalid={hasError} {...props} />
          {rightAddon && <span style={addonStyle}>{rightAddon}</span>}
        </div>
        {hasError && (
          <span style={{ ...messageStyle, color: colors.error[500] }}>{error}</span>
        )}
        {!hasError && hint && (
          <span style={{ ...messageStyle, color: colors.dark[400] }}>{hint}</span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

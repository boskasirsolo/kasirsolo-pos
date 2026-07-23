import React, { type ReactNode } from "react";
import { colors, fonts, fontSizes, fontWeights, spacing } from "../theme";

export interface FormFieldProps {
  /** Field label */
  label: string;
  /** Field name / htmlFor */
  name?: string;
  /** Whether this field is required */
  required?: boolean;
  /** Error message */
  error?: string;
  /** Hint text */
  hint?: string;
  /** Form field content (e.g. input, select, textarea) */
  children: ReactNode;
}

/**
 * Form field wrapper with label, required indicator, error, and hint.
 */
export function FormField({ label, name, required, error, hint, children }: FormFieldProps) {
  const hasError = Boolean(error);

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: spacing[1],
    width: "100%",
  };

  const labelRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: spacing[1],
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.dark[700],
    lineHeight: 1.5,
  };

  const requiredStyle: React.CSSProperties = {
    color: colors.error[500],
    fontWeight: fontWeights.bold,
  };

  const messageStyle: React.CSSProperties = {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    lineHeight: 1.5,
  };

  return (
    <div style={containerStyle}>
      <div style={labelRowStyle}>
        <label htmlFor={name} style={labelStyle}>
          {label}
        </label>
        {required && <span style={requiredStyle}>*</span>}
      </div>
      {children}
      {hasError && (
        <span style={{ ...messageStyle, color: colors.error[500] }}>{error}</span>
      )}
      {!hasError && hint && (
        <span style={{ ...messageStyle, color: colors.dark[400] }}>{hint}</span>
      )}
    </div>
  );
}

FormField.displayName = "FormField";

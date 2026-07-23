import React from "react";
import { colors, radii, transitions } from "@kasirsolo/ui/theme";

export interface ShareProgressBarProps {
  /** Current number of completed shares */
  current: number;
  /** Total number of shares required */
  total: number;
  /** Height of the progress bar. Defaults to 10 */
  height?: number;
  /** Whether to show the label text. Defaults to true */
  showLabel?: boolean;
  /** Bar color when in progress */
  color?: string;
  /** Bar color when completed */
  completedColor?: string;
}

/**
 * Visual progress bar for share missions.
 * Shows current/total shares with a filled bar and optional label.
 */
export function ShareProgressBar({
  current,
  total,
  height = 10,
  showLabel = true,
  color = colors.primary[500],
  completedColor = colors.success[500],
}: ShareProgressBarProps) {
  const percentage = total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;
  const isCompleted = current >= total;
  const barColor = isCompleted ? completedColor : color;

  const containerStyle: React.CSSProperties = {
    width: "100%",
  };

  const trackStyle: React.CSSProperties = {
    width: "100%",
    height: `${height}px`,
    backgroundColor: colors.dark[100],
    borderRadius: radii.full,
    overflow: "hidden",
    position: "relative",
  };

  const fillStyle: React.CSSProperties = {
    height: "100%",
    width: `${percentage}%`,
    backgroundColor: barColor,
    borderRadius: radii.full,
    transition: `width ${transitions.slow}`,
    minWidth: current > 0 ? `${height}px` : "0",
  };

  const labelStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "6px",
    fontSize: "0.8125rem",
    color: isCompleted ? completedColor : colors.dark[400],
    fontWeight: 500,
  };

  return (
    <div style={containerStyle}>
      <div style={trackStyle}>
        <div style={fillStyle} role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total} />
      </div>
      {showLabel && (
        <div style={labelStyle}>
          <span>
            {current}/{total} share{total !== 1 ? "s" : ""}
          </span>
          <span>{isCompleted ? "Selesai!" : `${percentage}%`}</span>
        </div>
      )}
    </div>
  );
}

ShareProgressBar.displayName = "ShareProgressBar";

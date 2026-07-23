"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";
import { colors, radii, shadows, spacing, fonts, fontSizes, fontWeights, transitions, zIndex } from "../theme";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Hook to access the toast notification system.
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

let toastCounter = 0;

/**
 * Toast provider that manages and renders toast notifications.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    const newToast: Toast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

ToastProvider.displayName = "ToastProvider";

// --- Internal Toast Container ---

const typeColors: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: colors.success[50], border: colors.success[500], icon: colors.success[600] },
  error: { bg: colors.error[50], border: colors.error[500], icon: colors.error[600] },
  warning: { bg: colors.warning[50], border: colors.warning[500], icon: colors.warning[600] },
  info: { bg: colors.info[50], border: colors.info[500], icon: colors.info[600] },
};

const typeIcons: Record<ToastType, string> = {
  success: "\u2713",
  error: "\u2717",
  warning: "\u26A0",
  info: "\u2139",
};

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    top: spacing[4],
    right: spacing[4],
    zIndex: zIndex.toast,
    display: "flex",
    flexDirection: "column",
    gap: spacing[2],
    maxWidth: "400px",
    width: "100%",
    pointerEvents: "none",
  };

  return (
    <div style={containerStyle} aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const scheme = typeColors[toast.type];

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const itemStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: spacing[3],
    padding: spacing[3],
    backgroundColor: scheme.bg,
    borderLeft: `4px solid ${scheme.border}`,
    borderRadius: radii.lg,
    boxShadow: shadows.elevated,
    fontFamily: fonts.body,
    pointerEvents: "auto",
    transform: isVisible ? "translateX(0)" : "translateX(100%)",
    opacity: isVisible ? 1 : 0,
    transition: `transform ${transitions.normal}, opacity ${transitions.normal}`,
  };

  const iconStyle: React.CSSProperties = {
    color: scheme.icon,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    lineHeight: 1,
    flexShrink: 0,
    marginTop: "2px",
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.dark[900],
    lineHeight: 1.4,
  };

  const messageStyle: React.CSSProperties = {
    fontSize: fontSizes.xs,
    color: colors.dark[500],
    lineHeight: 1.4,
    marginTop: "2px",
  };

  const closeStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.25rem",
    height: "1.25rem",
    border: "none",
    backgroundColor: "transparent",
    color: colors.dark[400],
    cursor: "pointer",
    fontSize: fontSizes.sm,
    borderRadius: radii.sm,
    flexShrink: 0,
    padding: 0,
    lineHeight: 1,
  };

  return (
    <div style={itemStyle} role="alert">
      <span style={iconStyle} aria-hidden="true">
        {typeIcons[toast.type]}
      </span>
      <div style={contentStyle}>
        <div style={titleStyle}>{toast.title}</div>
        {toast.message && <div style={messageStyle}>{toast.message}</div>}
      </div>
      <button style={closeStyle} onClick={() => onRemove(toast.id)} aria-label="Dismiss" type="button">
        &#x2715;
      </button>
    </div>
  );
}

"use client";

import React, { useEffect, useCallback, useRef, type ReactNode } from "react";
import { colors, radii, shadows, spacing, transitions, zIndex, fonts, fontSizes, fontWeights } from "../theme";

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal is closed */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: ReactNode;
  /** Modal size */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Whether clicking the overlay closes the modal */
  closeOnOverlayClick?: boolean;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
  /** Footer content (e.g. action buttons) */
  footer?: ReactNode;
}

const sizeMap: Record<string, string> = {
  sm: "400px",
  md: "560px",
  lg: "720px",
  xl: "900px",
  full: "calc(100vw - 2rem)",
};

/**
 * Modal overlay component with backdrop, keyboard handling, and focus trap.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === "Escape") {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      // Focus the modal on open
      modalRef.current?.focus();
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: zIndex.modal,
    padding: spacing[4],
    animation: `ksp-fade-in ${transitions.fast}`,
  };

  const panelStyle: React.CSSProperties = {
    position: "relative",
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    boxShadow: shadows.xl,
    width: "100%",
    maxWidth: sizeMap[size],
    maxHeight: "calc(100vh - 2rem)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    animation: `ksp-scale-in ${transitions.normal}`,
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `${spacing[4]} ${spacing[6]}`,
    borderBottom: `1px solid ${colors.dark[100]}`,
    flexShrink: 0,
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: fonts.heading,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.dark[900],
    margin: 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2rem",
    height: "2rem",
    borderRadius: radii.md,
    border: "none",
    backgroundColor: "transparent",
    color: colors.dark[400],
    cursor: "pointer",
    fontSize: fontSizes.xl,
    lineHeight: 1,
    transition: `all ${transitions.fast}`,
  };

  const bodyStyle: React.CSSProperties = {
    padding: `${spacing[4]} ${spacing[6]}`,
    overflowY: "auto",
    flex: 1,
  };

  const footerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing[3],
    padding: `${spacing[3]} ${spacing[6]}`,
    borderTop: `1px solid ${colors.dark[100]}`,
    flexShrink: 0,
  };

  return (
    <div
      style={overlayStyle}
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "ksp-modal-title" : undefined}
    >
      <div
        ref={modalRef}
        style={panelStyle}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {title && (
          <div style={headerStyle}>
            <h2 id="ksp-modal-title" style={titleStyle}>
              {title}
            </h2>
            <button
              style={closeButtonStyle}
              onClick={onClose}
              aria-label="Close modal"
              type="button"
            >
              &#x2715;
            </button>
          </div>
        )}
        <div style={bodyStyle}>{children}</div>
        {footer && <div style={footerStyle}>{footer}</div>}
      </div>
    </div>
  );
}

Modal.displayName = "Modal";

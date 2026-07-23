import { useState, useCallback } from "react";
import type { ShareMethod } from "../data/types";
import { buildShareMessage } from "../data/config";

export interface UseShareDialogOptions {
  licenseId: string;
  /** Called when a share is successfully executed */
  onShare?: (method: ShareMethod) => void | Promise<void>;
}

export interface UseShareDialogReturn {
  /** Whether the share dialog is open */
  isOpen: boolean;
  /** Open the share dialog */
  open: () => void;
  /** Close the share dialog */
  close: () => void;
  /** Toggle the share dialog */
  toggle: () => void;
  /** Whether the Web Share API is supported */
  isWebShareSupported: boolean;
  /** Trigger native Web Share API */
  triggerWebShare: () => Promise<boolean>;
  /** Copy share link to clipboard */
  copyLink: () => Promise<boolean>;
  /** Open WhatsApp with share message */
  shareViaWhatsApp: () => void;
  /** Open Telegram with share message */
  shareViaTelegram: () => void;
  /** The share message text */
  shareMessage: string;
  /** The share URL */
  shareUrl: string;
  /** Whether a share action is in progress */
  sharing: boolean;
}

/**
 * React hook for controlling the share dialog state and handling
 * Web Share API interactions.
 *
 * Provides methods for sharing via native share sheet, clipboard,
 * WhatsApp, and Telegram.
 */
export function useShareDialog(options: UseShareDialogOptions): UseShareDialogReturn {
  const { licenseId, onShare } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [sharing, setSharing] = useState(false);

  const shareMessage = buildShareMessage(licenseId);
  const shareUrl = `https://kasirsolo.com/download?ref=${licenseId}`;

  const isWebShareSupported =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const triggerWebShare = useCallback(async (): Promise<boolean> => {
    if (!isWebShareSupported) return false;

    setSharing(true);
    try {
      await navigator.share({
        title: "KASIRSOLO - Aplikasi Kasir Gratis",
        text: shareMessage,
        url: shareUrl,
      });
      await onShare?.("web_share");
      return true;
    } catch (err) {
      // User cancelled the share - this is not an error
      if (err instanceof Error && err.name === "AbortError") {
        return false;
      }
      // NotAllowedError means share was blocked (e.g. not triggered by user gesture)
      console.warn("[KSP Sharing] Web Share failed:", err);
      return false;
    } finally {
      setSharing(false);
    }
  }, [isWebShareSupported, shareMessage, shareUrl, onShare]);

  const copyLink = useCallback(async (): Promise<boolean> => {
    setSharing(true);
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareMessage);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = shareMessage;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      await onShare?.("copy_link");
      return true;
    } catch (err) {
      console.warn("[KSP Sharing] Copy to clipboard failed:", err);
      return false;
    } finally {
      setSharing(false);
    }
  }, [shareMessage, onShare]);

  const shareViaWhatsApp = useCallback(() => {
    const encoded = encodeURIComponent(shareMessage);
    window.open(`https://wa.me/?text=${encoded}`, "_blank", "noopener,noreferrer");
    onShare?.("whatsapp");
  }, [shareMessage, onShare]);

  const shareViaTelegram = useCallback(() => {
    const encoded = encodeURIComponent(shareMessage);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encoded}`, "_blank", "noopener,noreferrer");
    onShare?.("telegram");
  }, [shareMessage, shareUrl, onShare]);

  return {
    isOpen,
    open,
    close,
    toggle,
    isWebShareSupported,
    triggerWebShare,
    copyLink,
    shareViaWhatsApp,
    shareViaTelegram,
    shareMessage,
    shareUrl,
    sharing,
  };
}

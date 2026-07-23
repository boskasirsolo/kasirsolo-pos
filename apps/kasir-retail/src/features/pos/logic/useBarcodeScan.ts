"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseBarcodeScanOptions {
  onScan: (barcode: string) => void;
  minLength?: number;
  maxDelay?: number;
  enabled?: boolean;
}

/**
 * Hook to capture barcode scanner input (keyboard wedge mode).
 * Barcode scanners typically type characters rapidly followed by Enter.
 */
export function useBarcodeScan({
  onScan,
  minLength = 4,
  maxDelay = 80,
  enabled = true,
}: UseBarcodeScanOptions) {
  const buffer = useRef("");
  const timer = useRef<NodeJS.Timeout | null>(null);

  const resetBuffer = useCallback(() => {
    buffer.current = "";
  }, []);

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "Enter") {
        if (buffer.current.length >= minLength) {
          onScan(buffer.current);
        }
        resetBuffer();
        return;
      }

      if (e.key.length === 1) {
        buffer.current += e.key;

        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(resetBuffer, maxDelay);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [enabled, minLength, maxDelay, onScan, resetBuffer]);

  return { resetBuffer };
}

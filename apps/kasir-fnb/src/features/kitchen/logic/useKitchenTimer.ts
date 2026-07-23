"use client";

import { useState, useEffect, useRef } from "react";

export function useKitchenTimer(createdAt: string) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    function update() {
      const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
      setElapsed(Math.max(0, diff));
    }
    update();
    intervalRef.current = setInterval(update, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [createdAt]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const formatted = `${minutes}:${String(seconds).padStart(2, "0")}`;
  const isOverdue = minutes >= 15;
  const isWarning = minutes >= 10;

  return { elapsed, formatted, isOverdue, isWarning };
}

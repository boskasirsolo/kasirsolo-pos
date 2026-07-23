"use client";

import { useState, useEffect, useCallback } from "react";
import { get, put, openDatabase } from "@/lib/db";
import { DEFAULT_POS_SETTINGS } from "@/lib/db";
import type { PosSettings } from "@/lib/db";

export function useSettings() {
  const [settings, setSettings] = useState<PosSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await openDatabase();
      const existing = await get("settings", "settings");
      if (existing) {
        setSettings(existing as PosSettings);
      } else {
        // Initialize with defaults
        await put("settings", DEFAULT_POS_SETTINGS);
        setSettings(DEFAULT_POS_SETTINGS);
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      setSettings(DEFAULT_POS_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateSettings = useCallback(async (updates: Partial<PosSettings>) => {
    setSaving(true);
    try {
      const current = settings ?? DEFAULT_POS_SETTINGS;
      const updated: PosSettings = {
        ...current,
        ...updates,
        id: "settings",
        updated_at: new Date().toISOString(),
      };

      await put("settings", updated);
      setSettings(updated);
    } finally {
      setSaving(false);
    }
  }, [settings]);

  return {
    settings,
    loading,
    saving,
    load,
    updateSettings,
  };
}

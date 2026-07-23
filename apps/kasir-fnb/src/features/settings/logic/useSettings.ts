"use client";

import { useState, useEffect, useCallback } from "react";
import { getSettings, saveSettings } from "../data/queries";
import type { FnbSettings } from "@/lib/db";
import { DEFAULT_FNB_SETTINGS } from "@/lib/db";

export function useSettings() {
  const [settings, setSettings] = useState<FnbSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
    } catch {
      setSettings(DEFAULT_FNB_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateSettings = useCallback(async (updates: Partial<FnbSettings>) => {
    setSaving(true);
    try {
      const updated = await saveSettings(updates);
      setSettings(updated);
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    settings,
    loading,
    saving,
    load,
    updateSettings,
  };
}

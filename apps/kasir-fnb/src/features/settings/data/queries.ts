"use client";

import { openDatabase, get, put } from "@/lib/db";
import type { FnbSettings } from "@/lib/db";
import { DEFAULT_FNB_SETTINGS } from "@/lib/db";

export async function getSettings(): Promise<FnbSettings> {
  await openDatabase();
  const settings = await get<FnbSettings>("fnb_settings", "settings");
  return settings ?? DEFAULT_FNB_SETTINGS;
}

export async function saveSettings(updates: Partial<FnbSettings>): Promise<FnbSettings> {
  await openDatabase();
  const current = await getSettings();
  const updated: FnbSettings = {
    ...current,
    ...updates,
    id: "settings",
    updated_at: new Date().toISOString(),
  };
  await put("fnb_settings", updated);
  return updated;
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import {
  getBusinessSettings,
  saveBusinessSettings,
  getBankSettings,
  saveBankSettings,
  getTrialConfig,
  saveTrialConfig,
  getSecuritySettings,
  saveSecuritySettings,
  getWATemplates,
  saveWATemplates,
} from "../data/queries";
import type {
  SettingsTab,
  BusinessSettings,
  BankSettings,
  TrialConfig,
  SecuritySettings,
  WATemplate,
} from "../data/types";

export function useSettings() {
  const [tab, setTab] = useState<SettingsTab>("business");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [business, setBusiness] = useState<BusinessSettings | null>(null);
  const [bank, setBank] = useState<BankSettings | null>(null);
  const [trial, setTrial] = useState<TrialConfig | null>(null);
  const [security, setSecurity] = useState<SecuritySettings | null>(null);
  const [waTemplates, setWATemplates] = useState<WATemplate[]>([]);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowser();
      const [b, bk, t, s, w] = await Promise.all([
        getBusinessSettings(supabase),
        getBankSettings(supabase),
        getTrialConfig(supabase),
        getSecuritySettings(supabase),
        getWATemplates(supabase),
      ]);
      setBusiness(b);
      setBank(bk);
      setTrial(t);
      setSecurity(s);
      setWATemplates(w);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat pengaturan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const supabase = getSupabaseBrowser();
      switch (tab) {
        case "business":
          if (business) await saveBusinessSettings(supabase, business);
          break;
        case "bank":
          if (bank) await saveBankSettings(supabase, bank);
          break;
        case "trial":
          if (trial) await saveTrialConfig(supabase, trial);
          break;
        case "security":
          if (security) await saveSecuritySettings(supabase, security);
          break;
        case "whatsapp":
          await saveWATemplates(supabase, waTemplates);
          break;
      }
      setSuccess("Pengaturan berhasil disimpan");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  }, [tab, business, bank, trial, security, waTemplates]);

  return {
    tab,
    setTab,
    loading,
    saving,
    error,
    success,
    business,
    setBusiness,
    bank,
    setBank,
    trial,
    setTrial,
    security,
    setSecurity,
    waTemplates,
    setWATemplates,
    save,
    refresh: fetchSettings,
  };
}

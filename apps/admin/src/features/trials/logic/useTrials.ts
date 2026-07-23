"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { getTrialStats, getTrialClients, extendTrial, lockClient } from "../data/queries";
import type { TrialClient, TrialStats, TrialTab } from "../data/types";

export function useTrials() {
  const [tab, setTab] = useState<TrialTab>("active");
  const [stats, setStats] = useState<TrialStats>({ active: 0, expiring: 0, expired: 0, extended: 0, locked: 0 });
  const [clients, setClients] = useState<TrialClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowser();
      const [statsData, clientsData] = await Promise.all([
        getTrialStats(supabase),
        getTrialClients(supabase, tab),
      ]);
      setStats(statsData);
      setClients(clientsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data trial");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExtend = useCallback(async (clientId: string, days?: number) => {
    try {
      const supabase = getSupabaseBrowser();
      await extendTrial(supabase, clientId, days);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal perpanjang trial");
    }
  }, [fetchData]);

  const handleLock = useCallback(async (clientId: string) => {
    try {
      const supabase = getSupabaseBrowser();
      await lockClient(supabase, clientId);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunci klien");
    }
  }, [fetchData]);

  return {
    tab,
    setTab,
    stats,
    clients,
    loading,
    error,
    refresh: fetchData,
    extend: handleExtend,
    lock: handleLock,
  };
}

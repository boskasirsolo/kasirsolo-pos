"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { getLicenses, revokeLicense } from "../data/queries";
import type { LicenseFilter, LicenseWithClient } from "../data/types";

export function useLicenses() {
  const [licenses, setLicenses] = useState<LicenseWithClient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<LicenseFilter>({
    search: "",
    status: "all",
    planType: "all",
    page: 1,
    perPage: 15,
  });

  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowser();
      const result = await getLicenses(supabase, filter);
      setLicenses(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat lisensi");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  const handleRevoke = useCallback(async (id: string) => {
    try {
      const supabase = getSupabaseBrowser();
      await revokeLicense(supabase, id);
      await fetchLicenses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mencabut lisensi");
    }
  }, [fetchLicenses]);

  return {
    licenses,
    total,
    loading,
    error,
    filter,
    setFilter,
    refresh: fetchLicenses,
    revoke: handleRevoke,
  };
}

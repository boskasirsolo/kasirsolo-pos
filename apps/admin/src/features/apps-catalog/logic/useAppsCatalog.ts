"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { getApps, toggleAppStatus } from "../data/queries";
import type { AppWithStats } from "../data/types";

export function useAppsCatalog() {
  const [apps, setApps] = useState<AppWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApps = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowser();
      const result = await getApps(supabase);
      setApps(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat katalog");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const handleToggle = useCallback(async (id: string, isActive: boolean) => {
    try {
      const supabase = getSupabaseBrowser();
      await toggleAppStatus(supabase, id, isActive);
      await fetchApps();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal update status");
    }
  }, [fetchApps]);

  return { apps, loading, error, refresh: fetchApps, toggleStatus: handleToggle };
}

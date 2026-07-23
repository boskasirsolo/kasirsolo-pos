"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { getDevices, deactivateDevice, removeDevice } from "../data/queries";
import type { DeviceFilter, DeviceWithRelations } from "../data/types";

export function useDevices() {
  const [devices, setDevices] = useState<DeviceWithRelations[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<DeviceFilter>({
    search: "",
    activeOnly: false,
    page: 1,
    perPage: 15,
  });

  const fetchDevices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowser();
      const result = await getDevices(supabase, filter);
      setDevices(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat perangkat");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleDeactivate = useCallback(async (id: string) => {
    try {
      const supabase = getSupabaseBrowser();
      await deactivateDevice(supabase, id);
      await fetchDevices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menonaktifkan perangkat");
    }
  }, [fetchDevices]);

  const handleRemove = useCallback(async (id: string) => {
    try {
      const supabase = getSupabaseBrowser();
      await removeDevice(supabase, id);
      await fetchDevices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus perangkat");
    }
  }, [fetchDevices]);

  return {
    devices,
    total,
    loading,
    error,
    filter,
    setFilter,
    refresh: fetchDevices,
    deactivate: handleDeactivate,
    remove: handleRemove,
  };
}

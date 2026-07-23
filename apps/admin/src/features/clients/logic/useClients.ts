"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { getClients, deleteClient } from "../data/queries";
import type { ClientFilter, ClientListResponse, ClientWithRelations } from "../data/types";

export function useClients(filter: ClientFilter) {
  const [response, setResponse] = useState<ClientListResponse>({
    data: [],
    total: 0,
    page: 1,
    perPage: 15,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<ClientWithRelations | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowser();
      const result = await getClients(supabase, filter);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data klien");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const removeClient = useCallback(async (id: string) => {
    try {
      const supabase = getSupabaseBrowser();
      await deleteClient(supabase, id);
      await fetchClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus klien");
    }
  }, [fetchClients]);

  return {
    clients: response.data,
    total: response.total,
    totalPages: response.totalPages,
    loading,
    error,
    selectedClient,
    setSelectedClient,
    refresh: fetchClients,
    removeClient,
  };
}

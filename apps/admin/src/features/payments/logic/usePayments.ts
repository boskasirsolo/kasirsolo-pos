"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { getPayments, updatePaymentStatus } from "../data/queries";
import type { PaymentFilter, PaymentWithClient, PaymentStatus } from "../data/types";

export function usePayments() {
  const [payments, setPayments] = useState<PaymentWithClient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PaymentFilter>({
    search: "",
    status: "all",
    page: 1,
    perPage: 15,
  });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowser();
      const result = await getPayments(supabase, filter);
      setPayments(result.data);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat pembayaran");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const changeStatus = useCallback(async (id: string, status: PaymentStatus) => {
    try {
      const supabase = getSupabaseBrowser();
      await updatePaymentStatus(supabase, id, status);
      await fetchPayments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal update status");
    }
  }, [fetchPayments]);

  return {
    payments,
    total,
    loading,
    error,
    filter,
    setFilter,
    refresh: fetchPayments,
    changeStatus,
  };
}

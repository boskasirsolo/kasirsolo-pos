"use client";

import { useState, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { generateActivationKey } from "../data/queries";

interface GenerateKeyParams {
  clientId: string;
  appId: string;
  planType: string;
  maxDevices: number;
  amountPaid: number;
  expiresAt: string | null;
}

export function useGenerateKey() {
  const [loading, setLoading] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (params: GenerateKeyParams) => {
    setLoading(true);
    setError(null);
    setGeneratedKey(null);

    try {
      const supabase = getSupabaseBrowser();
      const result = await generateActivationKey(supabase, params);
      setGeneratedKey(result.license_key);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal generate key");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setGeneratedKey(null);
    setError(null);
  }, []);

  return { loading, generatedKey, error, generate, reset };
}

"use client";

import { useState, useCallback } from "react";
import { getSupabaseBrowser } from "@/lib/supabase";
import { clientFormSchema, type ClientFormData } from "../data/schema";
import { createClient, updateClient } from "../data/queries";
import type { KspClient } from "@kasirsolo/db/types";

export function useClientForm(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = useCallback((data: ClientFormData) => {
    const result = clientFormSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field) fieldErrors[String(field)] = issue.message;
      }
      setErrors(fieldErrors);
      return null;
    }
    setErrors({});
    return result.data;
  }, []);

  const submitCreate = useCallback(
    async (formData: ClientFormData) => {
      const validated = validate(formData);
      if (!validated) return null;

      setLoading(true);
      setServerError(null);

      try {
        const supabase = getSupabaseBrowser();
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const code = Array.from({ length: 6 }, () =>
          chars[Math.floor(Math.random() * chars.length)]
        ).join("");

        const result = await createClient(supabase, {
          name: validated.name,
          phone: validated.phone,
          email: validated.email || null,
          app_code: `KSP-${code}`,
          status: "trial",
          trial_started: new Date().toISOString(),
          trial_expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          trial_extended: false,
          source: validated.source || "admin",
          notes: validated.notes || null,
          activation_key: null,
        });

        onSuccess?.();
        return result;
      } catch (err) {
        setServerError(err instanceof Error ? err.message : "Gagal membuat klien");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [validate, onSuccess]
  );

  const submitUpdate = useCallback(
    async (id: string, formData: ClientFormData): Promise<KspClient | null> => {
      const validated = validate(formData);
      if (!validated) return null;

      setLoading(true);
      setServerError(null);

      try {
        const supabase = getSupabaseBrowser();
        const result = await updateClient(supabase, id, {
          name: validated.name,
          phone: validated.phone,
          email: validated.email || null,
          source: validated.source || undefined,
          notes: validated.notes || null,
          status: validated.status,
        });

        onSuccess?.();
        return result;
      } catch (err) {
        setServerError(err instanceof Error ? err.message : "Gagal memperbarui klien");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [validate, onSuccess]
  );

  return {
    loading,
    errors,
    serverError,
    submitCreate,
    submitUpdate,
    clearErrors: () => {
      setErrors({});
      setServerError(null);
    },
  };
}

'use client';

import { useState, useCallback } from 'react';
import { trialSchema, type TrialFormData } from '../data/schema';

interface FieldErrors {
  nama?: string;
  alamat?: string;
  wa?: string;
  app?: string;
  form?: string;
}

export function useTrialForm() {
  const [formData, setFormData] = useState<TrialFormData>({
    nama: '',
    alamat: '',
    wa: '',
    app: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const updateField = useCallback(
    (field: keyof TrialFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear field error on change
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  const validate = useCallback((): boolean => {
    const result = trialSchema.safeParse(formData);
    if (result.success) {
      setErrors({});
      return true;
    }

    const fieldErrors: FieldErrors = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof FieldErrors;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    });
    setErrors(fieldErrors);
    return false;
  }, [formData]);

  const submit = useCallback(async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const cleanedData = {
        ...formData,
        wa: formData.wa.replace(/\D/g, ''),
      };

      const res = await fetch('/api/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrors(data.errors || { form: 'Terjadi kesalahan. Coba lagi.' });
        return;
      }

      setIsSuccess(true);
    } catch {
      setErrors({ form: 'Gagal menghubungi server. Coba lagi.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validate]);

  return {
    formData,
    errors,
    isSubmitting,
    isSuccess,
    updateField,
    submit,
  };
}

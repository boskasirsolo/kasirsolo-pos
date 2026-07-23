"use client";

import { useState, useCallback } from "react";
import { menuItemSchema, type MenuItemFormData } from "../data/schema";

export function useMenuForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((data: Partial<MenuItemFormData>): boolean => {
    const result = menuItemSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  }, []);

  const clearErrors = useCallback(() => setErrors({}), []);

  return { errors, validate, clearErrors };
}

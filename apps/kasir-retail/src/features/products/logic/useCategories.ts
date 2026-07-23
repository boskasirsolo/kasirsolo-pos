"use client";

import { useState, useEffect, useCallback } from "react";
import { getAll, put, del, openDatabase } from "@/lib/db";
import type { PosCategory } from "@/lib/db";

export function useCategories() {
  const [categories, setCategories] = useState<PosCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await openDatabase();
      const data = (await getAll("categories")) as PosCategory[];
      setCategories(data.filter((c) => c.is_active).sort((a, b) => a.sort_order - b.sort_order));
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addCategory = useCallback(async (name: string, color: string) => {
    const category: PosCategory = {
      id: crypto.randomUUID(),
      name,
      color,
      icon: null,
      sort_order: categories.length,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sync_status: "pending",
    };

    await put("categories", category);
    setCategories((prev) => [...prev, category]);
  }, [categories.length]);

  const editCategory = useCallback(async (id: string, name: string, color: string) => {
    const existing = categories.find((c) => c.id === id);
    if (!existing) return;

    const updated: PosCategory = {
      ...existing,
      name,
      color,
      updated_at: new Date().toISOString(),
      sync_status: "pending",
    };

    await put("categories", updated);
    setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }, [categories]);

  const deleteCategory = useCallback(async (id: string) => {
    await del("categories", id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return {
    categories,
    loading,
    load,
    addCategory,
    editCategory,
    deleteCategory,
  };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { getMenuItems, getMenuCategories, getMenuModifiers, saveMenuItem, deleteMenuItem, saveMenuCategory, deleteMenuCategory } from "../data/queries";
import type { MenuItem, MenuCategory, MenuModifier } from "../data/types";

export function useMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [modifiers, setModifiers] = useState<MenuModifier[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [i, c, m] = await Promise.all([
        getMenuItems(),
        getMenuCategories(),
        getMenuModifiers(),
      ]);
      setItems(i);
      setCategories(c);
      setModifiers(m);
    } catch {
      // Offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addItem = useCallback(async (item: MenuItem) => {
    await saveMenuItem(item);
    await load();
  }, [load]);

  const removeItem = useCallback(async (id: string) => {
    await deleteMenuItem(id);
    await load();
  }, [load]);

  const addCategory = useCallback(async (cat: MenuCategory) => {
    await saveMenuCategory(cat);
    await load();
  }, [load]);

  const removeCategory = useCallback(async (id: string) => {
    await deleteMenuCategory(id);
    await load();
  }, [load]);

  return {
    items,
    categories,
    modifiers,
    loading,
    load,
    addItem,
    removeItem,
    addCategory,
    removeCategory,
  };
}

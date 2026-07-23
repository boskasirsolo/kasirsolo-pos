"use client";

import { openDatabase, getAll, put, del } from "@/lib/db";
import type { MenuItem, MenuCategory, MenuModifier } from "./types";

export async function getMenuItems(): Promise<MenuItem[]> {
  await openDatabase();
  const items = await getAll<MenuItem>("menu_items");
  return items.sort((a, b) => a.sort_order - b.sort_order);
}

export async function saveMenuItem(item: MenuItem): Promise<void> {
  await openDatabase();
  await put("menu_items", item);
}

export async function deleteMenuItem(id: string): Promise<void> {
  await openDatabase();
  await del("menu_items", id);
}

export async function getMenuCategories(): Promise<MenuCategory[]> {
  await openDatabase();
  const cats = await getAll<MenuCategory>("menu_categories");
  return cats.sort((a, b) => a.sort_order - b.sort_order);
}

export async function saveMenuCategory(category: MenuCategory): Promise<void> {
  await openDatabase();
  await put("menu_categories", category);
}

export async function deleteMenuCategory(id: string): Promise<void> {
  await openDatabase();
  await del("menu_categories", id);
}

export async function getMenuModifiers(): Promise<MenuModifier[]> {
  await openDatabase();
  return getAll<MenuModifier>("menu_modifiers");
}

export async function saveMenuModifier(modifier: MenuModifier): Promise<void> {
  await openDatabase();
  await put("menu_modifiers", modifier);
}

export async function deleteMenuModifier(id: string): Promise<void> {
  await openDatabase();
  await del("menu_modifiers", id);
}

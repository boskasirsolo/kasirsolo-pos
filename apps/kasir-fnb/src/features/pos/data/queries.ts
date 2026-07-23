"use client";

import { openDatabase, getAll, getAllByIndex, put, get } from "@/lib/db";
import type { FnbSettings } from "@/lib/db";

export interface FnbMenuItem {
  id: string;
  name: string;
  price: number;
  category_id: string;
  image: string | null;
  modifiers: string[];
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FnbMenuCategory {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  color: string;
}

export async function getMenuItems(): Promise<FnbMenuItem[]> {
  await openDatabase();
  return getAll<FnbMenuItem>("menu_items");
}

export async function getMenuItemsByCategory(categoryId: string): Promise<FnbMenuItem[]> {
  await openDatabase();
  return getAllByIndex<FnbMenuItem>("menu_items", "category_id", categoryId);
}

export async function getMenuCategories(): Promise<FnbMenuCategory[]> {
  await openDatabase();
  return getAll<FnbMenuCategory>("menu_categories");
}

export async function getSettings(): Promise<FnbSettings> {
  await openDatabase();
  const settings = await get<FnbSettings>("fnb_settings", "settings");
  if (!settings) {
    const { DEFAULT_FNB_SETTINGS } = await import("@/lib/db");
    return DEFAULT_FNB_SETTINGS;
  }
  return settings;
}

export async function saveTransaction(data: Record<string, unknown>): Promise<void> {
  await openDatabase();
  await put("fnb_transactions", data);
}

export async function saveKitchenOrder(data: Record<string, unknown>): Promise<void> {
  await openDatabase();
  await put("kitchen_orders", data);
}

export async function saveReceipt(data: Record<string, unknown>): Promise<void> {
  await openDatabase();
  await put("fnb_receipts", data);
}

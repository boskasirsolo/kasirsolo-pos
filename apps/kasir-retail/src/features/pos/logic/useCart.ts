"use client";

import { useState, useCallback } from "react";
import type { CartState, CartItem } from "../data/types";
import { EMPTY_CART } from "../data/types";
import {
  addToCart,
  removeFromCart,
  updateQty,
  applyItemDiscount,
  calculateTotals,
} from "../data/cart-utils";
import type { PosProduct } from "@/lib/db";
import { get, put } from "@/lib/db";
import type { PosSettings } from "@/lib/db";

const HELD_CART_KEY = "kasirsolo_held_cart";

export function useCart() {
  const [state, setState] = useState<CartState>(EMPTY_CART);

  const recalculate = useCallback((items: CartItem[], overrides?: Partial<CartState>) => {
    const current = { ...state, ...overrides };
    const totals = calculateTotals(items, {
      discountType: current.discountType,
      discountValue: current.discountValue,
      taxEnabled: current.taxEnabled,
      taxPercentage: current.taxPercentage,
    });

    setState((prev) => ({
      ...prev,
      ...overrides,
      items,
      ...totals,
    }));
  }, [state]);

  const addItem = useCallback((product: PosProduct, qty: number = 1) => {
    setState((prev) => {
      const newItems = addToCart(prev.items, product, qty);
      const totals = calculateTotals(newItems, {
        discountType: prev.discountType,
        discountValue: prev.discountValue,
        taxEnabled: prev.taxEnabled,
        taxPercentage: prev.taxPercentage,
      });
      return { ...prev, items: newItems, ...totals };
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setState((prev) => {
      const newItems = removeFromCart(prev.items, productId);
      const totals = calculateTotals(newItems, {
        discountType: prev.discountType,
        discountValue: prev.discountValue,
        taxEnabled: prev.taxEnabled,
        taxPercentage: prev.taxPercentage,
      });
      return { ...prev, items: newItems, ...totals };
    });
  }, []);

  const updateItemQty = useCallback((productId: string, qty: number) => {
    setState((prev) => {
      const newItems = updateQty(prev.items, productId, qty);
      const totals = calculateTotals(newItems, {
        discountType: prev.discountType,
        discountValue: prev.discountValue,
        taxEnabled: prev.taxEnabled,
        taxPercentage: prev.taxPercentage,
      });
      return { ...prev, items: newItems, ...totals };
    });
  }, []);

  const setDiscount = useCallback((type: "fixed" | "percentage" | null, value: number) => {
    setState((prev) => {
      const totals = calculateTotals(prev.items, {
        discountType: type,
        discountValue: value,
        taxEnabled: prev.taxEnabled,
        taxPercentage: prev.taxPercentage,
      });
      return {
        ...prev,
        discountType: type,
        discountValue: value,
        ...totals,
      };
    });
  }, []);

  const toggleDiscount = useCallback(() => {
    setState((prev) => {
      if (prev.discountType) {
        // Remove discount
        const totals = calculateTotals(prev.items, {
          discountType: null,
          discountValue: 0,
          taxEnabled: prev.taxEnabled,
          taxPercentage: prev.taxPercentage,
        });
        return { ...prev, discountType: null, discountValue: 0, ...totals };
      }
      // For now, apply a simple prompt approach
      const valueStr = prompt("Masukkan diskon (contoh: 10% atau 5000):");
      if (!valueStr) return prev;

      let type: "fixed" | "percentage" = "fixed";
      let value = 0;

      if (valueStr.includes("%")) {
        type = "percentage";
        value = parseFloat(valueStr.replace("%", "")) || 0;
      } else {
        value = parseInt(valueStr.replace(/\D/g, ""), 10) || 0;
      }

      const totals = calculateTotals(prev.items, {
        discountType: type,
        discountValue: value,
        taxEnabled: prev.taxEnabled,
        taxPercentage: prev.taxPercentage,
      });

      return { ...prev, discountType: type, discountValue: value, ...totals };
    });
  }, []);

  const setCustomer = useCallback((name: string | null, phone: string | null) => {
    setState((prev) => ({ ...prev, customerName: name, customerPhone: phone }));
  }, []);

  const setNotes = useCallback((notes: string | null) => {
    setState((prev) => ({ ...prev, notes }));
  }, []);

  const clearCart = useCallback(() => {
    setState(EMPTY_CART);
  }, []);

  const holdCart = useCallback(() => {
    if (state.items.length === 0) return;
    localStorage.setItem(HELD_CART_KEY, JSON.stringify(state));
    setState(EMPTY_CART);
  }, [state]);

  const recallHeld = useCallback(() => {
    const held = localStorage.getItem(HELD_CART_KEY);
    if (held) {
      try {
        const parsed = JSON.parse(held) as CartState;
        setState(parsed);
        localStorage.removeItem(HELD_CART_KEY);
      } catch {
        // Invalid data
      }
    }
  }, []);

  const hasHeldCart = useCallback((): boolean => {
    return !!localStorage.getItem(HELD_CART_KEY);
  }, []);

  const initTax = useCallback(async () => {
    try {
      const settings = await get("settings", "settings") as PosSettings | undefined;
      if (settings) {
        setState((prev) => ({
          ...prev,
          taxEnabled: settings.tax_enabled,
          taxPercentage: settings.tax_percentage,
        }));
      }
    } catch {
      // Default tax settings
    }
  }, []);

  return {
    state,
    addItem,
    removeItem,
    updateItemQty,
    setDiscount,
    toggleDiscount,
    setCustomer,
    setNotes,
    clearCart,
    holdCart,
    recallHeld,
    hasHeldCart,
    initTax,
  };
}

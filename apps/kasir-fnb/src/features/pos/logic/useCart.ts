"use client";

import { useState, useCallback, useEffect } from "react";
import type { FnbCartState, FnbCartItem, OrderType } from "../data/types";
import { EMPTY_FNB_CART } from "../data/types";
import {
  addToCart,
  removeFromCart,
  updateQty,
  applyItemDiscount,
  calculateFnbTotals,
  type MenuItemForCart,
} from "../data/cart-utils";
import { getSettings } from "../data/queries";

const HELD_CART_KEY = "kasirsolo_fnb_held_cart";

export function useCart() {
  const [state, setState] = useState<FnbCartState>(EMPTY_FNB_CART);

  const addItem = useCallback(
    (menuItem: MenuItemForCart, qty: number = 1, modifiers: FnbCartItem["modifiers"] = [], notes: string | null = null) => {
      setState((prev) => {
        const newItems = addToCart(prev.items, menuItem, qty, modifiers, notes);
        const totals = calculateFnbTotals(newItems, {
          discountType: prev.discountType,
          discountValue: prev.discountValue,
          taxEnabled: prev.taxEnabled,
          taxPercentage: prev.taxPercentage,
          serviceChargeEnabled: prev.serviceChargeEnabled,
          serviceChargePercentage: prev.serviceChargePercentage,
        });
        return { ...prev, items: newItems, ...totals };
      });
    },
    []
  );

  const removeItem = useCallback((index: number) => {
    setState((prev) => {
      const newItems = removeFromCart(prev.items, index);
      const totals = calculateFnbTotals(newItems, {
        discountType: prev.discountType,
        discountValue: prev.discountValue,
        taxEnabled: prev.taxEnabled,
        taxPercentage: prev.taxPercentage,
        serviceChargeEnabled: prev.serviceChargeEnabled,
        serviceChargePercentage: prev.serviceChargePercentage,
      });
      return { ...prev, items: newItems, ...totals };
    });
  }, []);

  const updateItemQty = useCallback((index: number, qty: number) => {
    setState((prev) => {
      const newItems = updateQty(prev.items, index, qty);
      const totals = calculateFnbTotals(newItems, {
        discountType: prev.discountType,
        discountValue: prev.discountValue,
        taxEnabled: prev.taxEnabled,
        taxPercentage: prev.taxPercentage,
        serviceChargeEnabled: prev.serviceChargeEnabled,
        serviceChargePercentage: prev.serviceChargePercentage,
      });
      return { ...prev, items: newItems, ...totals };
    });
  }, []);

  const setOrderType = useCallback((orderType: OrderType) => {
    setState((prev) => ({
      ...prev,
      orderType,
      tableId: orderType !== "dine_in" ? null : prev.tableId,
      tableNumber: orderType !== "dine_in" ? null : prev.tableNumber,
    }));
  }, []);

  const setTable = useCallback((tableId: string | null, tableNumber: number | null) => {
    setState((prev) => ({
      ...prev,
      tableId,
      tableNumber,
    }));
  }, []);

  const setDiscount = useCallback((type: "fixed" | "percentage" | null, value: number) => {
    setState((prev) => {
      const totals = calculateFnbTotals(prev.items, {
        discountType: type,
        discountValue: value,
        taxEnabled: prev.taxEnabled,
        taxPercentage: prev.taxPercentage,
        serviceChargeEnabled: prev.serviceChargeEnabled,
        serviceChargePercentage: prev.serviceChargePercentage,
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
        const totals = calculateFnbTotals(prev.items, {
          discountType: null,
          discountValue: 0,
          taxEnabled: prev.taxEnabled,
          taxPercentage: prev.taxPercentage,
          serviceChargeEnabled: prev.serviceChargeEnabled,
          serviceChargePercentage: prev.serviceChargePercentage,
        });
        return { ...prev, discountType: null, discountValue: 0, ...totals };
      }

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

      const totals = calculateFnbTotals(prev.items, {
        discountType: type,
        discountValue: value,
        taxEnabled: prev.taxEnabled,
        taxPercentage: prev.taxPercentage,
        serviceChargeEnabled: prev.serviceChargeEnabled,
        serviceChargePercentage: prev.serviceChargePercentage,
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
    setState(EMPTY_FNB_CART);
  }, []);

  const holdCart = useCallback(() => {
    if (state.items.length === 0) return;
    localStorage.setItem(HELD_CART_KEY, JSON.stringify(state));
    setState(EMPTY_FNB_CART);
  }, [state]);

  const recallHeld = useCallback(() => {
    const held = localStorage.getItem(HELD_CART_KEY);
    if (held) {
      try {
        const parsed = JSON.parse(held) as FnbCartState;
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

  const initSettings = useCallback(async () => {
    try {
      const settings = await getSettings();
      setState((prev) => ({
        ...prev,
        taxEnabled: settings.tax_enabled,
        taxPercentage: settings.tax_percentage,
        serviceChargeEnabled: settings.service_charge_enabled,
        serviceChargePercentage: settings.service_charge_percentage,
        orderType: settings.default_order_type,
      }));
    } catch {
      // Default settings
    }
  }, []);

  useEffect(() => {
    initSettings();
  }, [initSettings]);

  return {
    state,
    addItem,
    removeItem,
    updateItemQty,
    setOrderType,
    setTable,
    setDiscount,
    toggleDiscount,
    setCustomer,
    setNotes,
    clearCart,
    holdCart,
    recallHeld,
    hasHeldCart,
    initSettings,
  };
}

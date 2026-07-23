"use client";

import { useState, useCallback } from "react";
import type { FnbCartItem, SplitDetail, SplitBillMode, FnbPaymentMethod } from "../data/types";
import { splitBillEqual, splitBillByItem } from "../data/cart-utils";

export function useSplitBill() {
  const [mode, setMode] = useState<SplitBillMode | null>(null);
  const [splitCount, setSplitCount] = useState(2);
  const [splits, setSplits] = useState<SplitDetail[]>([]);
  const [assignments, setAssignments] = useState<Map<number, number>>(new Map());

  const initEqualSplit = useCallback((total: number, count: number) => {
    setSplitCount(count);
    setMode("equal");
    setSplits(splitBillEqual(total, count));
  }, []);

  const initItemSplit = useCallback((items: FnbCartItem[]) => {
    setMode("by_item");
    const defaultAssignments = new Map<number, number>();
    items.forEach((_, i) => defaultAssignments.set(i, 0));
    setAssignments(defaultAssignments);
    setSplits(splitBillByItem(items, defaultAssignments));
  }, []);

  const updateSplitCount = useCallback((total: number, count: number) => {
    setSplitCount(count);
    setSplits(splitBillEqual(total, count));
  }, []);

  const assignItemToGroup = useCallback((items: FnbCartItem[], itemIndex: number, groupIndex: number) => {
    setAssignments((prev) => {
      const next = new Map(prev);
      next.set(itemIndex, groupIndex);
      const newSplits = splitBillByItem(items, next);
      setSplits(newSplits);
      return next;
    });
  }, []);

  const markSplitPaid = useCallback((index: number, method: FnbPaymentMethod) => {
    setSplits((prev) =>
      prev.map((s, i) => (i === index ? { ...s, paid: true, method } : s))
    );
  }, []);

  const reset = useCallback(() => {
    setMode(null);
    setSplitCount(2);
    setSplits([]);
    setAssignments(new Map());
  }, []);

  const allPaid = splits.length > 0 && splits.every((s) => s.paid);

  return {
    mode,
    splitCount,
    splits,
    assignments,
    allPaid,
    setMode,
    initEqualSplit,
    initItemSplit,
    updateSplitCount,
    assignItemToGroup,
    markSplitPaid,
    reset,
  };
}

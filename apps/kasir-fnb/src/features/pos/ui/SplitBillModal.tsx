"use client";

import { useState } from "react";
import { Button } from "@kasirsolo/ui";
import { formatRupiah } from "@kasirsolo/utils";
import type { FnbCartItem, SplitBillMode, SplitDetail, FnbPaymentMethod } from "../data/types";
import { FNB_PAYMENT_METHODS } from "../data/types";

interface SplitBillModalProps {
  total: number;
  items: FnbCartItem[];
  onClose: () => void;
  onConfirm: (splits: SplitDetail[]) => void;
}

export function SplitBillModal({ total, items, onClose, onConfirm }: SplitBillModalProps) {
  const [mode, setMode] = useState<SplitBillMode>("equal");
  const [splitCount, setSplitCount] = useState(2);
  const [assignments, setAssignments] = useState<Map<number, number>>(new Map());

  const equalAmount = Math.ceil(total / splitCount);

  function handleEqualConfirm() {
    const splits: SplitDetail[] = Array.from({ length: splitCount }, (_, i) => ({
      label: `Bagian ${i + 1}`,
      items: [],
      amount: i === splitCount - 1 ? total - equalAmount * (splitCount - 1) : equalAmount,
      paid: false,
      method: "cash" as FnbPaymentMethod,
    }));
    onConfirm(splits);
  }

  function handleItemConfirm() {
    const groups = new Map<number, FnbCartItem[]>();
    items.forEach((item, index) => {
      const group = assignments.get(index) ?? 0;
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(item);
    });

    const splits: SplitDetail[] = Array.from(groups.entries()).map(([idx, groupItems]) => ({
      label: `Bagian ${idx + 1}`,
      items: groupItems,
      amount: groupItems.reduce((sum, item) => sum + item.total, 0),
      paid: false,
      method: "cash" as FnbPaymentMethod,
    }));
    onConfirm(splits);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />

      <div className="relative bg-white rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up">
        <div className="pt-3 pb-2">
          <div className="sheet-handle" />
        </div>

        <div className="flex items-center justify-between px-4 pb-3 border-b border-pos-border">
          <div>
            <h2 className="text-lg font-heading font-bold text-gray-900">Split Bill</h2>
            <p className="text-xs text-gray-500">Total: {formatRupiah(total)}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400" type="button">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode selector */}
        <div className="flex gap-2 px-4 py-3">
          <button
            onClick={() => setMode("equal")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all
              ${mode === "equal"
                ? "bg-brand-primary text-white border-brand-primary"
                : "bg-white text-gray-600 border-pos-border"}`}
            type="button"
          >
            Bagi Rata
          </button>
          <button
            onClick={() => setMode("by_item")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all
              ${mode === "by_item"
                ? "bg-brand-primary text-white border-brand-primary"
                : "bg-white text-gray-600 border-pos-border"}`}
            type="button"
          >
            Per Item
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {mode === "equal" ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">Jumlah Orang</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                    className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center
                      text-gray-700 active:bg-gray-200"
                    type="button"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold tabular-nums w-8 text-center">{splitCount}</span>
                  <button
                    onClick={() => setSplitCount(Math.min(20, splitCount + 1))}
                    className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center
                      text-brand-primary active:bg-brand-primary/20"
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Per orang</span>
                  <span className="text-xl font-bold text-brand-primary">{formatRupiah(equalAmount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Ketuk nomor bagian untuk mengubah pengelompokan item</p>
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">{formatRupiah(item.total)}</p>
                  </div>
                  <button
                    onClick={() => {
                      const current = assignments.get(index) ?? 0;
                      const next = (current + 1) % Math.max(2, splitCount);
                      setAssignments((prev) => new Map(prev).set(index, next));
                    }}
                    className="w-8 h-8 rounded-lg bg-brand-primary text-white text-sm font-bold
                      flex items-center justify-center active:scale-95"
                    type="button"
                  >
                    {(assignments.get(index) ?? 0) + 1}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="px-4 pt-3 pb-4 border-t border-pos-border"
          style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}
        >
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={mode === "equal" ? handleEqualConfirm : handleItemConfirm}
          >
            Konfirmasi Split Bill
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@kasirsolo/ui";
import { formatRupiah } from "@kasirsolo/utils";
import { NumberPad } from "./NumberPad";
import { PAYMENT_METHODS, QUICK_AMOUNTS } from "../data/types";
import type { PosPaymentMethod } from "@/lib/db";

interface PaymentModalProps {
  total: number;
  onClose: () => void;
  onComplete: (method: string, amountPaid: number, paymentRef: string | null) => Promise<void>;
  processing: boolean;
}

export function PaymentModal({ total, onClose, onComplete, processing }: PaymentModalProps) {
  const [method, setMethod] = useState<PosPaymentMethod>("cash");
  const [amountStr, setAmountStr] = useState("");
  const [paymentRef, setPaymentRef] = useState("");
  const [error, setError] = useState<string | null>(null);

  const amountPaid = parseInt(amountStr || "0", 10);
  const change = Math.max(0, amountPaid - total);
  const isCash = method === "cash";
  const canSubmit = isCash ? amountPaid >= total : true;

  function handleNumberPad(value: string) {
    if (value === "C") {
      setAmountStr("");
      return;
    }
    if (value === "DEL") {
      setAmountStr((prev) => prev.slice(0, -1));
      return;
    }
    // Prevent leading zeros
    if (amountStr === "" && value === "0") return;
    // Max 12 digits
    if (amountStr.length >= 12) return;
    setAmountStr((prev) => prev + value);
  }

  function handleQuickAmount(amount: number) {
    setAmountStr(String(amount));
  }

  function handleExact() {
    setAmountStr(String(total));
  }

  async function handleSubmit() {
    setError(null);

    if (isCash && amountPaid < total) {
      setError("Jumlah bayar kurang dari total");
      return;
    }

    try {
      await onComplete(method, isCash ? amountPaid : total, paymentRef || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pembayaran gagal");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-2xl max-h-[95vh] flex flex-col animate-slide-up">
        <div className="pt-3 pb-2">
          <div className="sheet-handle" />
        </div>

        {/* Header */}
        <div className="px-4 pb-3 border-b border-pos-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-gray-900">Pembayaran</h2>
            <button onClick={onClose} className="p-2 text-gray-400" type="button" aria-label="Tutup">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-2xl font-bold text-brand-primary mt-1">
            {formatRupiah(total)}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.value}
                  onClick={() => setMethod(pm.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all
                    ${method === pm.value
                      ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                      : "border-pos-border bg-white text-gray-600"}`}
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={pm.icon} />
                  </svg>
                  <span className="text-[10px] font-medium">{pm.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cash Amount Input */}
          {isCash && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                Jumlah Bayar
              </label>

              {/* Amount display */}
              <div className="bg-gray-50 rounded-xl p-4 mb-3 text-center">
                <p className="text-3xl font-bold text-gray-900 tabular-nums font-mono">
                  {amountStr ? formatRupiah(amountPaid, { prefix: true }) : formatRupiah(0)}
                </p>
                {amountPaid > 0 && amountPaid >= total && (
                  <p className="text-sm text-green-600 mt-1">
                    Kembalian: {formatRupiah(change)}
                  </p>
                )}
                {amountPaid > 0 && amountPaid < total && (
                  <p className="text-sm text-red-500 mt-1">
                    Kurang: {formatRupiah(total - amountPaid)}
                  </p>
                )}
              </div>

              {/* Quick amounts */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <button
                  onClick={handleExact}
                  className="py-2 rounded-lg bg-brand-primary/10 text-brand-primary text-sm font-medium
                    active:bg-brand-primary/20 transition-colors"
                  type="button"
                >
                  Uang Pas
                </button>
                {QUICK_AMOUNTS.slice(0, 5).map((amount) => (
                  <button
                    key={amount}
                    onClick={() => handleQuickAmount(amount)}
                    className="py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium
                      active:bg-gray-200 transition-colors"
                    type="button"
                  >
                    {formatRupiah(amount, { compact: true })}
                  </button>
                ))}
              </div>

              {/* Number pad */}
              <NumberPad onInput={handleNumberPad} />
            </div>
          )}

          {/* Non-cash payment ref */}
          {!isCash && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                Referensi (Opsional)
              </label>
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="No. referensi / ID transaksi"
                className="w-full px-4 py-3 bg-gray-50 border border-pos-border rounded-xl
                  text-base text-gray-900 placeholder:text-gray-400
                  focus:outline-none focus:border-brand-primary"
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="px-4 pt-3 pb-4 border-t border-pos-border"
          style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}
        >
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleSubmit}
            loading={processing}
            disabled={!canSubmit}
          >
            {isCash
              ? `Bayar ${formatRupiah(total)} - Kembalian ${formatRupiah(change)}`
              : `Konfirmasi ${formatRupiah(total)}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

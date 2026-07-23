"use client";

import { formatRupiah, formatDate } from "@kasirsolo/utils";
import { Button, Badge } from "@kasirsolo/ui";
import type { PosTransaction } from "@/lib/db";

interface TransactionDetailProps {
  transaction: PosTransaction;
  onVoid: () => Promise<void>;
  onPrintReceipt: () => void;
  onBack: () => void;
  voiding: boolean;
}

export function TransactionDetail({
  transaction,
  onVoid,
  onPrintReceipt,
  onBack,
  voiding,
}: TransactionDetailProps) {
  const tx = transaction;

  return (
    <div className="bg-pos-bg min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-pos-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 text-gray-600" type="button">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-sm font-heading font-bold text-gray-900">{tx.transaction_number}</h1>
            <p className="text-xs text-gray-500">{formatDate(tx.created_at, { time: true })}</p>
          </div>
          {tx.is_void && <Badge status="error">Void</Badge>}
        </div>
      </div>

      {/* Receipt-style content */}
      <div className="p-4 space-y-4">
        {/* Items */}
        <div className="bg-white rounded-xl border border-pos-border p-4 space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase">Item</h3>
          {tx.items.map((item, idx) => (
            <div key={idx} className="flex justify-between">
              <div>
                <p className="text-sm text-gray-900">{item.product_name}</p>
                <p className="text-xs text-gray-500">
                  {item.quantity} x {formatRupiah(item.unit_price)}
                  {item.discount > 0 && ` (-${formatRupiah(item.discount)})`}
                </p>
              </div>
              <p className="text-sm font-medium text-gray-900">{formatRupiah(item.total)}</p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="bg-white rounded-xl border border-pos-border p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatRupiah(tx.subtotal)}</span>
          </div>
          {tx.discount_amount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Diskon</span>
              <span>-{formatRupiah(tx.discount_amount)}</span>
            </div>
          )}
          {tx.tax_amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pajak ({tx.tax_percentage}%)</span>
              <span>{formatRupiah(tx.tax_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold border-t border-dashed border-gray-200 pt-2">
            <span>Total</span>
            <span className="text-brand-primary">{formatRupiah(tx.total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Bayar ({tx.payment_method.toUpperCase()})</span>
            <span>{formatRupiah(tx.amount_paid)}</span>
          </div>
          {tx.change > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Kembalian</span>
              <span>{formatRupiah(tx.change)}</span>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="bg-white rounded-xl border border-pos-border p-4 space-y-2">
          {tx.cashier_name && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Kasir</span>
              <span className="text-gray-700">{tx.cashier_name}</span>
            </div>
          )}
          {tx.customer_name && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Pelanggan</span>
              <span className="text-gray-700">{tx.customer_name}</span>
            </div>
          )}
          {tx.payment_ref && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Ref. Pembayaran</span>
              <span className="text-gray-700 font-mono">{tx.payment_ref}</span>
            </div>
          )}
          {tx.notes && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Catatan</span>
              <span className="text-gray-700">{tx.notes}</span>
            </div>
          )}
          {tx.is_void && tx.void_reason && (
            <div className="flex justify-between text-xs">
              <span className="text-red-500">Alasan Void</span>
              <span className="text-red-600">{tx.void_reason}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3"
          style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}
        >
          <Button variant="outline" fullWidth onClick={onPrintReceipt}>
            Cetak Struk
          </Button>
          {!tx.is_void && (
            <Button
              variant="danger"
              fullWidth
              onClick={onVoid}
              loading={voiding}
            >
              Void
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { formatRupiah, formatDate } from "@kasirsolo/utils";
import { Button } from "@kasirsolo/ui";
import type { FnbReceiptData } from "../logic/usePayment";

interface ReceiptPreviewProps {
  receipt: FnbReceiptData;
  onClose: () => void;
}

export function ReceiptPreview({ receipt, onClose }: ReceiptPreviewProps) {
  function handlePrint() {
    window.print();
  }

  function handleShare() {
    const text = buildReceiptText(receipt);
    if (navigator.share) {
      navigator.share({ title: "Struk Pembayaran", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" />

      <div className="relative bg-white rounded-t-2xl max-h-[90vh] flex flex-col animate-slide-up">
        <div className="pt-3 pb-2">
          <div className="sheet-handle" />
        </div>

        {/* Success */}
        <div className="text-center py-4 border-b border-pos-border">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-lg font-heading font-bold text-gray-900">Pembayaran Berhasil!</h2>
          <p className="text-sm text-gray-500">{receipt.transactionNumber}</p>
          {receipt.queueNumber && (
            <div className="mt-2 inline-block bg-brand-primary/10 rounded-xl px-4 py-2">
              <p className="text-xs text-brand-primary">Nomor Antrian</p>
              <p className="text-3xl font-bold text-brand-primary">{receipt.queueNumber}</p>
            </div>
          )}
        </div>

        {/* Receipt */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="receipt-print bg-white border border-dashed border-gray-300 rounded-lg p-4 max-w-xs mx-auto">
            <div className="receipt-header text-center mb-3">
              <p className="font-bold text-sm">{receipt.storeName}</p>
              {receipt.storeAddress && <p className="text-xs text-gray-600">{receipt.storeAddress}</p>}
              {receipt.storePhone && <p className="text-xs text-gray-600">{receipt.storePhone}</p>}
            </div>

            <div className="receipt-divider border-t border-dashed border-gray-300 my-2" />

            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{receipt.transactionNumber}</span>
              <span>{formatDate(receipt.createdAt, { time: true, short: true })}</span>
            </div>

            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>{receipt.orderType}</span>
              {receipt.tableNumber && <span>Meja {receipt.tableNumber}</span>}
              {receipt.queueNumber && <span>Antrian #{receipt.queueNumber}</span>}
            </div>

            {receipt.cashierName && (
              <p className="text-xs text-gray-600 mb-2">Kasir: {receipt.cashierName}</p>
            )}

            <div className="receipt-divider border-t border-dashed border-gray-300 my-2" />

            {/* Items */}
            <div className="space-y-1">
              {receipt.items.map((item, idx) => (
                <div key={idx}>
                  <p className="text-xs font-medium">{item.name}</p>
                  {item.modifiers && (
                    <p className="text-[10px] text-gray-500 ml-2">{item.modifiers}</p>
                  )}
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{item.quantity} x {formatRupiah(item.price)}</span>
                    <span>{formatRupiah(item.total)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="receipt-divider border-t border-dashed border-gray-300 my-2" />

            {/* Totals */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Subtotal</span>
                <span>{formatRupiah(receipt.subtotal)}</span>
              </div>

              {receipt.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-green-600">
                  <span>{receipt.discountLabel || "Diskon"}</span>
                  <span>-{formatRupiah(receipt.discountAmount)}</span>
                </div>
              )}

              {receipt.serviceChargeAmount > 0 && (
                <div className="flex justify-between text-xs">
                  <span>{receipt.serviceChargeLabel || "Service Charge"}</span>
                  <span>{formatRupiah(receipt.serviceChargeAmount)}</span>
                </div>
              )}

              {receipt.taxAmount > 0 && (
                <div className="flex justify-between text-xs">
                  <span>{receipt.taxLabel || "Pajak"}</span>
                  <span>{formatRupiah(receipt.taxAmount)}</span>
                </div>
              )}

              <div className="receipt-divider border-t border-double border-gray-400 my-1" />

              <div className="flex justify-between text-sm font-bold">
                <span>TOTAL</span>
                <span>{formatRupiah(receipt.total)}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span>Bayar ({receipt.paymentMethod.toUpperCase()})</span>
                <span>{formatRupiah(receipt.amountPaid)}</span>
              </div>

              {receipt.change > 0 && (
                <div className="flex justify-between text-xs font-medium">
                  <span>Kembalian</span>
                  <span>{formatRupiah(receipt.change)}</span>
                </div>
              )}
            </div>

            <div className="receipt-divider border-t border-dashed border-gray-300 my-2" />

            <div className="receipt-footer text-center">
              <p className="text-xs text-gray-500">{receipt.footerMessage}</p>
              <p className="text-[10px] text-gray-400 mt-1">KASIRSOLO F&B</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex gap-3 px-4 pt-3 pb-4 border-t border-pos-border"
          style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}
        >
          <Button variant="outline" fullWidth onClick={handlePrint}>
            Cetak
          </Button>
          <Button variant="outline" fullWidth onClick={handleShare}>
            Bagikan
          </Button>
          <Button variant="primary" fullWidth onClick={onClose}>
            Selesai
          </Button>
        </div>
      </div>
    </div>
  );
}

function buildReceiptText(receipt: FnbReceiptData): string {
  const lines: string[] = [];
  lines.push(receipt.storeName);
  if (receipt.storeAddress) lines.push(receipt.storeAddress);
  lines.push("---");
  lines.push(`${receipt.transactionNumber}`);
  lines.push(`${receipt.orderType}${receipt.tableNumber ? ` - Meja ${receipt.tableNumber}` : ""}${receipt.queueNumber ? ` - Antrian #${receipt.queueNumber}` : ""}`);
  if (receipt.cashierName) lines.push(`Kasir: ${receipt.cashierName}`);
  lines.push("---");

  receipt.items.forEach((item) => {
    lines.push(`${item.name}`);
    if (item.modifiers) lines.push(`  ${item.modifiers}`);
    lines.push(`  ${item.quantity} x ${formatRupiah(item.price)} = ${formatRupiah(item.total)}`);
  });

  lines.push("---");
  lines.push(`Subtotal: ${formatRupiah(receipt.subtotal)}`);
  if (receipt.discountAmount > 0) lines.push(`Diskon: -${formatRupiah(receipt.discountAmount)}`);
  if (receipt.serviceChargeAmount > 0) lines.push(`Service Charge: ${formatRupiah(receipt.serviceChargeAmount)}`);
  if (receipt.taxAmount > 0) lines.push(`Pajak: ${formatRupiah(receipt.taxAmount)}`);
  lines.push(`TOTAL: ${formatRupiah(receipt.total)}`);
  lines.push(`Bayar (${receipt.paymentMethod}): ${formatRupiah(receipt.amountPaid)}`);
  if (receipt.change > 0) lines.push(`Kembalian: ${formatRupiah(receipt.change)}`);
  lines.push("---");
  lines.push(receipt.footerMessage);

  return lines.join("\n");
}

"use client";

import { formatRupiah, formatDate } from "@kasirsolo/utils";
import { Button } from "@kasirsolo/ui";
import type { PosReceipt } from "@/lib/db";

interface ReceiptPreviewProps {
  receipt: PosReceipt;
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
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 animate-fade-in" />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-2xl max-h-[90vh] flex flex-col animate-slide-up">
        <div className="pt-3 pb-2">
          <div className="sheet-handle" />
        </div>

        {/* Success Banner */}
        <div className="text-center py-4 border-b border-pos-border">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-lg font-heading font-bold text-gray-900">Pembayaran Berhasil!</h2>
          <p className="text-sm text-gray-500">{receipt.transaction_number}</p>
        </div>

        {/* Receipt Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Printable receipt */}
          <div className="receipt-print bg-white border border-dashed border-gray-300 rounded-lg p-4 max-w-xs mx-auto">
            {/* Header */}
            <div className="receipt-header text-center mb-3">
              <p className="font-bold text-sm">{receipt.store_name || "KASIRSOLO Retail"}</p>
              {receipt.store_address && (
                <p className="text-xs text-gray-600">{receipt.store_address}</p>
              )}
              {receipt.store_phone && (
                <p className="text-xs text-gray-600">{receipt.store_phone}</p>
              )}
            </div>

            <div className="receipt-divider border-t border-dashed border-gray-300 my-2" />

            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>{receipt.transaction_number}</span>
              <span>{formatDate(receipt.created_at, { time: true, short: true })}</span>
            </div>

            {receipt.cashier_name && (
              <p className="text-xs text-gray-600 mb-2">Kasir: {receipt.cashier_name}</p>
            )}

            <div className="receipt-divider border-t border-dashed border-gray-300 my-2" />

            {/* Items */}
            <div className="space-y-1">
              {receipt.items.map((item, idx) => (
                <div key={idx}>
                  <p className="text-xs font-medium">{item.product_name}</p>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{item.quantity} x {formatRupiah(item.unit_price)}</span>
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

              {receipt.discount_amount > 0 && (
                <div className="flex justify-between text-xs text-green-600">
                  <span>{receipt.discount_label || "Diskon"}</span>
                  <span>-{formatRupiah(receipt.discount_amount)}</span>
                </div>
              )}

              {receipt.tax_amount > 0 && (
                <div className="flex justify-between text-xs">
                  <span>{receipt.tax_label || "Pajak"}</span>
                  <span>{formatRupiah(receipt.tax_amount)}</span>
                </div>
              )}

              <div className="receipt-divider border-t border-double border-gray-400 my-1" />

              <div className="flex justify-between text-sm font-bold">
                <span>TOTAL</span>
                <span>{formatRupiah(receipt.total)}</span>
              </div>

              <div className="flex justify-between text-xs">
                <span>Bayar ({receipt.payment_method.toUpperCase()})</span>
                <span>{formatRupiah(receipt.amount_paid)}</span>
              </div>

              {receipt.change > 0 && (
                <div className="flex justify-between text-xs font-medium">
                  <span>Kembalian</span>
                  <span>{formatRupiah(receipt.change)}</span>
                </div>
              )}
            </div>

            <div className="receipt-divider border-t border-dashed border-gray-300 my-2" />

            {/* Footer */}
            <div className="receipt-footer text-center">
              <p className="text-xs text-gray-500">
                {receipt.footer_message || "Terima kasih atas kunjungan Anda!"}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">KASIRSOLO Retail</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-4 pt-3 pb-4 border-t border-pos-border"
          style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}
        >
          <Button variant="outline" fullWidth onClick={handlePrint}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            Cetak
          </Button>
          <Button variant="outline" fullWidth onClick={handleShare}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
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

function buildReceiptText(receipt: PosReceipt): string {
  const lines: string[] = [];
  lines.push(receipt.store_name || "KASIRSOLO Retail");
  if (receipt.store_address) lines.push(receipt.store_address);
  if (receipt.store_phone) lines.push(receipt.store_phone);
  lines.push("---");
  lines.push(`${receipt.transaction_number}`);
  lines.push(`${formatDate(receipt.created_at, { time: true })}`);
  if (receipt.cashier_name) lines.push(`Kasir: ${receipt.cashier_name}`);
  lines.push("---");

  receipt.items.forEach((item) => {
    lines.push(`${item.product_name}`);
    lines.push(`  ${item.quantity} x ${formatRupiah(item.unit_price)} = ${formatRupiah(item.total)}`);
  });

  lines.push("---");
  lines.push(`Subtotal: ${formatRupiah(receipt.subtotal)}`);
  if (receipt.discount_amount > 0) lines.push(`Diskon: -${formatRupiah(receipt.discount_amount)}`);
  if (receipt.tax_amount > 0) lines.push(`Pajak: ${formatRupiah(receipt.tax_amount)}`);
  lines.push(`TOTAL: ${formatRupiah(receipt.total)}`);
  lines.push(`Bayar (${receipt.payment_method}): ${formatRupiah(receipt.amount_paid)}`);
  if (receipt.change > 0) lines.push(`Kembalian: ${formatRupiah(receipt.change)}`);
  lines.push("---");
  lines.push(receipt.footer_message || "Terima kasih!");

  return lines.join("\n");
}

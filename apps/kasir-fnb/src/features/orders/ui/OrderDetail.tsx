"use client";

import { formatRupiah, formatDate } from "@kasirsolo/utils";
import { Button } from "@kasirsolo/ui";
import type { FnbTransaction } from "../data/types";

interface OrderDetailProps {
  transaction: FnbTransaction;
  onClose: () => void;
}

export function OrderDetail({ transaction: tx, onClose }: OrderDetailProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />

      <div className="relative bg-white rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up">
        <div className="pt-3 pb-2">
          <div className="sheet-handle" />
        </div>

        <div className="px-4 pb-3 border-b border-pos-border">
          <h2 className="text-lg font-heading font-bold text-gray-900">{tx.transaction_number}</h2>
          <p className="text-xs text-gray-500">
            {formatDate(tx.created_at, { time: true })} - {tx.order_type === "dine_in" ? "Dine In" : tx.order_type === "takeaway" ? "Takeaway" : "Delivery"}
            {tx.table_number ? ` - Meja ${tx.table_number}` : ""}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {tx.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-gray-500">{item.quantity} x {formatRupiah(item.unit_price)}</p>
              </div>
              <p className="font-medium">{formatRupiah(item.total)}</p>
            </div>
          ))}

          <div className="border-t border-dashed border-gray-300 pt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatRupiah(tx.subtotal)}</span>
            </div>
            {tx.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Diskon</span>
                <span>-{formatRupiah(tx.discount_amount)}</span>
              </div>
            )}
            {tx.service_charge_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Service Charge</span>
                <span>{formatRupiah(tx.service_charge_amount)}</span>
              </div>
            )}
            {tx.tax_amount > 0 && (
              <div className="flex justify-between text-sm">
                <span>Pajak</span>
                <span>{formatRupiah(tx.tax_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-1">
              <span>Total</span>
              <span className="text-brand-primary">{formatRupiah(tx.total)}</span>
            </div>
          </div>
        </div>

        <div className="px-4 pt-3 pb-4 border-t border-pos-border" style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}>
          <Button variant="outline" fullWidth onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}

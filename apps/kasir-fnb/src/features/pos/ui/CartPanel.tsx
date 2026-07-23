"use client";

import { formatRupiah } from "@kasirsolo/utils";
import { Button } from "@kasirsolo/ui";
import { getCartItemCount } from "../data/cart-utils";
import type { FnbCartState } from "../data/types";

interface CartPanelProps {
  cart: FnbCartState;
  onClose: () => void;
  onUpdateQty: (index: number, qty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
  onProceedPayment: () => void;
}

export function CartPanel({
  cart,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedPayment,
}: CartPanelProps) {
  const itemCount = getCartItemCount(cart.items);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" onClick={onClose} />

      <div className="relative bg-white rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up">
        <div className="pt-3 pb-2">
          <div className="sheet-handle" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-pos-border">
          <div>
            <h2 className="text-lg font-heading font-bold text-gray-900">Pesanan</h2>
            <p className="text-xs text-gray-500">
              {itemCount} item
              {cart.orderType === "dine_in" && cart.tableNumber && ` - Meja ${cart.tableNumber}`}
              {cart.orderType === "takeaway" && " - Takeaway"}
              {cart.orderType === "delivery" && " - Delivery"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {cart.items.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-red-500 font-medium px-3 py-1.5 rounded-lg
                  hover:bg-red-50 transition-colors"
                type="button"
              >
                Hapus Semua
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400" type="button" aria-label="Tutup">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
              </svg>
              <p className="text-sm">Pesanan kosong</p>
            </div>
          ) : (
            <div>
              {cart.items.map((item, index) => (
                <div key={index} className="cart-item">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    {item.modifiers.length > 0 && (
                      <p className="text-[10px] text-gray-500 truncate">
                        {item.modifiers.map((m) => `${m.name}: ${m.option}`).join(", ")}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-[10px] text-brand-primary truncate">Catatan: {item.notes}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatRupiah(item.price + item.modifiersTotal)} x {item.quantity}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateQty(index, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600
                          active:bg-gray-200 transition-colors"
                        type="button"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(index, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary
                          active:bg-brand-primary/20 transition-colors"
                        type="button"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    </div>

                    <p className="text-sm font-bold text-gray-900 w-20 text-right">
                      {formatRupiah(item.total)}
                    </p>

                    <button
                      onClick={() => onRemoveItem(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      type="button"
                      aria-label="Hapus"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals & Payment */}
        {cart.items.length > 0 && (
          <div
            className="border-t border-pos-border px-4 pt-3 pb-4"
            style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}
          >
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Subtotal</span>
              <span>{formatRupiah(cart.subtotal)}</span>
            </div>

            {cart.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600 mb-1">
                <span>Diskon</span>
                <span>-{formatRupiah(cart.discountAmount)}</span>
              </div>
            )}

            {cart.serviceChargeEnabled && cart.serviceChargeAmount > 0 && (
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Service Charge {cart.serviceChargePercentage}%</span>
                <span>{formatRupiah(cart.serviceChargeAmount)}</span>
              </div>
            )}

            {cart.taxEnabled && cart.taxAmount > 0 && (
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>PPN {cart.taxPercentage}%</span>
                <span>{formatRupiah(cart.taxAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-lg font-bold text-gray-900 mt-2 mb-4">
              <span>Total</span>
              <span className="text-brand-primary">{formatRupiah(cart.total)}</span>
            </div>

            <Button variant="primary" fullWidth size="lg" onClick={onProceedPayment}>
              Bayar {formatRupiah(cart.total)}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

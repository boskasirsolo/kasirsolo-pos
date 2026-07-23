"use client";

import { formatRupiah } from "@kasirsolo/utils";
import { Button } from "@kasirsolo/ui";
import { CartItemRow } from "./CartItem";
import { getCartItemCount } from "../data/cart-utils";
import type { CartState } from "../data/types";

interface CartPanelProps {
  cart: CartState;
  onClose: () => void;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
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
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative bg-white rounded-t-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Handle */}
        <div className="pt-3 pb-2">
          <div className="sheet-handle" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-pos-border">
          <div>
            <h2 className="text-lg font-heading font-bold text-gray-900">Keranjang</h2>
            <p className="text-xs text-gray-500">{itemCount} item</p>
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
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
              type="button"
              aria-label="Tutup"
            >
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
              <p className="text-sm">Keranjang kosong</p>
            </div>
          ) : (
            <div>
              {cart.items.map((item) => (
                <CartItemRow
                  key={item.productId}
                  item={item}
                  onUpdateQty={(qty) => onUpdateQty(item.productId, qty)}
                  onRemove={() => onRemoveItem(item.productId)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Totals & Payment Button */}
        {cart.items.length > 0 && (
          <div className="border-t border-pos-border px-4 pt-3 pb-4"
            style={{ paddingBottom: "calc(1rem + var(--safe-bottom))" }}
          >
            {/* Subtotal */}
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Subtotal</span>
              <span>{formatRupiah(cart.subtotal)}</span>
            </div>

            {/* Discount */}
            {cart.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600 mb-1">
                <span>Diskon</span>
                <span>-{formatRupiah(cart.discountAmount)}</span>
              </div>
            )}

            {/* Tax */}
            {cart.taxEnabled && cart.taxAmount > 0 && (
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>PPN {cart.taxPercentage}%</span>
                <span>{formatRupiah(cart.taxAmount)}</span>
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between text-lg font-bold text-gray-900 mt-2 mb-4">
              <span>Total</span>
              <span className="text-brand-primary">{formatRupiah(cart.total)}</span>
            </div>

            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={onProceedPayment}
            >
              Bayar {formatRupiah(cart.total)}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

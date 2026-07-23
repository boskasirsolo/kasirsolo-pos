"use client";

import { formatRupiah } from "@kasirsolo/utils";
import type { CartItem } from "../data/types";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (qty: number) => void;
  onRemove: () => void;
}

export function CartItemRow({ item, onUpdateQty, onRemove }: CartItemRowProps) {
  return (
    <div className="cart-item">
      {/* Product info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
        <p className="text-xs text-gray-500">
          {formatRupiah(item.price)} x {item.quantity}
        </p>
        {item.discount > 0 && (
          <p className="text-xs text-green-600">-{formatRupiah(item.discount)}</p>
        )}
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdateQty(item.quantity - 1)}
          className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center
            text-gray-600 active:bg-gray-200 transition-colors"
          type="button"
          aria-label="Kurangi"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
          </svg>
        </button>

        <span className="w-8 text-center text-sm font-semibold text-gray-900 tabular-nums">
          {item.quantity}
        </span>

        <button
          onClick={() => onUpdateQty(item.quantity + 1)}
          className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center
            text-brand-primary active:bg-brand-primary/20 transition-colors"
          type="button"
          aria-label="Tambah"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      {/* Item total */}
      <div className="text-right ml-2">
        <p className="text-sm font-semibold text-gray-900 tabular-nums">
          {formatRupiah(item.total)}
        </p>
        <button
          onClick={onRemove}
          className="text-[10px] text-red-400 hover:text-red-600 mt-0.5"
          type="button"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}

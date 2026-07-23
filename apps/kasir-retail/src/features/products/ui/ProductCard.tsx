"use client";

import { formatRupiah } from "@kasirsolo/utils";
import type { PosProduct } from "@/lib/db";

interface ProductCardProps {
  product: PosProduct;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-pos-border p-3 flex flex-col
        active:bg-gray-50 transition-colors text-left"
      type="button"
    >
      <div className="w-full aspect-square bg-orange-50 rounded-lg flex items-center justify-center mb-2">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full rounded-lg object-cover" />
        ) : (
          <svg className="w-8 h-8 text-brand-primary/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )}
      </div>
      <p className="text-xs font-medium text-gray-900 line-clamp-2">{product.name}</p>
      <p className="text-xs font-bold text-brand-primary mt-1">{formatRupiah(product.price)}</p>
      {product.track_stock && (
        <p className={`text-[10px] mt-0.5 ${product.stock <= product.min_stock ? "text-red-500" : "text-gray-400"}`}>
          Stok: {product.stock} {product.unit}
        </p>
      )}
    </button>
  );
}

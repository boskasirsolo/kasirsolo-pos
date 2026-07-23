"use client";

import { formatRupiah } from "@kasirsolo/utils";
import { EmptyState } from "@kasirsolo/ui";
import type { PosProduct } from "@/lib/db";

interface LowStockAlertsProps {
  products: PosProduct[];
}

export function LowStockAlerts({ products }: LowStockAlertsProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        title="Stok aman"
        description="Tidak ada produk dengan stok rendah"
        icon={
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-900 px-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        Stok Rendah ({products.length})
      </h3>
      <div className="space-y-1.5 px-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center gap-3 bg-white rounded-xl border border-red-100 p-3"
          >
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
              <p className="text-xs text-gray-500">{formatRupiah(product.price)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-bold ${product.stock === 0 ? "text-red-600" : "text-orange-500"}`}>
                {product.stock === 0 ? "HABIS" : product.stock}
              </p>
              <p className="text-[10px] text-gray-400">
                min: {product.min_stock}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

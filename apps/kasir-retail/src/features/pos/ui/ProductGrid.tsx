"use client";

import { formatRupiah } from "@kasirsolo/utils";
import { EmptyState } from "@kasirsolo/ui";
import type { PosProduct } from "@/lib/db";

interface ProductGridProps {
  products: PosProduct[];
  loading: boolean;
  onProductTap: (product: PosProduct) => void;
}

export function ProductGrid({ products, loading, onProductTap }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="product-tile animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-lg mb-2" />
            <div className="w-16 h-3 bg-gray-200 rounded" />
            <div className="w-12 h-3 bg-gray-100 rounded mt-1" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="Tidak ada produk"
        description="Belum ada produk yang sesuai. Coba ubah pencarian atau tambah produk baru."
        icon={
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
      {products.map((product) => (
        <button
          key={product.id}
          onClick={() => onProductTap(product)}
          className="product-tile"
          type="button"
        >
          {/* Product icon/image */}
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-10 h-10 rounded-lg object-cover mb-1"
            />
          ) : (
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-1">
              <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}

          {/* Product name */}
          <p className="text-[11px] font-medium text-gray-800 text-center line-clamp-2 leading-tight">
            {product.name}
          </p>

          {/* Price */}
          <p className="text-[11px] font-bold text-brand-primary mt-0.5">
            {formatRupiah(product.price)}
          </p>

          {/* Stock indicator */}
          {product.track_stock && product.stock <= product.min_stock && (
            <div className="mt-0.5">
              <span className="text-[9px] text-red-500 font-medium">
                Stok: {product.stock}
              </span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

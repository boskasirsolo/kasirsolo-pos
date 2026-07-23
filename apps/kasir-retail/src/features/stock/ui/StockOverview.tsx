"use client";

import { formatRupiah } from "@kasirsolo/utils";
import { StatCard } from "@kasirsolo/ui";
import type { PosProduct } from "@/lib/db";

interface StockOverviewProps {
  products: PosProduct[];
  lowStockProducts: PosProduct[];
  loading: boolean;
}

export function StockOverview({ products, lowStockProducts, loading }: StockOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const trackedProducts = products.filter((p) => p.track_stock && p.is_active);
  const totalStock = trackedProducts.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = trackedProducts.reduce((sum, p) => sum + p.stock * p.cost_price, 0);
  const outOfStock = trackedProducts.filter((p) => p.stock === 0).length;

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      <StatCard
        label="TOTAL PRODUK"
        value={trackedProducts.length.toString()}
        accentColor="#FF5F1F"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
      />
      <StatCard
        label="TOTAL STOK"
        value={totalStock.toLocaleString("id-ID")}
        accentColor="#3B82F6"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 12.75l-5.571-3m0 0L2.25 12l4.179 2.25m11.142-4.5L21.75 12l-4.179 2.25m0 0L12 17.25l-5.571-3" />
          </svg>
        }
      />
      <StatCard
        label="NILAI STOK"
        value={formatRupiah(totalValue, { compact: true })}
        accentColor="#22C55E"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <StatCard
        label="STOK RENDAH"
        value={lowStockProducts.length.toString()}
        subLabel={outOfStock > 0 ? `${outOfStock} habis` : undefined}
        accentColor={lowStockProducts.length > 0 ? "#EF4444" : "#22C55E"}
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        }
      />
    </div>
  );
}

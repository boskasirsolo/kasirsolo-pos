"use client";

import { useState } from "react";
import { PosShell } from "@/components/layout/PosShell";
import { StockOverview, StockAdjustForm, LowStockAlerts, useStock } from "@/features/stock";
import { useToast, Modal } from "@kasirsolo/ui";

export default function StockPage() {
  const { products, lowStockProducts, loading, adjusting, adjustStock, load } = useStock();
  const { addToast } = useToast();
  const [showAdjust, setShowAdjust] = useState(false);

  async function handleAdjust(data: Parameters<typeof adjustStock>[0]) {
    try {
      await adjustStock(data);
      addToast({ type: "success", title: "Stok diperbarui" });
      setShowAdjust(false);
    } catch {
      addToast({ type: "error", title: "Gagal mengubah stok" });
    }
  }

  return (
    <PosShell>
      <div className="pb-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h1 className="text-lg font-heading font-bold text-gray-900">Stok</h1>
          <button
            onClick={() => setShowAdjust(true)}
            className="text-sm font-medium text-brand-primary px-3 py-1.5 rounded-lg
              hover:bg-brand-primary/5 transition-colors"
            type="button"
          >
            + Penyesuaian
          </button>
        </div>

        {/* Overview cards */}
        <StockOverview
          products={products}
          lowStockProducts={lowStockProducts}
          loading={loading}
        />

        {/* Low stock alerts */}
        <div className="mt-4">
          <LowStockAlerts products={lowStockProducts} />
        </div>
      </div>

      {/* Stock adjustment modal */}
      <Modal
        isOpen={showAdjust}
        onClose={() => setShowAdjust(false)}
        title="Penyesuaian Stok"
        size="full"
      >
        <StockAdjustForm
          products={products}
          onSubmit={handleAdjust}
          onCancel={() => setShowAdjust(false)}
          loading={adjusting}
        />
      </Modal>
    </PosShell>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getProducts,
  getLowStockProducts,
  updateProductStock,
  getProductById,
  put,
  openDatabase,
} from '@/lib/db';
import type { PosProduct, PosStockAdjustment, StockAdjustmentType } from '@/lib/db';
import type { StockAdjustFormData } from '../data/types';
import { getCurrentUser } from '@kasirsolo/auth';

export function useStock() {
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<PosProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await openDatabase();
      const [all, low] = await Promise.all([
        getProducts({ activeOnly: true }),
        getLowStockProducts(),
      ]);
      setProducts(all);
      setLowStockProducts(low);
    } catch (err) {
      console.error('Failed to load stock data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const adjustStock = useCallback(
    async (data: StockAdjustFormData) => {
      setAdjusting(true);
      try {
        const product = await getProductById(data.productId);
        if (!product) throw new Error('Produk tidak ditemukan');

        const user = await getCurrentUser();

        // Calculate new stock
        const isIncrease = ['purchase', 'return', 'transfer_in', 'correction'].includes(data.type);
        const newStock = isIncrease
          ? product.stock + data.quantity
          : Math.max(0, product.stock - data.quantity);

        // Update product stock
        await updateProductStock(data.productId, newStock);

        // Save adjustment record
        const adjustment: PosStockAdjustment = {
          id: crypto.randomUUID(),
          product_id: data.productId,
          product_name: product.name,
          type: data.type,
          quantity: isIncrease ? data.quantity : -data.quantity,
          stock_before: product.stock,
          stock_after: newStock,
          reason: data.reason || data.type,
          adjusted_by: user?.id ?? null,
          created_at: new Date().toISOString(),
          sync_status: 'pending',
        };

        await put('stock_adjustments', adjustment);

        // Reload data
        await load();
      } finally {
        setAdjusting(false);
      }
    },
    [load],
  );

  return {
    products,
    lowStockProducts,
    loading,
    adjusting,
    load,
    adjustStock,
  };
}

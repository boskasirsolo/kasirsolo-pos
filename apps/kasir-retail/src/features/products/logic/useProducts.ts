"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getProducts,
  getProductById,
  saveProduct,
  deleteProduct as deleteProductDb,
  openDatabase,
} from "@/lib/db";
import type { PosProduct } from "@/lib/db";
import type { ProductFormData } from "../data/types";

export function useProducts() {
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await openDatabase();
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createProduct = useCallback(async (data: ProductFormData): Promise<PosProduct> => {
    setSaving(true);
    try {
      const product: PosProduct = {
        id: crypto.randomUUID(),
        name: data.name,
        barcode: data.barcode || null,
        category_id: data.category_id || null,
        price: data.price,
        cost_price: data.cost_price,
        stock: data.stock,
        min_stock: data.min_stock,
        unit: data.unit,
        image: data.image,
        is_active: true,
        track_stock: data.track_stock,
        notes: data.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sync_status: "pending",
      };

      await saveProduct(product);
      setProducts((prev) => [product, ...prev]);
      return product;
    } finally {
      setSaving(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, data: ProductFormData): Promise<PosProduct> => {
    setSaving(true);
    try {
      const existing = await getProductById(id);
      if (!existing) throw new Error("Produk tidak ditemukan");

      const updated: PosProduct = {
        ...existing,
        name: data.name,
        barcode: data.barcode || null,
        category_id: data.category_id || null,
        price: data.price,
        cost_price: data.cost_price,
        stock: data.stock,
        min_stock: data.min_stock,
        unit: data.unit,
        image: data.image,
        track_stock: data.track_stock,
        notes: data.notes || null,
        updated_at: new Date().toISOString(),
        sync_status: "pending",
      };

      await saveProduct(updated);
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } finally {
      setSaving(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    await deleteProductDb(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    products,
    loading,
    saving,
    load,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

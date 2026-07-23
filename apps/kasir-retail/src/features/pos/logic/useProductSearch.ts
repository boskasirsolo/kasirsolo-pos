"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getProducts,
  getProductByBarcode,
  openDatabase,
  getAll,
} from "@/lib/db";
import type { PosProduct, PosCategory } from "@/lib/db";

export function useProductSearch() {
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [allProducts, setAllProducts] = useState<PosProduct[]>([]);
  const [categories, setCategories] = useState<PosCategory[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Load all products and categories on mount
  useEffect(() => {
    async function load() {
      try {
        await openDatabase();
        const [prods, cats] = await Promise.all([
          getProducts({ activeOnly: true }),
          getAll("categories") as Promise<PosCategory[]>,
        ]);
        setAllProducts(prods);
        setProducts(prods);
        setCategories(cats.filter((c) => c.is_active).sort((a, b) => a.sort_order - b.sort_order));
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Filter products when query or category changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      let filtered = allProducts;

      if (category) {
        filtered = filtered.filter((p) => p.category_id === category);
      }

      if (query.trim()) {
        const term = query.trim().toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            (p.barcode && p.barcode.toLowerCase().includes(term))
        );
      }

      setProducts(filtered);
    }, 150);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, category, allProducts]);

  const searchByBarcode = useCallback(async (barcode: string) => {
    try {
      const product = await getProductByBarcode(barcode);
      if (product && product.is_active) {
        setProducts([product]);
        setQuery(barcode);
      }
    } catch {
      // Product not found
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const prods = await getProducts({ activeOnly: true });
      setAllProducts(prods);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    categories,
    query,
    setQuery,
    category,
    setCategory,
    loading,
    searchByBarcode,
    refresh,
  };
}

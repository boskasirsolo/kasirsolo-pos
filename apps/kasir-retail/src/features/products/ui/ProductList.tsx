"use client";

import { useState } from "react";
import { formatRupiah } from "@kasirsolo/utils";
import { Button, EmptyState } from "@kasirsolo/ui";
import type { PosProduct, PosCategory } from "@/lib/db";

interface ProductListProps {
  products: PosProduct[];
  categories: PosCategory[];
  loading: boolean;
  onEdit: (product: PosProduct) => void;
  onDelete: (product: PosProduct) => void;
  onAdd: () => void;
}

export function ProductList({
  products,
  categories,
  loading,
  onEdit,
  onDelete,
  onAdd,
}: ProductListProps) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "price" | "stock">("name");

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  let filtered = products;
  if (search) {
    const term = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.barcode && p.barcode.toLowerCase().includes(term))
    );
  }
  if (catFilter) {
    filtered = filtered.filter((p) => p.category_id === catFilter);
  }

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "price") return b.price - a.price;
    return a.stock - b.stock;
  });

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-white rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="sticky top-0 z-10 bg-pos-bg px-4 pt-3 pb-2 space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-pos-border rounded-xl text-sm
                focus:outline-none focus:border-brand-primary"
            />
          </div>
          <Button variant="primary" onClick={onAdd}>
            + Tambah
          </Button>
        </div>

        {/* Category filter + sort */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setCatFilter(null)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium
              ${catFilter === null ? "bg-brand-primary text-white" : "bg-white text-gray-600 border border-pos-border"}`}
            type="button"
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCatFilter(cat.id)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium
                ${catFilter === cat.id ? "bg-brand-primary text-white" : "bg-white text-gray-600 border border-pos-border"}`}
              type="button"
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Count */}
      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">{filtered.length} produk</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "name" | "price" | "stock")}
          className="text-xs bg-transparent text-gray-500 border-none focus:outline-none"
        >
          <option value="name">Nama A-Z</option>
          <option value="price">Harga Tertinggi</option>
          <option value="stock">Stok Terendah</option>
        </select>
      </div>

      {/* Product Items */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Belum ada produk"
          description="Mulai tambahkan produk untuk berjualan"
          action={<Button variant="primary" onClick={onAdd}>Tambah Produk</Button>}
        />
      ) : (
        <div className="px-4 space-y-2 pb-4">
          {filtered.map((product) => (
            <button
              key={product.id}
              onClick={() => onEdit(product)}
              className="w-full bg-white rounded-xl border border-pos-border p-3 flex items-center gap-3
                active:bg-gray-50 transition-colors text-left"
              type="button"
            >
              {/* Image */}
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                {product.image ? (
                  <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                ) : (
                  <svg className="w-6 h-6 text-brand-primary/50" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {product.barcode && (
                    <span className="text-[10px] text-gray-400 font-mono">{product.barcode}</span>
                  )}
                  {product.category_id && categoryMap.has(product.category_id) && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      {categoryMap.get(product.category_id)}
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Stock */}
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-brand-primary">{formatRupiah(product.price)}</p>
                {product.track_stock && (
                  <p className={`text-[10px] font-medium ${product.stock <= product.min_stock ? "text-red-500" : "text-gray-400"}`}>
                    Stok: {product.stock}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
